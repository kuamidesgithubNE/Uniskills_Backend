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
  profilePic: { type: String, default: '' },

  // Portfolio
  bio: { type: String, default: '' }, 
  portfolio: [{ type: String }], // URLs of images/projects uploaded

  // Ratings
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who rated
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

// Virtual field for average rating
UserSchema.virtual('averageRating').get(function () {
  if (!this.ratings.length) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
  return sum / this.ratings.length;
});

module.exports = mongoose.model('User', UserSchema);
