// server/routes/communityRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const communityController = require('../controllers/communityController');

// POSTS
router.post('/posts', auth, communityController.createPost);
router.get('/posts', auth, communityController.getPosts);
router.put('/posts/:id', auth, communityController.updatePost); 
router.delete('/posts/:id', auth, communityController.deletePost); 

// LIKES
router.put('/posts/:id/like', auth, communityController.toggleLike);

// COMMENTS
router.get('/posts/:id/comments', auth, communityController.getComments);
router.post('/posts/:id/comments', auth, communityController.addComment);

// CONTRIBUTORS
router.get('/top-users', auth, communityController.getTopContributors); 
module.exports = router;