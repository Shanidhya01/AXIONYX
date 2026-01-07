const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getAuth } = require('../config/firebaseAdmin');

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (secret) return secret;

    if (process.env.NODE_ENV === 'production') {
        throw new Error('Missing required env var: JWT_SECRET');
    }

    console.warn('[auth] JWT_SECRET not set; using an insecure development fallback.');
    return 'dev-jwt-secret-change-me';
};

// --- HELPER FUNCTION: Generates JWT Token ---
const generateToken = (id) => {
    const payload = { userId: id };
    return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
};


// 1. REGISTER
exports.register = async (req, res) => {
    try {
        const { name, email, password, dob, city, college, role } = req.body;

        // Ensure JWT secret is available before writing anything
        getJwtSecret();

        // Check existing user
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user with new fields
        user = new User({
            name,
            email,
            password: hashedPassword,
            dob,
            city,
            college,
            role: role || 'Student'
        });

        await user.save();

        // Return Token
        const token = generateToken(user.id);

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// 2. LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        

        // Check user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        if (!user.password) {
            return res.status(400).json({ msg: 'This account uses social login. Please sign in with the provider used to create it.' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        

        // Return Token
        const token = generateToken(user.id);

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// 3. GET ME
exports.getMe = async (req, res) => {
    try {
        // Includes -password, -googleId, -githubId for cleaner return
        const user = await User.findById(req.user.userId).select('-password -googleId -githubId -firebaseUid');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// 6. FIREBASE TOKEN EXCHANGE (Google sign-in via Firebase)
// @route   POST api/auth/firebase
// @desc    Verify Firebase ID token and issue a local JWT for the app
exports.firebaseLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ msg: 'Missing idToken' });
        }

        // Ensure JWT secret is available before writing anything
        getJwtSecret();

        const adminAuth = getAuth();
        const decoded = await adminAuth.verifyIdToken(idToken);
        const firebaseUid = decoded.uid;
        const provider = decoded.firebase?.sign_in_provider;

        let email = decoded.email;
        let name = decoded.name || decoded.displayName;
        let avatar = decoded.picture || '';

        // For some providers (notably GitHub), decoded token can omit email/displayName.
        // Fetch the user record as a best-effort fallback.
        if (!email || !name || !avatar) {
            try {
                const userRecord = await adminAuth.getUser(firebaseUid);
                if (!email) email = userRecord.email;
                if (!name) name = userRecord.displayName;
                if (!avatar) avatar = userRecord.photoURL || '';
            } catch (e) {
                // Ignore and keep best-effort values from decoded token.
            }
        }

        if (!email) {
            return res.status(400).json({
                msg: "No email returned by Firebase for this provider. For GitHub, ensure you enabled GitHub in Firebase Auth and request the 'user:email' scope; also make sure your GitHub account has an email available."
            });
        }

        if (!name) {
            name = provider === 'google.com' ? 'Google User' : provider === 'github.com' ? 'GitHub User' : 'User';
        }

        let user = await User.findOne({ $or: [{ firebaseUid }, { email }] });

        if (!user) {
            user = await User.create({
                name,
                email,
                avatar,
                firebaseUid,
            });
        } else {
            let changed = false;
            if (!user.firebaseUid) {
                user.firebaseUid = firebaseUid;
                changed = true;
            }
            if (!user.avatar && avatar) {
                user.avatar = avatar;
                changed = true;
            }
            if ((!user.name || user.name === 'User') && name) {
                user.name = name;
                changed = true;
            }
            if (changed) await user.save();
        }

        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        console.error('Firebase login error:', err);

        const message = (err && err.message) ? String(err.message) : 'Firebase login failed';
        const code = err && (err.code || err.errorInfo?.code);

        // Common misconfig: Firebase Admin credentials missing/unreadable
        if (message.toLowerCase().includes('default credentials') || message.toLowerCase().includes('application default') || message.toLowerCase().includes('could not load')) {
            return res.status(500).json({
                msg: 'Firebase Admin credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS (recommended) or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.'
            });
        }

        // Invalid/expired token
        if (String(code || '').includes('auth/') || message.toLowerCase().includes('id token')) {
            if (process.env.NODE_ENV !== 'production') {
                return res.status(401).json({ msg: 'Invalid Firebase token', details: message });
            }
            return res.status(401).json({ msg: 'Invalid Firebase token' });
        }

        // Dev-only extra context
        if (process.env.NODE_ENV !== 'production') {
            return res.status(401).json({ msg: 'Firebase login failed', details: message });
        }

        return res.status(401).json({ msg: 'Firebase login failed' });
    }
};

// 4. UPDATE DETAILS
exports.updateDetails = async (req, res) => {
    try {
        // Add 'avatar' to the destructured object
        const { name, bio, college, city, dob, avatar } = req.body;

        const updateFields = {};
        if (name) updateFields.name = name;
        if (bio) updateFields.bio = bio;
        if (college) updateFields.college = college;
        if (city) updateFields.city = city;
        if (dob) updateFields.dob = dob;
        if (avatar) updateFields.avatar = avatar; // <--- ADD THIS LINE

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: updateFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// 5. CHANGE PASSWORD
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // IMPORTANT: Prevent password change if the account was created via OAuth (has no local password)
        if (!user.password) {
             return res.status(400).json({ msg: 'Cannot change password on OAuth account.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Incorrect current password' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        await user.save();
        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// --- NEW OAUTH FUNCTION ---

// 6. EXCHANGE OAUTH ID FOR JWT TOKEN
// @route   GET api/auth/oauth/token
// @desc    Exchanges temporary user ID passed via URL for a permanent JWT token
exports.exchangeOAuthToken = async (req, res) => {
    try {
        // The userId comes from the query string set by the Passport redirect
        const userId = req.query.id; 
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Generate the JWT token and send it back
        const token = generateToken(user.id); 
        res.json({ token });
    } catch (err) {
        console.error("Token exchange error:", err);
        res.status(500).send('Server Error');
    }
};

// Export all functions
module.exports = {
    register: exports.register,
    login: exports.login,
    getMe: exports.getMe,
    updateDetails: exports.updateDetails,
    changePassword: exports.changePassword,
    exchangeOAuthToken: exports.exchangeOAuthToken,
    firebaseLogin: exports.firebaseLogin
};