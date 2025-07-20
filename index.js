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
    if(units == "℃"){
        units = "&units=metric"
    }
    else if(units == "°F"){
        units = "&units=imperial"
    }
    else if(units == "K"){
        units = "&units=default"
    }
    return units
} 
selector.addEventListener("change", (e) => {
    selector.value = e.target.value
    search(searchArea.value)
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
    search(input)

    //check if the current search is already in favorites
    console.log("Checking now")
    for (let i = 0; i < favDiv.children; i++) {
        console.log(searchArea.value == favDiv.children[i].innerText)
        if (searchArea.value == favDiv.children[i]) {
            addFavButton.innerText = "Favorited"
        }
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
            search(searchArea.value, getUnits)
        })
    }
    else {
        console.log(searchArea.value + " is already added to favorites.")
    }

})

const search = async(searchTerm) => {
    //console.log(searchTerm)
    document.getElementById("city").innerText = searchTerm
    console.log("Searching for " + searchTerm)

    let JSON = await ((await fetch("https://api.openweathermap.org/data/2.5/weather?q=" + searchTerm +"&appid=" + apiKey + getUnits())).json())
    console.log(JSON)

    let mainWeatherDescr = JSON.weather[0].description
    let mainWeather = JSON.weather[0].main
    let feelsLike = JSON.main.feels_like
    let humidity = JSON.main.humidity
    let pressure = JSON.main.pressure
    let visibility = JSON.sys.visibility


    let windDegree = JSON.wind.deg
    let windSpeed = JSON.wind.speed

    document.getElementById("temperature").innerText = JSON.main.temp + selector.value

    createChart()
    getWeeklyForecast(7)

}

async function createChart () {

    const url = "https://pro.openweathermap.org/data/2.5/forecast/hourly?q=" + searchArea.value + "&appid=" + apiKey + getUnits()
    console.log(url)
    let hourlyJSON = await ((await (fetch(url))).json())
    console.log(hourlyJSON)

    console.log(hourlyJSON.list[0].main.temp)
    console.log(hourlyJSON.list[0].dt_text)

    let owmHourlyValues = []
    for(let i = 0; i < 24; i++){
        owmHourlyValues.push(hourlyJSON.list[i].main.temp)
    }
    console.log(owmHourlyValues)

    const hourlyChartData = {
        labels: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6],
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

const getWeeklyForecast = async(numberOfDays) => {
    while(weeklyDiv.lastElementChild){
        weeklyDiv.removeChild(lastElementChild)
    }

    url = "https://api.openweathermap.org/data/2.5/forecast/daily?q=" + searchArea.value + "&cnt=" + numberOfDays + "&appid=" + apiKey + getUnits()
    console.log(url)
    const weeklyJSON = await((await fetch(url)).json())
    console.log(weeklyJSON)

    for(let i = 0; i < weeklyJSON.list.length; i++){
        const dayWidgetDiv = document.createElement("div")
        const dayDiv = document.createElement("div")
        dayDiv.innerText = weeklyJSON.list[i].temp.day + selector.value
        const minDiv = document.createElement("div")
        minDiv.innerText = weeklyJSON.list[i].temp.min  + selector.value
        const maxDiv = document.createElement("div")
        maxDiv.innerText = weeklyJSON.list[i].temp.max  + selector.value

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