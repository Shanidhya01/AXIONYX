const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

// --- 1. Serialization/Deserialization ---
// Passport needs to know how to save the user to the session (serialization)
// and how to retrieve the user object on subsequent requests (deserialization).

passport.serializeUser((user, done) => {
  // Save only the user ID to the session
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  // Retrieve the full user object from the database using the ID
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// --- 2. GitHub Strategy ---
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  const githubCallbackUrl =
    process.env.GITHUB_CALLBACK_URL ||
    (process.env.SERVER_URL
      ? `${process.env.SERVER_URL.replace(/\/+$/, "")}/api/auth/github/callback`
      : "/api/auth/github/callback");

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: githubCallbackUrl,
        scope: ["user:email"], // Request email permission
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        // GitHub profile often returns an emails array, but sometimes needs to be fetched separately.
        const primaryEmail =
          profile.emails && profile.emails.length > 0
            ? profile.emails.find((email) => email.primary)?.value ||
              profile.emails[0].value
            : `${profile.username}@github.com`; // Fallback email (less secure)

        const newUser = {
          githubId: profile.id,
          name: profile.displayName || profile.username,
          email: primaryEmail,
        };

        try {
          let user = await User.findOne({ githubId: profile.id });

          if (user) {
            done(null, user); // User exists, proceed
          } else {
            // Check if email already exists
            user = await User.findOne({ email: newUser.email });

            if (user) {
              user.githubId = profile.id;
              await user.save();
              done(null, user);
            } else {
              user = await User.create(newUser);
              done(null, user);
            }
          }
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
} else {
  console.warn(
    "[passport] GitHub OAuth disabled: set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to enable it."
  );
}
