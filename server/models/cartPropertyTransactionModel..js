const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const propertySchema = new Schema({
    agent_email_fkey: { type: String },
    name: { type: String },
    address: { type: String },
    city: { type: String },
    images: { type: Array },
    description: { type: String },
    tag: { type: String },
    specifications: {
        price: { type: Number },
        bedrooms: { type: Number },
        bathrooms: { type: Number },
        area: { type: Number },
    },
    year_built: { type: Number }
}, { timestamps: true });

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



const cartSchema = new Schema({
    user_email_fkey: { type: String },
    properties: { type: Array }
}, { timestamps: true });


const Transaction = mongoose.model("Transactions", transactionSchema),
    Property = mongoose.model("Properties", propertySchema),
    Cart = mongoose.model("Carts", cartSchema);

module.exports = { Transaction, Property, Cart };