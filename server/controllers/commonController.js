const { savePassword, checkPassword, resetPassword } = require("./passwordController");
const randomToken = require("random-token")
// const { loginUser } = require("./userController");

const User = require("../models/userModel").User,
    Agent = require("../models/agentModel").AgentModel,
    Admin = require("../models/adminModel").AdminModel;

const clients = {
    "user": User,
    "agent": Agent,
    "admin": Admin
}

let clientModel;

/* Require: client_type, client_data, client_id */
async function authenticateClientLogin(res, client_type, client_data, client = null) {
    try {
        clientModel = clients[client_type];
        let search_response = await clientModel.findOne({ email: client_data.email })
        console.log(search_response)

        checkPassword(search_response._id, client_data.password)
            .then((response) => {
                console.log(response)
                if (response) {
                    res.status(200).send({ message: "User Logged in successfully" });
                } if (response == false) { throw error }
            })

    } catch (error) {
        console.log(error)
        res.status(404).send({
            message: "User does not exist",
        });
    }
}

/* Require: client_type, client_email;
   Returns: client_data in DB | false */
async function findClientMatch(client_type, client_email) {
    try {
        console.log(client_type, client_email)
        clientModel = clients[client_type];
        return await clientModel.findOne({ email: client_email })
            .then((response) => {
                console.log(response)
                return response
            }).catch((error) => {
                console.log(error)
                return false
            })
    } catch (error) {
        console.log(error);
        return false
    }

}

/* Require: http_response_obj client_type, client_data, client_model */
async function addNewClient(res, client_type, client_data, client) {
    try {
        let match = await findClientMatch(client_type, client_data.email);

        if (match == "OK") {
            res.status(400).send({ message: "User already exists" });
        } else {
            let temp_id;
            let saved_details = await client.save();
            console.log(saved_details)
            savePassword(saved_details._id, client_data.password)
                .then((response) => {
                    console.log(response);
                    temp_id = response._id;
                    res.status(200).send({ message: "User added succesfully" });
                });
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "An error occured" });
    }
}

/* Require: http_response_obj, client_type, client_data */
async function updateClientData(res, client_type, client_data, client = null) {
    try {
        clientModel = clients[client_type];
        console.log(client)
        clientModel.findOneAndUpdate({ _id: client_data._id }, client_data)
            .then((response) => {
                if (response) {
                    console.log("[OK] - User updated successfully");
                    res.status(200).send({ message: "User Data updated successfully" })
                } else {
                    res.status(404).send({
                        message: "User does not exist",
                    });
                }
            })
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "An error occured" });
    }

}


module.exports = {
    addNewClient,
    findClientMatch,
    updateClientData,
    authenticateClientLogin,
}