const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const jwt = require('jsonwebtoken');
const { ResetToken } = require('./tokenModel');
const config = process.env

const options = { discriminatorKey: 'itemType', collection: 'users', toObject : {virtuals: true} }


const defaultUserSchema = new Schema({
    firstname: { type: String, required: [true, "Firstname is required"] },
    lastname: { type: String, required: [true, "Lastname is required"] },
    email: { type: String, required: [true, "email is required"], unique: true},
    phonenumber: { type: String, required: [true, "phone number is required"] },
    address: { type: String },
}, options, { timestamp: true })
const Base = mongoose.model("defaultUsers", defaultUserSchema)


const endUser = new Schema({
    role: { type: String, required: [true, "role is required"], default: "EndUser" },
    // verification_token: { type: Schema.Types.ObjectId, ref: 'VerificationToken'}
});

const agent = new Schema({
    role: { type: String, required: [true, "role is required"], default: "Agent" },
    profile_picture: { type: String },
        description: { type: String },
        contact: {
            linkedln: { type: String },
            facebook: { type: String },
            instagram: { type: String },
            twitter: { type: String },
            phone: { type: String },
        }
});

const admin = new Schema({
    firstname: { type: String, required: [true, "Firstname is required"] },
    lastname: { type: String, required: [true, "Lastname is required"] },
    email: { type: String, unique: true, required: [true, "email is required"] },
    phonenumber: { type: String, required: [true, "phone number is required"] },
    address: { type: String },
    role: { type: String, required: [true, "role is required"], default: "Admin" }
}, options, { timestamp: true });


const Users = [admin, endUser, agent]
Users.forEach(function (userSchema) {
    userSchema.methods.createJWT = function () {
        return jwt.sign({ _id: this._id, name: this.name, email: this.email, role: this.role }, config.JWT_SECRET, { expiresIn: config.JWT_LIFETIME })
    }

    userSchema.methods.createResetToken = async function (reset_token) {
        await ResetToken.findOneAndUpdate({ user: this._id, role: this.role }, { token: reset_token }, { upsert: true }, function (err, doc) {
            if (err) { throw "An error occured" }
        }).clone()
        return jwt.sign({ _id: this._id, reset_token, email: this.email, role: this.role }, config.JWT_SECRET, { expiresIn: config.JWT_LIFETIME })
    }

    userSchema.virtual('status', {
        ref: "Status",
        localField: "_id",
        foreignField: "user",
        justOne: true
    })
    userSchema.virtual('verification_token', {
        ref: "VerificationToken",
        localField: "_id",
        foreignField: "user",
        justOne: true
    })
    userSchema.virtual('reset_token', {
        ref: "ResetToken",
        localField: "_id",
        foreignField: "user",
        justOne: true
    })

    userSchema.virtual('password', {
        ref: "Password",
        localField: "_id",
        foreignField: "user",
        justOne: true
    })

    userSchema.virtual('fullName').
        get(function () { return `${this.firstName} ${this.lastName}`; }).
        set(function (v) {
            // `v` is the value being set, so use the value to set
            // `firstName` and `lastName`.
            const firstName = v.substring(0, v.indexOf(' '));
            const lastName = v.substring(v.indexOf(' ') + 1);
            this.set({ firstName, lastName });
        });

})

const Agent = Base.discriminator("Agent", agent),
    EndUser = Base.discriminator("EndUser", endUser),
    Admin = Base.discriminator("Admin", admin)

module.exports = {
    Agent,
    EndUser,
    Admin
};