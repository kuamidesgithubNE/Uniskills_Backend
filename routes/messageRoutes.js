const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Notification = require('../models/Notification'); // 👈 add this

// -------------------- GET ALL MESSAGES (Admin use) --------------------
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .populate("sender receiver", "name email"); // optional
    res.json(messages);
  } catch (err) {
    console.error("Error fetching all messages:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// -----------------------  Get chat list for logged-in user -----------------------------
router.get("/my", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .sort({ createdAt: -1 })
      .populate("sender receiver", "name avatar");

    // Group by conversation partner
    const chatMap = new Map();

    messages.forEach((msg) => {
      const otherUser =
        msg.sender._id.toString() === userId
          ? msg.receiver
          : msg.sender;

      if (!chatMap.has(otherUser._id.toString())) {
        chatMap.set(otherUser._id.toString(), {
          _id: msg._id,
          userId: otherUser._id,
          name: otherUser.name,
          avatar: otherUser.avatar || "https://placehold.co/100x100",
          content: msg.content,
          createdAt: msg.createdAt,
          unreadCount: 0 // you can enhance later
        });
      }
    });

    res.json([...chatMap.values()]);
  } catch (err) {
    console.error("Error fetching chat list:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// -------------------- SEND MESSAGE --------------------
router.post("/", auth, async (req, res) => {
  try {
    const { receiverId, job, content } = req.body;

    const message = await Message.create({
      sender: req.user.id,   // from logged-in user
      receiver: receiverId,
      job,
      content
    });

    // ✅ Create a notification for the receiver
    await Notification.create({
      user: receiverId,
      sender: req.user.id,
      type: "message",
      message: `New message from ${req.user.id}`
    });

    res.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// -------------------- GET CONVERSATION Using a chatid --------------------
router.get("/chat/:chatId", auth, async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ _id: chatId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Error fetching chat by ID:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// -------------------- GET CONVERSATION between two users  --------------------
router.get("/:artisanId/:userId", auth, async (req, res) => {
  try {
    const { artisanId, userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: artisanId, receiver: userId },
        { sender: userId, receiver: artisanId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate("sender receiver", "name email"); // optional

    res.json(messages);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- DELETE MESSAGE --------------------
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

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
