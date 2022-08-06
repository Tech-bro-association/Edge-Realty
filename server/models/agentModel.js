const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const agentSchema = new Schema(
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


const Agent = mongoose.model("Agents", agentSchema);


module.exports = { Agent };