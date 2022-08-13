// const User = require("../models/userModel").User;
const { User } = require("../models/userModel"),
    { Password, TempPassword } = require("../models/passwordModel"),
    { transporter, mailOptions } = require("../services/emailService.js"),
    bcrypt = require('bcrypt'),
    randomToken = require("random-token"),
    htmlHostAddress = "http://localhost:8080";


function resetPassword(user_id) {
    return new Promise((resolve, reject) => {
        let token = randomToken(16),
            user_email = response.email;
        TempPassword.findOne({ user_id_fkey: user_id }) // Find user with userId in TempPassword collection
            .then((response) => {
                /* null response - Add new id and token to temppassword collection
                        response - Update user token in temmPassword collection */
                if (response) {
                    updateOrCreateTempPassword(user_id, token, true).then(resolve({ status: "OK" }));
                    /* true -> Update, false -> Create */
                } else {
                    updateOrCreateTempPassword(user_id, token, false).then(resolve({ status: "OK" }));
                }
                mailTemporaryDetails(user_email, token);

            })
            .catch((error) => {
                console.log(error)
                reject(error)
            });
    })
}

async function updateOrCreateTempPassword(user_id, token, task) {
    if (task == "update") {
        return await TempPassword.findOneAndUpdate({ user_id_fkey: user_id }, { token: token }, { new: true })
            .then((response) => {
                console.log("[OK] - Temp password updated successfully");
            })
    }
    if (task == "create") {
        return await TempPassword.create({
            user_id_fkey: user_id,
            token: token
        })
            .then((response) => {
                console.log("[OK] - Temp password created successfully");
            })
    }
}


function mailTemporaryDetails(user_email, token) {
    let message =
        "You requested a password reset for your JounalX account\n\n" +
        "You have been assigned a temporary password" +
        "\n" +
        "Use this temporary token together with your email address to reset your login details" +
        "\n\n" +
        "Email: " +
        user_email +
        "\n" +
        "Temporary password: " +
        token +
        "\n\n" +
        "To reset your password, visit the following link:\n" +
        htmlHostAddress +
        "/templates/authentication/confirm_reset.html/" +
        "\n\n" +
        "\n\n" +
        "If you did not request a password reset, please ignore this email.\n\n" +
        "Regards,\n" +
        "JounalX team";

    let user_mail_option = mailOptions(
        user_email,
        "JournalX Password Reset",
        message
    );

    // Send token and resetLink to user's Email address
    transporter.sendMail(user_mail_option, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
    return
};

/*  Accepts user_email and token,    
    returns true or false if match in database */
function confirmResetToken(req, res, next) {
    // Check temporary password
    console.log(req.body);
    let user_email = req.body.email,
        token = req.body.token,
        new_password = req.body.new_password,
        user_id;

    User.findOne({ user_type: "regular", email: user_email })
        .then((response) => {
            return new Promise((resolve, reject) => {

                if (response) {
                    user_id = response._id;
                    TempPassword.findOne({ user_id_fkey: user_id, token: token })
                        .then((response) => { if (response) { resolve(true) } else { resolve(false) } })
                        .catch((error) => {
                            console.log(error)
                            reject(error)
                        });
                } else { res.status(401).send({ message: "User does not exists" }) };
            })
        })
        .then((response) => {
            if (response == true) {
                changeOldPassword(user_id, new_password).then((response) => {
                    if (response) {
                        TempPassword.findOneAndDelete({ user_id_fkey: user_id })
                            .then((response) => {
                                if (response) { res.status(200).send({ message: "Password updated" }); }
                                else { res.status(404).send({ message: "Token does not exist" }) }
                            }).catch((error) => {
                                console.log(error)
                                res.status(500).send({ message: "An error occured" })
                            });
                    }
                })
            } else { res.status(400).send({ message: "User details does not exist" }) }
        })
};

async function hashPassword(password) {
    let saltRounds = 10
    await bcrypt.hash(password, saltRounds)
        .then(hash => password = hash)
    return password
}

async function checkHash(password, hash, res = null) {
    return await bcrypt.compare(password, hash)
        .then(response => { return response })
}

function savePassword(user_id, user_password) {
    return new Promise((resolve, reject) => {
        hashPassword(user_password).then(hash => {
            let new_password = new Password({
                user_id_fkey: user_id,
                password: hash,
            });
            new_password.save().then(response => {
                console.log(response)
                resolve(response);
            }).catch(error => {
                reject(error);
            });
        }
        ).catch(error => {
            reject(error);
        }
        );
    }); // Promise
}

function changeOldPassword(user_id, new_password) {
    return new Promise((resolve, reject) => {
        hashPassword(new_password).then(hash => {
            Password.findOneAndUpdate({ user_id_fkey: user_id }, { user_id_fkey: user_id, password: hash }, { returnOriginal: false })
                .then((response) => {
                    console.log(response)
                    resolve(response)
                }).catch(error => { reject(error) })
        }).catch(error => { reject(error) })
    })
}

function checkPassword(user_id, user_password) {
    /* Resolves true or false if password matches saved hash value */
    return new Promise((resolve, reject) => {
        Password.findOne({ user_id_fkey: user_id })
            .then(response => {
                if (response) {
                    (async () => {
                        let result = await checkHash(user_password, response.password)
                            .then(response => { return response })
                        resolve(result);
                    })()
                }
            }).catch(error => {
                reject(error);
            });
    })
}


async function resetClientPassword(res, client_type, client_data, client = null) {
    try {
        let token = randomToken(16),
            search_response = TempPassword.findOne({ user_id_fkey: client_data._id });

        /* case 1: user has requested a password reset before - update the temp password */
        if (search_response) { await updateOrCreateTempPassword(client_data._id, token, "update") }

        /* case 2: user has not requested a password reset before - create a new temp password */
        else { await updateOrCreateTempPassword(client_data._id, token, "create") }

        await mailTemporaryDetails(client_data.email, token)
        return "OK"
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "An error occured" });
    }

}

async function updateOrCreateTempPassword(user_id, token) {
    try {
        let search_response = await TempPassword.findOne({ user_id_fkey: user_id });
        if (search_response) {
            TempPassword.findOneAndUpdate({ user_id_fkey: user_id }, { token: token })
                .then((response) => {
                    console.log("[OK] - Temp password updated successfully");
                })
        } else {
            TempPassword.create({ user_id_fkey: user_id, token: token })
                .then((response) => {
                    console.log("[OK] - Temp password created successfully");
                })
        }
    } catch (error) {
        console.log(error);
    }
}

async function checkTempPassword(user_id, token) {
    try {
        let search_response = await TempPassword.findOne({ user_id_fkey: user_id, token: token });
        if (search_response) {
            return true
        } else {
            return false
        }
    } catch (error) {
        console.log(error);
    }
}

async function deleteTempPassword(user_id) {
    try {
        TempPassword.findOneAndDelete({ user_id_fkey: user_id })
            .then((response) => {
                console.log("[OK] - Temp password deleted successfully");
            })
    } catch (error) {
        console.log(error)
        res.status(404).send({ message: "User account does not exist" })
    }

}

module.exports = {
    savePassword,
    checkPassword,
    resetPassword,
    confirmResetToken,
    resetClientPassword,
    checkTempPassword,
    deleteTempPassword,
}