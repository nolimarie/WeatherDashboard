// Variable declaration
var searchFormEl = document.querySelector("#citySearchForm");
var cityInputVal = document.querySelector("#inputCity");
var searchBtn = document.querySelector("#citySearch");
var cityListEl = document.querySelector(".city-list");

var weatherCont = document.querySelector("#weatherContent");
var cardDivEl = document.querySelector(".card");
var cardTitleEl = document.querySelector(".card-title");
var weatherIconEl = document.querySelector("#icon");
var uvIndexEl = document.querySelector("#uvIndex");

var openWeatherQueryUrl = "https://api.openweathermap.org/data/2.5/";
var apiKey = "624559456ca6fb66f8b87b160aa040d5";
var existingEntries = JSON.parse(localStorage.getItem("cities"));


window.onload = function initializeDashboard() {
  // retrieving our data from local storage and converting it back into an array
  if (localStorage.getItem("cities") !== null) {
    for (var i = 0; i < existingEntries.length; i++) {
      // create a button element with city name
      createNewCityButton(existingEntries[i], cityListEl);
    }
  }
};

function handleSearch(event) {
  event.preventDefault();

  var cityInput = cityInputVal.value.trim();

  if (!cityInput) {
    // alert empty input error to user
    errorMessage("Please enter a valid city name", searchFormEl, 3000);
    return;
  } else {
    getCurrentWeather(cityInput, apiKey);
    getForecast(cityInput, apiKey);
    cityInputVal.value = "";
    weatherCont.classList.add("hide");
  }
}

// Add eventListener to search button
searchBtn.addEventListener("click", handleSearch);

var currentDate = new Date();
function getTodaysDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();
  return [month, day, year].join("/");
}

function formatDate(date) {
  var year = date.split("-")[0];
  var month = date.split("-")[1];
  var day = date.split("-")[2];

  if (month.charAt(0) === "0") {
    month = month.slice(1);
  }
  if (day.charAt(0) === "0") {
    day = day.slice(1);
  }
  return [month, day, year].join("/");
}

function getCurrentWeather(cityName, apiKey) {
  var url =
    openWeatherQueryUrl + "weather?q=" + cityName + "&appid=" + apiKey + "&units=imperial";

  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        console.log("There is an issue. Status Code: " + response.status);
        // alert invalid search to user
        errorMessage(
          "No results for " + cityName + ". Please try again", weatherCont, 3000);
        return;
      } else {
        return response.json(); 
      }
    })

    .then(function (weatherData) {
      weatherCont.classList.remove("hide");
      // print the weather data
      displayCurrentWeather(weatherData);

      // save city name to local storage if it is new
      var isNew = true;

      if (localStorage.getItem("cities") !== null) {
        for (var i = 0; i < existingEntries.length; i++) {
          if (existingEntries[i] === weatherData.name) {
            isNew = false;
          }
        }

        if (isNew) {
          existingEntries.push(weatherData.name);
          localStorage.setItem("cities", JSON.stringify(existingEntries));
          createNewCityButton(weatherData.name, cityListEl);
        }
      } else {
        existingEntries = [];
        existingEntries.push(weatherData.name);
        localStorage.setItem("cities", JSON.stringify(existingEntries));
        createNewCityButton(weatherData.name, cityListEl);
      }
    })
    .catch(function (error) {
      console.log("There is an error: " + error);
    });
}

// Get the current UV index of the input city
function getUVIndex(lat, lon, apiKey) {
  uvIndexUrl = openWeatherQueryUrl + "uvi?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;
  
  fetch(uvIndexUrl)
    .then(function (response) {
      if (!response.ok) {
        throw response.json();
      }
      return response.json();
    })
    .then(function (uvData) {
      var uvIndex = uvData.value;

      // Change UV index colors according to conditions
      if (uvIndex <= 2) {
        colorClass = "green";
      } else if (uvIndex <= 5) {
        colorClass = "yellow";
      } else if (uvIndex <= 7) {
        colorClass = "orange";
      } else if (uvIndex <= 10) {
        colorClass = "red";
      } else if (uvIndex > 10) {
        colorClass = "violet";
      }
      document.querySelector("#uvIndex").setAttribute("class", colorClass);
      uvIndexEl.textContent = uvIndex;
    })
    .catch(function (error) {
      console.log("There is a error: " + error);
    });
}

// Get the 5-day forecast for input city.
function getForecast(cityName, apiKey) {
  var url =
    openWeatherQueryUrl +
    "forecast?q=" +
    cityName +
    "&appid=" +
    apiKey +
    "&units=imperial";

  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        console.log("There is an issue. Status Code: " + response.status);
        return;
      } else {
        return response.json();
      }
    })
    .then(function (forecastData) {
      var ourForecastObject = [];

      for (var i = 0; i < forecastData.list.length; i++) {
        
        if (i % 8 === 0) {
          ourForecastObject.push({
            date: forecastData.list[i].dt_txt.split(" ")[0],
            icon: forecastData.list[i].weather[0].icon,
            iconAlt: forecastData.list[i].weather[0].description,
            temp: forecastData.list[i].main.temp,
            humidity: forecastData.list[i].main.humidity,
          });
        }
      }

      for (var i = 0; i < ourForecastObject.length; i++) {
        var dateTitle = document.querySelectorAll(".date-title");
        var iconEl = document.querySelectorAll("#forecastIcon");
        var tempSpan = document.querySelectorAll("#tempForecast");
        var humiditySpan = document.querySelectorAll("#humidityForecast");

        dateTitle[i].textContent = formatDate(ourForecastObject[i].date);
        iconEl[i].setAttribute(
          "src",
          "https://openweathermap.org/img/wn/" +
            ourForecastObject[i].icon +
            "@2x.png"
        );
        iconEl[i].setAttribute("alt", ourForecastObject[i].iconAlt);
        tempSpan[i].textContent = ourForecastObject[i].temp + " °F";
        humiditySpan[i].textContent = ourForecastObject[i].humidity + "%";
      }
      
    })
    .catch(function (error) {
      console.log("There is an error: " + error);
    });
}

function displayCurrentWeather(resultObj) {
  // show City name, date, and corresponding weather icon
  cardTitleEl.textContent =
    resultObj.name + " (" + getTodaysDate(currentDate) + ") ";

  // setting src and alt attribute of image
  weatherIconEl.setAttribute(
    "src",
    "https://openweathermap.org/img/wn/" + resultObj.weather[0].icon + "@2x.png"
  );
  weatherIconEl.setAttribute("alt", resultObj.weather[0].description);
  cardTitleEl.append(weatherIconEl);

  var tempEl = document.querySelector("#temp");
  var humidityEl = document.querySelector("#humidity");
  var windSpeedEl = document.querySelector("#wind");

  // Adding temperature  
  if (resultObj.main.temp) {
    tempEl.textContent = resultObj.main.temp + " °F";
  } else {
    tempEl.textContent = "No temperature for this city.";
  }

  // Adding humidity  
  if (resultObj.main.humidity) {
    humidityEl.textContent = resultObj.main.humidity + "%";
  } else {
    humidityEl.textContent = "No humidity for this city.";
  }

  // Adding wind speed 
  if (resultObj.wind.speed) {
    windSpeedEl.textContent = resultObj.wind.speed + " MPH";
  } else {
    windSpeedEl.textContent = "No wind speed for this city.";
  }

  // Adding uv index 
  if (resultObj.coord.lat && resultObj.coord.lon) {
    var lat = resultObj.coord.lat;
    var lon = resultObj.coord.lon;
    getUVIndex(lat, lon, apiKey);
  } else {
    uvIndexEl.textContent = "No UV index for this city.";
  }
}

// function to create new list item in the sidebar with the city's name
function createNewCityButton(cityName, location) {
  var cityBtnEl = document.createElement("button");
  cityBtnEl.setAttribute("type", "button");
  cityBtnEl.classList.add("list-group-item", "list-group-item-action");
  cityBtnEl.textContent = cityName;
  cityBtnEl.setAttribute("value", cityName);
  location.prepend(cityBtnEl);
  cityBtnEl.addEventListener("click", function () {
    var allCityBtns = document.querySelectorAll(".list-group-item");
    for (var i = 0; i < allCityBtns.length; i++) {
      allCityBtns[i].classList.remove("active");
    }
    getCurrentWeather(cityBtnEl.value, apiKey);
    getForecast(cityBtnEl.value, apiKey);
    cityBtnEl.classList.add("active");
  });
}

// This function displays a message to the user if their input is not valid
function errorMessage(msg, location, duration) {
  var alertErrorDiv = document.createElement("div");
  alertErrorDiv.classList.add(
    "alert",
    "alert-danger",
    "text-center",
    "pt-2",
    "pb-0"
  );
  alertErrorDiv.innerHTML = "<p><strong>" + msg + "</strong></p>";

  setTimeout(function () {
    alertErrorDiv.parentElement.removeChild(alertErrorDiv);
  }, duration);

  location.prepend(alertErrorDiv);
}
