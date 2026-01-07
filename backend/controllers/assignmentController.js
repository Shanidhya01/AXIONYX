const Assignment = require('../models/Assignment');

// 1. GET ALL ASSIGNMENTS (for the logged-in user only)
exports.getAssignments = async (req, res) => {
  try {
    const tasks = await Assignment.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 2. CREATE ASSIGNMENT
exports.createAssignment = async (req, res) => {
  try {
    const { title, subject, dueDate } = req.body;

    const newAssignment = new Assignment({
      user: req.user.userId, // Link to the logged-in user
      title,
      subject,
      dueDate,
      status: 'To Do' // Default status
    });

    const savedTask = await newAssignment.save();
    res.json(savedTask);

  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 3. UPDATE ASSIGNMENT (Move card or Edit)
exports.updateAssignment = async (req, res) => {
  try {
    const { title, subject, dueDate, status } = req.body;
    
    // Build update object (only update fields that are sent)
    const updateFields = {};
    if (title) updateFields.title = title;
    if (subject) updateFields.subject = subject;
    if (dueDate) updateFields.dueDate = dueDate;
    if (status) updateFields.status = status;

    let task = await Assignment.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // Ensure user owns this task
    if (task.user.toString() !== req.user.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    task = await Assignment.findByIdAndUpdate(
      req.params.id, 
      { $set: updateFields }, 
      { new: true }
    );

    res.json(task);

  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 4. DELETE ASSIGNMENT
exports.deleteAssignment = async (req, res) => {
  try {
    const task = await Assignment.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // Ensure user owns this task
    if (task.user.toString() !== req.user.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await task.deleteOne();
    res.json({ msg: 'Task removed' });

  } catch (err) {
    res.status(500).send('Server Error');
  }
};