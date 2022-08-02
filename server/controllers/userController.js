const User = require("../models/userModel").User;
const hostAddress = "http://localhost:5000";


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
    findUserMatch(data.email).then((response) => {
        if (response == true) {
            res.status(400).send({
                message: "User already exists",
            });
        } else {
            user
                .save()
                .then((response) => {
                    if (response) {
                        // Add user password to passwordDB
                        // addPassword(response._id, data.password);
                        res.status(200).send({
                            message: "User added successfully",
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

module.exports = {
    addNewUser,
    updateUserData,
    updateUserPassword,
};
