const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, uppercase: true },
  code: { type: String, default: '' },
  sessions: { type: Number, default: 0 }, 
  attended: { type: Number, default: 0 }, 
  color: { type: String, default: 'bg-blue-500' }, 
  schedule: [{
    day: { type: String, required: true }, 
    startTime: { type: String, required: true }, 
    endTime: { type: String, required: true }, 
    room: { type: String, default: '' }
  }],
  // NEW: Store specific logs here to sync across devices
  history: [{
    date: { type: String }, // e.g. "2025-12-11"
    slotId: { type: String }, // e.g. "09:00"
    status: { type: String } // "present", "absent", "cancelled"
  }]
});

module.exports = mongoose.model('Subject', SubjectSchema);