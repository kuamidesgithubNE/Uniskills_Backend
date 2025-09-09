// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  budget: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: [String], default: [] }, 
  duration: { type: String, },
  status: { 
    type: String, 
    enum: ['Open', 'Pending', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  category: { type: String, required: true },
  urgency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  postedBy: {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    image: { type: String },
    verified: { type: Boolean, default: false },
    memberSince: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

// Virtual field to compute "posted"
jobSchema.virtual('posted').get(function () {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
});

// Make sure virtuals are included when sending JSON
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);
