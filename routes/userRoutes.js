const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require("cors");


require('dotenv').config();




const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer storage config
const storage = multer.diskStorage({
  destination: 'uploads/', // save files in "uploads" folder
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  }
});

const upload = multer({ storage });


app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads')); // serve images



// Signup (Customer or Artisan)
router.post('/signup', async (req, res) => {
  const { name, email, phone, password, role, skills, location, experience } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      skills,
      location,
      experience
    });

    await user.save();

    res.status(201).json({
      message: 'Signup successful. Await admin approval if artisan.',
      user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Optional: Block unapproved artisans
    if (user.role === 'artisan' && user.isApproved) {
      return res.status(403).json({ message: 'Artisan not approved by admin yet' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        availability: user.availability,
        skills: user.skills,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Get logged-in user's profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // exclude password
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /users/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = (({ name, phone, skills, location, experience, bio, portfolio, profilePic }) => 
      ({ name, phone, skills, location, experience, bio, portfolio, profilePic }))(req.body);

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.json(user);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// POST /users/:id/rate
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) return res.status(404).json({ error: "User not found" });

    targetUser.ratings.push({
      user: req.user.id,
      rating,
      review
    });

    await targetUser.save();
    res.json({ success: true, ratings: targetUser.ratings, average: targetUser.averageRating });
  } catch (err) {
    console.error("Error adding rating:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("ratings.user", "name");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      ...user.toObject(),
      averageRating: user.averageRating
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;
