const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const mongoose = require('mongoose'); // CRITICAL: Import Mongoose for types

// --- MISSING HELPER FUNCTION (Final Fix for ReferenceError) ---
const toObjectId = (idString) => {
    // This safely converts the string ID from the JWT payload into the Mongoose type
    return new mongoose.Types.ObjectId(idString);
};

// 1. CREATE POST (POST api/community/posts)
exports.createPost = async (req, res) => {
    try {
        const { title, content, imageUrl, tags } = req.body;
        
        if (!title || !content) return res.status(400).json({ msg: "Title and content are required." });

        const newPost = new Post({
            author: toObjectId(req.user.userId), // Now works!
            title, 
            content,
            imageUrl,
            tags: tags || []
        });

        await newPost.save();
        
        await newPost.populate('author', 'name avatar');
        res.json(newPost);
    } catch (err) {
        console.error("Create Post Error:", err);
        res.status(500).send('Server Error');
    }
};

// 2. GET POSTS (GET api/community/posts)
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find({}) 
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (err) {
        console.error("Get Posts Error:", err);
        res.status(500).send('Server Error');
    }
};


// 3. TOGGLE LIKE (PUT api/community/posts/:id/like) - Confirmed working with atomic updates
exports.toggleLike = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.userId; 

        const post = await Post.findById(postId).lean();
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        const isLiked = post.likes.some(likeId => likeId.toString() === userId);

        let updatedPost;

        if (isLiked) {
            // UNLIKE: Use $pull
            updatedPost = await Post.findByIdAndUpdate(
                postId,
                { $pull: { likes: userId } },
                { new: true }
            );
        } else {
            // LIKE: Use $addToSet
            updatedPost = await Post.findByIdAndUpdate(
                postId,
                { $addToSet: { likes: userId } },
                { new: true }
            );
        }

        if (!updatedPost) return res.status(404).json({ msg: 'Post not found after update' });

        res.json(updatedPost.likes); 

    } catch (err) {
        console.error("Atomic Like Error:", err);
        res.status(500).json({ msg: "Database error during like operation." });
    }
};

// 4. GET COMMENTS (GET api/community/posts/:id/comments)
exports.getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.id })
            .populate('author', 'name avatar')
            .sort({ createdAt: 1 });
            
        res.json(comments);
    } catch (err) {
        console.error("Get Comments Error:", err);
        res.status(500).send('Server Error');
    }
};

// 5. ADD COMMENT (POST api/community/posts/:id/comments)
exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        
        const newComment = new Comment({
            post: toObjectId(req.params.id),
            author: toObjectId(req.user.userId),
            content
        });

        await newComment.save();
        
        await Post.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });
        
        await newComment.populate('author', 'name avatar');
        
        res.status(201).json(newComment);
    } catch (err) {
        console.error("Add Comment Error:", err);
        res.status(500).send('Server Error');
    }
};

// 6. DELETE POST (DELETE api/community/posts/:id)
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ msg: 'Post not found' });
        
        if (post.author.toString() !== req.user.userId) {
            return res.status(401).json({ msg: 'User not authorized to delete this post' });
        }

        await post.deleteOne();
        await Comment.deleteMany({ post: req.params.id });

        res.json({ msg: 'Post and comments removed' });

    } catch (err) {
        console.error("Delete Post Error:", err);
        res.status(500).send('Server Error');
    }
};

// 7. UPDATE POST (PUT api/community/posts/:id)
exports.updatePost = async (req, res) => {
    try {
        const { title, content, imageUrl, tags } = req.body;

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        if (post.author.toString() !== req.user.userId) {
            return res.status(401).json({ msg: 'User not authorized to update this post' });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { $set: { title, content, imageUrl, tags } },
            { new: true }
        ).populate('author', 'name avatar');

        res.json(updatedPost);

    } catch (err) {
        console.error("Update Post Error:", err);
        res.status(500).send('Server Error');
    }
};


// 8. GET TOP CONTRIBUTORS (GET api/community/top-users)
exports.getTopContributors = async (req, res) => {
    try {
        const topUsers = await Post.aggregate([
            {
                $group: {
                    _id: "$author",
                    totalPosts: { $sum: 1 },
                    totalLikes: { $sum: { $size: "$likes" } }
                }
            },
            { $sort: { totalPosts: -1, totalLikes: -1 } },
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
                    preserveNullAndEmptyArrays: true 
                } 
            },
            { $match: { authorDetails: { $ne: null } } },
            {
                $project: {
                    _id: 0,
                    posts: "$totalPosts",
                    likes: "$totalLikes",
                    name: "$authorDetails.name",
                    avatar: "$authorDetails.avatar",
                    xp: { $add: [ { $multiply: ["$totalPosts", 10] }, "$totalLikes" ] }
                }
            },
            { $sort: { xp: -1 } }
        ]);

        res.json(topUsers);
    } catch (err) {
        console.error("Top Contributor Aggregation Error:", err);
        res.status(500).send('Server Error');
    }
};