const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    agent_email_fkey: { type: String },
    user_email_fkey: { type: String },
    property_id_fkey: { type: String },
    transaction_type: { type: String },
    transaction_date: { type: Date },
    transaction_amount: { type: Number },
    transaction_status: { type: String },
    transaction_notes: { type: String },
    transaction_date_created: { type: Date },
    transaction_date_updated: { type: Date },
    transaction_date_deleted: { type: Date }
}, { timestamps: true });

const Transaction = mongoose.model("Transactions", transactionSchema)

module.exports = { Transaction }