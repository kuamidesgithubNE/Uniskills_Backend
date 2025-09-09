const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const adminRoutes = require('./routes/adminRoutes');
const artisanRoutes = require('./routes/artisanRoutes');
const applicationRoutes  = require('./routes/applicationRoutes');
const messageRoutes  = require('./routes/messageRoutes');

app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/artisan', artisanRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000; // 🔑 Fallback for local dev

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ Database Connected Successfully!");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Connection failed!', err);
  });
