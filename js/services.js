
//api key for weather api
const apiKey = '2eb345d2cc5549afb6030800241407';

function getWeatherDeatails(query) {
    const apiUrlStr = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=3&aqi=no&alerts=no`;
    
    fetch(apiUrlStr)
        .then(response => response.json())
        .then(data => {
            // Process the fetched data
            console.log('weather data: ', data);
        })
        .catch(error => {
            // Handle errors
            console.log('weather api error: ', error);
        });
}

