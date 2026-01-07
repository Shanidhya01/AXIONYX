const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slots: [{
    id: { type: String }, 
    start: { type: String },
    end: { type: String }
  }]
});

module.exports = mongoose.model('Timetable', TimetableSchema);