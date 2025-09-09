const express = require('express');
const router = express.Router();
const Job = require('../models/JobModel');
const auth = require('../middleware/auth');
const Application = require('../models/Application');
const Notification = require('../models/Notification'); 


//View Jobs 

router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().populate("postedBy.customer", "name");
    if (jobs.length === 0) {
      res.status(404).json({ message: "No jobs available right now!" });
    } else {
      res.status(200).json(jobs);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------- GET ALL JOBS POSTED BY CUSTOMER ----------------
router.get("/my", auth, async (req, res) => {
try {
  if (req.user.role !== "customer") {
    return res.status(403).json({ message: "Only customers can view their jobs" });
  }

  // fetch jobs posted by this customer
  const jobs = await Job.find({ "postedBy.customer": req.user.id }).lean();

  const jobsWithCount = await Promise.all(
    jobs.map(async (job) => {
      const count = await Application.countDocuments({ job: job._id });

      // compute time ago
      const now = new Date();
      const postedAt = new Date(job.createdAt || job.postedAt); // adjust based on your schema
      const diffMs = now - postedAt;
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeAgo = "";
      if (diffMinutes < 1) timeAgo = "Just now";
      else if (diffMinutes < 60) timeAgo = `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
      else if (diffHours < 24) timeAgo = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      else timeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

      return {
        ...job,
        applicantsCount: count,
        timeAgo,
      };
    })
  );

  console.log("Jobs with applicants count & timeAgo:", jobsWithCount);
  res.json(jobsWithCount);
} catch (err) {
  res.status(500).json({ error: err.message });
}

});

// ---------------- GET APPLICANTS FOR A JOB (by customer) ----------------
router.get("/:jobId/applications", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Ensure only customer who posted it can see
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your job" });
    }

    // Fetch applications
    const applications = await Application.find({ job: job._id })
      .populate("artisan", "name email phone skills rating");

    res.json({
      job: {
        id: job._id,
        title: job.title,
        location: job.location,
        timeAgo: job.timeAgo,
      },
      applicantsCount: applications.length,
      applications,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get a single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy.customer", "name");
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Create job request (by customer)
router.post('/request', async (req, res) => {
  const {
    title,
    location,
    budget,
    description,
    requirements,
    category,
    urgency,
    postedBy
  } = req.body;

  try {
    const job = new Job({
      title,
      location,
      budget,
      description,
      requirements,
      category,
      urgency,         // optional (defaults to "Medium")
      postedBy         // object with customer, rating, reviews, etc.
    });

    await job.save();

    // ✅ Create a notification for the receiver
        await Notification.create({
          user: receiverId,
          sender: req.user.id,
          type: "job",
          message: `New job posted by ${user.name || 'a customer'}`
        });
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Artisan accepts or rejects a job
router.patch('/:jobId/status', async (req, res) => {
  const { status } = req.body;
  try {
    const job = await Job.findByIdAndUpdate(req.params.jobId, { status }, { new: true });
    res.json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
