const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendFeedback } = require('../controllers/supportController');

router.post('/', auth, sendFeedback);

module.exports = router;