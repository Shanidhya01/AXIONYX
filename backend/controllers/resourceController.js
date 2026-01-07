const Resource = require('../models/Resource');
const ResourceRequest = require('../models/ResourceRequest');
const User = require('../models/User'); // Needed for lookup
const mongoose = require('mongoose');

// Helper to convert string ID to ObjectId (for internal use, though Mongoose usually handles this)
const toObjectId = (idString) => {
    return new mongoose.Types.ObjectId(idString);
};

// --- RESOURCE CRUD ---

// 1. CREATE RESOURCE (POST api/resources)
exports.createResource = async (req, res) => {
    try {
        // When using multer, text fields come in req.body
        const { title, subject, fileType } = req.body;
        
        let fileUrl = req.body.fileUrl; // Fallback for Drive Link/Other
        
        // If a file was attached via multer, its path/filename is usually set here (req.file)
        if (req.file) {
            // NOTE: In a real app, this is where you'd upload to S3/Cloudinary.
            // For now, we simulate the link based on the file name/path.
            fileUrl = `/uploads/${req.file.filename}`;
        }
        
        // Validation
        if (!title || !subject || !fileUrl) {
            return res.status(400).json({ msg: "Title, subject, and file URL/attachment are required." });
        }

        const newResource = new Resource({
            title,
            subject,
            // Map file type correctly
            fileType: fileType === 'Drive Link' ? 'Link' : fileType,
            fileUrl,
            author: req.user.userId
        });

        await newResource.save();
        await newResource.populate('author', 'name');

        res.status(201).json(newResource);
    } catch (err) {
        console.error("Resource Creation Error:", err);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// 2. GET RESOURCES (GET api/resources)
exports.getResources = async (req, res) => {
    try {
        const filter = req.query.subject && req.query.subject !== 'All' ? { subject: req.query.subject } : {};
        
        const resources = await Resource.find(filter)
            .populate('author', 'name')
            .sort({ createdAt: -1 });

        res.json(resources);
    } catch (err) {
        console.error("Get Resources Error:", err);
        res.status(500).send('Server Error');
    }
};

// 3. TOGGLE LIKE (PUT api/resources/:id/like)
exports.toggleLike = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const userId = req.user.userId;

        const resource = await Resource.findById(resourceId).lean();
        if (!resource) return res.status(404).json({ msg: 'Resource not found' });

        const isLiked = resource.likes.some(likeId => likeId.toString() === userId);

        let updatedResource;

        if (isLiked) {
            updatedResource = await Resource.findByIdAndUpdate(
                resourceId,
                { $pull: { likes: userId } },
                { new: true }
            );
        } else {
            updatedResource = await Resource.findByIdAndUpdate(
                resourceId,
                { $addToSet: { likes: userId } },
                { new: true }
            );
        }

        res.json(updatedResource.likes);
    } catch (err) {
        console.error("Resource Like Error:", err);
        res.status(500).json({ msg: "Database error during like operation." });
    }
};

// 4. INCREMENT DOWNLOAD (PUT api/resources/:id/download)
exports.incrementDownload = async (req, res) => {
    try {
        const resourceId = req.params.id;
        
        const updatedResource = await Resource.findByIdAndUpdate(
            resourceId,
            { $inc: { downloads: 1 } },
            { new: true }
        );

        if (!updatedResource) return res.status(404).json({ msg: 'Resource not found' });

        res.json({ fileUrl: updatedResource.fileUrl });

    } catch (err) {
        console.error("Download Error:", err);
        res.status(500).send('Server Error');
    }
};

// 5. DELETE RESOURCE (DELETE api/resources/:id)
exports.deleteResource = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const userId = req.user.userId;

        const resource = await Resource.findById(resourceId);
        if (!resource) return res.status(404).json({ msg: 'Resource not found' });
        
        // Check if the user is the author
        if (resource.author.toString() !== userId) {
            return res.status(401).json({ msg: 'User not authorized to delete this resource' });
        }

        await resource.deleteOne();

        res.json({ msg: 'Resource removed' });

    } catch (err) {
        console.error("Delete Resource Error:", err);
        res.status(500).send('Server Error');
    }
};

// 6. UPDATE RESOURCE (PUT api/resources/:id)
exports.updateResource = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const userId = req.user.userId;
        const { title, subject, fileType, fileUrl } = req.body;

        const resource = await Resource.findById(resourceId);
        if (!resource) return res.status(404).json({ msg: 'Resource not found' });

        // Check if the user is the author
        if (resource.author.toString() !== userId) {
            return res.status(401).json({ msg: 'User not authorized to update this resource' });
        }
        
        // Update fields
        const updatedResource = await Resource.findByIdAndUpdate(
            resourceId,
            { $set: { title, subject, fileType, fileUrl } },
            { new: true }
        ).populate('author', 'name');

        res.json(updatedResource);

    } catch (err) {
        console.error("Update Resource Error:", err);
        res.status(500).send('Server Error');
    }
};

// --- LEADERBOARD ---

// 7. GET TOP CONTRIBUTORS (GET api/resources/top-users) - REAL LOGIC
exports.getTopContributors = async (req, res) => {
    try {
        const topUsers = await Resource.aggregate([
            {
                $group: {
                    _id: "$author",
                    totalUploads: { $sum: 1 },
                    // Calculate total score based on uploads, downloads, and likes
                    totalScore: { $sum: { $add: ["$downloads", { $size: "$likes" }, { $multiply: [10, 1] }] } } 
                }
            },
            { $sort: { totalScore: -1, totalUploads: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "authorDetails"
                }
            },
            { 
                $unwind: {
                    path: "$authorDetails",
                    preserveNullAndEmptyArrays: false 
                } 
            },
            {
                $project: {
                    _id: 0,
                    uploads: "$totalUploads",
                    xp: "$totalScore",
                    name: "$authorDetails.name",
                    avatar: "$authorDetails.avatar"
                }
            }
        ]);

        res.json(topUsers);
    } catch (err) {
        console.error("Resource Leaderboard Aggregation Error:", err);
        res.status(500).send('Server Error');
    }
};

// --- RESOURCE REQUESTS ---

// 8. REQUEST RESOURCE (POST api/resources/requests)
exports.createRequest = async (req, res) => {
    try {
        const { title, subject } = req.body;
        
        if (!title || !subject) {
            return res.status(400).json({ msg: "Title and subject are required for a request." });
        }

        const newRequest = new ResourceRequest({
            title,
            subject,
            requester: req.user.userId,
            upvotes: [req.user.userId] // Requester automatically upvotes their request
        });

        await newRequest.save();
        await newRequest.populate('requester', 'name');

        res.status(201).json(newRequest);
    } catch (err) {
        console.error("Create Request Error:", err);
        res.status(500).send('Server Error');
    }
};

// 9. GET RESOURCE REQUESTS (GET api/resources/requests)
exports.getRequests = async (req, res) => {
    try {
        const requests = await ResourceRequest.find({ isFulfilled: false })
            .populate('requester', 'name')
            // Sort by number of upvotes (highest demand first)
            .sort({ upvotes: -1, createdAt: -1 }) 
            .limit(5); // Show top 5 requests

        res.json(requests);
    } catch (err) {
        console.error("Get Requests Error:", err);
        res.status(500).send('Server Error');
    }
};

// 10. TOGGLE UPVOTE (PUT api/resources/requests/:id/upvote)
exports.toggleUpvote = async (req, res) => {
    try {
        const requestId = req.params.id;
        const userId = req.user.userId;

        const request = await ResourceRequest.findById(requestId).lean();
        if (!request) return res.status(404).json({ msg: 'Request not found' });

        const isUpvoted = request.upvotes.some(upvoteId => upvoteId.toString() === userId);

        let updatedRequest;

        if (isUpvoted) {
            // UNVOTE: Use $pull
            updatedRequest = await ResourceRequest.findByIdAndUpdate(
                requestId,
                { $pull: { upvotes: userId } },
                { new: true }
            );
        } else {
            // UPVOTE: Use $addToSet
            updatedRequest = await ResourceRequest.findByIdAndUpdate(
                requestId,
                { $addToSet: { upvotes: userId } },
                { new: true }
            );
        }
        
        res.json(updatedRequest.upvotes);
    } catch (err) {
        console.error("Upvote Error:", err);
        res.status(500).json({ msg: "Database error during upvote operation." });
    }
};

// 11. MARK REQUEST AS FULFILLED (PUT api/resources/requests/:id/fulfill)
exports.fulfillRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        
        const updatedRequest = await ResourceRequest.findByIdAndUpdate(
            requestId,
            { $set: { isFulfilled: true } },
            { new: true }
        );

        if (!updatedRequest) return res.status(404).json({ msg: 'Request not found' });

        res.json(updatedRequest);
    } catch (err) {
        console.error("Fulfill Request Error:", err);
        res.status(500).send('Server Error');
    }
};

// 12. DELETE REQUEST (DELETE api/resources/requests/:id)
exports.deleteRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const userId = req.user.userId;

        const request = await ResourceRequest.findById(requestId);
        if (!request) return res.status(404).json({ msg: 'Request not found' });
        
        // Only the original requester can delete the request
        if (request.requester.toString() !== userId) {
            return res.status(401).json({ msg: 'User not authorized to delete this request' });
        }

        await request.deleteOne();

        res.json({ msg: 'Resource request removed' });

    } catch (err) {
        console.error("Delete Request Error:", err);
        res.status(500).send('Server Error');
    }
};