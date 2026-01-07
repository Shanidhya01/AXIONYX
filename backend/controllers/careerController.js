const Career = require('../models/Career');

// 1. GET ALL APPLICATIONS
exports.getApplications = async (req, res) => {
  try {
    const jobs = await Career.find({ user: req.user.userId }).sort({ date: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 2. ADD APPLICATION
exports.createApplication = async (req, res) => {
  try {
    const { company, role, location, date, link, status } = req.body;
    
    const newJob = new Career({
      user: req.user.userId,
      company,
      role,
      location,
      date,
      link,
      status: status || 'Applied'
    });

    const savedJob = await newJob.save();
    res.json(savedJob);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 3. UPDATE APPLICATION (Status/Details)
exports.updateApplication = async (req, res) => {
  try {
    const job = await Career.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(job);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 4. DELETE APPLICATION
exports.deleteApplication = async (req, res) => {
  try {
    await Career.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Application removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};