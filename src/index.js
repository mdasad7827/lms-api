const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
app.use(express.json());
const authRoute = require("../routes/auth");
const bookRoute = require("../routes/book");

app.use("/api/user", authRoute);
app.use("/api/books", bookRoute);

mongoose.connect(
  process.env.DB_CONNECT,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },

  () => console.log("Connected to db")
);

app.listen(port, () => console.log(`LMS-APIs listening on port ${port}!`));
