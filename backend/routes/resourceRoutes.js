// server/routes/resourceRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const resourceController = require('../controllers/resourceController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const maybeUploadSingle = (fieldName) => (req, res, next) => {
	const contentType = String(req.headers['content-type'] || '');

	// Only parse multipart requests with multer; allow JSON link-only payloads.
	if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
		return next();
	}

	return upload.single(fieldName)(req, res, (err) => {
		if (err) {
			return res.status(400).json({ msg: err.message || 'Invalid upload' });
		}
		return next();
	});
};

// RESOURCES CRUD
router.post('/', auth, maybeUploadSingle('file'), resourceController.createResource);
router.get('/', auth, resourceController.getResources);
router.put('/:id/like', auth, resourceController.toggleLike);
router.put('/:id/download', auth, resourceController.incrementDownload);
router.put('/:id', auth, resourceController.updateResource);  
router.delete('/:id', auth, resourceController.deleteResource);

// LEADERBOARD
router.get('/top-users', auth, resourceController.getTopContributors);

// RESOURCE REQUESTS
router.post('/requests', auth, resourceController.createRequest);     
router.get('/requests', auth, resourceController.getRequests);        
router.put('/requests/:id/upvote', auth, resourceController.toggleUpvote);
router.put('/requests/:id/fulfill', auth, resourceController.fulfillRequest); 
router.delete('/requests/:id', auth, resourceController.deleteRequest);

module.exports = router;