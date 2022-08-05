// const User = require("../models/userModel").User;
const { User, Password, TempPassword } = require("../models/userModel");
const bcrypt = require('bcrypt');
const randomToken = require("random-token");
const { transporter, mailOptions } = require("../services/emailService.js");
const htmlHostAddress = "http://localhost:8080";


function resetPassword(user_id) {
    return new Promise((resolve, reject) => {
        User.findOne({ _id: user_id, user_type: "regular" })
            .then(response => {
                if (response) {
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
                } else {
                    reject(error)
                };
            }).catch(error => {
                console.log(error);
            });
    })

}

async function updateOrCreateTempPassword(user_id, token, update) {
    if (update == true) {
        await TempPassword.findOneAndUpdate(user_id, {
            token: token
        }).then((response) => {
            console.log(response);
        });
        await TempPassword.findOne(user_id).then((response) => {
            console.log(response);
        });
    } else {
        let userNewTempPassword = new TempPassword({
            user_id_fkey: user_id,
            token: token
        });
        await userNewTempPassword.save().then((response) => {
            console.log(response);
        }, (error) => { console.log(error) }).catch(error => console.log(error));
    }

};

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
    console.log(req.body);
    let user_email = req.body.email;
    let token = req.body.token;

    User.findOne({ user_type: "regular", email: user_email })
        .then((response) => {
            console.log(response);
            if (response) {
                TempPassword.findOne({ user_id_fkey: response._id, token: token })
                    .then((response) => {
                        if (response) {
                            res.status(200).send({ match: true });
                        } else {
                            res.status(400).send({ match: false })
                        };
                    })
                    .catch((error) => { console.log(error) });
            } else { res.status(401).send({ message: "User does not exists" }) };
        })
        .catch((error) => { console.log(error) });
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

function checkPassword(user_id, user_password) {
    /* Resolves true or false if password matches saved hash value */
    return new Promise((resolve, reject) => {
        Password.findOne({ user_id_fkey: user_id })
            .then(response => {
                console.log('password.findone')
                console.log(response)
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

module.exports = {
    savePassword,
    checkPassword,
    resetPassword,
    confirmResetToken
}