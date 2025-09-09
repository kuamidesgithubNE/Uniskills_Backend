const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const Job = require('../models/JobModel');
const auth = require('../middleware/auth');



router.post("/:jobId/apply", auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - no user in token" });
    }

    if (req.user.role !== "artisan") {
      return res.status(403).json({ message: "Only artisans can apply" });
    }

    const jobId = req.params.jobId;
    const artisanId = req.user.id;

    const job = await Job.findById(jobId).populate("postedBy.customer", "name email");
    if (!job) return res.status(404).json({ message: "Job not found" });

    const alreadyApplied = await Application.findOne({ job: jobId, artisan: artisanId });
    if (alreadyApplied) return res.status(400).json({ message: "Already applied" });

    const application = await Application.create({
      job: jobId,
      artisan: artisanId,
      customer: job.postedBy.customer,  // 👈 Save customer ID
      message: req.body.message || ""
    });

// ✅ Create a notification for the receiver
    await Notification.create({
      user: job.postedBy.customer,
      sender: artisanId,
      type: "application",
      message: `New application from ${user.name || 'an artisan'} for your job "${job.title}"`
    });

    res.status(201).json(application);
  } catch (err) {
    console.error("❌ Error in apply route:", err); 
    res.status(500).json({ error: err.message });
  }
});





// ------------------ VIEW APPLICATIONS FOR A JOB ------------------
router.get("/:jobId/applications", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.postedBy.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your job" });
    }

    const applications = await Application.find({ job: job._id })
      .populate("artisan", "name email phone skills rating");

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- VIEW APPLICANTS FOR A JOB ----------------
router.get("/:jobId/applicants", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Only the customer who posted the job can view applicants
    if (job.postedBy.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your job" });
    }

    const applications = await Application.find({ job: job._id })
      .populate("artisan", "name skills location email phone") // adjust fields as needed
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ------------------ UPDATE APPLICATION STATUS (ACCEPT/REJECT) ------------------
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status, reason } = req.body; // accepted / rejected
    const application = await Application.findById(req.params.id).populate("job");

    if (!application) return res.status(404).json({ message: "Application not found" });

    if (application.job.postedBy.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your job" });
    }

    application.history.push({ status, reason });
    application.status = status;
    await application.save();

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------ WITHDRAW APPLICATION ------------------
router.put("/applications/:id/withdraw", auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.artisan.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your application" });
    }

    application.history.push({ status: "withdrawn", reason: "Artisan withdrew" });
    application.status = "withdrawn";
    await application.save();

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// ------------------ TRACK MY APPLICATIONS ------------------
router.get("/my", auth, async (req, res) => {
  try {
    if (req.user.role !== "artisan") {
      return res.status(403).json({ message: "Only artisans can view their applications" });
    }

    const applications = await Application.find({ artisan: req.user.id })
      .populate("job", "title description location status phone") // job info
      .populate("customer", "name email") // ✅ customer info
      .sort({ createdAt: -1 });

    // Add custom message based on status
    const withMessages = applications.map((app) => {
      let message = "";
      if (app.status === "pending") {
        message = "Your job is awaiting approval. Kindly wait to receive notice.";
      } else if (app.status === "accepted") {
        message = "Congratulations! Your application has been accepted.";
      } else if (app.status === "rejected") {
        message = "Sorry, your application was not successful this time.";
      } else if (app.status === "withdrawn") {
        message = "You have withdrawn this application.";
      }

      return {
        ...app._doc, // include all fields
        message,    // add custom message
        customer_id: app.customer?._id || null,
        customer_name: app.customer?.name || "Unknown",
      };
    });

    res.json(withMessages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
