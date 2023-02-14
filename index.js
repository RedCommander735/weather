let current_location;
let set_location
let refresh
let current_city
let lat
let lon
let legend
let weather_box
let image
let text

async function setup() {
    set_location = document.getElementById("set_location");
    refresh = document.getElementById("refresh_btn");
    current_city = document.getElementById("city");
    weather_box = document.getElementById("weather");
    image = document.getElementById("image");
    text = document.getElementById("text");

    set_location.addEventListener("submit", (event) => {
        event.preventDefault();
        event.stopPropagation();
        target = event.target
        getLocation(target);
    });

    legend = await fetch('https://api.met.no/weatherapi/weathericon/2.0/legends')
    .then((response) => response.json());

    lat = localStorage.getItem('lat');
    lon = localStorage.getItem('lon');
    current_city.innerText = localStorage.getItem('city');
    update_weater(lat, lon);
};

async function getLocation(form) {

    const formData = new FormData(form)
    const query = formData.get("name")

    const location = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1`)
        .then((response) => response.json());

        const first = location[0];
        const addr = first.address

        let town = ""
        const county = (addr.county) ? addr.county + "," : "";
        const state  = (addr.state) ? addr.state + "," : "";
        const country = (addr.country) ? addr.country : "";

        if (addr.village) {
            town = addr.village + ","
        } else if (addr.town) {
            town = addr.town + ","
        } else if (addr.city) {
            town = addr.city + ","
        };

        current_city.innerText = `${town} ${county} ${state} ${country}`

        lat = first.lat
        lon = first.lon

        localStorage.setItem('lat', lat)
        localStorage.setItem('lon', lon)
        localStorage.setItem('city', `${town} ${county} ${state} ${country}`)

        update_weater(lat, lon);
}

async function update_weater(lat, lon) {
    console.log("Fetching weather data...")

    const weather = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`)
    .then((response) => response.json());

    const current_weather_code = weather.properties.timeseries[0].data.next_1_hours.summary.symbol_code
    const code_wo_time = current_weather_code.split('_')[0];
    const time = current_weather_code.split('_')[1];
    const current_weather = legend[code_wo_time].desc_en

    image.innerHTML = await fetch(`https://raw.githubusercontent.com/RedCommander735/weather/master/svg/${current_weather_code}.svg`)
    .then((response) => response.text());

    text.innerHTML = `<p>${current_weather}</p>`
};

document.addEventListener("DOMContentLoaded", setup);
