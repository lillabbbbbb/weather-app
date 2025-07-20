const searchArea = document.getElementById("search-bar")
const searchButton = document.getElementById("button-search")
const locationButton = document.getElementById("geolocation");
const currentIconImg = document.getElementById("current-icon")
const addFavButton = document.getElementById("add-favorite")
const favDiv = document.getElementById("favorites")
const selecter = document.getElementById("select-metrics")
let previousMetric = selecter.value

let favs = []

let icons = {
    sunny: '<a href="https://www.flaticon.com/free-icons/sunny" title="sunny icons">Sunny icons created by Freepik - Flaticon</a>',
    cloudyRainySunny: '<a href="https://www.flaticon.com/free-icons/wind" title="wind icons">Wind icons created by Freepik - Flaticon</a>',
    cloudyWindySunny: '<a href="https://www.flaticon.com/free-icons/clear-sky" title="clear-sky icons">Clear-sky icons created by Freepik - Flaticon</a>',
    cloudySunny: '<a href="https://www.flaticon.com/free-icons/clouds-and-sun" title="clouds-and-sun icons">Clouds-and-sun icons created by Freepik - Flaticon</a>',
}

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

let currTemp = document.getElementById("temperature").innerText = temperatures.current + selecter.value
createChart()
currentIconImg.src = "assets/sun.png"
console.log("source set")

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
    if (!favs.includes(searchArea.value)) {
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
            search(searchArea.value)
        })
    }
    else {
        console.log(searchArea.value + " is already added to favorites.")
    }

})

selecter.addEventListener("change", (e) => {
    let newMetric = e.target.value

    console.log(newMetric + " has been chosen now instead of " + previousMetric + ".")
    //go through all temperatures displayed on page and convert them all
    temperatures.current = convert(previousMetric, newMetric, temperatures.current)
    let currTemp = document.getElementById("temperature").innerText = temperatures.current + selecter.value


    previousMetric = newMetric
})

const convert = (previousMetric, newMetric, value) => {
    const c = "℃"
    const f = "°F"
    const k = "K"
    let newValue;
    //from Celsius to Fahrenheit
    if (previousMetric == c && newMetric == f) {
        newValue = (value * (9 / 5) + 32)
    }

    //from Fahrenheit to Celsius
    if (previousMetric == f && newMetric == c) {
        newValue = ((value - 32) * 5 / 9)
    }

    //from Celsius to Kelvin
    if (previousMetric == c && newMetric == k) {
        newValue = (value + 273.15)
    }

    //from Kelvin to Celsius
    if (previousMetric == k && newMetric == c) {
        newValue = (value - 273.15)
    }

    //from Fahrenheit to Kelvin
    if (previousMetric == f && newMetric == k) {
        newValue = ((value - 32) * 5 / 9 + 273.15)
    }

    //from Kelvin to Fahrenheit
    if (previousMetric == k && newMetric == f) {
        newValue = ((value - 273.15) * 9 / 5 + 32)
    }
    console.log(value + previousMetric + " has been changed to " + newValue + newMetric)
    return newValue
}

const search = (searchTerm) => {
    //console.log(searchTerm)
    document.getElementById("city").innerText = searchTerm
    console.log("Searching for " + searchTerm)
}

function createChart() {
    const hourlyChartData = {
        labels: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6],
        datasets: [
            {
                name: "First API",
                values: temperatures.hourlyDay[0]
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