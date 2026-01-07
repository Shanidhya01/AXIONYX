// server/models/ResourceRequest.js
const mongoose = require('mongoose');

const ResourceRequestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    subject: {
        type: String,
        required: true
    },
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isFulfilled: {
        type: Boolean,
        default: false
    },
    upvotes: [{ // Users who also need this resource
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('ResourceRequest', ResourceRequestSchema);