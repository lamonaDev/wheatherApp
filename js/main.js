// //! getMainWeather
document.addEventListener('DOMContentLoaded', function() {
    fetchForecast('alex');
    const searchButton = document.querySelector('.btn.btn-dark');
    const cityInput = document.querySelector('.city-input');
    searchButton.addEventListener('click', function() {
        const city = cityInput.value.trim();
        if (city) {
            fetchForecast(city);
            cityInput.value = "";
        } else {
            alert('Please enter a city name.');
        }
    });
});

async function fetchForecast(city) {
    const apiKey = '84e12e6e88614c39af1144700252306'; // Replace with your WeatherAPI key
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=4`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        updateCards(data);
    } catch (error) {
        console.error('Error fetching forecast:', error);
        alert('Failed to fetch forecast. Please try again.');
    }
}

function calculateAverageWindDirection(hours) {
    let sumX = 0;
    let sumY = 0;
    hours.forEach(hour => {
        const degree = hour.wind_degree;
        const rad = (degree * Math.PI) / 180;
        sumX += Math.cos(rad);
        sumY += Math.sin(rad);
    });
    const avgRad = Math.atan2(sumY, sumX);
    let avgDegree = (avgRad * 180) / Math.PI;
    if (avgDegree < 0) avgDegree += 360;
    return avgDegree;
}

function getCompassDirection(degree) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.floor((degree + 11.25) / 22.5) % 16;
    return directions[index];
}

function updateCards(data) {
    const cards = document.querySelectorAll('.mainWeatherContainer .card');
    const forecastDays = data.forecast.forecastday;
    const city = data.location.name;
    const country = data.location.country;

    forecastDays.forEach((day, index) => {
        if (index < 4) { // Ensure we only update the 4 available cards
            const card = cards[index];
            const dateObj = new Date(day.date);
            const dayOfMonth = dateObj.getDate();
            const month = dateObj.getMonth() + 1;
            const year = dateObj.getFullYear();
            const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
            const formattedDate = `${dayOfMonth}/${month}/${year} (${weekday})`;

            const temp = day.day.avgtemp_c;
            const condition = day.day.condition.text;
            const precipitation = Math.max(day.day.daily_chance_of_rain, day.day.daily_chance_of_snow);
            const windSpeed = day.day.maxwind_kph;
            const avgHumidity = day.day.avghumidity;

            const daylightHours = day.hour.filter(hour => {
                const hourOfDay = parseInt(hour.time.split(' ')[1].split(':')[0], 10);
                return hourOfDay >= 6 && hourOfDay <= 18;
            });
            const feelsLikeSum = daylightHours.reduce((sum, hour) => sum + hour.feelslike_c, 0);
            const avgFeelsLike = daylightHours.length > 0 ? (feelsLikeSum / daylightHours.length).toFixed(1) : 'N/A';

            const allHours = day.hour;
            const avgWindDegree = calculateAverageWindDirection(allHours);
            const windDirection = getCompassDirection(avgWindDegree);

            const cityElement = card.querySelector('h4:nth-child(1)');
            const dateElement = card.querySelector('h4:nth-child(2)');
            const tempElement = card.querySelector('.display-2');
            const feelsLikeElement = card.querySelector('p.mb-2');
            const conditionElement = card.querySelector('h5');

            cityElement.textContent = `${city}, ${country}`;
            dateElement.textContent = formattedDate;
            tempElement.textContent = `${temp.toFixed(1)}°C`;
            feelsLikeElement.innerHTML = `Feels Like: <strong>${avgFeelsLike} °C</strong>`;
            conditionElement.innerHTML = `${condition} / 
                <i class="bi bi-fan" style="font-size: 17px;"></i><i class="m-2" style="font-size: 10px;">${windSpeed} KM/H</i>
                <i class="bi bi-compass" style="font-size: 17px;"></i><i class="m-2" style="font-size: 10px;">${windDirection}</i>
                <i class="bi bi-droplet-fill" style="font-size: 17px;"></i><i class="m-2" style="font-size: 10px;">${avgHumidity}%</i>`;
        }
    });
}