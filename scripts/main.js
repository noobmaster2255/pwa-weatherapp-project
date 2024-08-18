import weatherDB from "./weatherDb.js";
import weatherIndexedDb from "./weatherIndexedDb.js";

weatherIndexedDb.open()
  .then(() => {
    console.log('indexed db is availabe');
  })
  .catch((error) => {
    console.log('Failed to open indexed db:', error);
  });

// Registration of the Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js", { scope: "/" })
    .then((registration) => {
      console.log("Register success: ", registration);
    })
    .catch((error) => {
      console.log("Register failed: ", error);
    });
} else {
  console.log("Service Workers are not supported!");
}

const searchContainer = document.getElementById("searchContainer");
const searchBar = document.getElementById("searchBar");
const currentLocationIcon = document.getElementById("currentLocationIcon");
const bookmarkButton = document.getElementById("bookmarkButton");
const profileNavIcon = document.getElementById("profileNavIcon");

const baseUrl = "http://api.weatherapi.com/v1/forecast.json?";
if (searchContainer != null) {
  searchContainer.addEventListener("click", function (event) {
    searchContainer.classList.add("active");
    searchBar.focus();
  });
}

document.addEventListener("click", function (event) {
  if (!searchContainer.contains(event.target)) {
    if (searchBar.value.trim() === "") {
      searchContainer.classList.remove("active");
    }
  } else {
    if (searchBar.value.trim() != "") {
      getHomeWeatherDetails(searchBar.value.trim());
      searchBar.value = "";
    }
  }

  if (event.target == currentLocationIcon) {
    loadCurrentLocationWeather("click");
  }
});

if (window.location.pathname === "/pages/profile.html") {
  document.addEventListener("DOMContentLoaded", () => {
    const authText = document.getElementById("authText");
    const authIcon = document.getElementById("authIcon");

    weatherDB.authStatus((isLoggedIn) => {
      if (isLoggedIn) {
        authText.textContent = "Logout";
        authIcon.classList.add("fa-right-from-bracket");
        authIcon.classList.remove("fa-sign-in-alt");
      } else {
        authText.textContent = "Login";
        authIcon.classList.add("fa-sign-in-alt");
        authIcon.classList.remove("fa-right-from-bracket");
      }
    });
  });
}

function loadCurrentLocationWeather(action) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      getHomeWeatherDetails(`${position.coords.latitude},${position.coords.longitude}`);
    },
    (error) => {
      console.error("Error getting location:", error.message);
      // Handle errors, e.g., permission denied, unavailable location services
      if (error.code === error.PERMISSION_DENIED) {
        if (action == "click") {
          alert(
            "Location access denied. Please enable location services in your browser settings."
          );
        } else {
          getHomeWeatherDetails("London, Ontario");
        }
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        alert("Location information is unavailable.");
      } else if (error.code === error.TIMEOUT) {
        alert("The request to get user location timed out.");
      }
    }
  );
}

if ("geolocation" in navigator) {
  console.log("geolocation available");
} else {
  console.log("geolocation not available");
  currentLocationIcon.style.visibility = false;
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM content loaded");

  //check whether it is bookmark page
  if (window.location.href.includes("bookmark")) {

    weatherIndexedDb.open()
      .then(() => {
        console.log('indexed db is availabe');
        weatherIndexedDb.getAllBookmarkedLocations().then((data) => {
          if (data) {
            displayBookmarkedLocation(data)
          }
          console.log('All bookmarks data: ', data);
          if (navigator.onLine) {
            getAllBookmarkedLocations();
          }
        })
          .catch((error) => {
            console.log('Failed to get all bookmarks', error);
            if (navigator.onLine) {
              getAllBookmarkedLocations();
            }
          });
      })
      .catch((error) => {
        console.log('Failed to open indexed db:', error);
        if (navigator.onLine) {
          getAllBookmarkedLocations();
        }
      });

  }

  if (window.location.href.includes("index")) {
    bookmarkButton.addEventListener("click", function () {
      handleBookmarkData();
    });


    weatherIndexedDb.open()
      .then(() => {
        console.log('indexed db is availabe');
        weatherIndexedDb.getHomeLocation()
          .then((data) => {
            console.log('home loc data:', data);
            if (data) {
              weatherDB.setCurrentData(data);
              populateHomeScreen(data);
              getHomeWeatherDetails(`${data.location.lat},${data.location.lon}`);
            } else {
              if (navigator.geolocation) {
                loadCurrentLocationWeather("pageLoad");
              } else {
                getHomeWeatherDetails("London, Ontario");
              }
            }
          })
          .catch((error) => {
            console.log('Failed to get home location: ', error);
          });
      })
      .catch((error) => {
        console.log('Failed to open indexed db:', error);
      });




  }

  // check whether it is user profile page
  if (window.location.href.includes("profile")) {
    getUserDetails();
    return;
  }
});

///////////


weatherDB
  .open()
  .then(() => {
    console.log("Firebase is initialized and ready to use.");
  })
  .catch((error) => {
    console.error("Error initializing Firebase:", error);
  });

document.addEventListener("DOMContentLoaded", () => {
  if (weatherDB.auth.currentUser) {
    const createAccBtn = document.getElementById("createAccBtn");
    createAccBtn.style.display = "none";
  }
});

window.displayRegModal = function displayRegModal() {
  const modalElement = new bootstrap.Modal(document.getElementById("registerationModal"));
  modalElement.show();
}

window.createUser = function createUser() {
  const userLoginEmail = document.getElementById("userEmailRegister").value.trim();
  const userLoginPaswrd = document.getElementById("passwordRegister").value.trim();

  if (userLoginEmail != "" && userLoginPaswrd != "") {
    weatherDB
      .signUp(userLoginEmail, userLoginPaswrd)
      .then((user) => {
        const modalElement = bootstrap.Modal.getInstance(document.getElementById("registerationModal"));
        if (modalElement) {
          modalElement.hide();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    console.log("Both fields are required");
  }
}
window.handleAuthAction = function handleAuthAction() {
  if (weatherDB.auth.currentUser) {
    logoutUser();
  } else {
    const modalElement = new bootstrap.Modal(document.getElementById("exampleModal"));
    modalElement.show();
  }
};

window.loginUser = function loginUser() {
  const userLoginEmail = document.getElementById("userLoginEmail").value.trim();
  const userLoginPaswrd = document.getElementById("userLoginPaswrd").value.trim();

  if (userLoginEmail != "" && userLoginPaswrd != "") {
    weatherDB
      .login(userLoginEmail, userLoginPaswrd)
      .then((user) => {
        const modalElement = bootstrap.Modal.getInstance(document.getElementById("exampleModal"));
        if (modalElement) {
          modalElement.hide();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    console.log("Both fields are required");
  }
};

function handleBookmarkData() {
  weatherDB
    .checkUserLoggedIn()
    .then((user) => {
      const bookmarkIcon = document.getElementById("bookmarkButton");


      // Add bookmark
      weatherDB
        .addBookmark(user)
        .then(() => {
          bookmarkIcon.className = "";
          bookmarkIcon.className = "fa-solid fa-bookmark";
          console.log("Bookmarked successfully");
        })
        .catch((error) => {
          console.error("Error adding to bookmark:", error);
        });
    })
    .catch((error) => {
      // Show modal if user is not logged in
      console.error("User not logged in:", error);
      const modalElement = new bootstrap.Modal(document.getElementById("exampleModal"));
      modalElement.show();
    });
}

//api key for weather api
const apiKey = "2eb345d2cc5549afb6030800241407";
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getHomeWeatherDetails(query) {
  const apiUrlStr = `${baseUrl}key=${apiKey}&q=${query}&days=3&aqi=no&alerts=no`;

  fetch(apiUrlStr)
    .then((response) => response.json())
    .then((data) => {
      weatherIndexedDb.setHomeLocation(data)
      weatherDB.setCurrentData(data);
      weatherDB.checkUserLoggedIn().then((user) => {
        if (user) {
          weatherDB
            .checkIfLocationBookmarked(user, `${data.location.name}_${data.location.region}`)
            .then((result) => {
              const bookmarkButton = document.getElementById("bookmarkButton");
              if (result) {
                // bookmarkButton.className = "";
                bookmarkButton.className = "fa-solid fa-bookmark";
              } else {
                // bookmarkButton.className = "";
                bookmarkButton.className = "fa-regular fa-bookmark";
              }
            });
        }
      });
      return data;
    })
    .then((data) => {
      // Process the fetched data
      populateHomeScreen(data);
      return data;
    })
    .catch((error) => {
      // Handle errors
      console.log("weather api error: ", error);
    });
}

function populateHomeScreen(data) {
  const currentLocationName = document.getElementById("locationName");
  const currentLocationWeatherImage = document.getElementById("weatherImage");
  const currentLocationTemp = document.getElementById("temperature");
  const currentLocationWeatherCondition = document.getElementById("weatherCondition");
  const currentLocationFeelsLike = document.getElementById("feelsLike");
  const currentLocationHumidity = document.getElementById("humidity");
  const currentLocationwind = document.getElementById("wind");
  const currentLocationUv = document.getElementById("uv");

  currentLocationName.textContent = `${data.location.name}, ${data.location.region}`;
  let imageUrl = `${data.current.condition.icon}`;

  currentLocationWeatherImage.src = imageUrl.replace("64x64", "128x128");
  currentLocationTemp.textContent = `${data.current.temp_c}℃`;
  currentLocationWeatherCondition.textContent = `${data.current.condition.text}`;
  currentLocationFeelsLike.textContent = `${data.current.feelslike_c}℃`;
  currentLocationHumidity.textContent = `${data.current.humidity}%`;
  currentLocationwind.textContent = `${data.current.wind_mph} m/h`;
  currentLocationUv.textContent = `${data.current.uv}`;

  addForecast(data);
}

function getAllBookmarkedLocations() {

  weatherDB.checkUserLoggedIn().then((user) => {
    weatherDB.getAllBookmarkedLocations(user).then((locations) => {
      displayBookmarkedLocation(locations);
      refreshBookmarkedLocations(locations, user);
    });
  });

}

function refreshBookmarkedLocations(locations, user) {
  const promises = [];
  for (const key in locations) {
    const apiUrlStr = `${baseUrl}key=${apiKey}&q=${key}&days=3&aqi=no&alerts=no`;
    promises.push(
      fetch(apiUrlStr)
        .then((response) => response.json())
        .then((data) => {
          return data;
        })
    );
  }
  Promise.all(promises)
    .then((results) => {
      // All fetches have completed
      console.log("All data fetched:", results);
      // Perform action with the collected data
      let updatedLocations = {};
      for (let i = 0; i < results.length; i++) {
        let loc = results[i];
        updatedLocations[getLocationName(loc)] = loc;
      }
      // console.log("asada",user, updatedLocations)
      weatherDB.updateBookmarkedLocations(updatedLocations, user);
      displayBookmarkedLocation(updatedLocations);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function getLocationName(data) {
  return `${data.location.name}, ${data.location.region}`;
}

function addForecast(data) {
  let foreCast = data.forecast.forecastday;
  const foreCastRow = document.getElementById("f-row");

  for (let i = foreCastRow.children.length - 1; i >= 0; i--) {
    foreCastRow.removeChild(foreCastRow.children[i]);
  }

  for (let i = 1; i < foreCast.length; i++) {
    const foreCastDay = foreCast[i];

    const fContainer = document.createElement("div");
    fContainer.className = "f-forecast-container";
    const fDay = document.createElement("p");
    fDay.className = "f-day";
    if (i == 1) {
      fDay.textContent = "Tomorrow";
    } else {
      const date = new Date(foreCastDay.date);
      console.log(daysOfWeek[date.getDay()]);
      fDay.textContent = daysOfWeek[date.getDay()];
    }

    fContainer.appendChild(fDay);

    const fImagContainer = document.createElement("div");
    fImagContainer.className = "f-weather-condition-img";

    const fWeatherCond = document.createElement("p");
    fWeatherCond.className = "f-weather-condition";
    fWeatherCond.textContent = foreCastDay.day.condition.text;

    const fWeatherImag = document.createElement("img");
    fWeatherImag.src = foreCastDay.day.condition.icon.replace("64x64", "128x128");

    fImagContainer.appendChild(fWeatherImag);
    fImagContainer.appendChild(fWeatherCond);

    fContainer.appendChild(fImagContainer);

    const fTemp = document.createElement("p");
    fTemp.textContent = `${foreCastDay.day.avgtemp_c}℃`;

    fContainer.appendChild(fTemp);

    foreCastRow.appendChild(fContainer);
  }
}

function displayBookmarkedLocation(locations) {
  weatherIndexedDb.deleteAllBookmarkedLocations()
    .then(() => {
      weatherIndexedDb.addBookMarkedLocations(locations);
    })
    .catch((error) => {
      console.log('delete all boookmark indexdb error:', error);
    })
  const bList = document.getElementById("bookmark-list");

  for (let i = bList.children.length - 1; i >= 0; i--) {
    bList.removeChild(bList.children[i]);
  }
  Object.keys(locations)
    .sort()
    .forEach((key) => {
      const data = locations[key];
      const bContainer = document.createElement("div");
      bContainer.className = "f-forecast-container bookmark-tile-container";

      const bLocationName = document.createElement("p");
      bLocationName.className = "f-day";
      bLocationName.textContent = `${data.location.name}, ${data.location.region}`;
      bContainer.appendChild(bLocationName);

      const bImgContainer = document.createElement("div");
      bImgContainer.className = "bookmark-weather-condition-img";

      const bImg = document.createElement("img");
      bImg.src = data.current.condition.icon.replace("64x64", "128x128");

      const bWeatherCond = document.createElement("p");
      bWeatherCond.className = "f-weather-condition";
      bWeatherCond.textContent = data.current.condition.text;

      bImgContainer.appendChild(bImg);
      bImgContainer.appendChild(bWeatherCond);

      const bTemp = document.createElement("p");
      bTemp.textContent = `${data.current.temp_c}℃`;

      const bIcon = document.createElement("i");
      bIcon.className = "fa-solid fa-bookmark";

      bContainer.appendChild(bImgContainer);
      bContainer.appendChild(bTemp);
      bContainer.appendChild(bIcon);

      bList.appendChild(bContainer);

      bIcon.addEventListener("click", () => {
        weatherDB.removeBookmarkedLocation(data).then((isDeleted) => {
          if (isDeleted) {
            bList.removeChild(bContainer);
          }
        });
      });
    });
}

function getUserDetails() {
  weatherDB
    .checkUserLoggedIn()
    .then((user) => {
      displayUserDetails(user);
    })
    .catch((error) => {
      // showModal();
    });
}

function displayUserDetails(user) {
  const userEmail = document.getElementById("userEmail");
  userEmail.textContent = user.email;
}

function logoutUser() {

  weatherDB.logout().then((message) => {
    const userEmail = document.getElementById("userEmail");
    userEmail.textContent = "";
    alert(message);
    weatherIndexedDb.deleteAllBookmarkedLocations()
      .then(() => {
        console.log('cleared all bookmarks');
      })
      .catch((error) => {
        console.log('delete all indexed db error', error);
      });

  });
}
function addBookMarkedLocation(data) { }

function removeBookMarkedLocation() { }
