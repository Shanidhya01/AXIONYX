const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
// UPDATED IMPORT: Added 'removeFriend'
const { 
    searchUsers, 
    sendRequest, 
    acceptRequest,
    declineRequest, 
    getSocialData, 
    removeFriend 
} = require('../controllers/userController');

router.get('/search', auth, searchUsers);
router.post('/request/:id', auth, sendRequest);
router.put('/accept', auth, acceptRequest);
router.get('/social', auth, getSocialData);
router.delete('/friends/:id', auth, removeFriend);
router.put('/decline', auth, declineRequest);

module.exports = router;