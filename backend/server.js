require('dotenv').config();
const express = require('express');
// const mongoose = require('mongoose');
const cors = require('cors');
const mysql = require('mysql2/promise');
const cookieParser = require('cookie-parser');
const auth = require('./routes/authRoutes');

const app = express();
app.use(cors());
const server = require('http').createServer(app);


// const dbConfig = require('./config/secret');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// mongoose.Promise = global.Promise;
// mongoose.connect(
//   'mongodb+srv://leonLi:leonli123@cluster0.m9xud.mongodb.net/reset-password?retryWrites=true&w=majority',//dbConfig.url,
//   {
//     useNewUrlParser: true
//   }
// ).then((conn) => {
//   console.log("Mongo Connected")
// }).catch((err) => {
//   console.log(err)
// })

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

global.db = db;

app.use('/api/resetpassword', auth);

server.listen(3000, () => {
  console.log('Listening on port 3000');
});

// let query = "SELECT * FROM Customers ORDER BY customer_id ASC"; // query database to get all the players

// execute query
// db.query(query, (err, result) => {
//   console.log(result);
// });