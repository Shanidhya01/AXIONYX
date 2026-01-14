if (!process.env.VERCEL) {
    require('dotenv').config();
}
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
const IS_VERCEL = !!process.env.VERCEL;

// Ensure crashes show up in Vercel logs with a stack trace.
process.on('unhandledRejection', (reason) => {
    console.error('[process] unhandledRejection', reason);
});
process.on('uncaughtException', (err) => {
    console.error('[process] uncaughtException', err);
    // Let the platform handle restart; don't call process.exit() in serverless.
});

// Vercel Serverless does not support long-lived WebSocket servers.
// Keep Socket.IO only for local/self-hosted deployments.
const httpServer = IS_VERCEL ? null : createServer(app);

const corsOptions = {
    origin: process.env.CLIENT_URL || true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true, 
    optionsSuccessStatus: 200
};

// --- DB: helper for serverless + local ---
let mongoConnectionPromise;
const connectToMongo = () => {
    if (mongoose.connection.readyState === 1) return Promise.resolve();
    if (mongoConnectionPromise) return mongoConnectionPromise;

    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        console.error('[db] Missing required env var: MONGO_URI');
        return Promise.resolve();
    }

    mongoConnectionPromise = mongoose
        .connect(MONGO_URI)
        .then(() => console.log('MongoDB connected'))
        .catch((err) => {
            console.error('MongoDB connection error:', err);
            mongoConnectionPromise = undefined;
        });

    return mongoConnectionPromise;
};

// --- 3. SETUP SOCKET.IO ---
let io = null;
if (!IS_VERCEL) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            credentials: true
        }
    });
}

// Share io instance with controllers (null on Vercel)
app.set('io', io);

// --- 4. CORE MIDDLEWARE ---
app.use(cors(corsOptions)); 
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// On serverless, fail fast instead of buffering DB ops until timeout.
if (IS_VERCEL) {
    mongoose.set('bufferCommands', false);
}

// Lightweight routes that should never depend on DB
app.get(['/','/favicon.ico','/favicon.png'], (req, res) => {
    res.status(200).json({ ok: true, service: 'axionyx-backend' });
});

app.get('/__health', (req, res) => {
    const missing = [];
    if (!process.env.MONGO_URI) missing.push('MONGO_URI');
    if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
    // SESSION_SECRET is optional on Vercel (sessions disabled)

    res.status(200).json({
        ok: true,
        service: 'axionyx-backend',
        vercel: IS_VERCEL,
        commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
        missing,
    });
});

// --- 5. PASSPORT/SESSION MIDDLEWARE ---
const sessionSecret = process.env.SESSION_SECRET;
const sessionsEnabled = !IS_VERCEL && Boolean(sessionSecret);

app.set('trust proxy', 1);

if (sessionsEnabled) {
    app.use(session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        }
    }));
} else {
    console.warn('[session] Sessions disabled (serverless or missing SESSION_SECRET).');
}

app.use(passport.initialize());
if (sessionsEnabled) {
    app.use(passport.session());
}


// --- 6. REAL-TIME SOCKET LOGIC ---
if (io) io.on('connection', (socket) => {
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
// Connect to Mongo lazily for API requests (must be registered BEFORE /api routes)
app.use('/api', async (req, res, next) => {
    if (mongoose.connection.readyState === 1) return next();
    if (!process.env.MONGO_URI) {
        return res.status(500).json({ msg: 'Server misconfigured: MONGO_URI is not set' });
    }
    try {
        await connectToMongo();
        return next();
    } catch (e) {
        return res.status(500).json({ msg: 'Database connection failed' });
    }
});
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

// --- 9. LAST-RESORT ERROR HANDLER ---
// Must be after routes.
app.use((err, req, res, next) => {
    console.error('[express] unhandled error', {
        method: req.method,
        url: req.originalUrl,
        message: err?.message,
        stack: err?.stack,
    });

    if (res.headersSent) return next(err);
    res.status(500).json({ msg: 'Internal server error' });
});


// --- 8. DATABASE CONNECTION & SERVER START ---
const PORT = process.env.PORT || 5001;

if (!IS_VERCEL) {
    connectToMongo().then(() => {
        httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    });
}

module.exports = app;

    