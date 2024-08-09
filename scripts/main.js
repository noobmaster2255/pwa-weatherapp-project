import WeatherDB from "../scripts/weatherDb.js";

const searchContainer = document.getElementById("searchContainer");
const searchBar = document.getElementById("searchBar");
const currentLocationIcon = document.getElementById("currentLocationIcon");
const bookmarkButton = document.getElementById("bookmarkButton");

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
    bookmarkButton.addEventListener("click", function () {
      handleBookmarkData();
    });
    return;
  }
});

///////////

const weatherDB = new WeatherDB();
weatherDB
  .open()
  .then(() => {
    console.log("Firebase is initialized and ready to use.");
  })
  .catch((error) => {
    console.error("Error initializing Firebase:", error);
  });

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
  const apiUrlStr = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=3&aqi=no&alerts=no`;

  fetch(apiUrlStr)
    .then((response) => response.json())
    .then((data) => {
      weatherDB.setCurrentData(data);
      weatherDB.checkUserLoggedIn().then((user) => {
        if (user) {
          weatherDB
            .checkIfLocationBookmarked(user, `${data.location.name}_${data.location.region}`)
            .then((result) => {
              console.log("res...", result);
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
      console.log("weather data: ", data);
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
      return data;
    })
    .catch((error) => {
      // Handle errors
      console.log("weather api error: ", error);
    });
}

function getAllBookmarkedLocations() {
  weatherDB.getAllBookmarkedLocations()
    .then((locations) => {
      displayBookmarkedLocation(locations);
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
      console.log(date.getDay());
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

      bContainer.appendChild(bImgContainer);
      bContainer.appendChild(bTemp);

      bList.appendChild(bContainer);
    });
}

function addBookMarkedLocation(data) { }

function removeBookMarkedLocation() { }
