import WeatherDB from "../scripts/weatherDb.js";

const searchContainer = document.getElementById("searchContainer");
const searchBar = document.getElementById("searchBar");
const currentLocationIcon = document.getElementById("currentLocationIcon");

searchContainer.addEventListener("click", function (event) {
  searchContainer.classList.add("active");
  searchBar.focus();
});

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
    navigator.geolocation.getCurrentPosition((position) => {
      getHomeWeatherDetails(`${position.coords.latitude},${position.coords.longitude}`);
    });
  }
});

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
    getAllBookmarkedLocations();
    return;
  }

  if (window.location.href.includes("index")) {
    return;
  }
});

///////////

const weatherDB = new WeatherDB();
weatherDB
  .open()
  .then(() => {
    console.log("Firebase is initialized and ready to use.");
    checkIfBookmarked();
  })
  .catch((error) => {
    console.error("Error initializing Firebase:", error);
  });

function checkIfBookmarked() {
  weatherDB
    .checkUserLoggedIn()
    .then((user) => {
      const locationName = document.getElementById("locationName").textContent;
      weatherDB
        .isLocationBookmarked(user, locationName)
        .then((isBookmarked) => {
          const bookmarkIcon = document.getElementById("bookmarkIcon");
          if (isBookmarked) {
            bookmarkIcon.className = "fa-solid fa-bookmark";
          } else {
            bookmarkIcon.className = "fa-regular fa-bookmark";
          }
        })
        .catch((error) => {
          console.error("Error checking bookmark status:", error);
        });
    })
    .catch((error) => {
      console.error("User not logged in:", error);
    });
}

window.loginUser = function loginUser() {
  const userLoginEmail = document.getElementById("userLoginEmail").value.trim();
  const userLoginPaswrd = document.getElementById("userLoginPaswrd").value.trim();

  if (userLoginEmail != "" && userLoginPaswrd != "") {
    weatherDB
      .login(userLoginEmail, userLoginPaswrd)
      .then((user) => {
        console.log("Log in successfull:", user);
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

window.handleBookmarkClick = function handleBookmarkClick() {
  weatherDB
    .checkUserLoggedIn()
    .then((user) => {
      // Assuming elements are text or image elements, use textContent for non-input elements
      const locationName = document.getElementById("locationName").textContent;
      const weatherImage = document.getElementById("weatherImage").src;
      const temperature = document.getElementById("temperature")?.textContent || "N/A";
      const weatherCondition = document.getElementById("weatherCondition")?.textContent || "N/A";
      const bookmarkIcon = document.getElementById("bookmarkIcon");
      const data = {
        location: locationName,
        imageUrl: weatherImage,
        currentTemperature: temperature,
        currentCondition: weatherCondition,
      };

      // Add bookmark
      weatherDB
        .addBookmark(user, data)
        .then(() => {
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
};

// auth functions ends here...
