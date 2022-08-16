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

const Property = mongoose.model("Properties", propertySchema);

module.exports = { Property };