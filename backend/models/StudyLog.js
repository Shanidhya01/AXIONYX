const mongoose = require('mongoose');

const StudyLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: "YYYY-MM-DD"
  minutes: { type: Number, required: true },
  source: { type: String, enum: ['pomodoro', 'study-session'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('StudyLog', StudyLogSchema);