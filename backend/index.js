require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const passport = require('passport');
require('./config/passport');

// --- 1. IMPORT MODELS ---
const User = require('./models/User');
const Group = require('./models/Group');
const Message = require('./models/Message');

// --- 2. IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const careerRoutes = require('./routes/careerRoutes');
const studyZoneRoutes = require('./routes/studyZoneRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const supportRoutes = require('./routes/supportRoutes');
const communityRoutes = require('./routes/communityRoutes');
const resourceRoutes = require('./routes/resourceRoutes');

const app = express();
const httpServer = createServer(app);

const corsOptions = {
    origin: process.env.CLIENT_URL, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true, 
    optionsSuccessStatus: 200
};

// --- 3. SETUP SOCKET.IO ---
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL, 
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
        credentials: true 
    }
});

// Share io instance with controllers
app.set('io', io);

// --- 4. CORE MIDDLEWARE ---
app.use(cors(corsOptions)); 
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- 5. PASSPORT/SESSION MIDDLEWARE ---
app.set('trust proxy', 1);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 ,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' 
    }
}));

app.use(passport.initialize());
app.use(passport.session());


// --- 6. REAL-TIME SOCKET LOGIC (Unchanged) ---
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);
    socket.on('join_room', (data) => {
        socket.join(data);
        console.log(`User ${socket.id} joined room: ${data}`);
    });
    socket.on('send_message', async (data) => {
        try {
            // A. Save Message
            const newMessage = new Message({
                sender: data.userId, 
                content: data.message,
                room: data.room
            });
            await newMessage.save();
            
            // B. Prepare Broadcast Payload
            const broadcastData = {
                _id: newMessage._id,
                content: newMessage.content,
                sender: { _id: data.userId, name: data.author },
                createdAt: newMessage.createdAt,
                room: data.room 
            };
            
            // C. Send to others in room
            socket.to(data.room).emit('receive_message', broadcastData);

            // D. Update Stats (Unread Counts & Last Activity)
            const now = new Date();

            if (data.room.startsWith('group_')) {
                // GROUP LOGIC
                const group = await Group.findOneAndUpdate(
                    { roomId: data.room },
                    { lastMessageAt: now }
                );
                
                if (group) {
                    // Increment unread for all members EXCEPT sender
                    await User.updateMany(
                        { _id: { $in: group.members, $ne: data.userId } },
                        { $inc: { [`unread.${data.room}`]: 1 } }
                    );
                }
            } else {
                // DM LOGIC
                const ids = data.room.split('_');
                const receiverId = ids.find(id => id !== data.userId);
                
                // Update Sender's Activity Time
                await User.findByIdAndUpdate(data.userId, {
                    $set: { [`lastActivity.${data.room}`]: now }
                });

                if (receiverId) {
                    // Update Receiver's Activity Time AND Increment Unread
                    await User.findByIdAndUpdate(receiverId, {
                        $set: { [`lastActivity.${data.room}`]: now },
                        $inc: { [`unread.${data.room}`]: 1 }
                    });
                }
            }

        } catch (err) {
            console.error("Socket Logic Error:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log("User Disconnected", socket.id);
    });
});

// --- 7. REGISTER ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/study-zone', studyZoneRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/resources', resourceRoutes);


// --- 8. DATABASE CONNECTION & SERVER START ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI ;

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .then(() => {
        httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.log(err));

    