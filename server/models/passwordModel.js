const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    agent_id_fkey: {
        type: String,
    },
    admin_id_fkey: {
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

const Password = mongoose.model("Passwords", passwordSchema);
const TempPassword = mongoose.model("TempPasswords", tempPasswordSchema);

module.exports = { Password, TempPassword };