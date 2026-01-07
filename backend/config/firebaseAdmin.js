const admin = require('firebase-admin');

let app;

const getFirebaseApp = () => {
  if (app) return app;

  if (admin.apps && admin.apps.length > 0) {
    app = admin.app();
    return app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKeyRaw) {
    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    return app;
  }

  // Fallback for environments that provide GOOGLE_APPLICATION_CREDENTIALS
  // or other Application Default Credentials.
  app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });

  return app;
};

const getAuth = () => {
  getFirebaseApp();
  return admin.auth();
};

module.exports = {
  getFirebaseApp,
  getAuth,
};
