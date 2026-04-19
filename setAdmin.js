const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = 'CcLC2fywhoVAr5HAse0pdeYBFw22';

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('Admin claim set successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error setting admin claim:', err);
    process.exit(1);
  });