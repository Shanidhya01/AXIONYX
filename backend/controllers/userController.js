const User = require('../models/User');

// 1. SEARCH USERS
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    
    const users = await User.find({ 
        name: { $regex: q, $options: 'i' }, 
        _id: { $ne: req.user.userId } 
    }).select('name avatar'); 
    
    res.json(users);
  } catch (err) { res.status(500).send('Server Error'); }
};

// 2. SEND REQUEST (Updated)
exports.sendRequest = async (req, res) => {
  try {
    const sender = await User.findById(req.user.userId);
    const target = await User.findById(req.params.id);

    if (!target) return res.status(404).json({ msg: 'User not found' });
    
    // Check duplicates
    if (target.friendRequests.includes(sender._id) || target.friends.includes(sender._id)) {
        return res.status(400).json({ msg: 'Request already sent or already friends' });
    }

    // Add to target's INCOMING
    target.friendRequests.push(sender._id);
    // Add to sender's OUTGOING
    sender.sentRequests.push(target._id);

    await target.save();
    await sender.save();

    res.json({ msg: 'Request sent' });
  } catch (err) { res.status(500).send('Server Error'); }
};

// 3. ACCEPT REQUEST (Updated)
exports.acceptRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const sender = await User.findById(req.body.senderId);

    if (!user || !sender) return res.status(404).json({ msg: 'User not found' });

    // Remove from lists
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== req.body.senderId);
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== req.user.userId);
    
    // Add to friends
    user.friends.push(sender._id);
    sender.friends.push(user._id);

    await user.save();
    await sender.save();
    
    res.json({ msg: 'Friend added' });
  } catch (err) { res.status(500).send('Server Error'); }
};

// 4. GET SOCIAL DATA
exports.getSocialData = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('friends', 'name avatar')
            .populate('friendRequests', 'name avatar')
            .populate('sentRequests', 'name'); 
            
        res.json({ 
            friends: user.friends, 
            requests: user.friendRequests,
            sent: user.sentRequests,
            lastActivity: user.lastActivity // <--- SEND THIS
        });
    } catch (err) { res.status(500).send('Server Error'); }
};

// 5. REMOVE FRIEND
exports.removeFriend = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const friendId = req.params.id;
    const friend = await User.findById(friendId);

    if (!user || !friend) return res.status(404).json({ msg: 'User not found' });

    // Filter out IDs from both lists
    user.friends = user.friends.filter(id => id.toString() !== friendId);
    friend.friends = friend.friends.filter(id => id.toString() !== req.user.userId);

    await user.save();
    await friend.save();

    res.json({ msg: 'Friend removed' });
  } catch (err) { res.status(500).send('Server Error'); }
};

// 6. DECLINE REQUEST
exports.declineRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const senderId = req.body.senderId;

    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Remove from incoming requests
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
    
    // Optional: Remove from sender's 'sentRequests' if you want to clean that up too
    await User.findByIdAndUpdate(senderId, {
        $pull: { sentRequests: req.user.userId }
    });

    await user.save();
    res.json({ msg: 'Request declined' });
  } catch (err) { res.status(500).send('Server Error'); }
};