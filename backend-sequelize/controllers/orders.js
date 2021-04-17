const Orders = require("../models").Orders;
const Address = require("../models").Address;
const Customer = require("../models").Customer;
const db = require("../models");
const Op = require("sequelize").Op;
const paypal = require("@paypal/checkout-server-sdk");
const payPalClient = require("./paypal/paypal_component");

let constructor = (req) => {
  return {
    order_date: new Date(),
  };
};

module.exports = {
  async create(req, res) {
    let json = JSON.parse(req.body);
    let firstName = json.firstName;
    let lastName = json.lastName;
    let address = json.address;
    let address2 = json.address2;
    let country = json.country;
    let city = json.city;
    let state = json.state;
    let zip = json.zip;
    // let same_address = json.same_address === "checked" ? true : false;
    let total = json.total.toFixed(2);
    let taxes = json.taxes;
    let products = json.products;
    let customer_id = json.customer_id;
    let address_id = json.address_id;

    let validated_total = 0;

    let sales_tax_rate_canada = {
      AB: { sales_tax: 0.05 },
      BC: { sales_tax: 0.12 },
      SK: { sales_tax: 0.11 },
      MB: { sales_tax: 0.12 },
      ON: { sales_tax: 0.13 },
      QC: { sales_tax: 0.14975 },
      NB: { sales_tax: 0.15 },
      PE: { sales_tax: 0.15 },
      NS: { sales_tax: 0.15 },
      NL: { sales_tax: 0.15 },
      YT: { sales_tax: 0.05 },
      NT: { sales_tax: 0.05 },
      NU: { sales_tax: 0.05 },
    };

    let validated_server_total = 0;
    let isValidated = true;

    // if (same_address !== null && same_address !== "") isValidated = false;
    if (firstName === null || firstName === "") isValidated = false;
    else if (lastName === null || lastName === "") isValidated = false;
    else if (address === null || address === "") isValidated = false;
    else if (country === null || country === "") isValidated = false;
    else if (city === null || city === "") isValidated = false;
    else if (state === null || state === "" || state === "choose")
      isValidated = false;
    else if (zip === null || zip === "") isValidated = false;
    else if (total === null || total === "") isValidated = false;
    else if (taxes === null || taxes === "") isValidated = false;
    else {
      products.forEach((product) => {
        validated_total +=
          parseFloat(product.product_price) * product.product_quantity;
      });

      validated_server_total = (
        (1 + sales_tax_rate_canada[state].sales_tax) *
        validated_total
      ).toFixed(2);
    }

    if (validated_server_total !== total) isValidated = false;

    if (!isValidated)
      return res.status(400).json({ message: "validation errors" });

    const order_address = {
      address_line_1: address,
      address_line_2: address2,
      city: city,
      province: state,
      postal_code: zip,
      country: country,
    };

    const [record, created] = await Address.upsert(order_address, {
      returning: true,
    }).catch((error) => {
      console.log("Address error: " + error);
    });

    address_id = record.address_id;

    await Customer.findOne({ where: { customer_id: customer_id } }).then(
      (customer) => {
        customer
          .update({
            billing_address_id: address_id,
            shipping_address_id: address_id,
          })
          .then((customer) => {})
          .catch((err) => {
            console.log("Customer not updated:" + err);
          });
      }
    );

    const order = {
      order_date: Date.now(),
      order_status: "Placed",
      order_shipping_address_id: address_id,
      order_total_plus_tax: validated_server_total,
      tax_rate: sales_tax_rate_canada[state].sales_tax,
      customer_id: customer_id,
    };

    // assume success if process has made it here.
    Orders.create(order)
      .then((order) => {
        products.forEach((product) => {
          db.sequelize.query(
            `INSERT INTO Order_Detail (order_id, total_price, product_id, quantity)
            VALUES (:order_id, :total_price, :product_id, :quantity)`,
            {
              replacements: {
                order_id: order.order_id,
                total_price: product.product_price,
                product_id: product.product_id,
                quantity: product.product_quantity,
              },
            }
          );
        });
        res.status(201).json({
          message: "Order placed successfully",
          order_id: order.order_id,
        });
      })
      .catch((err) => {
        res
          .status(500)
          .json({ message: `Error occured for placing order: + ${err}` });
      });
  },
  async handleRequest(req, res) {
    let results = await Orders.findOne({
      where: { order_id: req.params.id },
    }).then((order) => order.order_total_plus_tax);

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "CAD",
            value: results,
          },
        },
      ],
    });

    try {
      order = await payPalClient.client().execute(request);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }

    db.sequelize.query(
      `UPDATE Orders
        SET transaction_id = :trans_id
        WHERE order_id = :order_id`,
      {
        replacements: {
          order_id: req.params.id,
          trans_id: order.result.id,
        },
      }
    );

    res.status(200).json({
      orderID: order.result.id,
    });
  },
  findAll(req, res) {
    console.log(req);
    if (req.query.customerid) {
      console.log("findAll ex with parms");
      return Orders.findAll({
        where: {
          customer_id: req.query.customerid,
          transaction_id: { [Op.not]: null },
        },
        order: [["order_date", "DESC"]],
      })
        .then((orders) => {
          res.status(201).send(orders);
        })
        .catch((error) => res.status(400).json({ message: "Error" }));
    }
    console.log("findAll ex");
    return Orders.findAll({
      where: {
        transaction_id: { [Op.not]: null },
        order_total_plus_tax: { [Op.not]: null },
      },
      order: [["order_date", "DESC"]],
    })
      .then((orders) => {
        res.status(201).send(orders);
      })
      .catch((error) => res.status(400).json({ message: "Error" }));
  },
  findByCustomer(req, res) {
    console.log("findbycustomer ex");
    return Orders.findAll({
      where: { customer_id: req.params.id, transaction_id: { [Op.not]: null } },
    })
      .then((orders) => {
        res.status(201).send(orders);
      })
      .catch((error) => res.status(400).json({ message: "Error" }));
  },
  findOne(req, res) {
    return Orders.findOne({ where: { id: req.params.id } })
      .then((order) => {
        if (!order) {
          res.status(201).send({ message: "No record found" });
        }
        res.status(201).send(order);
      })
      .catch((error) => res.status(400).json({ message: "Error" }));
  },
  update(req, res) {
    return Orders.findOne({ where: { id: req.params.id } })
      .then((order) => {
        if (!order) {
          res.status(201).send({ message: "No record found" });
        }
        const values = constructor(req);
        order
          .update(values)
          .then((update) => res.status(201).send(update))
          .catch((error) => res.status(400).json({ message: "Error" }));
      })
      .catch((error) => res.status(400).json({ message: "Error" }));
  },
  updateStatus(req, res) {
    console.log(req);
    return Orders.findOne({ where: { order_id: req.params.id } })
      .then((order) => {
        if (!order) {
          res.status(201).send({ message: "No record found" });
        }
        // order
        //   .update({ order_status: req.body.order_status })
        //   .then((update) => res.status(201).send(update))
        //   .catch((error) => res.status(400).json({ message: error }));
        Customer.findOne({ where: { customer_id: order.customer_id } })
        .then((customer)=>{
          if (!customer) {
            res.status(201).send({ message: "No customer record found" });
          }
          console.log(customer.email);
          order
          .update({ order_status: req.body.order_status })
          .then((update) => res.status(201).send(update))
          .catch((error) => res.status(400).json({ message: error }));
          var mailOptions = {
            to: customer.email,
            from: "411340343@qq.com", 
            subject: "Order status changes",
            text:
              "Dear " + customer.email+":" + "\n\n" +
              "Your Order " + order.transaction_id +" status is changed to be " + order.order_status + ".\n\n",
          };
          const sgMail = require("@sendgrid/mail");
          sgMail.setApiKey(process.env.EMAIL_API_KEY);
          sgMail
            .send(mailOptions)
            .then(() => {
              console.log("Send status email successfully!");
            })
            .catch((err) => {
              console.log(`Error sending status email ${err}`);
            });
        })
        .catch((error) => res.status(400).json({ message: error }));
        
      })
      .catch((error) => res.status(400).json({ message: error }));
  },
  delete(req, res) {
    return Orders.destroy({ where: { id: req.params.id } })
      .then(() => {
        res.status(200).json({ message: "order deleted successfully" });
      })
      .catch((error) => res.status(204).json({ message: "delete error" }));
  },
};
