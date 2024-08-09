import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
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
    this.currentData = null;
    this.db = null;
    this.auth = null;
    this.isAvailable = false;
    this.user = null;
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
          this.user = auth.currentUser
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
          console.log("User : ", user.email);
          resolve(user);
        } else {
          reject("No user logged in");
        }
      });
    });
  }

  setCurrentData(data) {
    this.currentData = data;
  }
  addBookmark(user) {
    let data = this.currentData;
    data.id = `${user.uid}_${data.location.name}_${data.location.region}`;
    return setDoc(doc(this.db, "bookmarks", `${user.uid}_${data.location.name}_${data.location.region}`), data);
    // return addDoc(collection(this.db, "bookmarks"), data);
  }

  checkIfLocationBookmarked(user, location) {
    return new Promise(async (resolve, reject) => {
      const q = query(
        collection(this.db, "bookmarks"),
        where("id", "==", `${user.uid}_${location}`)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((element) => {
        console.log("element...", element.data());
        resolve(true);
      });
      resolve(false);
      // if (!querySnapshot.empty) {
      //   resolve(true);
      // } else {
      //   resolve(false);
      // }
    });

    // querySnapshot.forEach((doc) => {
    //   console.log(doc.id, " => ", doc.data());
    // });

    // return new Promise((resolve, reject) => {
    //   const bookmarkPath = `bookmarks`;
    //   const bookmarkRef = doc(this.db, bookmarkPath);
    //   console.log(bookmarkRef);
    //   bookmarkRef
    //     .where("id", "==", `${user.uid}_${data.location.name}_${data.location.region}`)
    //     .get()
    //     .then((querySnapshot) => {
    //       if (!querySnapshot.empty) {
    //         resolve(true);
    //       } else {
    //         resolve(false);
    //       }
    //     })
    //     .catch((error) => {
    //       resolve(false);
    //       // reject("Error checking bookmarks:", error);
    //     });
    // });
  }
}

export default WeatherDB;
