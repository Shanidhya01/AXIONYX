const StudySession = require('../models/StudySession');
const StudyLog = require('../models/StudyLog'); 

// 1. GET ACTIVE SESSIONS
exports.getSessions = async (req, res) => {
  try {
    const now = new Date();
    // active = endTime is in the future
    const sessions = await StudySession.find({ endTime: { $gt: now } })
      .populate('host', 'name')
      .sort({ startTime: 1 });
      
    res.json(sessions);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 2. CREATE SESSION
exports.createSession = async (req, res) => {
  try {
    const { topic, subject, location, startTime, endTime, maxParticipants } = req.body;

    const session = new StudySession({
      host: req.user.userId,
      topic,
      subject,
      location,
      startTime,
      endTime,
      maxParticipants: maxParticipants || 5,
      participants: [req.user.userId] 
    });

    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// 3. JOIN SESSION
exports.joinSession = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id);
    if (!session) return res.status(404).json({ msg: 'Session not found' });

    if (session.participants.length >= session.maxParticipants) {
      return res.status(400).json({ msg: 'Session is full' });
    }
    if (session.participants.includes(req.user.userId)) {
      return res.status(400).json({ msg: 'Already joined' });
    }

    session.participants.push(req.user.userId);
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 4. LOG STUDY TIME (For Pomodoro / Sessions)
exports.logStudyTime = async (req, res) => {
  try {
    const { minutes, source } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    const newLog = new StudyLog({
      user: req.user.userId,
      minutes,
      source,
      date: today
    });

    await newLog.save();
    res.json(newLog);
  } catch (err) {
    console.error("Log Error:", err);
    res.status(500).send('Server Error');
  }
};

// 5. GET STUDY STATS (For Dashboard)
exports.getStudyStats = async (req, res) => {
  try {
    // Fetch all logs for this user
    const logs = await StudyLog.find({ user: req.user.userId });
    
    // Sum total minutes
    const totalMinutes = logs.reduce((acc, log) => acc + log.minutes, 0);
    
    // Convert to hours (1 decimal place)
    const totalHours = (totalMinutes / 60).toFixed(1);
    
    res.json({ totalHours, totalMinutes });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};