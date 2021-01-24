const { resolveContent } = require("nodemailer/lib/shared");
const { db } = require("../models/users");

SanitizeInput = (string) => {
  return string;
};

module.exports = {
  async CheckIfEmailExist(email) {
    email = SanitizeInput(email);
    sql = `SELECT * FROM Customers WHERE email = '${email}'`;

    db.execute(sql, (err, res) => {
      if (err) throw console.log(err);
      console.log(res);
      if (!Array.isArray(res) || !res.length) {
        console.log("Email not found.");
        return false;
      }
      return true;
    });
  },
  async CreateUser(body) {
    username = SanitizeInput(body.username);
    email = SanitizeInput(body.email);
    sql = `INSERT INTO Customers (email, password, first_name, last_name)
        VALUES ('${email}','${body.password}','John','Smith')`;
    db.execute(sql, (err, result) => {
      if (err) throw console.log(err);
    });
  },
  async FindUser(body) {
    email = SanitizeInput(body.email);
    sql = `SELECT * FROM Customers WHERE email = '${email}'`;

    const mysql = require("mysql2/promise");
    const db = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    try {
      let [rows, fields] = await db.execute(sql);
      let user = {
        email: rows[0].email,
        password: rows[0].password,
      };
      console.log(user);
      return user;
    } catch (err) {}
  },
};
