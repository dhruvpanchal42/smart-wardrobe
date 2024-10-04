const admin = require('firebase-admin');
const serviceAccount = require('../d-cube-c3ae9-firebase-adminsdk-zajcc-fe1750d493.json'); 

// Check if Firebase app has already been initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'd-cube-c3ae9.appspot.com'  // Replace with your Firebase Storage bucket name
    });
}

// Export the initialized admin object and the bucket
const bucket = admin.storage().bucket();
module.exports = { admin, bucket };
