const User = require("../models/userModel").User;
const resetPasssword = require("../controllers/passwordController").resetPassword;
const savePassword = require("../controllers/passwordController").savePassword;
const { addNewClient, findClientMatch,
    updateClientData, authenticateClientLogin,
    resetClientPassword } = require("./commonController")


function loginUser(req, res) {
    console.log('--- Login User ---')
    console.log(req.body)
    authenticateClientLogin(res, "user", req.body)
}

//  Find user match
function findUserMatch(user_email) {
    return User.findOne({ email: user_email })
        .then((response) => {
            return response != null
        }
        ).catch((error) => {
            console.log(error);
            return false
        });
}

// Add new user to db
function addNewUser(req, res, next) {
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

// Update user password
function updateUserPassword(req, res) {
    User.findOne({ email: req.body.email })
        .then((response) => {
            if (response) {
                let user_id = response._id;
                // Update password in passwordDB
                savePassword(user_id, req.body.password);
            } else {
                res.status(404).send({
                    message: "User does not exist",
                });
            }
        })
        .catch((error) => {
            res.status(400).send({
                message: "An error occured",
            });
        });
}

// resetUserPassword
async function resetUserPassword(req, res) {
    User.findOne({ email: req.body.email, type: "regular" })
        .then((response) => {
            if (response) {
                resetPasssword(response._id).then((response) => {
                    if (response) {
                        console.log('[OK] - ' + response)
                        res.status(200).send({ message: "Temporary reset token sent to user email" })
                    }

                }, (error) => {
                    console.log(error)
                    res.status(401).send({ message: "User account does not exist" })
                });

            } else {
                res.status(404).send({
                    message: "User does not exist",
                });
            }
        })
        .catch(error => {
            console.log(error)
        })
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
    updateUserPassword,
    loginUser,
    resetUserPassword,
    findUser
};
