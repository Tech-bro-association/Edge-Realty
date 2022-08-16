const { Cart } = require("../models/cartModel.");
const { User } = require("../models/userModel"),
    { Agent } = require("../models/agentModel"),

const { findClientMatch } = require("../controllers/common/clientsCommonController");

const clients = {
    "user": User,
    "agent": Agent
}

async function deleteUser(req, res) {
    try {
        let client_id;
        let client_data = await findClientMatch(req.body.client_type, req.body.email)
        if (client_data) { client_id = client_data._id };

        await User.findOneAndDelete({ email: req.body.client_email });
        await Password.findOneAndDelete({ user_id_fkey: client_id });
        await Appointment.findOneAndDelete({ user_email_fkey: req.body.client_email });
        await Cart.findOneAndDelete({ user_email_fkey: req.body.client_email });

        res.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

async function deleteAgent(req, res) { 
    try {
        let client_id;
        let client_data = await findClientMatch(req.body.client_type, req.body.email)
        if (client_data) { client_id = client_data._id };

        await Agent.findOneAndDelete({ email: req.body.client_email });
        await Password.findOneAndDelete({ agent_id_fkey: client_id });
        await Appointment.findOneAndDelete({ agent_email_fkey: req.body.client_email });
        await Cart.findOneAndDelete({ agent_email_fkey: req.body.client_email });
        await Transaction.findOneAndDelete({ agent_email_fkey: req.body.client_email });
        await Property.findOneAndDelete({agent_email_fkey: req.body.client_email});

        res.status(200).send({ message: "Agent deleted successfully" });
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

async function getUserTransactionHistory(req, res) { }

async function getAgentTransactionHistory(req, res) { }

module.exports = {
    deleteUser,
    deleteAgent,
    getUserTransactionHistory,
    getAgentTransactionHistory,
}