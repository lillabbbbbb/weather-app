const searchArea = document.getElementById("search-bar")
const searchButton = document.getElementById("button-search")
const locationButton = document.getElementById("geolocation");
const status = document.querySelector("#status");
status.innerText=""
const currentIconImg = document.getElementById("current-icon")
const addFavButton = document.getElementById("add-favorite")
const favDiv = document.getElementById("favorites")
const lastVisitedDiv = document.getElementById("last-visited")
const selector = document.getElementById("select-metrics")
const weatherDataSelector = document.getElementById("select-weather-data")
weatherDataSelector.disabled = true
const chartProviderSelector = document.getElementById("select-provider-chart")
const hourSlider = document.getElementById("hours-slider")
hourSlider.min = 1
hourSlider.max = 48
hourSlider.value = 24
hourSlider.disabled = true
const generalProviderSelector = document.getElementById("general-provider-selector")
const weeklyDiv = document.getElementById("div-weekly")

const apiKey1 = "d84bd23391e17b943fc45b049bd574d4"
const apiKey2 = "Cgp1nINqRCsErUN8HM74lwRgOyAP0ulF"
const apikey3 = ""

const CELSIUS = "℃"
const FAHRENHEIT = "°F"
const KELVIN = "K"

let forecastDaysNr = 7
let forecastHours = hourSlider.value


function getForecastHours() {
    return hourSlider.value
}

let units = getUnits()
let map;

/*
let data = {
    api1: {
        current: [],
        hourlyForecast: [],
        dailyForecast: []
    },
    api2: {
        current: [],
        hourlyForecast: [],
        dailyForecast: []
    },
    api3: {
        current: [],
        hourlyForecast: [],
        dailyForecast: []
    }
}
*/

let providerNames = [
    "OpenWeatherMap",
    "Tomorrow IO",
    "OpenMeteo"
]

let runProviders = {
    "OpenWeatherMap": searchByCityName(),
    "Tomorrow IO": loadAPI2(),
    "OpenMeteo": loadAPI3(),
}
let k = 0
for (let i = 0; i < providerNames.length; i++) {
    let option1 = document.createElement("option")
    option1.text = providerNames[i]
    option1.setAttribute("value", providerNames[i])
    generalProviderSelector.add(option1)
    let option2 = document.createElement("option")
    option2.text = providerNames[i]
    option2.selected = true
    chartProviderSelector.add(option2)
    k++
}

let hourlyDataTotal = [
    [],
    [],
    []
]

/*
let avgDataTotal = [
    [],
    [],
    []
]
let minDataTotal = [
    [],
    [],
    []
]
let maxDataTotal = [
    [],
    [],
    []
]
*/
let descriptionTotalArray = [

]


//test data
let dailyDataTotal = [
    [
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
    ],
    [
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
    ],
    [
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
        [23, 19, 24, "clear sky"],
    ]
]



let data = []

let favs = []
let lastVisited = []

let iconPaths = {

}

function getProvider() {
    return generalProviderSelector.value
}


function getUnits() {
    let units = selector.value
    if (units == CELSIUS) {
        units = "&units=metric"
    }
    else if (units == FAHRENHEIT) {
        units = "&units=imperial"
    }
    else if (units == KELVIN) {
        units = "&units=default"
    }
    return units
}
hourSlider.addEventListener("input", () => {
    searchByCityName(searchArea.value)
})

selector.addEventListener("change", (e) => {
    selector.value = e.target.value
    searchByCityName(searchArea.value)
})

generalProviderSelector.addEventListener("change", (e) => {
    generalProviderSelector.value = e.target.value
    console.log("Now we are displaying the data from " + generalProviderSelector.value)
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

locationButton.addEventListener("click", async () => {
    //source: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API#examples


    async function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        status.textContent = "";

        let JSON = await ((await fetch("https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=" + apiKey1 + getUnits())).json())
        //console.log(JSON)
        //console.log("JSON.name:" + JSON.name)
        searchByLatLong(latitude, longitude)
    }

    function error() {
        status.textContent = "Unable to retrieve your location";
    }

    if (!navigator.geolocation) {
        status.textContent = "Geolocation is not supported by your browser";
        alert("Geolocation is not supported by your browser")
    } else {
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

const addToLastVisited = (cityName) => {
    console.log("this method is called")
    //check if the current search is not already in the last visited list
    if (lastVisited.includes(cityName)) {
        console.log("Removing " + cityName + " from last visited")
        lastVisitedDiv.removeChild(lastVisitedDiv.childNodes[lastVisited.indexOf(cityName) + 1])
        lastVisited.pop(cityName)
        console.log(lastVisited)
    }

    console.log("Adding " + cityName + " to last visited")
    let p = document.createElement("p")
    Object.assign(p, {
        role: "button",
        tabIndex: 0,
        style: "cursor: pointer"
    })
    p.innerText = cityName
    lastVisited.unshift(cityName)
    lastVisitedDiv.insertBefore(p, lastVisitedDiv.childNodes[1])
    p.addEventListener("click", () => {
        searchArea.value = p.innerText
        searchByCityName(searchArea.value)
    })

}

async function searchByCityName(searchTerm) {
    //console.log(searchTerm)

    if (!searchTerm) {
        return
    }


    //Fetch first API 
    let JSON = await ((await fetch("https://api.openweathermap.org/data/2.5/weather?q=" + searchTerm + "&appid=" + apiKey1 + getUnits())).json())
    console.log(JSON)
    console.log("Searching for " + JSON.name)

    let diffInHours = JSON.timezone / 3600

    let sunrise = JSON.sys.sunrise
    //Source: https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds
    sunrise = new Date(sunrise * 1000);
    // Hours part from the timestamp
    var hours = sunrise.getUTCHours() + diffInHours;
    // Minutes part from the timestamp
    var minutes = "0" + sunrise.getMinutes();
    sunrise.setHours(hours)
    // Will display time in 10:30:23 format
    formattedSunrise = sunrise.getHours() + ':' + minutes.substr(-2)
    console.log(formattedSunrise);

    let sunset = JSON.sys.sunset
    sunset = new Date(sunset * 1000);
    // Hours part from the timestamp
    var hours = sunset.getUTCHours() + diffInHours;
    // Minutes part from the timestamp
    var minutes = "0" + sunset.getMinutes();
    sunset.setHours(hours)
    // Will display time in 10:30:23 format
    formattedSunset = sunset.getHours() + ':' + minutes.substr(-2)
    console.log(formattedSunset);

    addToLastVisited(JSON.name)
    searchArea.value = JSON.name
    
    document.getElementById("city").innerText = JSON.name + ", " + JSON.sys.country
    //document.getElementById("unit").innerText = selector.value
    //let countryCode = JSON.sys.country
    //document.getElementById("country").innerText = countryCode

    currentIconImg.src = loadMyIcon(JSON.weather[0].description, JSON.main.temp, sunrise, sunset, diffInHours)
    currentIconImg.setAttribute("class", "current-icon")

    //set theme based on weather
    const html = document.getElementsByTagName("html")
    const body = document.getElementsByTagName("body")
    //testing
    //body[0].setAttribute("class", "test")
    //html[0].setAttribute("class", "stormy")
    //body[0].setAttribute("class", "stormy")
    html[0].setAttribute("class", setTheme(JSON.weather[0].description, JSON.main.temp, sunrise, sunset, diffInHours))
    body[0].setAttribute("class", setTheme(JSON.weather[0].description, JSON.main.temp, sunrise, sunset, diffInHours))

    
    const latitude = JSON.coord.lat
    const longitude = JSON.coord.lon
    loadMap(latitude, longitude)

    //Load hourly forecast of API 2 and 3. The number of free API calls is pretty limited, so you can comment these two lines out when not essential
    //HourlyApi3(latitude, longitude, date.getUTCHours(), diffInHours)
    //HourlyApi2(date.getUTCHours(), diffInHours)

    //Display various details about the current weather
    let mainWeatherDescr = JSON.weather[0].description
    let mainWeather = JSON.weather[0].main
    let feelsLike = JSON.main.feels_like
    let humidity = JSON.main.humidity
    let pressure = JSON.main.pressure
    let visibility = JSON.visibility / 1000
    let windDegree = JSON.wind.deg
    let windSpeed = JSON.wind.speed

    document.getElementById("temperature").innerHTML = `${JSON.main.temp}<sup>${selector.value}</sup>`
    document.getElementById("main-description").innerText = mainWeather + ", " + mainWeatherDescr
    document.getElementById("feels-like").innerHTML = `Feels like: ${feelsLike}<sup>${selector.value}</sup>`
    document.getElementById("sunrise").innerText = "Sunrise: " + formattedSunrise
    document.getElementById("sunset").innerText = "Sunset: " + formattedSunset
    document.getElementById("humidity").innerText = "Humidity: " + humidity + "%"
    document.getElementById("pressure").innerText = "Pressure: " + pressure + "hPa"
    document.getElementById("visibility").innerText = "Visibility: " + visibility + "km"
    document.getElementById("wind-deg").innerText = "Wind degree: " + windDegree + "°"
    document.getElementById("wind-speed").innerText = "Wind speed: " + windSpeed + "km/h"


    createChart()
    getWeeklyForecast(latitude, longitude, diffInHours)

}

//for now only used in "use current location" feature
const searchByLatLong = async (latitude, longitude) => {

    let JSON = await ((await fetch("https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=" + apiKey1 + getUnits())).json())
    console.log(JSON)
    searchArea.value = JSON.name
    console.log("Found " + JSON.name + " with latitude " + latitude + " and longitude " + longitude)

    let diffInHours = JSON.timezone / 3600

    let sunrise = JSON.sys.sunrise
    //Source: https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds
    sunrise = new Date(sunrise * 1000);
    // Hours part from the timestamp
    var hours = sunrise.getUTCHours() + diffInHours;
    // Minutes part from the timestamp
    var minutes = "0" + sunrise.getMinutes();
    sunrise.setHours(hours)
    // Will display time in 10:30:23 format
    formattedSunrise = sunrise.getHours() + ':' + minutes.substr(-2)
    console.log(formattedSunrise);

    let sunset = JSON.sys.sunset
    sunset = new Date(sunset * 1000);
    // Hours part from the timestamp
    var hours = sunset.getUTCHours() + diffInHours;
    // Minutes part from the timestamp
    var minutes = "0" + sunset.getMinutes();
    sunset.setHours(hours)
    // Will display time in 10:30:23 format
    formattedSunset = sunset.getHours() + ':' + minutes.substr(-2)
    console.log(formattedSunset);

    addToLastVisited(JSON.name)
    searchArea.value = JSON.name
    
    document.getElementById("city").innerText = JSON.name + ", " + JSON.sys.country
    //document.getElementById("unit").innerText = selector.value
    //let countryCode = JSON.sys.country
    //document.getElementById("country").innerText = countryCode

    currentIconImg.src = loadMyIcon(JSON.weather[0].description, JSON.main.temp, sunrise, sunset, diffInHours)
    currentIconImg.setAttribute("class", "current-icon")

    //set theme based on weather
    const html = document.getElementsByTagName("html")
    const body = document.getElementsByTagName("body")
    //testing
    //body[0].setAttribute("class", "test")
    //html[0].setAttribute("class", "stormy")
    //body[0].setAttribute("class", "stormy")
    html[0].setAttribute("class", setTheme(JSON.weather[0].description, JSON.main.temp, sunrise, sunset, diffInHours))
    body[0].setAttribute("class", setTheme(JSON.weather[0].description, JSON.main.temp, sunrise, sunset, diffInHours))
    //html[0].setAttribute("class", "rainy-cloudy")
    //body[0].setAttribute("class", "rainy-cloudy")

    loadMap(latitude, longitude)

    //Load hourly forecast of API 2 and 3. The number of free API calls is pretty limited, so you can comment these two lines out when not essential
    //HourlyApi3(latitude, longitude, date.getUTCHours(), diffInHours)
    //HourlyApi2(date.getUTCHours(), diffInHours)

    //Display various details about the current weather
    let mainWeatherDescr = JSON.weather[0].description
    let mainWeather = JSON.weather[0].main
    let feelsLike = JSON.main.feels_like
    let humidity = JSON.main.humidity
    let pressure = JSON.main.pressure
    let visibility = JSON.visibility / 1000
    let windDegree = JSON.wind.deg
    let windSpeed = JSON.wind.speed

    document.getElementById("temperature").innerHTML = `${JSON.main.temp}<sup>${selector.value}</sup>`
    document.getElementById("main-description").innerText = mainWeather + ", " + mainWeatherDescr
    document.getElementById("feels-like").innerHTML = `Feels like: ${feelsLike}<sup>${selector.value}</sup>`
    document.getElementById("sunrise").innerText = "Sunrise: " + formattedSunrise
    document.getElementById("sunset").innerText = "Sunset: " + formattedSunset
    document.getElementById("humidity").innerText = "Humidity: " + humidity + "%"
    document.getElementById("pressure").innerText = "Pressure: " + pressure + "hPa"
    document.getElementById("visibility").innerText = "Visibility: " + visibility + "km"
    document.getElementById("wind-deg").innerText = "Wind degree: " + windDegree + "°"
    document.getElementById("wind-speed").innerText = "Wind speed: " + windSpeed + "km/h"

    
    createChart()
    getWeeklyForecast(latitude, longitude, diffInHours)

}

function loadAPI2() {
    console.log("This is loadAPI2 function.")
}

function loadAPI3() {
    console.log("This is loadAPI3 function.")
}


function fromUnixToCurrent(unixTime, diffInHours) {

    var date = new Date(unixTime * 1000);

    let hour = date.getUTCHours() + diffInHours
    console.log(date.getUTCHours())

    // Return hours
    if (hour > 23) {
        hour -= 24
    }
    console.log(hour)

    return hour

}

function convert(value, previousMetric, newMetric) {
    const c = CELSIUS
    const f = FAHRENHEIT
    const k = KELVIN
    let newValue;
    //from Celsius to Fahrenheit
    if (previousMetric == c && newMetric == f) {
        newValue = (value * (9 / 5) + 32)
    }

    //from Fahrenheit to Celsius
    else if (previousMetric == f && newMetric == c) {
        newValue = ((value - 32) * 5 / 9)
    }

    //from Celsius to Kelvin
    else if (previousMetric == c && newMetric == k) {
        newValue = (value + 273.15)
    }

    //from Kelvin to Celsius
    else if (previousMetric == k && newMetric == c) {
        newValue = (value - 273.15)
    }

    //from Fahrenheit to Kelvin
    else if (previousMetric == f && newMetric == k) {
        newValue = ((value - 32) * 5 / 9 + 273.15)
    }

    //from Kelvin to Fahrenheit
    else if (previousMetric == k && newMetric == f) {
        newValue = ((value - 273.15) * 9 / 5 + 32)
    }
    else if (previousMetric == newMetric) {
        newValue = value
    }

    newValue = newValue.toFixed(1)

    console.log(value + previousMetric + " has been changed to " + newValue + newMetric)
    return newValue
}

async function HourlyApi2(UTCHour, diffInHours) {
    console.log("Fetch Second API: Tomorrow IO API")

    const url2 = "https://api.tomorrow.io/v4/weather/forecast?location=" + searchArea.value + "&timesteps=1h&units=metric&apikey=Cgp1nINqRCsErUN8HM74lwRgOyAP0ulF"
    const tomHourlyJSON = await ((await (fetch(url2))).json())
    console.log(tomHourlyJSON)


    let hour = UTCHour + diffInHours

    let tomHourlyValues = []
    let tomHourlyLabels = []

    let startIndex;

    console.log(tomHourlyJSON.timelines.hourly[0].time.substring(11, 13))

    for (let i = 0; i < tomHourlyJSON.timelines.hourly.length; i++) {
        console.log(i + ":   hour = " + hour + ", tomHourlyJSON.timelines.hourly[i].time.substring(11,13) = " + tomHourlyJSON.timelines.hourly[i].time.substring(11, 13))
        if ((hour) == parseInt(tomHourlyJSON.timelines.hourly[i].time.substring(11, 13)) || (hour - 23) == parseInt(tomHourlyJSON.timelines.hourly[i].time.substring(11, 13))) {
            startIndex = i;
            break;
        }
    }
    console.log(startIndex)
    for (let i = startIndex + 1; i < startIndex + 1 + 24; i++) {
        tomHourlyValues.push(tomHourlyJSON.timelines.hourly[i].values.temperature)
        tomHourlyLabels.push(tomHourlyJSON.timelines.hourly[i].time.substring(11, 13))
    }
    console.log(tomHourlyValues)
    console.log(tomHourlyLabels)

    //convert to another metric if necessary
    for (let i = 0; i < tomHourlyValues.length; i++) {
        tomHourlyValues[i] = convert(tomHourlyValues[i], CELSIUS, selector.value)
    }

    hourlyDataTotal[1] = tomHourlyValues
}

async function HourlyApi3(latitude, longitude, UTCHour, diffInHours) {
    console.log("Fetch Third API: Open Meteo API")

    const url = "https://api.open-meteo.com/v1/forecast?latitude=" + latitude + "&longitude=" + longitude + "&hourly=temperature_2m,precipitation,relative_humidity_2m&timezone=GMT&forecast_days=2&timeformat=unixtime"
    let hourly3JSON = await ((await fetch(url)).json())

    console.log(hourly3JSON)

    console.log(hourly3JSON.hourly.temperature_2m[0])
    console.log(hourly3JSON.hourly.time[0])

    let currentHour = UTCHour + diffInHours

    let api3HourlyValues = []
    let api3HourlyLabels = []

    let startIndex;

    for (let i = 0; i < hourly3JSON.hourly.time.length; i++) {
        if ((currentHour + 1) == fromUnixToCurrent(hourly3JSON.hourly.time[i], diffInHours) || (currentHour - 23) == fromUnixToCurrent(hourly3JSON.hourly.time[i], diffInHours)) {
            startIndex = i;
            break;
        }
    }
    console.log(startIndex)
    for (let i = startIndex; i < startIndex + 24; i++) {
        api3HourlyValues.push(hourly3JSON.hourly.temperature_2m[i])
        console.log(hourly3JSON.hourly.time[i] + ", " + diffInHours)
        api3HourlyLabels.push(fromUnixToCurrent(hourly3JSON.hourly.time[i], diffInHours))
    }

    console.log(api3HourlyValues)
    console.log(api3HourlyLabels)

    //convert to another metric if necessary
    for (let i = 0; i < api3HourlyValues.length; i++) {
        api3HourlyValues[i] = convert(api3HourlyValues[i], CELSIUS, selector.value)
    }

    hourlyDataTotal[2] = api3HourlyValues
    console.log(hourlyDataTotal)
}

async function createChart() {

    //Fetch First API: Open Weather Map API
    const url1 = "https://pro.openweathermap.org/data/2.5/forecast/hourly?q=" + searchArea.value + "&appid=" + apiKey1 + getUnits()
    console.log(url1)
    let hourlyJSON = await ((await (fetch(url1))).json())
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

    for (let i = 0; i < hourlyJSON.list.length; i++) {
        //console.log(i + ":   hour = " + hour + ", parseInt(hourlyJSON.list[i].dt_txt.substring(10,13)) = " + parseInt(hourlyJSON.list[i].dt_txt.substring(10,13)))
        if ((hour + 1) == parseInt(hourlyJSON.list[i].dt_txt.substring(10, 13)) || (hour - 23) == parseInt(hourlyJSON.list[i].dt_txt.substring(10, 13))) {
            startIndex = i;
            break;
        }
    }
    console.log(startIndex)

    const interval = setInterval(async () => {
        if (getForecastHours()) {
            clearInterval(interval)
            let forecastHours = getForecastHours()

            console.log(getForecastHours())
            for (let i = startIndex; i < startIndex + 24; i++) {
                console.log(getForecastHours())
                
                owmHourlyValues.push(hourlyJSON.list[i].main.temp)
                owmHourlyLabels.push(hourlyJSON.list[i].dt_txt.substring(10, 13))
            }
        }
    }, 100);

    console.log(owmHourlyValues)
    console.log(owmHourlyLabels)

    hourlyDataTotal[0] = owmHourlyValues


    //hourlyDataTotal[1] = temperatures.hourlyDay[1]

    let activeDatasets = []
    //Add datasets of those providers which are selected
    for (let i = 0; i < chartProviderSelector.children.length; i++) {
        /*if (chartProviderSelector.children[i].selected == true) {*/
        //exclude Tomorrow API hourly values when the unit is Kelvin
        activeDatasets.push({
            name: chartProviderSelector.children[i].value,
            values: hourlyDataTotal[i]
        })
        //}
    }


    //build chart
    const hourlyChartData = {
        labels: owmHourlyLabels,
        datasets: activeDatasets
    }

    const chart = new frappe.Chart("#hourly-chart", {
        data: hourlyChartData,
        type: 'line', // or 'bar', 'line', 'scatter', 'pie', 'percentage'
        height: 250,
        colors: ['#7cd6fd', '#743ee2', '#6495ED']
    })

}

async function getWeeklyAPI1(numberOfDays) {

    const apiNr = 1

    while (weeklyDiv.lastElementChild) {
        weeklyDiv.removeChild(weeklyDiv.lastElementChild)
    }
    console.log(getUnits())

    //Fetch first API: Open Weather Map
    url1 = "https://api.openweathermap.org/data/2.5/forecast/daily?q=" + searchArea.value + "&cnt=" + numberOfDays + "&appid=" + apiKey1 + getUnits()
    console.log(url1)
    const weeklyJSON = await ((await fetch(url1)).json())
    console.log(weeklyJSON)

    let avg, max, min, description

    console.log(weeklyJSON.list)

    for (let i = 0; i < weeklyJSON.list.length; i++) {
        console.log("This is iteration " + i + " in API " + apiNr)
        avg = weeklyJSON.list[i].temp.day
        min = weeklyJSON.list[i].temp.min
        max = weeklyJSON.list[i].temp.max
        description = weeklyJSON.list[i].weather[0].description

        descriptionTotalArray[i] = description

        const dayWidgetDiv = document.createElement("div")
        dayWidgetDiv.setAttribute("class", "daily-f-card-div")
        const dayP = document.createElement("p")
        dayP.innerHTML = `Day ${i + 1}: ${avg}<sup>${selector.value}</sup>`
        const minP = document.createElement("p")
        minP.innerHTML = `Min: ${min}<sup>${selector.value}</sup>`
        const maxP = document.createElement("p")
        maxP.innerHTML = `Max: ${max}<sup>${selector.value}</sup>`

        console.log(description)

        const icon = document.createElement("img")
        icon.src = loadMyIcon2(description, max)
        icon.setAttribute("class", "daily-icon")
        const p = document.createElement("p")
        p.innerText = description

        //dayWidgetDiv.setAttribute("background", setTheme(p, weeklyJSON.list[i].temp.day)."background")
        dayWidgetDiv.appendChild(icon)
        dayWidgetDiv.appendChild(p)
        dayWidgetDiv.appendChild(dayP)
        dayWidgetDiv.appendChild(minP)
        dayWidgetDiv.appendChild(maxP)

        weeklyDiv.appendChild(dayWidgetDiv)

    }

}

async function getWeeklyAPI2() {

    let apiNr = 2

    //Fetch Second API: Tomorrow IO API
    const url2 = "https://api.tomorrow.io/v4/weather/forecast?location=" + searchArea.value + "&timesteps=1d&units=metric&apikey=Cgp1nINqRCsErUN8HM74lwRgOyAP0ulF"
    const tomDailyJSON = await ((await (fetch(url2))).json())
    console.log(tomDailyJSON)

    while (weeklyDiv.lastElementChild) {
        weeklyDiv.removeChild(weeklyDiv.lastElementChild)
    }

    let avg, min, max, description

    for (let i = 0; i < tomDailyJSON.timelines.daily.length; i++) {
        console.log("This is iteration " + i + " in API " + apiNr)

        avg = tomDailyJSON.timelines.daily[i].values.temperatureAvg
        min = tomDailyJSON.timelines.daily[i].values.temperatureMin
        max = tomDailyJSON.timelines.daily[i].values.temperatureMax
        description = descriptionTotalArray[i]

        avg = convert(avg, CELSIUS, selector.value)
        min = convert(min, CELSIUS, selector.value)
        max = convert(max, CELSIUS, selector.value)

        const dayWidgetDiv = document.createElement("p")
        dayWidgetDiv.setAttribute("class", "daily-f-card-div")
        const dayP = document.createElement("p")
        dayP.innerHTML = `Day ${i + 1}: ${avg}<sup>${selector.value}</sup>`
        const minP = document.createElement("p")
        minP.innerHTML = `Min: ${min}<sup>${selector.value}</sup>`
        const maxP = document.createElement("p")
        maxP.innerHTML = `Max: ${max}<sup>${selector.value}</sup>`

        console.log(description)

        const icon = document.createElement("img")
        icon.src = loadMyIcon2(description, max)
        icon.setAttribute("class", "daily-icon")
        const p = document.createElement("p")
        p.innerText = description

        //dayWidgetDiv.setAttribute("background", setTheme(p, weeklyJSON.list[i].temp.day)."background")
        dayWidgetDiv.appendChild(icon)
        dayWidgetDiv.appendChild(p)
        dayWidgetDiv.appendChild(dayP)
        dayWidgetDiv.appendChild(minP)
        dayWidgetDiv.appendChild(maxP)

        weeklyDiv.appendChild(dayWidgetDiv)
    }

}
// Source: https://www.geeksforgeeks.org/javascript/javascript-program-to-find-largest-element-in-an-array/
function findGreatest(array) {
    return array.reduce((largest, current) =>
        (current > largest ? current : largest), array[0]);
}
function findSmallest(array) {
    return array.reduce((smallest, current) =>
        (current < smallest ? current : smallest), array[0]);
}

async function getWeeklyAPI3(latitude, longitude, diffInHours) {

    let apiNr = 3

    //Fetch Third API: Open Meteo API
    const url3 = "https://api.open-meteo.com/v1/forecast?latitude=" + latitude + "&longitude=" + longitude + "&hourly=temperature_2m,precipitation,relative_humidity_2m&timezone=GMT&forecast_days=" + forecastDaysNr + "&timeformat=unixtime"
    const JSON = await ((await (fetch(url3))).json())
    console.log(JSON)

    while (weeklyDiv.lastElementChild) {
        weeklyDiv.removeChild(weeklyDiv.lastElementChild)
    }

    let temperatures = JSON.hourly.temperature_2m
    let unixTimes = JSON.hourly.time
    console.log(temperatures)
    console.log(unixTimes)

    let min, max, description


    let actualTimes = []
    for (let i = 0; i < unixTimes.length; i++) {
        //console.log(fromUnixToCurrent(unixTimes[i], diffInHours))
        actualTimes[i] = fromUnixToCurrent(unixTimes[i], diffInHours)
    }
    console.log(actualTimes)

    let minArray = [], maxArray = []
    let k = 0

    for (let i = 0; i < temperatures.length; i) {
        console.log(i + ": " + actualTimes[i])
        if (actualTimes[i] == 0) {
            console.log("Time is 0!")
            let dayArray = []
            //iterate all the values of one day 0-24
            for (let j = i; j < i + 24; j++) {
                console.log(j)
                dayArray.push(temperatures[j])
            }
            console.log(dayArray)
            minArray[k] = convert(findGreatest(dayArray), CELSIUS, selector.value)
            maxArray[k] = convert(findSmallest(dayArray), CELSIUS, selector.value)
            k++
            i += 24
        }
        else {
            i++
        }
    }

    console.log(minArray)
    console.log(maxArray)

    //convert to another metric if necessary
    for (let i = 0; i < forecastDaysNr; i++) {

        min = minArray[i]
        console.log(min)
        max = maxArray[i]
        console.log(max)
        description = descriptionTotalArray[i]

        const dayWidgetDiv = document.createElement("div")
        dayWidgetDiv.setAttribute("class", "daily-f-card-div")

        
        const dayP = document.createElement("p")
        dayP.innerText = "Day " + (i + 1)
        
        const minP = document.createElement("p")
        minP.innerHTML = `Min: ${min}<sup>${selector.value}</sup>`
        const maxP = document.createElement("p")
        maxP.innerHTML = `Max: ${max}<sup>${selector.value}</sup>`
        console.log(description)

        const icon = document.createElement("img")
        icon.src = loadMyIcon2(description, max)
        icon.setAttribute("class", "daily-icon")
        const p = document.createElement("p")
        p.innerText = description

        //dayWidgetDiv.setAttribute("background", setTheme(p, weeklyJSON.list[i].temp.day)."background")
        dayWidgetDiv.appendChild(icon)
        dayWidgetDiv.appendChild(p)
        dayWidgetDiv.appendChild(dayP)
        dayWidgetDiv.appendChild(minP)
        dayWidgetDiv.appendChild(maxP)

        weeklyDiv.appendChild(dayWidgetDiv)

    }
}


const getWeeklyForecast = async (latitude, longitude, diffInHours) => {


    console.log("Weekly data of API 1 is being loaded now.")
    getWeeklyAPI1(forecastDaysNr)

    //waiting for the async stuff to finish up and actually fill the global array. The interval notation is from ChatGPT
    const interval = setInterval(async () => {
        if (descriptionTotalArray.length > 0) {
            clearInterval(interval);

            console.log(generalProviderSelector.value)
            if (generalProviderSelector.value == providerNames[1]) {
                console.log("Weekly data of API 2 is ignored now.")
                //getWeeklyAPI2()
            }
            else if (generalProviderSelector.value == providerNames[2]) {
                //getWeeklyAPI3(latitude, longitude, diffInHours)
                console.log("Weekly data of API 3 is ignored now.")
            }
        }
    }, 100);
}

//returns path to the corresponding day or night icon
const loadMyIcon = (description, temperature, sunrise, sunset, timeDiff) => {

    let iconPathsDay = {
        "sky is clear": "assets/day/sun.png",
        "clear sky": "assets/day/sun.png",
        "few clouds": "assets/day/cloud_sun.png",
        "scattered clouds": "assets/day/cloud.png",
        "overcast clouds": "assets/day/cloud.png",
        "broken clouds": "assets/day/cloud_sun.png",
        "shower rain": "assets/day/cloud_rain_sun.png",
        "rain": "assets/day/heavy_rain.png",
        "heavy intensity rain": "assets/day/heavy_rain.png",
        "moderate rain": "assets/day/heavy_rain.png",
        "light rain": "assets/day/cloud_rain_sun.png",
        "thunderstorm": "assets/day/storm.png",
        "snow": "assets/day/snowflake.png",
        "mist": "assets/day/mist.png",
        "haze": "assets/day/mist.png",
    }

    let iconPathsNight = {
        "sky is clear": "assets/nigth/moon.png",
        "clear sky": "assets/nigth/moon.png",
        "few clouds": "assets/nigth/cloud_night.png",
        "scattered clouds": "assets/nigth/cloud_night.png",
        "overcast clouds": "assets/nigth/cloud_night.png",
        "broken clouds": "assets/nigth/cloud_night.png",
        "shower rain": "assets/nigth/rain_night.png",
        "rain": "assets/nigth/rain_night.png",
        "heavy intensity rain": "assets/nigth/rain_night.png",
        "moderate rain": "assets/nigth/rain_night.png",
        "light rain": "assets/nigth/rain_night.png",
        "thunderstorm": "assets/nigth/storm_night.png",
        "snow": "assets/nigth/snow_night.png",
        "mist": "assets/day/mist.png",
        "haze": "assets/day/mist.png",
    }

    //check whether it is night
    let night = false
    let date = new Date()
    date.setHours(date.getHours() + timeDiff - 1)
    console.log(date < sunrise)
    console.log(date > sunset)
    console.log(date)
    console.log(sunrise)
    console.log(sunset)
    if((date < sunrise) || date > sunset){
        night = true
    }

    let iconPath;
    let paths
    if(night){
        paths = iconPathsNight
    }else{
        paths = iconPathsDay
    }

    for (let [key, value] of Object.entries(paths)) {
        //console.log(`${key}: ${value}`);
        //console.log("Description: " + description)
        if (description == key) {
            iconPath = value
            //console.log(key)
            break
        }
        //console.log("Suitable icon not found.")
    }

    //check for hot temperature
    const HOT_TEMP_CELS = 35
    const HOT_TEMP_FAHR = HOT_TEMP_CELS * (9 / 5) + 32
    const HOT_TEMP_KELV = HOT_TEMP_CELS + 273.15
    if ((selector.value == CELSIUS && temperature >= HOT_TEMP_CELS) || (selector.value == FAHRENHEIT && temperature >= HOT_TEMP_FAHR) || (selector.value == KELVIN && temperature >= HOT_TEMP_KELV)) {
        if(night){
            iconPath = "assets/nigth/hot_night.png"
        }else{
            iconPath = "assets/day/hot.png"
        }
    }

    return iconPath
}

/*
    @time: time of the day in hours (e.g. 14)
 */
const loadMyIcon2 = (description, temperature) => {

    let iconPaths = {
        "sky is clear": "assets/day/sun.png",
        "clear sky": "assets/day/sun.png",
        "few clouds": "assets/day/cloud_sun.png",
        "scattered clouds": "assets/day/cloud.png",
        "overcast clouds": "assets/day/cloud.png",
        "broken clouds": "assets/day/cloud_sun.png",
        "shower rain": "assets/day/cloud_rain_sun.png",
        "rain": "assets/day/heavy_rain.png",
        "heavy intensity rain": "assets/day/heavy_rain.png",
        "moderate rain": "assets/day/heavy_rain.png",
        "light rain": "assets/day/cloud_rain_sun.png",
        "thunderstorm": "assets/day/storm.png",
        "snow": "assets/day/snowflake.png",
        "mist": "assets/day/mist.png",
        "haze": "assets/day/mist.png",
    }

    let iconPath

    for (let [key, value] of Object.entries(iconPaths)) {
        //console.log(`${key}: ${value}`);
        //console.log("Description: " + description)
        if (description == key) {
            iconPath = value
            //console.log(key)
            break
        }
        //console.log("Suitable icon not found.")
    }

    //check for hot temperature
    const HOT_TEMP_CELS = 35
    const HOT_TEMP_FAHR = HOT_TEMP_CELS * (9 / 5) + 32
    const HOT_TEMP_KELV = HOT_TEMP_CELS + 273.15
    if ((selector.value == CELSIUS && temperature >= HOT_TEMP_CELS) || (selector.value == FAHRENHEIT && temperature >= HOT_TEMP_FAHR) || (selector.value == KELVIN && temperature >= HOT_TEMP_KELV)) {
        iconPath = "assets/day/hot.png"
        console.log("This city is hot!!")
    }

    return iconPath
}

//sets matching color theme (through setting CSS classes to HTML tags) based on the current weather and time of the day
const setTheme = (description, temperature, sunrise, sunset, timeDiff) => {

    let themeClasses = {
        "sky is clear": "sunny",
        "clear sky": "sunny",
        "few clouds": "sunny-cloudy",
        "scattered clouds": "cloudy",
        "overcast clouds": "cloudy",
        "broken clouds": "sunny-cloudy",
        "shower rain": "sunny-rainy",
        "rain": "rainy-cloudy",
        "moderate rain": "rainy-cloudy",
        "light rain": "rainy-cloudy",
        "thunderstorm": "stormy",
        "snow": "snowy",
        "mist": "cloudy",

    }

    let className;

    for (let [key, value] of Object.entries(themeClasses)) {
        console.log(`${key}: ${value}`);
        console.log("Description: " + description)
        if (description == key) {
            className = value
            console.log(className)
            break
        }
        console.log("Suitable theme not found.")
    }

    let hot = false;
    //check for hot temperature
    const HOT_TEMP_CELS = 35
    const HOT_TEMP_FAHR = HOT_TEMP_CELS * (9 / 5) + 32
    const HOT_TEMP_KELV = HOT_TEMP_CELS + 273.15
    if ((selector.value == CELSIUS && temperature >= HOT_TEMP_CELS) || (selector.value == FAHRENHEIT && temperature >= HOT_TEMP_FAHR) || (selector.value == KELVIN && temperature >= HOT_TEMP_KELV)) {
        hot = true
        className = "hot-cloudy"

    }
    console.log(temperature + " " + className)

    //check whether it is night
    let date = new Date()
    date.setHours(date.getHours() + timeDiff - 1)
    console.log(date < sunrise)
    console.log(date > sunset)
    console.log(date)
    console.log(sunrise)
    console.log(sunset)
    if((date < sunrise) || date > sunset){
        className = "night"
    }
    /*
    let hourNow = (new Date()).getUTCHours() + timeDiff
    if(hourNow > 24){
        hourNow -= 24
    }
    let minsNow = (new Date()).getUTCMinutes()
    console.log(hourNow)
    console.log(minsNow)
    console.log(hourNow < sunrise.getHours() + timeDiff)
    console.log(hourNow = sunrise.getHours() && minsNow < sunrise.getMinutes())
    console.log(sunrise.getHours() + timeDiff)
    console.log(hourNow = sunset.getHours() && minsNow > sunset.getMinutes())
    console.log(sunset.getHours())
    console.log(hourNow > sunset.getHours())
    if((hourNow < sunrise.getHours()) || (hourNow = sunrise.getHours() && minsNow < sunrise.getMinutes())|| (hourNow = sunset.getHours() && minsNow > sunset.getMinutes()) || (hourNow > sunset.getHours())){
        className = "night"
    }
    */
    console.log(className)

    return className
}

const loadOWMIcon = (description) => {

    iconCodes = {
        "clear sky": "01d",
        "few clouds": "02d",
        "scattered clouds": "03d",
        "broken clouds": "04d",
        "shower rain": "09d",
        "rain": "10d",
        "thunderstorm": "11d",
        "snow": "13d",
        "mist": "50d",

    }

    let code;

    for (let [key, value] of Object.entries(iconCodes)) {
        console.log(`${key}: ${value}`);
        console.log(description)
        if (description = key) {
            code = value
            console.log(code)
            break
        }
    }


    return "https://openweathermap.org/img/wn/" + code + "@2x.png"
}


const loadMap = async (lat, lon) => {
    ;
    if (!map) {
        console.log("Map is being initialized.")
        map = L.map('map').setView([lat, lon], 7);

        let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        let temp = L.tileLayer('http://maps.openweathermap.org/maps/2.0/weather/TA2/{z}/{x}/{y}?opacity=0.6&fill_bound=true&appid=' + apiKey1, {
            attribution: '&copy; <a href="https://openweathermap.org/api/weather-map-2">OpenWeatherMap</a> contributors'
        }).addTo(map)
    
        let precip = L.tileLayer('http://maps.openweathermap.org/maps/2.0/weather/PA0/{z}/{x}/{y}?opacity=0.7&fill_bound=true&appid=' + apiKey1, {
            attribution: '&copy; <a href="https://openweathermap.org/api/weather-map-2">OpenWeatherMap</a> contributors'
        })
    

        let pressure = L.tileLayer('http://maps.openweathermap.org/maps/2.0/weather/APM/{z}/{x}/{y}?opacity=0.6&fill_bound=true&appid=' + apiKey1, {
            attribution: '&copy; <a href="https://openweathermap.org/api/weather-map-2">OpenWeatherMap</a> contributors'
        })
    

        let wind = L.tileLayer('http://maps.openweathermap.org/maps/2.0/weather/WND/{z}/{x}/{y}?opacity=0.6&fill_bound=true&appid=' + apiKey1, {
            attribution: '&copy; <a href="https://openweathermap.org/api/weather-map-2">OpenWeatherMap</a> contributors'
        });
    

        let baseMapsData = {
            "Temperature Map": temp,
            "Precipitation": precip,
            "Pressure": pressure,
            "Wind": wind,
        }

        let baseMaps = {
            "Temperature Map": temp,
            "Precipitation": precip,
            "Pressure": pressure,
            "Wind": wind,
        }

        let layerControl = L.control.layers(baseMaps).addTo(map)

    } else {
        console.log("New view set.")
        map.setView([lat, lon])
    }

}


/*
//Tried to make button /select grabbable as a funny feature. Maybe next time
//This is from ChatGPT
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  document.querySelector("select").addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - document.querySelector("select").offsetLeft;
    offsetY = e.clientY - document.querySelector("select").offsetTop;
    document.querySelector("select").style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    document.querySelector("select").style.left = `${e.clientX - offsetX}px`;
    document.querySelector("select").style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.querySelector("select").style.cursor = "grab";
  });

  */