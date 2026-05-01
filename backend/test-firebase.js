const { db } = require('./firebaseConfig');

async function test() {
  try {
    const collections = await db.listCollections();
    console.log("Firestore connection successful! Collections:", collections.length);
  } catch (err) {
    console.error("Firebase Admin Error:", err);
  }
}
test();
