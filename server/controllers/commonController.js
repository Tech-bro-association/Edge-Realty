const { savePassword } = require("./passwordController");

const User = require("../models/userModel").User,
    Agent = require("../models/agentModel").AgentModel,
    Admin = require("../models/adminModel").AdminModel;

const clients = {
    "user": User,
    "agent": Agent,
    "admin": Admin
}

let clientModel;

// findUserMatch for user, admin, or agent
async function findClientMatch(clientType, client_email) {
    try {
        console.log(clientType)
        console.log(clients[clientType])
        clientModel = clients[clientType];
        console.log(clientModel)
        await clientModel.findOne({ email: client_email })
            .then((response) => {
                return response != null
            })
    } catch (error) {
        console.log(error);
        return false
    }

}

async function addNewClient(res, clientType, client, client_data) {
    try {
        let match = await findClientMatch(clientType, client_data.email);

        if (match) {
            res.status(400).send({ message: "User already exists" });
        } else {
            let temp_id;
            let saved_details = await client.save();
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

module.exports = {
    addNewClient,
    findClientMatch
}