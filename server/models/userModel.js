const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    user_type: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("Users", userSchema);

module.exports = { User };
