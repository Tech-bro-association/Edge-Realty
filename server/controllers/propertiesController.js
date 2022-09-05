
const asyncWrapper = require("../middlewares/asyncWrapper");
const { Property } = require("../models/propertyModel");
const { statusCode } = require("./utils/statusCode");



const searchProperties = asyncWrapper(async (req, res, next) => {
    const properties = await Property.find(req.body.query);
    return res.satus(statusCode.OK).send({ message: "Success", response: properties })
})

const addNewPropertyListing = asyncWrapper(async (property_data) => {
    const newListing = new Property(property_data)
    await newListing.save()
    return newListing
})

const removePropertyListing = asyncWrapper(async (req, res, next) => {
    const property = await Property.findByIdAndDelete(req.body.property_id);
    return res.status(statusCode.OK).send({ message: "Success", response: property })
})

const updatePropertyListing = asyncWrapper(async (req, res, next) => {
    const property = await Property.findByIdAndUpdate(req.body.property._id, req.body.property, { new: true })
    return property
})


module.exports = {
    searchProperties,
    addNewPropertyListing,
    removePropertyListing,
    updatePropertyListing
}
