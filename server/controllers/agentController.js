
const Agent = require("../models/AgentModel").Agent;
const { Property, Transaction, Appointment } = require("../models/otherModel");
const { addNewClient, updateClientData, authenticateClientLogin } = require("./common/commonController");
const { transporter, mailOptions } = require("./utils/emailService.js");

function loginAgent(req, res) {
    console.log('--- Login Agent ---')
    console.log(req.body)
    authenticateClientLogin(res, "agent", req.body)
}

// Add new Agent to db
function addNewAgent(req, res) {
    let data = req.body;
    console.log("--- Request body ---");
    console.log(req.body);
    let Agent = new Agent({
        name: data.name,
        email: data.email,
        Agent_type: data.signup_type || "regular",
        address: data.address,
    });

    addNewClient(res, "Agent", data, Agent)
};

// Update Agent data
function updateAgentData(req, res) {
    updateClientData(res, "Agent", req.body)
}

function showTransactionHistory(req, res) {
    try {
        Transaction.find({ agent_id: req.body.agent_id })
            .then(response => {
                res.status(200).send(response)
            })
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

function mailAppointment(user_email, agent_email, date, time, notes) {
    try {
        let mailOptions = {
            from: "Rent-A-Home",
            to: user_email,
            subject: "Appointment Confirmation",
            text: `Hello,\n\nYou have booked an appointment with ${agent_email} on ${date} at ${time}.\n\nNotes: ${notes}\n\nRegards,\nRent-A-Home Team.`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

function bookAppointment(req, res) {
    try {
        let new_appointment = new Appointment({
            agent_email_fkey: req.body.agent_email,
            user_email_fkey: req.body.user_email,
            date: req.body.date,
            time: req.body.time,
            notes: req.body.notes,
            status: "pending"
        })
        new_appointment.save()
            .then(response => {
                mailAppointment(req.body.user_email, req.body.agent_email, req.body.date, req.body.time, req.body.notes)
                res.status(200).send(response)
            })
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

function addListing(req, res) {
    try {
        let new_listing = new Property({
            agent_email_fkey: req.body.agent_email,
            name: req.body.name,
            address: req.body.address,
            images: req.body.images,
            description: req.body.description,
            specification: {
                price: req.body.price,
                bedrooms: req.body.bedrooms,
                bathrooms: req.body.bathrooms,
                area: req.body.area
            },
            year_built: req.body.year_built
        });
        new_listing.save()
            .then(response => {
                res.status(200).send(response)
            })
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

function removeListing(req, res) {
    try {
        Property.findOneAndDelete({ _id: req.body.listing_id })
            .then(response => {
                res.status(200).send(response)
            })
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}


module.exports = {
    addNewAgent,
    updateAgentData,
    loginAgent,
    showTransactionHistory,
    bookAppointment,
    addListing,
    removeListing
};
