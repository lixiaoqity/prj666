require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const cookieParser = require("cookie-parser");
const auth = require("./routes/authRoutes");

const app = express();
app.use(cors());
const server = require("http").createServer(app);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

const connect = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

global.connect = connect;

app.use("/api/resetpassword", auth);

server.listen(3000, () => {
  console.log("Listening on port 3000");
});
