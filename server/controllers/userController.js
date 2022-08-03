const mongoose = require("mongoose");
const User = require("../models/userModel").User;
const resetPasssword = require("../controllers/passwordController").resetPassword;
const savePassword = require("../controllers/passwordController").savePassword;
let db = require('../server').db;

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
async function addNewUser(req, res, next) {
    let data = req.body;
    console.log("--- Request body ---");
    console.log(req.body);
    let user = new User({
        name: data.name,
        email: data.email,
        user_type: data.user_type || "regular",
        address: data.address,
    });

    const session = await db.startSession();

    // Check if user already exists
    await findUserMatch(data.email).then((response) => {
        if (response == true) {
            res.status(400).send({
                message: "User already exists",
            });
        } else {
            session.startTransaction();
            try {
                user.save({ session })
                savePassword(response._id, data.password)
                    .then((response) => {
                        console.log(response)
                        res.status(200).send({ message: "User added successfully" })
                    })
                    .catch((error) => {
                        res.status(400).send({ message: "An error occured" })
                        throw error;
                    })
                session.commitTransaction();
            } catch (error) {
                session.abortTransaction();
                console.log(error)
                throw error;
            } finally {
                session.endSession();
            }
        }
    });
};

// Update user data
function updateUserData(req, res) {
    User.findOneAndUpdate({ _id: req.body._id }, req.body)
        .then((response) => {
            if (response) {
                console.log("User updated successfully");
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
                let userId = response._id;
                // Update password in passwordDB
                // updatePassword(userId, req.body.password);
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
function resetUserPassword(req, res) {
    User.findOne({ email: req.body.email, type: "regular" })
        .then((response) => {
            if (response) {
                resetPasssword(response._id);
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


module.exports = {
    addNewUser,
    updateUserData,
    updateUserPassword,
};
