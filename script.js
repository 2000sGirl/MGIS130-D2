/* =================================================================
   3-LAYER ARCHITECTURE JAVASCRIPT IMPLEMENTATION
   ================================================================= */

// -----------------------------------------------------------------
// LAYER 1: DATA LAYER (Storage, API Retrieval & Input Parsing)
// -----------------------------------------------------------------
const DataLayer = {
  // Mock Fallback Data (used if no OpenWeather API Key is supplied)
  mockDatabase: {
    "london": { name: "London", country: "GB", temp: 15, temp_min: 11, temp_max: 18, humidity: 72, wind: 4.1, feels_like: 14, pressure: 1015, icon: "04d", description: "broken clouds" },
    "new york": { name: "New York", country: "US", temp: 22, temp_min: 18, temp_max: 25, humidity: 55, wind: 3.6, feels_like: 21, pressure: 1012, icon: "01d", description: "clear sky" },
    "tokyo": { name: "Tokyo", country: "JP", temp: 19, temp_min: 15, temp_max: 22, humidity: 80, wind: 2.5, feels_like: 19, pressure: 1020, icon: "10d", description: "light rain" },
    "paris": { name: "Paris", country: "FR", temp: 17, temp_min: 13, temp_max: 20, humidity: 65, wind: 3.1, feels_like: 16, pressure: 1016, icon: "02d", description: "few clouds" }
  },

  // Reads API Key from Browser LocalStorage
  getApiKey() {
    return localStorage.getItem("weather_api_key") || "";
  },

  // Saves API Key to Browser LocalStorage
  setApiKey(key) {
    localStorage.setItem("weather_api_key", key);
  },

  // Reads Recent City Search History
  getRecentCities() {
    const history = localStorage.getItem("weather_recent_cities");
    return history ? JSON.parse(history) : ["London", "Tokyo", "New York"];
  },

  // Saves a City to Search History
  saveRecentCity(city) {
    let cities = this.getRecentCities();
    cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());
    cities.unshift(city);
    if (cities.length > 4) cities.pop(); // Keep top 4
    localStorage.setItem("weather_recent_cities", JSON.stringify(cities));
  },

  // Fetch Weather Data (Tries Live API -> Falls Back to Mock Data)
  async fetchWeatherData(cityName) {
    const apiKey = this.getApiKey();
    const cleanName = cityName.trim().toLowerCase();

    // If API key is present, try real OpenWeather endpoint
    if (apiKey) {
      try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cleanName)}&appid=${apiKey}&units=metric`);
        if (!response.ok) {
          if (response.status === 404) throw new Error("City not found. Please check spelling.");
          if (response.status === 401) throw new Error("Invalid API Key provided.");
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
        throw err; // Pass error up to UI
      }
    }

    // Mock Fallback Logic if no API key is provided
    if (this.mockDatabase[cleanName]) {
      return { isMock: true, raw: this.mockDatabase[cleanName] };
    } else {
      // Dynamic generator for unlisted cities in demo mode
      return {
        isMock: true,
        raw: {
          name: cityName.charAt(0).toUpperCase() + cityName.slice(1),
          country: "DEMO",
          temp: Math.floor(Math.random() * 15) + 10,
          humidity: Math.floor(Math.random() * 40) + 40,
          wind: (Math.random() * 5).toFixed(1),
          feels_like: Math.floor(Math.random() * 15) + 9,
          pressure: 1013,
          icon: "02d",
          description: "partly cloudy (demo mode)"
        }
      };
    }
  }
};

// -----------------------------------------------------------------
// LAYER 2: PROCESSING LAYER (Calculations, Transformations, Logic)
// -----------------------------------------------------------------
const ProcessingLayer = {
  // Temperature conversion formula: C to F
  celsiusToFahrenheit(celsius) {
    return Math.round((celsius * 9/5) + 32);
  },

  // Formats timestamp into readable local time
  getFormattedDate() {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit"
    });
  },

  // Transforms raw weather record into display-ready payload
  processRecord(rawData, unitChoice) {
    const isCelsius = unitChoice === 'C';
    
    const temp = isCelsius 
      ? Math.round(rawData.temp) 
      : this.celsiusToFahrenheit(rawData.temp);

    const feelsLike = isCelsius 
      ? Math.round(rawData.feels_like) 
      : this.celsiusToFahrenheit(rawData.feels_like);

    const iconUrl = rawData.icon.startsWith("http") 
      ? rawData.icon 
      : `https://openweathermap.org/img/wn/${rawData.icon}@2x.png`;

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

  // Cache DOM elements
  elements: {
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
    pressureVal: document.getElementById("pressureVal"),
    apiKeyInput: document.getElementById("apiKeyInput"),
    saveKeyBtn: document.getElementById("saveKeyBtn")
  },

  init() {
    // Initialize API Key field
    this.elements.apiKeyInput.value = DataLayer.getApiKey();

    // Attach Event Listeners
    this.elements.searchBtn.addEventListener("click", () => this.handleSearch());
    this.elements.cityInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleSearch();
    });

    this.elements.unitC.addEventListener("click", () => this.setUnit('C'));
    this.elements.unitF.addEventListener("click", () => this.setUnit('F'));

    this.elements.saveKeyBtn.addEventListener("click", () => {
      DataLayer.setApiKey(this.elements.apiKeyInput.value.trim());
      this.showStatus("API Key saved!", "info");
    });

    // Load recent searches
    this.renderRecentSearches();

    // Initial Load (Default to London)
    this.executeSearch("London");
  },

  renderRecentSearches() {
    const cities = DataLayer.getRecentCities();
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
    this.showStatus("Fetching weather data...", "info");

    try {
      const result = await DataLayer.fetchWeatherData(city);
      this.state.currentRawData = result.raw;
      
      DataLayer.saveRecentCity(result.raw.name);
      this.renderRecentSearches();

      this.renderWeather();
      
      if (result.isMock) {
        this.showStatus("Displaying demo data. Add an OpenWeather API key in settings for real-time live data.", "info");
      } else {
        this.hideStatus();
      }
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
    // Use Processing Layer to prepare view model
    const view = ProcessingLayer.processRecord(this.state.currentRawData, this.state.currentUnit);

    // Update UI Elements
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
    this.elements.statusMsg.textContent = msg;
    this.elements.statusMsg.className = `status-msg ${type}`;
  },

  hideStatus() {
    this.elements.statusMsg.className = "status-msg";
    this.elements.statusMsg.style.display = "none";
  }
};

// Initialize the app once DOM is ready
document.addEventListener("DOMContentLoaded", () => UILayer.init());
