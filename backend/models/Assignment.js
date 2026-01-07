const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Links task to specific user
  title: { type: String, required: true },
  subject: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['To Do', 'In Progress', 'Done'], 
    default: 'To Do' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);