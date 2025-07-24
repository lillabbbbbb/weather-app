const searchArea = document.getElementById("search-bar")
const searchButton = document.getElementById("button-search")
const locationButton = document.getElementById("geolocation");
const currentIconImg = document.getElementById("current-icon")
const addFavButton = document.getElementById("add-favorite")
const favDiv = document.getElementById("favorites")
const lastVisitedDiv = document.getElementById("last-visited")
const selector = document.getElementById("select-metrics")
const weatherDataSelector = document.getElementById("select-weather-data")
const chartProviderSelector = document.getElementById("select-provider-chart")
const generalProviderSelector = document.getElementById("general-provider-selector")
const weeklyDiv = document.getElementById("div-weekly")

const apiKey1 = "d84bd23391e17b943fc45b049bd574d4"
const apiKey2 = "Cgp1nINqRCsErUN8HM74lwRgOyAP0ulF"
const apikey3 = ""

const CELSIUS = "℃"
const FAHRENHEIT = "°F"
const KELVIN = "K"

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
    "2nd API",
    "OpenMeteo"
]

let runProviders = {
    "OpenWeatherMap": searchByCityName(),
    "2nd API": loadAPI2(),
    "OpenMeteo": loadAPI3(),
}
for (let [key, value] of Object.entries(runProviders)) {
    let option1 = document.createElement("option")
    option1.text = key
    generalProviderSelector.add(option1)
    let option2 = document.createElement("option")
    option2.text = key
    option2.selected = true
    chartProviderSelector.add(option2)
}

let hourlyDataTotal = [
    [],
    [],
    []
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

locationButton.addEventListener("click", async () => {
    //source: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API#examples

    const status = document.querySelector("#status");

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


    document.getElementById("city").innerText = JSON.name + ", " + JSON.sys.country
    document.getElementById("unit").innerText = selector.value
    addToLastVisited(JSON.name)
    searchArea.value = JSON.name
    //let countryCode = JSON.sys.country
    //document.getElementById("country").innerText = countryCode

    currentIconImg.src = loadMyIcon(JSON.weather[0].description)
    currentIconImg.setAttribute("class", "current-icon")

    //set theme based on weather
    const html = document.getElementsByTagName("html")
    const body = document.getElementsByTagName("body")
    //testing
    //html[0].setAttribute("class", "stormy")
    //body[0].setAttribute("class", "stormy")
    html[0].setAttribute("class", setTheme(JSON.weather[0].description, JSON.main.temp))
    body[0].setAttribute("class", setTheme(JSON.weather[0].description, JSON.main.temp))
    //body[0].setAttribute("class", "test")




    //const date = new Date();
    let diffInHours = JSON.timezone / 3600
    //console.log(date.getUTCHours())
    //console.log(diffInHours)
    //const hour = date.getUTCHours() + diffInHours

    let sunrise = JSON.sys.sunrise
    let sunset = JSON.sys.sunset

    //Source: https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds
    var date = new Date(sunrise * 1000);

    // Hours part from the timestamp
    var hours = date.getUTCHours() + diffInHours;

    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();

    date.setHours(hours)

    // Will display time in 10:30:23 format
    formattedSunrise = date.getHours() + ':' + minutes.substr(-2)
    console.log(formattedSunrise);

    var date = new Date(sunset * 1000);

    // Hours part from the timestamp
    var hours = date.getUTCHours() + diffInHours;

    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();

    date.setHours(hours)

    // Will display time in 10:30:23 format
    formattedSunset = date.getHours() + ':' + minutes.substr(-2)
    console.log(formattedSunset);



    const latitude = JSON.coord.lat
    const longitude = JSON.coord.lon
    loadMap(latitude, longitude)


    console.log("API 3:")
    HourlyApi3(latitude, longitude, date.getUTCHours(), diffInHours)



    let mainWeatherDescr = JSON.weather[0].description
    let mainWeather = JSON.weather[0].main
    let feelsLike = JSON.main.feels_like
    let humidity = JSON.main.humidity
    let pressure = JSON.main.pressure
    let visibility = JSON.visibility / 1000

    document.getElementById("main-description").innerText = mainWeather + ", " + mainWeatherDescr
    document.getElementById("feels-like").innerText = "Feels like " + feelsLike + selector.value
    document.getElementById("sunrise").innerText = "Sunrise: " + formattedSunrise
    document.getElementById("sunset").innerText = "Sunset: " + formattedSunset
    document.getElementById("humidity").innerText = "Humidity: " + humidity + "%"
    document.getElementById("pressure").innerText = "Pressure: " + pressure + "hPa"
    document.getElementById("visibility").innerText = "Visibility: " + visibility + "km"

    let windDegree = JSON.wind.deg
    let windSpeed = JSON.wind.speed

    document.getElementById("wind-deg").innerText = "Wind degree: " + windDegree + "°"
    document.getElementById("wind-speed").innerText = "Wind speed: " + windSpeed + "km/h"

    document.getElementById("temperature").innerText = JSON.main.temp


    createChart()
    getWeeklyForecast(7)

}

function loadAPI2() {
    console.log("This is loadAPI2 function.")
}

function loadAPI3() {
    console.log("This is loadAPI3 function.")
}


function fromUnixToCurrent(unixTime, diffInHours) {

    var date = new Date(unixTime * 1000);

    // Return hours
    if (date.getUTCHours() + diffInHours > 23) {
        return date.getUTCHours() + diffInHours - 24
    }
    return date.getUTCHours() + diffInHours

}

async function HourlyApi3(latitude, longitude, UTCHour, diffInHours) {

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
        api3HourlyLabels.push(fromUnixToCurrent(hourly3JSON.hourly.time[i], diffInHours))
    }

    console.log(api3HourlyValues)
    console.log(api3HourlyLabels)

    hourlyDataTotal[2] = api3HourlyValues
    console.log(hourlyDataTotal)
}

const searchByLatLong = async (latitude, longitude) => {

    let JSON = await ((await fetch("https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=" + apiKey1 + getUnits())).json())
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
    let visibility = JSON.visibility / 1000

    document.getElementById("main-description").innerText = mainWeather
    document.getElementById("feels-like").innerText = "Feels like " + feelsLike + selector.value
    document.getElementById("humidity").innerText = "Humidity: " + humidity + "%"
    document.getElementById("pressure").innerText = "Pressure: " + pressure + "hPa"
    document.getElementById("visibility").innerText = "Visibility: " + visibility + "km"


    let windDegree = JSON.wind.deg
    let windSpeed = JSON.wind.speed

    document.getElementById("wind-deg").innerText = "Wind degree: " + windDegree + "°"
    document.getElementById("wind-speed").innerText = "Wind speed: " + windSpeed + "km/h"

    document.getElementById("temperature").innerText = JSON.main.temp + selector.value

    createChart()
    getWeeklyForecast(7)
    loadMap(latitude, longitude)

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
    for (let i = startIndex; i < startIndex + 24; i++) {
        owmHourlyValues.push(hourlyJSON.list[i].main.temp)
        owmHourlyLabels.push(hourlyJSON.list[i].dt_txt.substring(10, 13))
    }

    console.log(owmHourlyValues)
    console.log(owmHourlyLabels)

    hourlyDataTotal[0] = owmHourlyValues

    hourlyDataTotal[1] = temperatures.hourlyDay[1]

    //Fetch Second API: Tomorrow IO API
    /*
    const url2 = "https://api.tomorrow.io/v4/weather/forecast?location=" + searchArea.value + "&timesteps=1h" + getUnits() + "&apikey=Cgp1nINqRCsErUN8HM74lwRgOyAP0ulF"
    const tomHourlyJSON = await( (await (fetch(url2))).json())
    console.log(tomHourlyJSON)


    let tomHourlyValues = []
    let tomHourlyLabels = []

    let startIndex2;

    console.log(tomHourlyJSON.timelines.hourly[0].time.substring(11,13))

    for (let i = 0; i < tomHourlyJSON.timelines.hourly.length; i++) {
        console.log(i + ":   hour = " + hour + ", tomHourlyJSON.timelines.hourly[i].time.substring(11,13) = " + tomHourlyJSON.timelines.hourly[i].time.substring(11,13))
        if ((hour + 1) == parseInt(tomHourlyJSON.timelines.hourly[i].time.substring(11,13)) || (hour - 23) == parseInt(tomHourlyJSON.timelines.hourly[i].time.substring(11,13))) {
            startIndex2 = i;
            break;
        }
    }
    console.log(startIndex2)
    for (let i = startIndex + 1; i < startIndex + 1 + 24; i++) {
        tomHourlyValues.push(tomHourlyJSON.timelines.hourly[i].values.temperature)
        tomHourlyLabels.push(tomHourlyJSON.timelines.hourly[i].time.substring(11,13))
    }
    console.log(tomHourlyValues)
    console.log(tomHourlyLabels)

    hourlyDataTotal[1] = tomHourlyValues
    */




    //Fetch Third API: Open Meteo API
    //Note: Open Meteo search works only with lat and long. I am using the lat and long values of the search from the first API because that's the most convenient
    let latitude = hourlyJSON.city.coord.lat
    let longitude = hourlyJSON.city.coord.lon

    const url3 = "https://api.open-meteo.com/v1/forecast?latitude=" + latitude + "&longitude=" + longitude + "&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m"
    const omHourlyJSON = await ((await (fetch(url3))).json())
    console.log(omHourlyJSON)


    let activeDatasets = []
    //Add datasets of those providers which are selected
    for (let i = 0; i < chartProviderSelector.children.length; i++) {
        if (chartProviderSelector.children[i].selected == true) {
            //exclude Tomorrow API hourly values when the unit is Kelvin
            if(!(chartProviderSelector.children[i].value == "Tomorrow API" && selector.value == KELVIN)){
                activeDatasets.push({
                name: chartProviderSelector.children[i].value,
                values: hourlyDataTotal[i]
            })
            }
        }
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

const getWeeklyForecast = async (numberOfDays) => {
    while (weeklyDiv.lastElementChild) {
        weeklyDiv.removeChild(weeklyDiv.lastElementChild)
    }
    console.log(getUnits())

    //Fetch first API: Open Weather Map
    url1 = "https://api.openweathermap.org/data/2.5/forecast/daily?q=" + searchArea.value + "&cnt=" + numberOfDays + "&appid=" + apiKey1 + getUnits()
    console.log(url1)
    const weeklyJSON = await ((await fetch(url1)).json())
    console.log(weeklyJSON)

    const h31 = document.createElement("h3")
    h31.innerText = "OpenWeatherMap"
    const api1Div = document.createElement("div")
    api1Div.setAttribute("class", "col")
    api1Div.appendChild(h31)

    for (let i = 0; i < weeklyJSON.list.length; i++) {
        const dayWidgetDiv = document.createElement("div")
        dayWidgetDiv.setAttribute("class", "daily-f-card-div")
        const dayDiv = document.createElement("div")
        dayDiv.innerText = "Day " + (i + 1) + ": " + weeklyJSON.list[i].temp.day + selector.value
        const minDiv = document.createElement("div")
        minDiv.innerText = "Min: " + weeklyJSON.list[i].temp.min + selector.value
        const maxDiv = document.createElement("div")
        maxDiv.innerText = "Max: " + weeklyJSON.list[i].temp.max + selector.value

        const icon = document.createElement("img")
        icon.src = loadMyIcon2(weeklyJSON.list[i].weather[0].description)
        icon.setAttribute("class", "daily-icon")
        const p = document.createElement("p")
        p.innerText = weeklyJSON.list[i].weather[0].description

        //dayWidgetDiv.setAttribute("background", setTheme(p, weeklyJSON.list[i].temp.day)."background")
        dayWidgetDiv.appendChild(icon)
        dayWidgetDiv.appendChild(p)
        dayWidgetDiv.appendChild(dayDiv)
        dayWidgetDiv.appendChild(minDiv)
        dayWidgetDiv.appendChild(maxDiv)

        api1Div.appendChild(dayWidgetDiv)
    }
    weeklyDiv.appendChild(api1Div)

    //This div data is just for testing, because Tomorrow API number of calls is very limited
    const h32 = document.createElement("h3")
    h32.innerText = "Fake Data"
    const api2Div = document.createElement("div")
    api2Div.setAttribute("class", "col")
    api2Div.appendChild(h32)

    for (let i = 0; i < weeklyJSON.list.length; i++) {
        const dayWidgetDiv = document.createElement("div")
        dayWidgetDiv.setAttribute("class", "daily-f-card-div")
        const dayDiv = document.createElement("div")
        dayDiv.innerText = "Day " + (i + 1) + ": " + weeklyJSON.list[i].temp.day + selector.value
        const minDiv = document.createElement("div")
        minDiv.innerText = "Min: " + weeklyJSON.list[i].temp.min + selector.value
        const maxDiv = document.createElement("div")
        maxDiv.innerText = "Max: " + weeklyJSON.list[i].temp.max + selector.value

        const icon = document.createElement("img")
        icon.src = loadMyIcon2(weeklyJSON.list[i].weather[0].description)
        icon.setAttribute("class", "daily-icon")
        const p = document.createElement("p")
        p.innerText = weeklyJSON.list[i].weather[0].description

        dayWidgetDiv.appendChild(icon)
        dayWidgetDiv.appendChild(p)
        dayWidgetDiv.appendChild(dayDiv)
        dayWidgetDiv.appendChild(minDiv)
        dayWidgetDiv.appendChild(maxDiv)

        api2Div.appendChild(dayWidgetDiv)
    }
    weeklyDiv.appendChild(api2Div)


    //Fetch Second API: Tomorrow IO API
    /*
    const url2 = "https://api.tomorrow.io/v4/weather/forecast?location=" + searchArea.value + "&timesteps=1d" + getUnits() + "&apikey=Cgp1nINqRCsErUN8HM74lwRgOyAP0ulF"
    const tomDailyJSON = await( (await (fetch(url2))).json())
    console.log(tomDailyJSON)


    let tomDailyValues = []

    console.log(tomDailyJSON.timelines.daily[0].values.temperatureAvg)
    console.log(tomDailyJSON.timelines.daily[0].values.temperatureMin)
    console.log(tomDailyJSON.timelines.daily[0].values.temperatureMax)

    const h32 = document.createElement("h3")
    h32.innerText = "Tomorrow API"
    weeklyDiv.appendChild(h32)

    
    for (let i = 0; i < weeklyJSON.list.length; i++) {
        const dayWidgetDiv = document.createElement("div")
        dayWidgetDiv.setAttribute("class", "daily-f-card-div")
        const dayDiv = document.createElement("div")
        dayDiv.innerText = "Day " + (i + 1) + ": " + tomDailyJSON.timelines.daily[0].values.temperatureAvg + selector.value
        const minDiv = document.createElement("div")
        minDiv.innerText = "Min: " + tomDailyJSON.timelines.daily[0].values.temperatureMin + selector.value
        const maxDiv = document.createElement("div")
        maxDiv.innerText = "Max: " + tomDailyJSON.timelines.daily[0].values.temperatureMax + selector.value

        const icon = document.createElement("img")
        icon.src = loadMyIcon2(weeklyJSON.list[i].weather[0].description)
        icon.setAttribute("class", "daily-icon")
        const p = document.createElement("p")
        p.innerText = weeklyJSON.list[i].weather[0].description

        dayWidgetDiv.appendChild(icon)
        dayWidgetDiv.appendChild(p)
        dayWidgetDiv.appendChild(dayDiv)
        dayWidgetDiv.appendChild(minDiv)
        dayWidgetDiv.appendChild(maxDiv)

        weeklyDiv.appendChild(dayWidgetDiv)
    }
    */

}

//returns path to the corresponding icon based on @description
const loadMyIcon = (description) => {

    icons = {
        cloudRainSun: "assets/cloud_rain_sun.png",
        cloudWindSun: "assets/cloud_wind_sun.png",
        cloudSun: "assets/cloud_sun.png",
        hot: "assets/hot.png",
        snow: "assets/snowflake.png",
        sun: "assets/sun.png",
        storm: "assets/storm",
        cloud: "assets/cloud.png"
    }

    description = description.toLowerCase()

    if (description.includes("snow")) {
        return icons.snow
    }
    else if (description.includes("storm")) {
        return icons.storm
    } else if (description.includes("cloud")) {
        return icons.cloud
    } else if (description.includes("rain")) {
        return icons.cloudRainSun
    } else if (description.includes("sun") || description.includes("clear")) {
        return icons.sun
    }
}

/*
    @time: time of the day in hours (e.g. 14)
 */
const loadMyIcon2 = (description, temperature, time) => {

    iconPaths = {
        "sky is clear": "assets/sun.png",
        "clear sky": "assets/sun.png",
        "few clouds": "assets/cloud_sun.png",
        "scattered clouds": "assets/cloud.png",
        "overcast clouds": "assets/cloud.png",
        "broken clouds": "assets/cloud_sun.png",
        "shower rain": "assets/cloud_rain_sun.png",
        "rain": "assets/heavy_rain.png",
        "heavy intensity rain": "assets/heavy_rain.png",
        "moderate rain": "assets/heavy_rain.png",
        "light rain": "assets/cloud_rain_sun.png",
        "thunderstorm": "assets/storm",
        "snow": "assets/snowflake.png",
        "mist": "assets/mist.png",

    }

    let iconPath;

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
        iconPath = "assets/hot.png"
    }


    return iconPath
}

//sets matching color theme (through setting CSS classes to HTML tags) based on the current weather
const setTheme = (description, temperature) => {

    let themeClasses = {
        "sky is clear": "sunny",
        "clear sky": "sunny",
        "few clouds": "cloudy",
        "scattered clouds": "cloudy",
        "overcast clouds": "cloudy",
        "broken clouds": "assets/cloud_sun.png",
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
        console.log("Suitable icon not found.")
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
        }).addTo(map);

        let precip = L.tileLayer('http://maps.openweathermap.org/maps/2.0/weather/PA0/{z}/{x}/{y}?opacity=0.7&fill_bound=true&appid=' + apiKey1, {
            attribution: '&copy; <a href="https://openweathermap.org/api/weather-map-2">OpenWeatherMap</a> contributors'
        })
        let pressure = L.tileLayer('http://maps.openweathermap.org/maps/2.0/weather/APM/{z}/{x}/{y}?opacity=0.6&fill_bound=true&appid=' + apiKey1, {
            attribution: '&copy; <a href="https://openweathermap.org/api/weather-map-2">OpenWeatherMap</a> contributors'
        })
        let wind = L.tileLayer('http://maps.openweathermap.org/maps/2.0/weather/WND/{z}/{x}/{y}?opacity=0.6&fill_bound=true&appid=' + apiKey1, {
            attribution: '&copy; <a href="https://openweathermap.org/api/weather-map-2">OpenWeatherMap</a> contributors'
        });



        let baseMaps = {
            "TempMap": temp,
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
