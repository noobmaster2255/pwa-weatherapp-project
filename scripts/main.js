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
      getHomeWeatherDetails(searchBar.value.trim())
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
  console.log("geolocation available")
} else {
  console.log("geolocation not available")
  currentLocationIcon.style.visibility = false;
}



document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM content loaded');
  
  //check whether it is bookmark page
  if (window.location.href.includes('bookmark')) {
    getAllBookmarkedLocations();
    return;
  }

  if (window.location.href.includes('index')) {
    
    return;
  }
});

