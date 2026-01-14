const Subject = require('../models/Subject');
const Timetable = require('../models/Timetable'); // <--- New Import

const normalizeSubjectName = (name) => String(name ?? '').trim().toUpperCase();

// 1. GET ALL SUBJECTS
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user.userId }).lean();

    // Defensive: older data may contain duplicates with the same name.
    // Dedupe by normalized name so the UI doesn't render duplicate cards.
    const byName = new Map();
    for (const subject of subjects) {
      const key = normalizeSubjectName(subject.name);
      if (!key) continue;

      const existing = byName.get(key);
      if (!existing) {
        byName.set(key, subject);
        continue;
      }

      // Merge minimal fields so data isn't lost in the response.
      existing.sessions = Math.max(existing.sessions ?? 0, subject.sessions ?? 0);
      existing.attended = Math.max(existing.attended ?? 0, subject.attended ?? 0);
      existing.schedule = [...(existing.schedule ?? []), ...(subject.schedule ?? [])];
      existing.history = [...(existing.history ?? []), ...(subject.history ?? [])];
    }

    res.json([...byName.values()]);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 2. GET TIME SLOTS (From Timetable Model)
exports.getTimeSlots = async (req, res) => {
  try {
    // Find the timetable config for this user
    let timetable = await Timetable.findOne({ user: req.user.userId });
    
    // If no config exists, return empty (frontend will use defaults)
    if (!timetable) {
        return res.json([]);
    }
    
    res.json(timetable.slots);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// 3. SAVE TIME SLOTS (To Timetable Model)
exports.saveTimeSlots = async (req, res) => {
  try {
    const { slots } = req.body;
    
    // Upsert: Update if exists, Create if not
    await Timetable.findOneAndUpdate(
      { user: req.user.userId },
      { $set: { slots: slots } },
      { new: true, upsert: true } // <--- Creates doc if missing
    );
    
    res.json({ msg: 'Slots saved' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// 4. CREATE NEW SUBJECT
exports.createSubject = async (req, res) => {
  try {
    const { name, code, sessions, attended } = req.body;

    const normalizedName = normalizeSubjectName(name);
    if (!normalizedName) {
      return res.status(400).json({ msg: 'Subject name is required' });
    }

    // Prevent duplicates per-user (older DBs may already have duplicates).
    const existing = await Subject.findOne({ user: req.user.userId, name: normalizedName });
    if (existing) {
      return res.json(existing);
    }

    const newSubject = new Subject({
      user: req.user.userId,
      name: normalizedName,
      code,
      sessions: Number(sessions) || 0,
      attended: Number(attended) || 0,
      schedule: [] 
    });
    const savedSubject = await newSubject.save();
    res.json(savedSubject);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 5. MARK ATTENDANCE (Updated with History Log)
exports.markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, date, slotTime } = req.body; // Expecting date & slotTime now
    
    const subject = await Subject.findById(id);

    if (!subject) return res.status(404).json({ msg: 'Subject not found' });
    if (subject.user.toString() !== req.user.userId) return res.status(401).json({ msg: 'Not authorized' });

    // 1. If this is a "Pop-up" mark (contains date/slotTime), check history first
    if (date && slotTime) {
        // Check if already marked
        const alreadyMarked = subject.history.some(h => h.date === date && h.slotId === slotTime);
        
        if (alreadyMarked) {
            return res.status(400).json({ msg: 'Already marked for today' });
        }

        // Add to history
        subject.history.push({ date, slotId: slotTime, status });
    }

    // 2. Update Stats (Counters)
    if (status === 'present') {
      subject.sessions += 1;
      subject.attended += 1;
    } else if (status === 'absent') {
      subject.sessions += 1;
    } 
    // 'cancelled' does not increase sessions count
    
    await subject.save();
    res.json(subject);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// 6. ADD TIMETABLE SLOT
exports.updateTimetable = async (req, res) => {
  try {
    const { day, startTime, endTime, subjectName, room } = req.body;

    const normalizedName = normalizeSubjectName(subjectName);
    if (!normalizedName) {
      return res.status(400).json({ msg: 'subjectName is required' });
    }

    // Find by normalized name to avoid duplicates caused by case/spacing.
    let subject = await Subject.findOne({ user: req.user.userId, name: normalizedName });
    
    if (!subject) {
      subject = new Subject({
        user: req.user.userId,
        name: normalizedName,
        sessions: 0,
        attended: 0,
        schedule: []
      });
    }

    subject.schedule.push({ day, startTime, endTime, room });
    await subject.save();

    res.json(subject);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 7. CLEAR SCHEDULE ONLY
exports.clearSchedule = async (req, res) => {
  try {
    await Subject.updateMany(
      { user: req.user.userId },
      { $set: { schedule: [] } }
    );
    res.json({ msg: 'Schedule cleared' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 8. RESET EVERYTHING
exports.resetTimetable = async (req, res) => {
  try {
    await Subject.deleteMany({ user: req.user.userId });
    await Timetable.deleteMany({ user: req.user.userId }); // Delete slots too
    res.json({ msg: 'Reset successful' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 9. GET DAY-WISE HISTORY FOR A SUBJECT
exports.getDetailedHistory = async (req, res) => {
    try {
        const { id } = req.params; // Subject ID
        const userId = req.user.userId;
        
        const subject = await Subject.findById(id);

        if (!subject || subject.user.toString() !== userId) {
            return res.status(404).json({ msg: 'Subject not found or unauthorized' });
        }

        // Return only the history log
        res.json(subject.history);
    } catch (err) {
        console.error("Get Detailed History Error:", err);
        res.status(500).send('Server Error');
    }
};