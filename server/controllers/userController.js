const User = require("../models/userModel").User;
const resetPasssword = require("../controllers/passwordController").resetPassword;
const savePassword = require("../controllers/passwordController").savePassword;
const checkPassword = require("../controllers/passwordController").checkPassword;
const { addNewClient, findClientMatch } = require("./commonController")


function loginUser(req, res) {
    console.log('--- Login User ---')
    console.log(req.body)
    User.findOne({ email: req.body.email })
        .then((response) => {
            console.log(response)
            try {
                checkPassword(response._id, req.body.password)
                    .then(response => {
                        console.log(response)
                        if (response) {
                            res.status(200).send({
                                message: "User logged in successfully",
                            });
                        } if (response == false) {
                            // console.log('invalid password')
                            res.status(404).send({
                                message: "User does not exist",
                            });
                        }
                    })
            } catch (error) {
                console.log("[Error] - " + error.message)
                res.status(400).send({
                    message: "User does not exist",
                });
            }

        })
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

    addNewClient(res, "user", user, data)
    // Check if user already exists
    // findUserMatch(data.email).then((response) => {
    //     if (response) {
    //         res.status(400).send({
    //             message: "User already exists",
    //         });
    //     } else {
    //         // Try using Transactions here
    //         try {
    //             let temp_id;
    //             user.save().then((response) => {
    //                 savePassword(response._id, data.password)
    //                     .then((response) => {
    //                         console.log(response)
    //                         temp_id = response._id
    //                         res.status(200).send({ message: "User added successfully" })
    //                     })
    //                     .catch((error) => {
    //                         res.status(400).send({ message: "An error occured" })
    //                         throw error;
    //                     })
    //                 console.log('[OK] - Password Saved')
    //             })
    //         } catch (error) {
    //             user.findOneAndDelete({ _id: temp_id }).then(response => console.log(response))
    //             console.log(error)
    //         }
    //     }
    // }).catch(error => console.log(error));
};

// Update user data
function updateUserData(req, res) {
    User.findOneAndUpdate({ _id: req.body._id }, req.body)
        .then((response) => {
            if (response) {
                console.log("[OK] - User updated successfully");
                res.status(200).send({
                    message: "User data updated successfully",
                });
            } else {
                res.status(404).send({
                    message: "User does not exist",
                });
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(400).send({
                message: "An error occured",
            });
        });
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
    resetUserPassword
};
