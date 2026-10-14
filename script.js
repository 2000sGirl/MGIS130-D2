/* =================================================================
   3-LAYER ARCHITECTURE JAVASCRIPT IMPLEMENTATION
   ================================================================= */

// -----------------------------------------------------------------
// LAYER 1: DATA LAYER (Retrieving external API data & storage)
// -----------------------------------------------------------------
const DataLayer = {
  apiKey: "b1024daabd7bd9298dc2252ea7cb71fa",

  async fetchWeatherData(cityName) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${this.apiKey}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found. Please check spelling.");
      }
      if (response.status === 401) {
        throw new Error("API Key pending activation (new keys can take up to 2 hours).");
      }
      throw new Error("Unable to fetch weather data.");
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
