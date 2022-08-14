const User = require("../models/userModel").User;
const { addNewClient, updateClientData, authenticateClientLogin } = require("./commonController");

function loginUser(req, res) {
    console.log('--- Login User ---')
    console.log(req.body)
    authenticateClientLogin(res, "user", req.body)
}

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

function findUser(req, res) {
    try {
        User.findOne({ _id: req.body._id })
            .then((response) => {
                if (response) {
                    console.log(response)
                    res.status(200).send({ message: "User found" })
                } else {
                    res.status(404).send({ message: "User not found" })
                }
            })
    } catch (error) {

    }
}

// Update user data
function updateUserData(req, res) {
    updateClientData(res, "user", req.body)
}

function addPropertyToCart(req, res) { }

function completePayment(req, res) { }

function showTransactionHistory(req, res) { }

function bookAppointment(req, res) { }

function signupForNewsletter(req, res) { }

function reportAgent(req, res) { }



module.exports = {
    addNewUser,
    updateUserData,
    loginUser,
    findUser
};
