const searchContainer = document.getElementById("searchContainer");
const searchBar = document.getElementById("searchBar");

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
});
