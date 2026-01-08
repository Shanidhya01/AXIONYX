# AXIONYX 🎓

A comprehensive student productivity platform designed to help students manage their academic life efficiently. AXIONYX combines attendance tracking, assignment management, study sessions, career planning, and social features in one unified platform.

## ✨ Features

### 📊 Dashboard
- **Real-time Schedule Display**: View today's classes with live status indicators
- **Attendance Overview**: Track attendance percentage across all subjects
- **Pending Assignments**: Quick view of upcoming tasks
- **Study Hours Tracking**: Monitor your study time statistics
- **Pomodoro Timer**: Built-in focus timer with customizable sessions
- **Smart Notifications**: Toast notifications for all actions

### 📚 Attendance Management
- **Smart Timetable**: Create and manage weekly class schedules
- **Quick Check-in**: Mark attendance as Present, Absent, or Cancelled
- **Visual Timeline**: Beautiful timeline view of daily schedule
- **Attendance History**: Track attendance logs per subject
- **Automatic Calculations**: Real-time attendance percentage updates
- **Multi-slot Support**: Handle multiple classes per day

### ✅ Assignments Tracker
- **Kanban Board**: Organize tasks in To Do, In Progress, and Done columns
- **Due Date Tracking**: Never miss a deadline
- **Subject Categorization**: Organize assignments by subject
- **Drag & Drop**: Easy task management (move between columns)
- **Database Sync**: All assignments saved to cloud

### 📖 Study Zone
- **Collaborative Sessions**: Create and join study sessions
- **Topic-based Groups**: Organize sessions by subject and topic
- **Location Sharing**: Virtual or physical study locations
- **Participant Management**: Track who's joining your sessions
- **Time Scheduling**: Set start and end times for sessions
- **Real-time Updates**: Auto-refresh session list

### 💼 Career Tracker
- **Job Application Management**: Track all your applications
- **Status Pipeline**: Applied → Interview → OA → Offer/Rejected
- **Company & Role Details**: Store job information
- **Application Links**: Quick access to job postings
- **Statistics Dashboard**: Track application success rates
- **Date Tracking**: Monitor application timelines

### 🌐 Community Feed
- **Social Posts**: Share updates, questions, and achievements
- **Image Uploads**: Add images to posts (Base64 encoded)
- **Tags & Categories**: Organize posts by topics
- **Likes & Comments**: Engage with community
- **My Posts Filter**: View your own contributions
- **Real-time Updates**: Auto-refresh feed

### 💬 Real-time Chat
- **Direct Messaging**: Chat with friends one-on-one
- **Group Chats**: Create and manage study groups
- **Friend System**: Send and accept friend requests
- **User Search**: Find and connect with other students
- **Online Status**: Socket.io powered real-time messaging
- **Message History**: Persistent chat logs

### 📁 Resources Hub
- **File Sharing**: Upload and share study materials
- **Link Repository**: Store important resource links
- **Subject Categorization**: Organize by subject
- **Like System**: Upvote helpful resources
- **Download Tracking**: Monitor resource popularity
- **Resource Requests**: Request materials you need
- **Top Contributors**: Leaderboard of active sharers

### 👤 Profile Management
- **Personal Information**: Name, email, college, bio, city, DOB
- **Avatar Upload**: Custom profile pictures (Base64)
- **Role Selection**: Student, Professional, Educator
- **Password Management**: Secure password change
- **Theme Toggle**: Light/Dark mode support
- **Profile Statistics**: Join date and friend count

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 3.4.1
- **Routing**: React Router DOM 7.10.1
- **State Management**: React Hooks
- **Notifications**: React Hot Toast 2.6.0
- **Icons**: Lucide React, React Icons
- **Animations**: Framer Motion 12.23.25
- **Real-time**: Socket.io Client 4.8.1
- **Authentication**: Firebase 12.7.0
- **Date Handling**: date-fns 4.1.0

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.2.1
- **Database**: MongoDB with Mongoose 9.0.1
- **Authentication**: 
  - JWT (jsonwebtoken 9.0.3)
  - Firebase Admin 13.4.0
  - Passport.js with GitHub Strategy
- **Password Hashing**: bcryptjs 3.0.3
- **Real-time**: Socket.io 4.8.1
- **File Upload**: Multer 2.0.2
- **Email**: Nodemailer 7.0.11
- **Session Management**: express-session 1.18.2
- **CORS**: cors 2.8.5

## 📁 Project Structure

```
AXIONYX/
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Layout/      # Sidebar, PageTransition
│   │   │   └── UI/          # Modal, StatCard, TaskCard, etc.
│   │   ├── pages/           # Main application pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Assignments.jsx
│   │   │   ├── StudyZone.jsx
│   │   │   ├── Career.jsx
│   │   │   ├── Community.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Resources.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── context/         # React Context (Theme)
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities (Firebase, Toast)
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                 # Node.js Backend
│   ├── models/              # MongoDB Models
│   │   ├── User.js
│   │   ├── Subject.js
│   │   ├── Assignment.js
│   │   ├── StudySession.js
│   │   ├── StudyLog.js
│   │   ├── Job.js
│   │   ├── Post.js
│   │   ├── Message.js
│   │   ├── Group.js
│   │   ├── Resource.js
│   │   └── ResourceRequest.js
│   ├── routes/              # API Routes
│   │   ├── authRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── assignmentRoutes.js
│   │   ├── studyZoneRoutes.js
│   │   ├── careerRoutes.js
│   │   ├── communityRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── resourceRoutes.js
│   │   ├── userRoutes.js
│   │   └── supportRoutes.js
│   ├── middleware/          # Auth middleware
│   ├── config/              # Configuration files
│   ├── index.js             # Server entry point
│   └── package.json
│
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Firebase Project (for OAuth)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/AXIONYX.git
cd AXIONYX
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_secret
FRONTEND_URL=http://localhost:5173
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### Running the Application

1. **Start the Backend Server**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

2. **Start the Frontend Development Server**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

3. **Access the Application**
Open your browser and navigate to `http://localhost:5173`

## 🔐 Authentication

AXIONYX supports multiple authentication methods:

- **Email/Password**: Traditional registration and login
- **Google OAuth**: Sign in with Google account
- **GitHub OAuth**: Sign in with GitHub account
- **JWT Tokens**: Secure session management

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/firebase` - Firebase OAuth
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update profile
- `PUT /api/auth/changepassword` - Change password

### Attendance
- `GET /api/attendance` - Get all subjects
- `POST /api/attendance` - Add new subject
- `PUT /api/attendance/:id` - Update subject
- `DELETE /api/attendance/:id` - Delete subject
- `PUT /api/attendance/mark/:id` - Mark attendance

### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create assignment
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Study Zone
- `GET /api/study-zone` - Get all sessions
- `POST /api/study-zone` - Create session
- `PUT /api/study-zone/join/:id` - Join session
- `GET /api/study-zone/stats` - Get study statistics

### Career
- `GET /api/career` - Get all job applications
- `POST /api/career` - Add job application
- `PUT /api/career/:id` - Update application
- `DELETE /api/career/:id` - Delete application

### Community
- `GET /api/community/posts` - Get all posts
- `POST /api/community/posts` - Create post
- `PUT /api/community/posts/:id` - Update post
- `DELETE /api/community/posts/:id` - Delete post
- `PUT /api/community/posts/:id/like` - Like post
- `POST /api/community/posts/:id/comments` - Add comment

### Resources
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Upload resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource
- `PUT /api/resources/:id/like` - Like resource
- `POST /api/resources/requests` - Request resource

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode**: Full dark theme support with system preference detection
- **Glass Morphism**: Modern glassmorphic UI elements
- **Animations**: Smooth transitions and micro-interactions
- **Loading States**: Beautiful loading indicators
- **Error Handling**: User-friendly error messages with toast notifications
- **Form Validation**: Client-side validation with visual feedback

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes with middleware
- CORS configuration
- Environment variable protection
- Firebase Admin SDK for OAuth
- XSS protection
- Input sanitization

## 📱 Key Components

### Frontend Components
- **Sidebar**: Navigation with route highlighting
- **StatCard**: Metric display cards
- **TaskCard**: Assignment card component
- **StudyCard**: Study session card
- **Modal**: Reusable modal dialogs
- **DatePicker**: Custom date input
- **TimePicker**: Custom time input
- **PomodoroTimer**: Focus timer widget

### Backend Models
- **User**: User account and profile data
- **Subject**: Class schedule and attendance logs
- **Assignment**: Task management
- **StudySession**: Collaborative study groups
- **Job**: Career application tracking
- **Post**: Community feed posts
- **Resource**: Shared study materials

## 🌟 Unique Features

1. **Duplicate Prevention**: Smart deduplication in dashboard schedule
2. **Real-time Sync**: Socket.io for instant updates
3. **Optimistic UI**: Immediate feedback before server confirmation
4. **Auto-refresh**: Regular data updates without page reload
5. **Offline Support**: Local state management
6. **Image Compression**: Base64 image handling
7. **Toast Notifications**: Non-intrusive user feedback
8. **Smart Routing**: Protected routes and authentication guards

## 🐛 Known Issues & Solutions

### Schedule Duplicates
If you see duplicate classes in the dashboard:
1. The frontend now includes deduplication logic
2. Clean up duplicate subjects in the Attendance page
3. Ensure each subject has unique schedule slots

### Chat Connection
- Ensure Socket.io is running on the backend
- Check CORS configuration if messages aren't sending

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Shanidhya Kumar 

## 🙏 Acknowledgments

- React Team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Firebase for authentication services
- MongoDB for the database
- Socket.io for real-time communication
- All open-source contributors

## 📞 Support

For support, email luckykumar0011s@gmail.com .

---

**Built with ❤️ for students, by Shanidhya**
