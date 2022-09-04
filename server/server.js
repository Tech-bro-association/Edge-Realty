require('dotenv').config();

const express = require("express");
const app = express();

const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middlewares/errorHandler")

const connectDatabase = require("./db/connectDB");

// Routes
const userRoute = require("./routes/endUserRoute"),
  agentRoute = require("./routes/agentRoute"),
  adminRoute = require("./routes/adminRoute"),
  authRoute = require("./routes/authRoute");

// Middlewares
app.use(morgan("dev"))
app.use(express.json())
app.use('/api/auth', authRoute)
app.use('/api/auth/user', userRoute)
app.use("/api/auth/agent/", agentRoute);
app.use('/api/auth/admin', adminRoute)
app.use("/api/secure/", (req, res, next) => { verifyAccessToken(req, res, next) });


app.use(errorHandler)

// Server connection
const PORT = process.env.PORT || 5520;
const start = async () => {
  try {
    // Initialize database
    await connectDatabase(process.env.MONGO_URI)

    // Express
    app.listen(PORT, function () {
      console.log(`Server is running on port ${PORT}....`);
    });
  } catch (error) {
    console.log(error)
  }
}

start()