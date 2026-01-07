const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  getSubjects, 
  getTimeSlots, 
  saveTimeSlots, 
  createSubject, 
  markAttendance, 
  updateTimetable, 
  clearSchedule, 
  resetTimetable,
  getDetailedHistory
} = require('../controllers/attendanceController');

router.get('/', auth, getSubjects);
router.get('/slots', auth, getTimeSlots); 
router.post('/slots', auth, saveTimeSlots); 
router.post('/create', auth, createSubject);
router.put('/mark/:id', auth, markAttendance);
router.post('/timetable', auth, updateTimetable);
router.delete('/clear-schedule', auth, clearSchedule);
router.delete('/reset', auth, resetTimetable);
router.get('/history/:id', auth, getDetailedHistory);

module.exports = router;