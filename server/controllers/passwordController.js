const User = require("../models/userModel").User;
const Password = require("../models/userModel").Password;
const hostAddress = "http://localhost:5000";


function resetPasssword(user_id, new_password) {
    User.findOne(user_id).then(response => {
        if (response) {
            Password.findOneAndUpdate({ user_id_fkey: user_id }, { password: new_password })
                .then(response => {
                    console.log(response);
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }).catch(error => {
        console.log(error);
    });
}

function savePassword(user_id, user_password) {
    let newPassword = new Password({
        user_id_fkey: user_id,
        password: user_password
    });
    return newPassword.save()
        .then(response => {
            console.log("---Saving password ---")
            console.log(response)
            console.log('Password updated successfully')
            return response
        })
        .catch(error => {
            console.log(error)
            return error
        });
}

module.exports = {
    resetPasssword,
    savePassword
}