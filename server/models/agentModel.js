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


const agentPasswordSchema = new Schema({
    agent_id_fkey: {
        type: String,
    },
    password: {
        type: String,
    },
});

const agentTempPasswordSchema = new Schema({
    agent_id_fkey: {
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
}
    , { timestamps: true }
);


const Agent = mongoose.model("Agents", agentSchema);
const AgentPassword = mongoose.model("AgentPasswords", agentPasswordSchema);
const AgentTempPassword = mongoose.model("AgentTempPasswords", agentTempPasswordSchema);

module.exports = { Agent, AgentPassword, AgentTempPassword };