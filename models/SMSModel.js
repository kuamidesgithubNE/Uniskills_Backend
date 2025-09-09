// models/SMSLog.js
const mongoose = require('mongoose');

const smsLogSchema = new mongoose.Schema({
  to: String,
  message: String,
  status: { type: String, enum: ['Sent', 'Failed', 'Pending'], default: 'Pending' },
  relatedJob: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SMSLog', smsLogSchema);
