const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const options = { discriminatorKey: 'itemType', collection: 'users' }

const status = new Schema ({
    user: {
        type: Schema.Types.ObjectId,
        refPath: 'role'
    },
    role: {
        type: String,
        required: true,
        enum: ["Founder", "SuperAdmin", "Staff", "Ticketer", "BoatOperator", "EndUser"]
    },
    isActive: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamp: true })

const Status = mongoose.model("Status", status)

module.exports = {
    Status
}