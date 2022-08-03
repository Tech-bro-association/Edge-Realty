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
    await bcrypt.hash(null, saltRounds)
        .then(hash => password = hash)
    return password
}

function checkHash(password, hash) {
    return bcrypt.compare(password, hash, function (err, res) {
        if (err) {
            console.log(err)
        } else {
            console.log(res)
        }
        return res  // True of False
    });
}

function savePassword(user_id, user_password) {
    return new Promise((resolve, reject) => {
        hashPassword(user_password).then(hash => {
            let new_password = new Password({
                user_id_fkey: user_id,
                password: hash,
            });
            new_password.save({ session }).then(response => {
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

module.exports = {
    resetPasssword,
    savePassword
}