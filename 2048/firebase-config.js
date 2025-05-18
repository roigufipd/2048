import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,

} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";

import { 
  getFirestore, 
  doc,
  setDoc,
  getDoc,
  updateDoc,

} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";



  const firebaseConfig = {
    apiKey: "AIzaSyBaRe-F8vxal0DiNfTydq1-Q-3uLQEty9I",
    authDomain: "project-299698313424897404.firebaseapp.com",
    projectId: "project-299698313424897404",
    storageBucket: "project-299698313424897404.firebasestorage.app",
    messagingSenderId: "240791474585",
    appId: "1:240791474585:web:3ee36afe18bc4551b0c308"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function initializeUserData(user) {
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await setDoc(userRef, {
      email: user.email,
      highScore: 0,
    });
  } else {
    console.log("User data already exists.", userDoc.data());
  }
  return userDoc;
}

export {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  initializeUserData,
  db,
};