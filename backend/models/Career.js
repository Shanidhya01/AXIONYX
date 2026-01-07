const mongoose = require('mongoose');

const CareerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  location: { type: String, default: 'Remote' },
  date: { type: Date, required: true },
  link: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Applied', 'OA Received', 'Interview', 'Offer', 'Rejected'], 
    default: 'Applied' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Career', CareerSchema);