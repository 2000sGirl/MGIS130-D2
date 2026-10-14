/* =================================================================
   3-LAYER ARCHITECTURE JAVASCRIPT IMPLEMENTATION
   ================================================================= */

// -----------------------------------------------------------------
// LAYER 1: DATA LAYER (Storage, API Retrieval & Input Parsing)
// -----------------------------------------------------------------
const DataLayer = {
  // Hardcoded OpenWeather API Key
  apiKey: "b1024daabd7bd9298dc2252ea7cb71fa",

  // Reads API Key (uses hardcoded key by default)
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
    if (cities.length > 4) cities.pop(); // Keep top 4
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
          throw new Error("Invalid API key or key activation pending (can take up to 2 hours for new keys).");
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
      throw err; // Pass error up to UI Layer
    }
  }
};

// -----------------------------------------------------------------
// LAYER 2: PROCESSING LAYER (Calculations, Transformations, Logic)
// -----------------------------------------------------------------
const ProcessingLayer = {
  // Temperature conversion formula: Celsius to Fahrenheit
  celsiusToFahrenheit(celsius) {
    return Math.round((celsius * 9 / 5) + 32);
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

  // Transforms raw weather record into display-ready UI view payload
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
    humidityVal:
