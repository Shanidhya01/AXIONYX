const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  getApplications, 
  createApplication, 
  updateApplication, 
  deleteApplication 
} = require('../controllers/careerController');

router.get('/', auth, getApplications);
router.post('/', auth, createApplication);
router.put('/:id', auth, updateApplication);
router.delete('/:id', auth, deleteApplication);

module.exports = router;