const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const Job = require('../models/JobModel');
const SMSLog = require('../models/SMSModel');

// Approve artisan/Customer
router.patch('/approve-artisan/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json({ message: 'Artisan approved', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// View all users
router.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// View all jobs
router.get('/jobs', async (req, res) => {
  const jobs = await Job.find();
  res.json(jobs);
});


// Approve Job (Artisan/Customer Approval)
router.patch('/approve-job/:id', async (req, res) => {
  try {
    // Update status to Accepted
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status: 'Accepted' },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ message: 'Job approved successfully', job });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Job
router.delete('/delete-job/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ message: 'Job deleted successfully', job });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



// Send SMS manually (mocked)
router.post('/send-sms', async (req, res) => {
  const { to, message, relatedJob } = req.body;

  const sms = new SMSLog({ to, message, status: 'Sent', relatedJob });
  await sms.save();

  // integrate SMS gateway here (e.g. Twilio)
  res.json({ message: 'SMS sent and logged', sms });
});

module.exports = router;
