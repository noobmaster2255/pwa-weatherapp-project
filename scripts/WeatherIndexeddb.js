class WeatherIndexedDb {
    constructor() {
        this.db = null;
        this.isAvailable = false;
    }


    open() {
        return new Promise((resolve, reject) => {
            if ('indexedDB' in window) {
                const request = indexedDB.open('Weather', 1);
                console.log('request', request);


                request.onerror = (event) => {
                    reject(event.target.error.message);
                }

                request.onsuccess = (event) => {
                    const db = event.target.result;
                    if (db) {
                        this.db = db;
                        this.isAvailable = true;
                        resolve();
                    } else {
                        reject('The database not available');
                    }
                }

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    const listObjectStore = db.createObjectStore('BookamarkList', { keyPath: 'id' });
                    const hometObjectStore = db.createObjectStore('homeLocation', { keyPath: 'page' });
                }
            } else {
                reject("Your browser doesn't support indexedBD.");
            }
        });
    }


    getAllBookmarkedLocations() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['BookamarkList'], 'readonly');
            transaction.onerror = (event) => {
                reject(event.target.error.message);
            }

            const store = transaction.objectStore('BookamarkList');
            const request = store.getAll();

            request.onerror = (event) => {
                reject(event.target.error.message);
            }

            request.onsuccess = (event) => {
                resolve(event.target.result);
            }
        });
    }

    addBookMarkedLocations(locations) {
        return new Promise((resolve, reject) => {
            console.log('add bookmark indexed db', locations);
            if (!this.isAvailable) {
                reject('Database not available');
            }

            let count = Object.keys(locations).length;
            let hasError = false;

            Object.keys(locations)
                .sort()
                .forEach((key) => {
                    const data = locations[key];

                    const transaction = this.db.transaction(['BookamarkList'], 'readwrite');

                    transaction.onerror = (event) => {
                        reject(event.target.error.message);
                    }

                    transaction.oncomplete = (event) => {
                        if (count === 0 && !hasError) {
                            resolve('All data added successfully.');
                        }
                    }

                    const store = transaction.objectStore('BookamarkList');
                    const storeRequest = store.put(data)

                    storeRequest.onerror = (event) => {
                        reject(event.target.error.message);
                    }

                    storeRequest.onsuccess = (event) => {
                        if (--count === 0 && !hasError) {
                            resolve();
                        }
                    }
                });
        });
    }

    addBookMarkedLocation(data) {
        return new Promise((resolve, reject) => {
            console.log('add bookmark indexed db', data);
            if (!this.isAvailable) {
                reject('Database not available');
            }
            const transaction = this.db.transaction(['BookamarkList'], 'readwrite');

            transaction.onerror = (event) => {
                reject(event.target.error.message);
            }

            transaction.onsuccess = (event) => {

            }


            const store = transaction.objectStore('BookamarkList');
            const storeRequest = store.put(data)

            storeRequest.onerror = (event) => {
                reject(event.target.error.message);
            }

            storeRequest.onsuccess = (event) => {
                resolve();
            }

        });
    }

    deleteAllBookmarkedLocations() {
        return new Promise((resolve, reject) => {
            console.log('add bookmark indexed db');
            if (!this.isAvailable) {
                reject('Database not available');
            }
            const transaction = this.db.transaction(['BookamarkList'], 'readwrite');

            transaction.onerror = (event) => {
                reject(event.target.error.message);
            }

            const store = transaction.objectStore('BookamarkList');
            const request = store.clear();

            request.onerror = (event) => {
                reject(event.target.error.message);
            }

            request.onsuccess = (event) => {
                resolve();
            }

        });
    }

    deleteBookMark(id) {
        return new Promise((resolve, reject) => {
            console.log('add bookmark indexed db', data);
            if (!this.isAvailable) {
                reject('Database not available');
            }
            const transaction = this.db.transaction(['BookamarkList'], 'readwrite');

            transaction.onerror = (event) => {
                reject(event.target.error.message);
            }

            const store = transaction.objectStore('BookamarkList');
            const request = store.delete(id);

            request.onerror = (event) => {
                reject(event.target.error.message);
            }

            request.onsuccess = (event) => {
                resolve();
            }

        });
    }

    getHomeLocation() {
        return new Promise((resolve, reject) => {
            if (!this.isAvailable) {
                reject('Database not available');
            }

            const transaction = this.db.transaction(['homeLocation'], 'readwrite');

            transaction.onerror = (event) => {
                reject(event.target.error.message);
            }

            const store = transaction.objectStore('homeLocation');
            const request = store.get('home');

            request.onerror = (event) => {
                reject(event.target.error.message);
            }

            request.onsuccess = (event) => {
                if (event.target.result == undefined) {
                    resolve(null)
                } else {
                    resolve(event.target.result);
                }
            }
        });
    }

    setHomeLocation(incomingData) {
        return new Promise((resolve, reject) => {
            let data = incomingData;
            data.page = 'home';
            console.log('add home indexed db', data);
            if (!this.isAvailable) {
                reject('Database not available');
            }
            const transaction = this.db.transaction(['homeLocation'], 'readwrite');

            const store = transaction.objectStore('homeLocation');
            const storeRequest = store.put(data)

            storeRequest.onerror = (event) => {
                reject(event.target.error.message);
            }

            storeRequest.onsuccess = (event) => {
                resolve();
            }
        });
    }





}

export default new WeatherIndexedDb();