const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // --- Auth Fields ---
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
        type: String,
        required: function() {
        return !this.googleId && !this.githubId && !this.firebaseUid;
        },
        select: false 
    },
  
  // --- Profile Fields ---
  dob: { type: Date },
  city: { type: String, default: '' },
  college: { type: String, default: '' },
  role: { type: String, enum: ['Student', 'Teacher', 'Admin'], default: 'Student' },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },

  googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true
    },
  
  // --- Social & Chat Fields (Crucial for Chat.jsx) ---
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  unread: { type: Map, of: Number, default: {} },
  lastActivity: { type: Map, of: Date, default: {} } 
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);