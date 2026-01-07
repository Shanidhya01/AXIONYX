const Message = require('../models/Message');
const Group = require('../models/Group');
const User = require('../models/User');

// 1. GET MESSAGES
exports.getMessages = async (req, res) => {
  try {
    const { room } = req.query;
    const messages = await Message.find({ room: room || 'general' })
      .populate('sender', 'name') 
      .sort({ createdAt: 1 })
      .limit(50);
    res.json(messages);
  } catch (err) { res.status(500).send('Server Error'); }
};

// 2. CREATE GROUP
exports.createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const roomId = `group_${Date.now()}`;
    
    const newGroup = new Group({
      name,
      roomId,
      admin: req.user.userId,
      members: [req.user.userId] 
    });

    await newGroup.save();

    // NEW: Notify everyone about the new group
    const io = req.app.get('io');
    if (io) {
        io.emit('group_created', newGroup); // Broadcast to all connected clients
    }

    res.json(newGroup);
  } catch (err) { 
      console.error(err);
      res.status(500).send('Server Error'); 
  }
};

// 3. GET GROUPS (FIXED: Returns ALL groups now)
exports.getGroups = async (req, res) => {
  try {
    // Changed from { members: req.user.userId } to {}
    // This makes all created groups visible to everyone
    const groups = await Group.find({}); 
    res.json(groups);
  } catch (err) { res.status(500).send('Server Error'); }
};

// 4. DELETE GROUP
exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findOne({ roomId: req.params.roomId });

    if (!group) return res.status(404).json({ msg: 'Group not found' });
    if (group.admin.toString() !== req.user.userId) return res.status(403).json({ msg: 'Not authorized' });

    await Group.findOneAndDelete({ roomId: req.params.roomId });

    const io = req.app.get('io');
    if (io) {
        io.emit('group_deleted', req.params.roomId); 
    }

    res.json({ msg: 'Group deleted successfully' });
  } catch (err) { res.status(500).send('Server Error'); }
};

// 5. MARK ROOM AS READ
exports.markRead = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    // Set the specific room's count to 0 in the map
    await User.findByIdAndUpdate(userId, {
        $set: { [`unread.${roomId}`]: 0 }
    });

    res.json({ msg: 'Marked as read' });
  } catch (err) { res.status(500).send('Server Error'); }
};