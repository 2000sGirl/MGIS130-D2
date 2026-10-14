/* =================================================================
   3-LAYER ARCHITECTURE JAVASCRIPT IMPLEMENTATION (script.js)
   ================================================================= */

// -----------------------------------------------------------------
// LAYER 1: DATA LAYER (Storage, API Retrieval & Input Parsing)
// -----------------------------------------------------------------
const DataLayer = {
  // Your OpenWeather API Key
  apiKey: "b1024daabd7bd9298dc2252ea7cb71fa",

  getApiKey() {
    return this.apiKey;
  },

  // Reads Recent City Search History from Browser LocalStorage
  getRecentCities() {
    const history = localStorage.getItem("weather_recent_cities");
    return history ? JSON.parse(history) : ["London", "Tokyo", "New York"];
  },

  // Saves a City to Search History
  saveRecentCity(city) {
    let cities = this.getRecentCities();
    cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());
    cities.unshift(city);
    if (cities.length > 4) cities.pop();
    localStorage.setItem("weather_recent_cities", JSON.stringify(cities));
  },

  // Fetch Live Weather Data from OpenWeather API
  async fetchWeatherData(cityName) {
    const apiKey = this.getApiKey();
    const cleanName = cityName.trim().toLowerCase();

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cleanName)}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("City not found. Please check spelling.");
        }
        if (response.status === 401) {
          throw new Error("Invalid API key or key activation pending (new keys can take up to 2 hours).");
        }
        throw new Error("Unable to retrieve weather data.");
      }

      const data = await response.json();

      return {
        isMock: false,
        raw: {
          name: data.name,
          country: data.sys.country,
          temp: data.main.temp,
          feels_like: data.main.feels_like,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          wind: data.wind.speed,
          icon: data.weather[0].icon,
          description: data.weather[0].description
        }
      };
    } catch (err) {
      throw err;
    }
  }
};

// -----------------------------------------------------------------
// LAYER 2: PROCESSING LAYER (Calculations, Transformations, Logic)
// -----------------------------------------------------------------
const ProcessingLayer = {
  celsiusToFahrenheit(celsius) {
    return Math.round((celsius * 9 / 5) + 32);
  },

  getFormattedDate() {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit"
    });
  },

  processRecord(rawData, unitChoice) {
    const isCelsius = unitChoice === 'C';

    const temp = isCelsius
      ? Math.round(rawData.temp)
      : this.celsiusToFahrenheit(rawData.temp);

    const feelsLike = isCelsius
      ? Math.round(rawData.feels_like)
      : this.celsiusToFahrenheit(rawData.feels_like);

    const iconUrl = `https://openweathermap.org/img/wn/${rawData.icon}@2x.png`;

    return {
      title: `${rawData.name}, ${rawData.country}`,
      formattedDate: this.getFormattedDate(),
      temperatureDisplay: temp,
      feelsLikeDisplay: `${feelsLike}°${unitChoice}`,
      unitSymbol: `°${unitChoice}`,
      humidityDisplay: `${rawData.humidity}%`,
      windDisplay: `${rawData.wind} m/s`,
      pressureDisplay: `${rawData.pressure} hPa`,
      description: rawData.description,
      iconUrl: iconUrl
    };
  }
};

// -----------------------------------------------------------------
// LAYER 3: USER INTERFACE (UI) LAYER (DOM, Events & Display)
// -----------------------------------------------------------------
const UILayer = {
  state: {
    currentUnit: 'C',
    currentRawData: null
  },

  elements: {},

  init() {
    // Select DOM Elements safely
    this.elements = {
      cityInput: document.getElementById("cityInput"),
      searchBtn: document.getElementById("searchBtn"),
      unitC: document.getElementById("unitC"),
      unitF: document.getElementById("unitF"),
      recentSearches: document.getElementById("recentSearches"),
      statusMsg: document.getElementById("statusMessage"),
      cityName: document.getElementById("cityName"),
      dateTime: document.getElementById("dateTime"),
      tempVal: document.getElementById("tempVal"),
      tempUnit: document.getElementById("tempUnit"),
      weatherIcon: document.getElementById("weatherIcon"),
      conditionDesc: document.getElementById("conditionDesc"),
      humidityVal: document.getElementById("humidityVal"),
      windVal: document.getElementById("windVal"),
      feelsLikeVal: document.getElementById("feelsLikeVal"),
      pressureVal: document.getElementById("pressureVal")
    };

    // Attach Event Listeners
    if (this.elements.searchBtn) {
      this.elements.searchBtn.addEventListener("click", () => this.handleSearch());
    }
    if (this.elements.cityInput) {
      this.elements.cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.handleSearch();
      });
    }

    if (this.elements.unitC) {
      this.elements.unitC.addEventListener("click", () => this.setUnit('C'));
    }
    if (this.elements.unitF) {
      this.elements.unitF.addEventListener("click", () => this.setUnit('F'));
    }

    // Load recent searches history & initial load
    this.renderRecentSearches();
    this.executeSearch("London");
  },

  renderRecentSearches() {
    const cities = DataLayer.getRecentCities();
    if (!this.elements.recentSearches) return;
    this.elements.recentSearches.innerHTML = "";
    cities.forEach(city => {
      const chip = document.createElement("span");
      chip.className = "recent-chip";
      chip.textContent = city;
      chip.addEventListener("click", () => this.executeSearch(city));
      this.elements.recentSearches.appendChild(chip);
    });
  },

  async handleSearch() {
    const query = this.elements.cityInput.value.trim();
    if (!query) {
      this.showStatus("Please enter a city name.", "error");
      return;
    }
    await this.executeSearch(query);
  },

  async executeSearch(city) {
    this.hideStatus();
    this.showStatus("Fetching live weather data...", "info");

    try {
      const result = await DataLayer.fetchWeatherData(city);
      this.state.currentRawData = result.raw;

      DataLayer.saveRecentCity(result.raw.name);
      this.renderRecentSearches();

      this.renderWeather();
      this.hideStatus();
    } catch (err) {
      this.showStatus(err.message, "error");
    }
  },

  setUnit(unit) {
    this.state.currentUnit = unit;
    if (unit === 'C') {
      this.elements.unitC.classList.add("active");
      this.elements.unitF.classList.remove("active");
    } else {
      this.elements.unitF.classList.add("active");
      this.elements.unitC.classList.remove("active");
    }

    if (this.state.currentRawData) {
      this.renderWeather();
    }
  },

  renderWeather() {
    const view = ProcessingLayer.processRecord(this.state.currentRawData, this.state.currentUnit);

    this.elements.cityName.textContent = view.title;
    this.elements.dateTime.textContent = view.formattedDate;
    this.elements.tempVal.textContent = view.temperatureDisplay;
    this.elements.tempUnit.textContent = view.unitSymbol;
    this.elements.conditionDesc.textContent = view.description;
    this.elements.humidityVal.textContent = view.humidityDisplay;
    this.elements.windVal.textContent = view.windDisplay;
    this.elements.feelsLikeVal.textContent = view.feelsLikeDisplay;
    this.elements.pressureVal.textContent = view.pressureDisplay;

    this.elements.weatherIcon.src = view.iconUrl;
    this.elements.weatherIcon.style.display = "block";
  },

  showStatus(msg, type) {
    if (!this.elements.statusMsg) return;
    this.elements.statusMsg.textContent = msg;
    this.elements.statusMsg.className = `status-msg ${type}`;
    this.elements.statusMsg.style.display = "block";
  },

  hideStatus() {
    if (!this.elements.statusMsg) return;
    this.elements.statusMsg.className = "status-msg";
    this.elements.statusMsg.style.display = "none";
  }
};

// Initialize the app once DOM is ready
document.addEventListener("DOMContentLoaded", () => UILayer.init());
