const { User } = require("../models/userModel"),
    { Agent } = require("../models/agentModel"),
    { Admin } = require("../models/adminModel");


async function deleteUser(req, res) {}

async function deleteAgent(req, res) {}

async function getUserTransactionHistory(req, res) {}

async function getAgentTransactionHistory(req, res) {}

module.exports = {
    deleteUser,
    deleteAgent,
    getUserTransactionHistory,
    getAgentTransactionHistory,
}