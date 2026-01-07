const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  getSessions, 
  createSession, 
  joinSession, 
  logStudyTime, // <--- Import
  getStudyStats // <--- Import
} = require('../controllers/studyZoneController');

router.get('/', auth, getSessions);
router.post('/', auth, createSession);
router.put('/join/:id', auth, joinSession);

// New Routes for Tracking
router.post('/log', auth, logStudyTime);
router.get('/stats', auth, getStudyStats);

module.exports = router;