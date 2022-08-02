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

const passwordSchema = new Schema({
  user_id_fkey: {
    type: String,
  },
  password: {
    type: String,
  },
});

const tempPasswordSchema = new Schema({
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
const Password = mongoose.model("Passwords", passwordSchema);
const TempPassword = mongoose.model("TempPasswords", tempPasswordSchema);

module.exports = { User, Password, TempPassword };
