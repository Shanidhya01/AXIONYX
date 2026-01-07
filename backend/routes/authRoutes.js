const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const passport = require('passport'); 

const { 
    register, 
    login, 
    getMe, 
    updateDetails, 
    changePassword,
    exchangeOAuthToken,
    firebaseLogin
} = require('../controllers/authController'); 


// --- EXISTING LOCAL AUTH ROUTES ---

// @route   POST api/auth/register
router.post('/register', register);

// @route   POST api/auth/login
router.post('/login', login);

// @route   POST api/auth/firebase
// @desc    Client sends Firebase ID token; server returns app JWT
router.post('/firebase', firebaseLogin);

// @route   GET api/auth/me
router.get('/me', auth, getMe);

// @route   PUT api/auth/updatedetails
router.put('/updatedetails', auth, updateDetails);

// @route   PUT api/auth/changepassword
router.put('/changepassword', auth, changePassword);

// @route   POST api/auth/logout // <--- NEW LOGOUT ROUTE
router.post('/logout', auth, (req, res) => {
    req.logout((err) => { 
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed.' });
        }
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Could not log out. Please try again.' });
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ success: true, message: 'Logged out successfully' });
        });
    });
});

// --- GITHUB OAUTH ROUTES ---

const isGitHubOAuthEnabled = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);

// @route   GET api/auth/github
router.get('/github', (req, res, next) => {
    if (!isGitHubOAuthEnabled) {
        return res.status(400).json({
            msg: 'GitHub OAuth is not configured on the server. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to enable it.'
        });
    }
    return passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});

// @route   GET api/auth/github/callback
router.get('/github/callback', (req, res, next) => {
    if (!isGitHubOAuthEnabled) {
        return res.status(400).json({
            msg: 'GitHub OAuth is not configured on the server. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to enable it.'
        });
    }

    return passport.authenticate('github', { failureRedirect: '/login' })(req, res, () => {
        res.redirect(`${process.env.CLIENT_URL}/oauth-success?id=${req.user._id}`);
    });
});


// --- TOKEN EXCHANGE ROUTE ---

// @route   GET api/auth/oauth/token
router.get('/oauth/token', exchangeOAuthToken);


module.exports = router;