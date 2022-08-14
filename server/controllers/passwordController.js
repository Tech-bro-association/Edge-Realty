// const User = require("../models/userModel").User;
const { Password, TempPassword } = require("../models/passwordModel"),
    { hashPassword, checkHash } = require("./utils/hash.js"),
    { transporter, mailOptions } = require("./utils/emailService.js"),
    { findClientMatch } = require("./commonController"),
    { saveAccessToken } = require("../middleware/accessToken"),
    randomToken = require("random-token"),
    htmlHostAddress = "http://localhost:8080";

const User = require("../models/userModel").User,
    Agent = require("../models/agentModel").AgentModel,
    Admin = require("../models/adminModel").AdminModel;

const clients = {
    "user": User,
    "agent": Agent,
    "admin": Admin
}
let clientModel;

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

/* Require: client_type, client_data, client_id */
async function authenticateClientLogin(req, res) {
    try {
        clientModel = clients[req.body.client_type];
        console.log(req.body)
        let search_response = await clientModel.findOne({ email: req.body.email })
        console.log(search_response)
        if (search_response) {
            let response = await checkPassword(search_response._id, req.body.password);
            if (response) {
                let access_token = randomToken(16);
                saveAccessToken(req.body.email, access_token);
                res.status(200).send({ message: "User Logged in successfully", access_token: access_token });
            } if (response == false) { throw "User password incorrect" }

        } else {
            throw "User not found"
        }

    } catch (error) {
        console.log(error)
        res.status(404).send({
            message: "User does not exist",
        });
    }
}

/* Resolves true or false if password matches saved hash value */
function checkPassword(user_id, user_password) {
    return new Promise((resolve, reject) => {
        Password.findOne({ user_id_fkey: user_id })
            .then(response => {
                console.log("password found")
                /* console.log(response) */
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
            let search_response = await TempPassword.findOneAndDelete({ user_id_fkey: client_data._id, token: token });

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
        let client_data = await findClientMatch(req.body.client_type, req.body.email);
        // console.log(client_data)
        if (client_data) {
            let hash = await hashPassword(req.body.new_password)
            if (hash) {
                await Password.findOne({ user_id_fkey: client_data._id }).then((response) => { /* console.log(response) */ }, (error) => { console.log(error) })

                await Password.findOneAndUpdate({ user_id_fkey: client_data._id }, { password: hash }, { upsert: false })
                    .then((response) => {
                        /* console.log(response) */
                    })
                await Password.findOne({ user_id_fkey: client_data._id }).then((response) => { /* console.log(response) */ })
                res.status(200).send({ message: "Password changed successfully" });
            }
        } else { throw "An error occured" }

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "An error occured" });
    }


}

module.exports = {
    checkPassword,
    resetClientPassword,
    confirmResetToken,
    changeOldPassword,
    sendResetToken,
    confirmResetToken,
    authenticateClientLogin,
}