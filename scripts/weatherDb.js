import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

class WeatherDB {
  constructor() {
    this.db = null;
    this.auth = null;
    this.isAvailable = false;
  }

  open() {
    return new Promise((resolve, reject) => {
      try {
        const firebaseConfig = {
          apiKey: "AIzaSyA8uGRcElN6Ruj3ll6ZLojUL7mbJpJUJfQ",
          authDomain: "pwa-weatherapp-project.firebaseapp.com",
          projectId: "pwa-weatherapp-project",
          storageBucket: "pwa-weatherapp-project.appspot.com",
          messagingSenderId: "139179265598",
          appId: "1:139179265598:web:07f2e2fd57357b0e704b6f",
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);

        if (db && auth) {
          this.db = db;
          this.auth = auth;
          this.isAvailable = true;
          resolve();
        } else {
          reject("Database or Auth is not available");
        }
      } catch (error) {
        reject(error.message);
      }
    });
  }

  signUp(email, password) {
    return new Promise((resolve, reject) => {
      createUserWithEmailAndPassword(this.auth, email, password)
        .then((userCredentials) => {
          resolve(userCredentials.user);
        })
        .catch((error) => {
          reject(error.message);
        });
    });
  }

  login(email, password) {
    return new Promise((resolve, reject) => {
      signInWithEmailAndPassword(this.auth, email, password)
        .then((userCredentials) => {
          resolve(userCredentials.user);
        })
        .catch((error) => {
          reject(error.message);
        });
    });
  }

  checkUserLoggedIn() {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          console.log("user is logged in" , user.email)
          resolve(user);
        } else {
          reject("No user logged in");
        }
      });
    });
  }

  addBookmark(user, data) {
    return addDoc(collection(this.db, "bookmarks"), {
      userId: user.uid,
      ...data,
    });
  }

  isLocationBookmarked(user, locationName) {
    return new Promise(async (resolve, reject) => {
      try {
        const q = query(
          collection(this.db, "bookmarks"),
          where("userId", "==", user.uid),
          where("location", "==", locationName)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (error) {
        reject(error.message);
      }
    });
  }
}

export default WeatherDB;
