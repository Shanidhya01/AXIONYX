const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Protect these routes!
const { 
  getAssignments, 
  createAssignment, 
  updateAssignment, 
  deleteAssignment 
} = require('../controllers/assignmentController');

// All routes require the 'auth' middleware
router.get('/', auth, getAssignments);
router.post('/', auth, createAssignment);
router.put('/:id', auth, updateAssignment);
router.delete('/:id', auth, deleteAssignment);

module.exports = router;