/* =================================================================
   3-LAYER ARCHITECTURE JAVASCRIPT IMPLEMENTATION
   ================================================================= */

// -----------------------------------------------------------------
// LAYER 1: DATA LAYER (With instant demo fallback)
// -----------------------------------------------------------------
const DataLayer = {
  apiKey: "b1024daabd7bd9298dc2252ea7cb71fa",

  // Local backup dataset so your site works right away
  mockData: {
    "london": { name: "London", country: "GB", temp: 15, feels_like: 14, humidity: 72, pressure: 1015, wind: 4.1, icon: "04d", description: "broken clouds" },
    "tokyo": { name: "Tokyo", country: "JP", temp: 19, feels_like: 19, humidity: 80, pressure: 1020, wind: 2.5, icon: "10d", description: "light rain" },
    "new york": { name: "New York", country: "US", temp: 22, feels_like: 21, humidity: 55, pressure: 1012, wind: 3.6, icon: "01d", description: "clear sky" }
  },

  async fetchWeatherData(cityName) {
    const cleanName = cityName.trim().toLowerCase();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cleanName)}&appid=${this.apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API status ${response.status}`);
      }

      const data = await response.json();
      return {
        name: data.name,
        country: data.sys.country,
        temp: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        wind: data.wind.speed,
        icon: data.weather[0].icon,
        description: data.weather[0].description
      };
    } catch (err) {
      // Fallback to mock data if API key is inactive (401 error)
      if (this.mockData[cleanName]) {
        return this.mockData[cleanName];
      }
      
      // Generic mock result for any other city search while API is inactive
      return {
        name: cityName.charAt(0).toUpperCase() + cityName.slice(1),
        country: "DEMO",
        temp: 20,
        feels_like: 19,
        humidity: 60,
        pressure: 1013,
        wind: 3.5,
        icon: "02d",
        description: "partly cloudy (demo mode)"
      };
    }
  }
};

// -----------------------------------------------------------------
// LAYER 2: PROCESSING LAYER (Calculations, Transformations, Business Logic)
// -----------------------------------------------------------------
const ProcessingLayer = {
  celsiusToFahrenheit(celsius) {
    return Math.round((celsius * 9 / 5) + 32);
  },

  processRecord(rawData, unit) {
    const isCelsius = unit === 'C';
    return {
      title: `${rawData.name}, ${rawData.country}`,
      date: new Date().toLocaleDateString("en-US", { weekday: "long", hour: "2-digit", minute: "2-digit" }),
      temp: isCelsius ? Math.round(rawData.temp) : this.celsiusToFahrenheit(rawData.temp),
      feelsLike: isCelsius ? `${Math.round(rawData.feels_like)}°C` : `${this.celsiusToFahrenheit(rawData.feels_like)}°F`,
      humidity: `${rawData.humidity}%`,
      wind: `${rawData.wind} m/s`,
      pressure: `${rawData.pressure} hPa`,
      desc: rawData.description,
      iconUrl: `https://openweathermap.org/img/wn/${rawData.icon}@2x.png`
    };
  }
};

// -----------------------------------------------------------------
// LAYER 3: UI LAYER EVENT & STATE HANDLING
// -----------------------------------------------------------------
let state = { unit: 'C', data: null };

async function runSearch(city) {
  const statusEl = document.getElementById("statusMessage");
  statusEl.textContent = "Fetching weather...";
  statusEl.className = "status-msg info";
  statusEl.style.display = "block";

  try {
    const rawData = await DataLayer.fetchWeatherData(city);
    state.data = rawData;
    render();
    statusEl.style.display = "none";
  } catch (err) {
    statusEl.textContent = err.message;
    statusEl.className = "status-msg error";
    statusEl.style.display = "block";
  }
}

function render() {
  if (!state.data) return;
  const view = ProcessingLayer.processRecord(state.data, state.unit);

  document.getElementById("cityName").textContent = view.title;
  document.getElementById("dateTime").textContent = view.date;
  document.getElementById("tempVal").textContent = view.temp;
  document.getElementById("tempUnit").textContent = `°${state.unit}`;
  document.getElementById("conditionDesc").textContent = view.desc;
  document.getElementById("humidityVal").textContent = view.humidity;
  document.getElementById("windVal").textContent = view.wind;
  document.getElementById("feelsLikeVal").textContent = view.feelsLike;
  document.getElementById("pressureVal").textContent = view.pressure;

  const img = document.getElementById("weatherIcon");
  img.src = view.iconUrl;
  img.style.display = "block";
}

// Attach event listeners when the webpage finishes loading
window.addEventListener("load", () => {
  const searchBtn = document.getElementById("searchBtn");
  const cityInput = document.getElementById("cityInput");
  const unitC = document.getElementById("unitC");
  const unitF = document.getElementById("unitF");

  searchBtn.onclick = () => {
    const city = cityInput.value.trim();
    if (city) runSearch(city);
  };

  cityInput.onkeypress = (e) => {
    if (e.key === "Enter") {
      const city = cityInput.value.trim();
      if (city) runSearch(city);
    }
  };

  unitC.onclick = () => {
    state.unit = 'C';
    unitC.classList.add("active");
    unitF.classList.remove("active");
    render();
  };

  unitF.onclick = () => {
    state.unit = 'F';
    unitF.classList.add("active");
    unitC.classList.remove("active");
    render();
  };

  // Run initial default search for London
  runSearch("London");
});
