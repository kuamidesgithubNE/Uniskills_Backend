const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  phone: String,
  password: String,
  role: { type: String, enum: ['customer', 'artisan'], required: true },
  skills: [String],
  location: String,
  experience: [String],
  availability: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
  profilePic: { type: String, default: '' }, // NEW
});

module.exports = mongoose.model('User', UserSchema);
