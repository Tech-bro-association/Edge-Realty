const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const userRoute = require("./routes/userRoute");
// const adminRoute = require("./routes/adminRoute");
// const agentRoute = require("./routes/agentRoute");
const PORT = process.env.PORT || 5000;

// Initialize database
const uri = "mongodb://localhost:27017/Edge-Realty";

mongoose.connect(uri);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log(`Connection to ${db.name} database Successful!`);
});

// console.log(db);

// Express
app.use(
  cors({
    origin: ["http://localhost:5500", "http://localhost:8080"],
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use("/user", userRoute);
// app.use("/agent", agentRoute);
// app.use("/admin", adminRoute);

app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}....`);
});

// module.exports = { db }