const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');





// Get all messages (admin use)
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }); // latest first
    res.json(messages);
  } catch (err) {
    console.error("Error fetching all messages:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { senderId, receiverId, job, content } = req.body;

  const message = await Message.create({
    sender: senderId,
    receiver: receiverId,
    job,
    content
  });

  res.json(message);
});


// -------------------- GET CONVERSATION --------------------
// Between logged-in user (myUserId) and another user (userId)
router.get("/:artisanId/:userId", auth, async (req, res) => {
  try {
    const { artisanId, userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: artisanId, receiver: userId },
        { sender: userId, receiver: artisanId }
      ]
    }).sort({ createdAt: 1 }); // oldest first

    res.json(messages);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// DELETE message by ID
router.delete("delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the message
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    // Only sender can delete their own message
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to delete this message" });
    }

    await message.deleteOne();

    res.json({ msg: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;