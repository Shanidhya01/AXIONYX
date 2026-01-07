const mongoose = require('mongoose');

const StudySessionSchema = new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  subject: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, default: '' },
  
  // Participants logic
  maxParticipants: { type: Number, required: true, default: 5 },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Time logic
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudySession', StudySessionSchema);