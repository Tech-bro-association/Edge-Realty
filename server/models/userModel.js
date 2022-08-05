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

const userPasswordSchema = new Schema({
  user_id_fkey: {
    type: String,
  },
  password: {
    type: String,
  },
});

const userTempPasswordSchema = new Schema({
  user_id_fkey: {
    type: String,
  },
  token: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 120,
  },
});

const User = mongoose.model("Users", userSchema);
const UserPassword = mongoose.model("Passwords", userPasswordSchema);
const UserTempPassword = mongoose.model("TempPasswords", userTempPasswordSchema);

module.exports = { User, UserPassword, UserTempPassword };