const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 👈 Add customer
  status: { 
    type: String, 
    enum: ["pending", "accepted", "rejected", "withdrawn"], 
    default: "pending" 
  },
  message: { type: String }, // optional message from artisan
  history: [
    {
      status: String,
      reason: String,
      updatedAt: { type: Date, default: Date.now }
    }
  ],
  appliedAt: { type: Date, default: Date.now }
});

// ✅ Virtual: time ago (use last history update if available)
applicationSchema.virtual("applied").get(function () {
  const now = new Date();

  const diffMs = now - this.appliedAt;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
});

applicationSchema.set("toJSON", { virtuals: true });
applicationSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model('Application', applicationSchema);
