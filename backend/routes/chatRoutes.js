const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
// Import the updated functions
const {
    getMessages,
    createGroup,
    getGroups,
    deleteGroup,
    markRead
} = require('../controllers/chatController');

router.get('/', auth, getMessages);
router.post('/groups', auth, createGroup);
router.get('/groups', auth, getGroups);
router.delete('/groups/:roomId', auth, deleteGroup);
router.put('/read/:roomId', auth, markRead);

module.exports = router;