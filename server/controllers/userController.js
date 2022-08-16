const User = require("../models/userModel").User;
const { addNewClient, updateClientData, authenticateClientLogin } = require("./common/clientsCommonController");
const { Transaction, Cart, Property, Appointment } = require("../models/otherModel");


// Add new user to db
function addNewUser(req, res) {
    let data = req.body;
    console.log("--- Request body ---");
    console.log(req.body);
    let user = new User({
        name: data.name,
        email: data.email,
        user_type: data.user_type || "regular",
        address: data.address,
    });

    addNewClient(res, "user", data, user)
};

// Update user data
function updateUserData(req, res) {
    updateClientData(res, "user", req.body)
}

async function addPropertyToCart(req, res) {
    try {
        let response = await Cart.findOne({ user_email_fkey: req.body.email });
        if (response) {
            response.propertires.push(req.body.property_id);
            await response.save();
            res.status(200).send(response);
        } else {
            let cart = new Cart({
                user_email_fkey: req.body.email,
                properties: [req.body.property_id]
            })
            await cart.save();
            res.status(200).send(cart); // Send cart object
        }
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

async function removePropertyFromCart(req, res) {
    try {
        let response = await Cart.findOne({ user_email_fkey: req.body.email });
        if (response) {
            response.properties.pull(req.body.property_id);
            await response.save();
            res.status(200).send(response);
        } else { res.status(200).send(response) }
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

async function getCartItems(req = null, res = null, user_email = null) {
    try {
        let search_response = await Cart.findOne({ user_email_fkey: req.body.email || user_email });
        if (search_response) {
            let cart_items = []
            for (let i = 0; i < response.properties.length; i++) {
                let property_id = response.properties[i];
                let property = await Property.findOne({ _id: property_id });
                cart_items.push(property);
            }
            if (req) { res.status(200).send(cart_items) }
            return cart_items
        } else {
            if (req) { res.status(200).send(response) }
            return response
        }
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

async function checkoutCart(req, res) {
    // try {
    //     let cart_items = await getCartItems(null, null, req.body.email),
    //         total_amount = 0;
    //     for (let property in cart_items) { total_amount += property.specifications.price };
    //     let transaction = new Transaction({
    //         agent_email_fkey: property.agent_email,
    //         user_email_fkey: req.body.email,
    //         properties: cart_items,
    //         total_amount: total_amount,
    //         payment_method: req.body.payment_method,
    //         payment_status: "pending",
    //         transaction_status: "pending",
    //     })
    //     transaction.save()
    //         .then(response => {
    //             res.status(200).send(response)
    //         })
    // } catch (error) {
    //     console.log(error)
    //     res.status(500).send(error)
    // }
}

async function clearCart(res, res) {
    try {
        let response = await Cart.findOneAndDelete({ user_email_fkey: req.body.email });
        if (response) { res.status(200).send(response) }
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

async function searchProperties(req, res) {
    try {
        let query = req.query;
        let properties = Property.find(query);
        properties.exec()
            .then(response => {
                res.status(200).send(response)
            })
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

function signupForNewsletter(req, res) { }



module.exports = {
    addNewUser,
    updateUserData,
    addPropertyToCart,
    removePropertyFromCart,
    getCartItems,
    checkoutCart,
    searchProperties,
    showTransactionHistory,
    bookAppointment,
    signupForNewsletter,
};
