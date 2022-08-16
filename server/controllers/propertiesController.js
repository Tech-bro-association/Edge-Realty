
const { Property } = require("../models/propertyModel");

async function searchProperties(req, res) {
    try {
        let query = req.query;
        let properties = Property.find(query);
        properties.exec()
            .then(response => {
                res.status(200).send(response)
            })
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

async function addNewPropertyListing() {
}

async function removePropertyListing() {
}

async function updatePropertyListing() {
}

module.exports = {
    searchProperties,
    addNewPropertyListing,
    removePropertyListing,
    updatePropertyListing
}
