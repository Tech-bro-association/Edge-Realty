const User = require("../models/userModel").User;
const { addNewClient, updateClientData } = require("./common/clientsCommonController");
const { Appointment } = require("../models/appointmentModel");

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

function signupForNewsletter(req, res) { }



module.exports = {
    addNewUser,
    updateUserData,
    signupForNewsletter,
};
