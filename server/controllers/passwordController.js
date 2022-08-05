const User = require("../models/userModel").User;
const Password = require("../models/userModel").Password;
const bcrypt = require('bcrypt');




function resetPasssword(user_id, new_password) {
    User.findOne(user_id).then(response => {
        if (response) {
            hashPassword(new_password).then(hash => {
                Password.findOneAndUpdate({ user_id_fkey: user_id }, { password: hash })
                    .then(response => {
                        console.log(response);
                    })
                    .catch(error => {
                        console.log(error);
                    });
            })
        }
    }).catch(error => {
        console.log(error);
    });
}

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
    resetPasssword,
    savePassword,
    checkPassword,
}