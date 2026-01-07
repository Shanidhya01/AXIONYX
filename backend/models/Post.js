const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Ensure the required 'title' field is here
    title: { 
        type: String,
        required: true,
        maxlength: 150 
    },
    
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    imageUrl: {
        type: String
    },
    tags: [{
        type: String,
        maxlength: 50
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    commentCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);