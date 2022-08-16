const User = require("../models/userModel").User;
const { addNewClient, updateClientData, authenticateClientLogin } = require("./common/clientsCommonController");
const { Transaction, Cart, Property } = require("../models/cartPropertyTransactionModel.");
const { Appointment } = require("../models/clientCommonModel");

// Add new user to db
function addNewUser(req, res) {
    let data = req.body;
    console.log("--- Request body ---");
    console.log(req.body);
    let user = new User({
        name: data.name,
        email: data.email,
        user_type: data.user_type || "regular",
        address: data.address,
    });

    addNewClient(res, "user", data, user)
};

// Update user data
function updateUserData(req, res) {
    updateClientData(res, "user", req.body)
}



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

function signupForNewsletter(req, res) { }



module.exports = {
    addNewUser,
    updateUserData,
    addPropertyToCart,
    removePropertyFromCart,
    getCartItems,
    checkoutCart,
    searchProperties,
    showTransactionHistory,
    bookAppointment,
    signupForNewsletter,
};
