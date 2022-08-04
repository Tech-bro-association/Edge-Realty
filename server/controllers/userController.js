// const mongoose = require("mongoose");
const User = require("../models/userModel").User;
const resetPasssword = require("../controllers/passwordController").resetPassword;
const savePassword = require("../controllers/passwordController").savePassword;
const { MongoClient } = require("mongodb");
// const client = require('../server').db;

// let uri, client, db;
// (async () => {
//     uri = "mongodb://localhost:27017/" + 'replicaSet=rs';
//     client = await MongoClient.connect(uri, { useNewUrlParser: true });
//     db = client.db("Edge-Realty");
//     client.db("Edge-Realty").collection("users").find({}).toArray(function (err, result) {
//         if (err) throw err;
//         console.log(`${result.length} users found`);
//     }
//     );

// })()

// mongoose.connect(uri);
// const client = mongoose.connection;

// client.on("error", console.error.bind(console, "connection error:"));
// client.once("open", function () {
//     console.log('--- User controller ---')
//     console.log(`Connection to ${client.name} database Successful!`);
// });


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

    // Check if user already exists
    findUserMatch(data.email).then((response) => {
        if (response) {
            res.status(400).send({
                message: "User already exists",
            });
        } else {
            // Try using Transactions here
            (async () => {
                try {
                    let temp_id;
                    await user.save()
                    await savePassword(response._id, data.password)
                        .then((response) => {
                            temp_id = response._id
                            console.log(response)
                            res.status(200).send({ message: "User added successfully" })
                        })
                        .catch((error) => {
                            res.status(400).send({ message: "An error occured" })
                            throw error;
                        })
                    console.log('[OK] - Password Saved')
                } catch (error) {
                    user.findOneAndDelete({ _id: temp_id }).then(response => console.log(response))
                    console.log(error)
                }
            })()
        }
    }).catch(error => console.log(error));
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
