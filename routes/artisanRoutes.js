const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const auth = require('../middleware/auth');

// GET /api/artisans?skill=Plumbing&location=Accra
router.get('/', async (req, res) => {
  try {
    const { skill, location } = req.query;

    // Only return approved artisans
    const filter = {
      role: 'artisan',
      isApproved: true
    };

    if (skill) {
      filter.skills = { $in: [skill] }; // Match skill in skills array
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' }; // Case-insensitive location search
    }

    const artisans = await User.find(filter).select('-password');

    res.json({ count: artisans.length, artisans });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
