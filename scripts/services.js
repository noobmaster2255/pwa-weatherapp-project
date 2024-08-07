
//api key for weather api
const apiKey = '2eb345d2cc5549afb6030800241407';
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getHomeWeatherDetails(query) {
    const apiUrlStr = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=3&aqi=no&alerts=no`;

    fetch(apiUrlStr)
        .then(response => response.json())
        .then(data => {
            // Process the fetched data
            console.log('weather data: ', data);
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
        })
        .catch(error => {
            // Handle errors
            console.log('weather api error: ', error);
        });
}


function addForecast(data) {
    let foreCast = data.forecast.forecastday;
    const foreCastRow = document.getElementById("f-row");

    for (let i = foreCastRow.children.length - 1; i >= 0; i--) {
        foreCastRow.removeChild(foreCastRow.children[i]);
    }


    for (let i = 1; i < foreCast.length; i++) {
        const foreCastDay = foreCast[i];
        
        const fContainer = document.createElement('div');
        fContainer.className = "f-forecast-container";
        const fDay = document.createElement('p');
        fDay.className = "f-day";
        if (i == 1) {
            fDay.textContent = "Tomorrow";
        } else {
            const date = new Date(foreCastDay.date);
            console.log(date.getDay())
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
        fWeatherImag.src = foreCastDay.day.condition.icon;


        fImagContainer.appendChild(fWeatherImag);
        fImagContainer.appendChild(fWeatherCond);

        fContainer.appendChild(fImagContainer);


        const fTemp = document.createElement("p");
        fTemp.textContent = `${foreCastDay.day.avgtemp_c}℃`;

        fContainer.appendChild(fTemp);

        foreCastRow.appendChild(fContainer);
    }



}

