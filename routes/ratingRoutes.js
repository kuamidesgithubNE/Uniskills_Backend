// routes/ratingRoutes.js
const express = require('express');
const Rating = require('../models/RateModel');
const auth = require('../middleware/auth'); // your auth middleware
const router = express.Router();

// ✅ Create rating
router.post('/', auth, async (req, res) => {
  try {
    const { artisan, job, rating, comment } = req.body;
    const customer = req.user.id; // from auth

    const newRating = new Rating({ customer, artisan, job, rating, comment });
    await newRating.save();

    res.status(201).json(newRating);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get ratings for an artisan
router.get('/artisan/:id', async (req, res) => {
  try {
    const ratings = await Rating.find({ artisan: req.params.id })
      .populate('customer', 'name email') // show who rated
      .populate('job', 'title');

    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get average rating for an artisan
router.get('/artisan/:id/average', async (req, res) => {
  try {
    const result = await Rating.aggregate([
      { $match: { artisan: new mongoose.Types.ObjectId(req.params.id) } },
      { $group: { _id: "$artisan", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    if (result.length === 0) {
      return res.json({ avgRating: 0, count: 0 });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get ratings by customer (optional)
router.get('/customer/:id', async (req, res) => {
  try {
    const ratings = await Rating.find({ customer: req.params.id })
      .populate('artisan', 'name email')
      .populate('job', 'title');

    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
