var cityEl = document.getElementById(citysearch);
var searchBtn = document.getElementById(searchbtn);
var curWeatherEl = document.getElementById(currentweather);
var cityEl = document.getElementById(cityname);
var condpicEl = document.getElementById(cond-pic);
var tempEl = document.getElementById(temp);
var humidityEl = document.getElementById(humidity);
var windEl = document.getElementById(wind);
var uvindexEl = document.getElementById(uvindex);
var fivedayEl = document.getElementById(fiveday);

var apiKey ="624559456ca6fb66f8b87b160aa040d5"


function getWeather(cityName) {
    let reqURL = "api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey;
    fetch(reqURL)
        .then(function (response) {
            currentEl.classList.remove("d-none");

            var currentDate = 

        })


}

