const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accessTokenSchema = new Schema({
    user_email_fkey: {
        type: String,
    },
    access_token: {
        type: String,
    },
});

const AccessToken = mongoose.model("AccessTokens", accessTokenSchema);
module.exports = { AccessToken }