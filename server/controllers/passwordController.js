// const User = require("../models/userModel").User;
const { User } = require("../models/userModel"),
    { Password, TempPassword } = require("../models/passwordModel"),
    { transporter, mailOptions } = require("../services/emailService.js"),
    { findClientMatch } = require("./commonController")
bcrypt = require('bcrypt'),
    randomToken = require("random-token"),
    htmlHostAddress = "http://localhost:8080";


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

async function hashPassword(password) {
    let saltRounds = 10
    await bcrypt.hash(password, saltRounds)
        .then(hash => password = hash)
    return password
}

async function checkHash(password, hash, _res = null) {
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

async function resetClientPassword(req, res) {
    try {
        console.log(req.body)
        let client_data = await findClientMatch(req.body.client_type, req.body.email)
        console.log(client_data)
        if (client_data) {
            let reset_response = await sendResetToken(client_data);
            if (reset_response == "OK") {
                res.status(200).send({ message: "Reset token sent to user's email" });
            } else {
                res.status(404).send({ message: "User does not exist" });
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "An error occured" });
    }
}

async function updateOrCreateResetToken(user_id, token, task) {
    if (task == "update") {
        return await TempPassword.findOneAndUpdate({ user_id_fkey: user_id }, { token: token }, { new: true })
            .then((_response) => { console.log("[OK] - Temp password updated successfully") })
    }
    if (task == "create") {
        return await TempPassword.create({
            user_id_fkey: user_id,
            token: token
        }).then((_response) => { console.log("[OK] - Temp password created successfully") })
    }
}

async function sendResetToken(client_data) {
    try {
        let token = randomToken(16),
            search_response = await TempPassword.findOne({ user_id_fkey: client_data._id });

        /* case 1: user has requested a password reset before - update the temp password */
        if (search_response) { await updateOrCreateResetToken(client_data._id, token, "update") }

        /* case 2: user has not requested a password reset before - create a new temp password */
        else { await updateOrCreateResetToken(client_data._id, token, "create") }

        mailTemporaryDetails(client_data.email, token)

        return "OK"
    } catch (error) {
        console.log(error);
        return "ERROR"
    }

}

async function confirmResetToken(req, res) {
    try {
        let user_email = req.body.email,
            token = req.body.token,
            client_data = await findClientMatch(req.body.client_type, user_email);

        if (client_data) {
            let search_response = await TempPassword.findOne({ user_id_fkey: client_data._id, token: token });

            if (search_response) {
                console.log("[OK] - Token Match found")
                res.status(200).send({ message: "Token Match found" });
            } else {
                console.log("[Error] Token Match not found")
                throw "Token Match not found"
            }

        } else { throw "An error occured" }

    } catch (error) {
        console.log(error);
        res.status(404).send({ message: error });
    }
}

async function changeOldPassword(req, res) {
    try {
        let client_data = findClientMatch(req.body.client_type, req.body.email);
        if (client_data) {
            await hashPassword(req.new_password).then(hash => {
                Password.findOneAndUpdate({ user_id_fkey: user_id }, { user_id_fkey: user_id, password: hash }, { returnOriginal: false })
                    .then((response) => {
                        console.log(response)
                    })
            })
            res.status(200).send({ message: "Password changed successfully" });
        } else { throw "An error occured" }

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "An error occured" });
    }


}

async function deleteResetToken(user_id) {
    try {
        TempPassword.findOneAndDelete({ user_id_fkey: user_id })
            .then((_response) => {
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
    resetClientPassword,
    confirmResetToken,
    changeOldPassword,
    sendResetToken,
    confirmResetToken,
    deleteResetToken,
}