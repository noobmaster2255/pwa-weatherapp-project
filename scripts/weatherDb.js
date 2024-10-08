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
  signOut,
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
          this.user = auth.currentUser;
          resolve();
        } else {
          reject("Database or Auth is not available");
        }
      } catch (error) {
        reject(error.message);
      }
    });
  }

  authStatus(callback) {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        callback(true); 
      } else {
        callback(false);
      }
    });
  }

  setCurrentData(data) {
    this.currentData = data;
  }

  signUp(email, password) {
    return new Promise((resolve, reject) => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
      if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return reject("Invalid email format");
      }
  
      createUserWithEmailAndPassword(this.auth, email, password)
        .then((userCredentials) => {
          resolve(userCredentials.user);
        })
        .catch((error) => {
          alert(`Sign-up failed: ${error.message}`);
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

  logout() {
    return new Promise((resolve, reject) => {
      signOut(this.auth)
        .then(() => {
          resolve("Logout succesfull");
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
          this.user = user;
          console.log("User : ", user.email);
          resolve(user);
        } else {
          reject("No user logged in");
        }
      });
    });
  }

  addBookmark(user) {
    let data = this.currentData;
    data.id = `${user.uid}_${data.location.name}_${data.location.region}`;
    data.userId = user.uid;
    return setDoc(
      doc(this.db, "bookmarks", `${user.uid}_${data.location.name}_${data.location.region}`),
      data
    );
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
        resolve(true);
      });
      resolve(false);
    });
  }

  getAllBookmarkedLocations(user) {
    return new Promise(async (resolve, reject) => {
      const querySnapshot = await getDocs(
        collection(this.db, "bookmarks"),
        where("userId", "==", this.auth.currentUser.uid)
      );
      let locations = {};
      querySnapshot.forEach((doc) => {

        if(doc.data().userId == this.auth.currentUser.uid){
          console.log(doc.id, " => ", doc.data());
          const location = doc.data();
          locations[`${location.location.name}, ${location.location.region}`] = location;
        }
        // doc.data() is never undefined for query doc snapshots
      });
      resolve(locations);
    });
  }

  updateBookmarkedLocations(locations, user) {
    Object.keys(locations)
      .sort()
      .forEach((key) => {
        const data = locations[key];
        data.id = `${user.uid}_${data.location.name}_${data.location.region}`;
        data.userId = user.uid;
        setDoc(
          doc(this.db, "bookmarks", `${user.uid}_${data.location.name}_${data.location.region}`),
          data
        );
      });

    // return addDoc(collection(this.db, "bookmarks"), data);
  }

  removeBookmarkedLocation(data) {
    return new Promise(async (resolve, reject) => {
      try {
        await deleteDoc(
          doc(
            this.db,
            "bookmarks",
            `${this.user.uid}_${data.location.name}_${data.location.region}`
          )
        );
        resolve(true);
      } catch (error) {
        reject(error.message);
      }
    });
  }
}

export default new WeatherDB();
