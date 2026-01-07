const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    subject: { // e.g., 'Computer Science', 'Mathematics'
        type: String,
        required: true
    },
    fileType: { // e.g., 'PDF', 'Image', 'Document'
        type: String,
        enum: ['PDF', 'Image', 'Document', 'Link', 'Other'],
        default: 'Link'
    },
    fileUrl: { // The link to the actual file (Drive, Dropbox, etc.)
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    downloads: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);