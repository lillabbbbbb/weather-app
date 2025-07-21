const searchArea = document.getElementById("search-bar")
const searchButton = document.getElementById("button-search")
const locationButton = document.getElementById("geolocation");
const currentIconImg = document.getElementById("current-icon")
const addFavButton = document.getElementById("add-favorite")
const favDiv = document.getElementById("favorites")
const selector = document.getElementById("select-metrics")
const weeklyDiv = document.getElementById("div-weekly")

const apiKey = "d84bd23391e17b943fc45b049bd574d4"
let units = getUnits()


let favs = []

let icons = {

}

function getUnits() {
    let units = selector.value
    if (units == "℃") {
        units = "&units=metric"
    }
    else if (units == "°F") {
        units = "&units=imperial"
    }
    else if (units == "K") {
        units = "&units=default"
    }
    return units
}
selector.addEventListener("change", (e) => {
    selector.value = e.target.value
    searchByCityName(searchArea.value)
})

const temperatures = {
    current: 24,
    hourlyDay: [
        [24, 24, 23, 23, 22, 21, 19, 17, 17, 17, 16, 15, 16, 17, 18, 19, 20, 22, 23, 24, 24, 25, 26, 27],
        [22, 24, 24, 23, 22, 21, 19, 17, 17, 17, 16, 15, 17, 18, 19, 19, 20, 21, 23, 24, 24, 25, 26, 27]
    ],
    dailyWeek: [
        [25, 27, 28, 27, 24, 25, 26],
        [25, 27, 28, 26, 24, 26, 27]
    ]
}

//console.log(temperatures.hourlyDay[0].length)

searchButton.addEventListener("click", (e) => {
    addFavButton.innerText = "Favorite"

    console.log("Search button is clicked")

    //prevent the page from refreshing, since the button is in a form
    e.preventDefault()

    let input = searchArea.value
    searchByCityName(input)

    //check if the current search is already in favorites
    console.log("Checking now")
    for (let i = 0; i < favDiv.children; i++) {
        console.log(searchArea.value == favDiv.children[i].innerText)
        if (searchArea.value == favDiv.children[i]) {
            addFavButton.innerText = "Favorited"
        }
    }

})

locationButton.addEventListener("click", async() => {
    //source: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API#examples

    const status = document.querySelector("#status");
    const mapLink = document.querySelector("#map");

    mapLink.href = "";
    mapLink.textContent = "";

    async function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        status.textContent = "";
        mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
        mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;

        let JSON = await ((await fetch("https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=" + apiKey + getUnits())).json())
        //console.log(JSON)
        //console.log("JSON.name:" + JSON.name)
        searchByLatLong(latitude, longitude)
    }

    function error() {
        status.textContent = "Unable to retrieve your location";
    }

    if (!navigator.geolocation) {
        status.textContent = "Geolocation is not supported by your browser";
    }else{
        navigator.geolocation.getCurrentPosition(success, error);
    }


})

addFavButton.addEventListener("click", () => {
    //check if the current search is already in favorites
    if (!favs.includes(searchArea.value) && !searchArea.value == "") {
        console.log("Adding " + searchArea.value + " to favorites")
        let p = document.createElement("p")
        Object.assign(p, {
            role: "button",
            tabIndex: 0,
            style: "cursor: pointer"
        })
        p.innerText = searchArea.value
        favDiv.appendChild(p)
        favs.push(searchArea.value)
        p.addEventListener("click", () => {
            searchArea.value = p.innerText
            searchByCityName(searchArea.value)
        })
    }
    else {
        console.log(searchArea.value + " is already added to favorites.")
    }

})

const searchByCityName = async (searchTerm) => {
    //console.log(searchTerm)
    searchArea.value = searchTerm

    let JSON = await ((await fetch("https://api.openweathermap.org/data/2.5/weather?q=" + searchTerm + "&appid=" + apiKey + getUnits())).json())
    console.log(JSON)
    console.log("Searching for " + JSON.name)
    document.getElementById("city").innerText = JSON.name
    let countryCode = JSON.sys.country
    document.getElementById("country").innerText = countryCode

    let mainWeatherDescr = JSON.weather[0].description
    let mainWeather = JSON.weather[0].main
    let feelsLike = JSON.main.feels_like
    let humidity = JSON.main.humidity
    let pressure = JSON.main.pressure
    let visibility = JSON.visibility / 1000

    document.getElementById("main-description").innerText = mainWeather
    document.getElementById("feels-like").innerText = "Feels like " + feelsLike + selector.value
    document.getElementById("humidity").innerText = "Humidity: " + humidity + "%"
    document.getElementById("pressure").innerText = "Pressure: " + pressure + "hPa"
    document.getElementById("visibility").innerText = "Visbility: " + visibility + "km"


    let windDegree = JSON.wind.deg
    let windSpeed = JSON.wind.speed

    document.getElementById("temperature").innerText = JSON.main.temp + selector.value

    createChart()
    getWeeklyForecast(7)

}

const searchByLatLong = async (latitude, longitude) => {
    //console.log(searchTerm)

    let JSON = await ((await fetch("https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=" + apiKey + getUnits())).json())
    console.log(JSON)
    searchArea.value = JSON.name
    let countryCode = JSON.sys.country
    document.getElementById("city").innerText = JSON.name
    document.getElementById("country").innerText = countryCode
    console.log("Found " + JSON.name + " with latitude " + latitude + " and longitude " + longitude)

    let mainWeatherDescr = JSON.weather[0].description
    let mainWeather = JSON.weather[0].main
    let feelsLike = JSON.main.feels_like
    let humidity = JSON.main.humidity
    let pressure = JSON.main.pressure
    let visibility = JSON.visibility

    document.getElementById("main-description").innerText = mainWeather
    document.getElementById("feels-like").innerText = feelsLike + selector.value
    document.getElementById("humidity").innerText = humidity
    document.getElementById("pressure").innerText = pressure
    document.getElementById("visibility").innerText = visibility + "m"


    let windDegree = JSON.wind.deg
    let windSpeed = JSON.wind.speed

    document.getElementById("temperature").innerText = JSON.main.temp + selector.value

    createChart()
    getWeeklyForecast(7)

}

async function createChart() {

    const url = "https://pro.openweathermap.org/data/2.5/forecast/hourly?q=" + searchArea.value + "&appid=" + apiKey + getUnits()
    console.log(url)
    let hourlyJSON = await ((await (fetch(url))).json())
    console.log(hourlyJSON)

    console.log(hourlyJSON.list[0].main.temp)
    console.log(hourlyJSON.list[0].dt_txt)

    //get data with current hour + 1 
    const date = new Date();
    let diffInHours = hourlyJSON.city.timezone / 3600
    //console.log(date.getUTCHours())
    //console.log(diffInHours)
    const hour = date.getUTCHours() + diffInHours
    console.log(hour)

    let owmHourlyValues = []
    let owmHourlyLabels = []

    let startIndex;

    for(let i = 0; i < hourlyJSON.list.length; i++){
        //console.log(i + ":   hour = " + hour + ", parseInt(hourlyJSON.list[i].dt_txt.substring(10,13)) = " + parseInt(hourlyJSON.list[i].dt_txt.substring(10,13)))
        if((hour + 1 ) == parseInt(hourlyJSON.list[i].dt_txt.substring(10,13))){
            startIndex = i;
            break;
        }
    }
    console.log(startIndex)
    for (let i = startIndex; i < startIndex + 24; i++) {
       owmHourlyValues.push(hourlyJSON.list[i].main.temp)
       owmHourlyLabels.push(hourlyJSON.list[i].dt_txt.substring(10,13))
    }

    console.log(owmHourlyValues)
    console.log(owmHourlyLabels)

    const hourlyChartData = {
        labels: owmHourlyLabels,
        datasets: [
            {
                name: "Open Weather Map API",
                values: owmHourlyValues
            },
            {
                name: "Second API",
                values: temperatures.hourlyDay[1]
            }
        ]
    }

    const chart = new frappe.Chart("#hourly-chart", {
        data: hourlyChartData,
        type: 'line', // or 'bar', 'line', 'scatter', 'pie', 'percentage'
        height: 250,
        colors: ['#7cd6fd', '#743ee2']
    })

}

const getWeeklyForecast = async (numberOfDays) => {
    while (weeklyDiv.lastElementChild) {
        weeklyDiv.removeChild(weeklyDiv.lastElementChild)
    }
    console.log(getUnits())
    url = "https://api.openweathermap.org/data/2.5/forecast/daily?q=" + searchArea.value + "&cnt=" + numberOfDays + "&appid=" + apiKey + getUnits()
    console.log(url)
    const weeklyJSON = await ((await fetch(url)).json())
    console.log(weeklyJSON)

    for (let i = 0; i < weeklyJSON.list.length; i++) {
        const dayWidgetDiv = document.createElement("div")
        const dayDiv = document.createElement("div")
        dayDiv.innerText = "Day " + (i + 1) + ": " + weeklyJSON.list[i].temp.day + selector.value
        const minDiv = document.createElement("div")
        minDiv.innerText = "Min: " + weeklyJSON.list[i].temp.min + selector.value
        const maxDiv = document.createElement("div")
        maxDiv.innerText = "Max: " + weeklyJSON.list[i].temp.max + selector.value

        dayWidgetDiv.appendChild(dayDiv)
        dayWidgetDiv.appendChild(minDiv)
        dayWidgetDiv.appendChild(maxDiv)

        weeklyDiv.appendChild(dayWidgetDiv)
    }


}

/*
let map, infoWindow;
//source: https://developers.google.com/maps/documentation/javascript/geolocation#maps_map_geolocation-javascript 
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 6,
    });
    infoWindow = new google.maps.InfoWindow();


    //locationButton.classList.add("custom-map-control-button");
    //map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);

    locationButton.addEventListener("click", () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    infoWindow.setPosition(pos);
                    infoWindow.setContent("Location found.");
                    infoWindow.open(map);
                    map.setCenter(pos);
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                },
            );
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation.",
    );
    infoWindow.open(map);
}

window.initMap = initMap;
initMap()
*/

//createChart()
currentIconImg.src = "assets/sun.png"