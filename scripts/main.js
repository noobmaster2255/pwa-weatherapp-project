const searchContainer = document.getElementById("searchContainer");
const searchBar = document.getElementById("searchBar");
const currentLocationName = document.getElementById("locationName");
const currentLocationWeatherImage = document.getElementById("weatherImage");

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
      getWeatherDeatails(searchBar.value.trim())
      searchBar.value = "";
    }
  }
});
