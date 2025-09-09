const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // recipient
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional (who triggered)
  type: {
    type: String,
    enum: ["message", "job", "rating", "system"], // flexible for future
    required: true,
  },
  message: { type: String, required: true }, // e.g. "You have a new message"
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);
