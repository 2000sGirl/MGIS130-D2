let currentUnit = 'F';
let currentWeatherData = null;
let hourlyForecastData = [];
let dailyForecastData = [];

// Fallback Curated Sunshine & Daily Inspiration Quotes Database
const fallbackQuotes = [
  { quote: "Keep your face always toward the sunshine—and shadows will fall behind you.", author: "Walt Whitman" },
  { quote: "Wherever you go, no matter what the weather, always bring your own sunshine.", author: "Anthony J. D'Angelo" },
  { quote: "Sunlight is the best medicine for the soul.", author: "Anonymous" },
  { quote: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo" },
  { quote: "Rise above the storm and you will find the sunshine.", author: "Mario Fernandez" },
  { quote: "Live in the sunshine, swim the sea, drink the wild air.", author: "Ralph Waldo Emerson" },
  { quote: "Just like the sun, you too have the power to brighten someone's day.", author: "Anonymous" },
  { quote: "To be happy, you must be your own sunshine.", author: "C.E. Jerningham" },
  { quote: "Change your thoughts and you change your world.", author: "Norman Vincent Peale" },
  { quote: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { quote: "Happiness is a warm day with a bright blue sky.", author: "Anonymous" }
];

let quoteIndex = 0;

// API Ninjas configuration
const API_NINJAS_KEY = window.ENV_API_NINJAS_KEY || '971rmOcnspYr7rnakL32gdSPTpxlx98QW1qyhwhl';
const INSPIRATIONAL_QUOTES_ENDPOINT = 'https://api.api-ninjas.com/v2/randomquotes?categories=inspirational';

async function fetchNextQuote() {
  const quoteTextEl = document.getElementById("quoteText");
  const quoteAuthorEl = document.getElementById("quoteAuthor");
  const quoteStatusMsg = document.getElementById("quoteStatusMsg");

  quoteStatusMsg.classList.add("hidden");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(INSPIRATIONAL_QUOTES_ENDPOINT, {
      method: 'GET',
      cache: 'no-cache',
      headers: { 
        'X-Api-Key': API_NINJAS_KEY 
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`API returned HTTP status ${res.status}`);
    }

    const data = await res.json();
    
    if (Array.isArray(data) && data.length > 0 && data[0].quote) {
      const newQuote = data[0].quote;
      const newAuthor = data[0].author || "Unknown";

      // Immediate instant swap without delay
      quoteTextEl.textContent = `"${newQuote}"`;
      quoteAuthorEl.textContent = `— ${newAuthor}`;
      return;
    } else {
      throw new Error("Invalid quote payload returned from server");
    }
  } catch (err) {
    console.error("API Ninjas Inspirational Quote Fetch Failed:", err);
    quoteStatusMsg.textContent = "⚠️ Unable to load quote from API Ninjas.";
    quoteStatusMsg.classList.remove("hidden");

    // Instant swap to fallback quote
    quoteIndex = (quoteIndex + 1) % fallbackQuotes.length;
    const fallback = fallbackQuotes[quoteIndex];
    quoteTextEl.textContent = `"${fallback.quote}"`;
    quoteAuthorEl.textContent = `— ${fallback.author}`;
  }
}

const pinterestPinDatabase = {
  freezing: [
    "https://www.pinterest.com/pin/325103666877294358/",
    "https://www.pinterest.com/pin/1096626578046203360/",
    "https://www.pinterest.com/pin/880242690216422312/",
    "https://www.pinterest.com/pin/14707136282735289/"
  ],
  cold: [
    "https://www.pinterest.com/pin/1151795673482366574/",
    "https://www.pinterest.com/pin/725712927464033890/",
    "https://www.pinterest.com/pin/783696772695074868/"
  ],
  cool: [
    "https://www.pinterest.com/pin/1151795673482366574/",
    "https://www.pinterest.com/pin/725712927464033890/",
    "https://www.pinterest.com/pin/783696772695074868/",
    "https://www.pinterest.com/pin/810718370468475192/",
    "https://www.pinterest.com/pin/84653668018139822/"
  ],
  mild: [
    "https://www.pinterest.com/pin/879890845968229570/",
    "https://www.pinterest.com/pin/37225134416239899/",
    "https://www.pinterest.com/pin/1084382416551882037/"
  ],
  warm: [
    "https://www.pinterest.com/pin/879890845968229570/",
    "https://www.pinterest.com/pin/37225134416239899/",
    "https://www.pinterest.com/pin/4590575472088816512/"
  ],
  rain: [
    "https://www.pinterest.com/pin/510806782716185424/",
    "https://www.pinterest.com/pin/339669996917641300/",
    "https://www.pinterest.com/pin/640285272058432275/"
  ]
};

function displayPinterestPins(tempF, weatherDesc) {
  const grid = document.getElementById("pinterestEmbedGrid");
  grid.innerHTML = "";

  let category = "cool";
  const main = (weatherDesc || "").toLowerCase();

  if (main.includes("rain") || main.includes("drizzle") || main.includes("shower")) {
    category = "rain";
  } else if (tempF <= 35) {
    category = "freezing";
  } else if (tempF <= 50) {
    category = "cold";
  } else if (tempF <= 65) {
    category = "cool";
  } else if (tempF <= 75) {
    category = "mild";
  } else {
    category = "warm";
  }

  const availablePins = pinterestPinDatabase[category] || pinterestPinDatabase.cool;
  const shuffled = [...availablePins].sort(() => 0.5 - Math.random());
  const selectedPins = shuffled.slice(0, 2);

  selectedPins.forEach(pinUrl => {
    const pinWrapper = document.createElement("div");
    pinWrapper.className = "w-full flex justify-center border border-amber-200/80 rounded-none p-2 bg-white/70 shadow-sm overflow-hidden";
    pinWrapper.innerHTML = `<a data-pin-do="embedPin" data-pin-width="medium" href="${pinUrl}"></a>`;
    grid.appendChild(pinWrapper);
  });

  if (window.PinUtils && typeof window.PinUtils.build === "function") {
    window.PinUtils.build();
  }
}

function getOption4SVG(iconCode) {
  const svgs = {
    "01d": `<svg viewBox="0 0 24 24" class="w-full h-full" fill="none"><circle cx="12" cy="12" r="6" fill="#f59e0b"/><circle cx="12" cy="12" r="9" fill="#fef3c7" opacity="0.75"/></svg>`,
    "01n": `<svg viewBox="0 0 24 24" class="w-full h-full" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#4338ca"/></svg>`,
    "02d": `<svg viewBox="0 0 24 24" class="w-full h-full" fill="none"><circle cx="14" cy="8" r="4" fill="#f59e0b"/><path d="M18 17H6a3.5 3.5 0 0 1 0-7h.4A5 5 0 0 1 16 11.5a3 3 0 0 1 2 5.5z" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/></svg>`,
    "02n": `<svg viewBox="0 0 24 24" class="w-full h-full" fill="none"><path d="M17 5a4 4 0 0 1 3.5 3.5" stroke="#a5b4fc" stroke-width="2.5" stroke-linecap="round"/><path d="M18 17H6a3.5 3.5 0 0 1 0-7h.4A5 5 0 0 1 16 11.5a3 3 0 0 1 2 5.5z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/></svg>`,
    "03d": `<svg viewBox="0 0 24 24" class="w-full h-full" fill="none"><path d="M18 17H6a3.5 3.5 0 0 1 0-7h.4A5 5 0 0 1 16 11.5a3 3 0 0 1 2 5.5z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.25"/></svg>`,
    "03n": `<svg viewBox="0 0 24 24" class="w-full h-full" fill="none"><path d="M18 17H6a3.5 3.5 0 0 1 0-7h.4A5 5 0 0 1 16 11.5a3 3 0 0 1 2 5.5z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.25"/></svg>`,
    "10d": `<svg viewBox="0 0 24 24" class="w-full h-full" fill="none"><path d="M18 15H6a3.5 3.5 0 0 1 0-7h.4A5 5 0 0 1 16 9.5a3 3 0 0 1 2 5.5z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/><line x1="8" y1="17" x2="7" y2="20" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="17" x2="11" y2="20" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="17" x2="15" y2="20" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/></svg>`,
    "10n": `<svg viewBox="0 0 24 24" class="w-full h-full" fill="none"><path d="M18 15H6a3.5 3.5 0 0 1 0-7h.4A5 5 0 0 1 16 9.5a3 3 0 0 1 2 5.5z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/><line x1="8" y1="17" x2="7" y2="20" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="17" x2="11" y2="20" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="17" x2="15" y2="20" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/></svg>`,
    "11d": `<svg viewBox="0 0 24 24" class="w-full h-full" fill="none"><path d="M18 14H6a3.5 3.5 0 0 1 0-7h.4A5 5 0 0 1 16 8.5a3 3 0 0 1 2 5.5z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/><path d="M13 14l-2 4h3l-2 4" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    "13d": `<svg viewBox="0 0 24 24" class="w-full h-full" fill="none"><path d="M18 15H6a3.5 3.5 0 0 1 0-7h.4A5 5 0 0 1 16 9.5a3 3 0 0 1 2 5.5z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/><circle cx="8" cy="18" r="1" fill="#38bdf8"/><circle cx="12" cy="19" r="1" fill="#38bdf8"/><circle cx="16" cy="18" r="1" fill="#38bdf8"/></svg>`
  };
  return svgs[iconCode] || svgs["01d"];
}

function celsiusToFahrenheit(c) {
  return Math.round((c * 9 / 5) + 32);
}

function getOutfitRecommendations(tempF, weatherMain, windSpeedMph) {
  const items = [];
  const main = (weatherMain || "").toLowerCase();

  if (tempF <= 35) {
    items.push("Heavy Winter Coat");
    items.push("Long Pants");
    items.push("Hat & Gloves");
  } else if (tempF > 35 && tempF <= 50) {
    items.push("Warm Coat / Sweater");
    items.push("Long Sleeve Shirt");
    items.push("Long Pants");
  } else if (tempF > 50 && tempF <= 65) {
    items.push("Light Jacket / Cardigan");
    items.push("Long Pants or Jeans");
    if (main.includes("clear") || main.includes("sun") || main.includes("sky")) {
      items.push("Sunglasses");
    }
  } else if (tempF > 65 && tempF <= 75) {
    items.push("Short Sleeve or Light Long Sleeve");
    items.push("Long Pants or Shorts");
  } else {
    items.push("Short Sleeve / Tank Top");
    items.push("Shorts");
    items.push("Sunglasses");
  }

  if (main.includes("rain") || main.includes("drizzle") || main.includes("shower")) {
    items.push("Rain Jacket or Umbrella");
  }

  return items;
}

function getWeatherIconCode(code, itemHour = 12) {
  const isNight = itemHour < 6 || itemHour >= 19;
  const suffix = isNight ? "n" : "d";

  if (code === 0) return `01${suffix}`;
  if (code >= 1 && code <= 3) return `02${suffix}`;
  if (code >= 45 && code <= 48) return `03${suffix}`;
  if (code >= 51 && code <= 67) return `10${suffix}`;
  if (code >= 71 && code <= 77) return `13${suffix}`;
  if (code >= 80 && code <= 82) return `10${suffix}`;
  if (code >= 95) return `11${suffix}`;
  return `01${suffix}`;
}

function getWeatherCodeDescription(code) {
  if (code === 0) return "Clear Sky";
  if (code === 1) return "Mainly Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 55) return "Light Drizzle";
  if (code >= 61 && code <= 65) return "Rainy";
  if (code >= 71 && code <= 75) return "Snowy";
  if (code >= 80 && code <= 82) return "Rain Showers";
  if (code >= 95) return "Thunderstorm";
  return "Partly Cloudy";
}

async function fetchWeatherData(city) {
  showStatus("Fetching live weather data...", "info");

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Please try another location.");
    }

    const location = geoData.results[0];
    const lat = location.latitude;
    const lon = location.longitude;
    const cityName = `${location.name}, ${location.country_code ? location.country_code.toUpperCase() : ''}`;

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,surface_pressure,windspeed_10m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    const current = weatherData.current_weather;
    const currentHour = new Date().getHours();

    currentWeatherData = {
      name: cityName,
      tempC: Math.round(current.temperature),
      tempF: celsiusToFahrenheit(current.temperature),
      feelsLikeC: Math.round(current.temperature - 1),
      feelsLikeF: celsiusToFahrenheit(current.temperature - 1),
      windMph: Math.round(current.windspeed * 0.621371),
      humidity: weatherData.hourly.relativehumidity_2m[currentHour] || 65,
      pressure: Math.round(weatherData.hourly.surface_pressure[currentHour] || 1013),
      weatherCode: current.weathercode,
      currentHour: currentHour
    };

    const times = weatherData.hourly.time;
    const temps = weatherData.hourly.temperature_2m;
    const codes = weatherData.hourly.weathercode;

    hourlyForecastData = [];
    for (let i = currentHour; i < currentHour + 12 && i < times.length; i++) {
      const itemDate = new Date(times[i]);
      hourlyForecastData.push({
        timeStr: itemDate.toLocaleTimeString([], { hour: 'numeric' }),
        hourVal: itemDate.getHours(),
        tempC: Math.round(temps[i]),
        tempF: celsiusToFahrenheit(temps[i]),
        code: codes[i]
      });
    }

    dailyForecastData = [];
    if (weatherData.daily && weatherData.daily.time) {
      const dTimes = weatherData.daily.time;
      const dMax = weatherData.daily.temperature_2m_max;
      const dMin = weatherData.daily.temperature_2m_min;
      const dCodes = weatherData.daily.weathercode;

      for (let i = 1; i < Math.min(7, dTimes.length); i++) {
        const dDate = new Date(dTimes[i] + 'T00:00:00');
        dailyForecastData.push({
          dayName: dDate.toLocaleDateString('en-US', { weekday: 'short' }),
          dateStr: dDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
          maxC: Math.round(dMax[i]),
          maxF: celsiusToFahrenheit(dMax[i]),
          minC: Math.round(dMin[i]),
          minF: celsiusToFahrenheit(dMin[i]),
          code: dCodes[i]
        });
      }
    }

    renderApp();
    hideStatus();

    const weatherDesc = getWeatherCodeDescription(currentWeatherData.weatherCode);
    displayPinterestPins(currentWeatherData.tempF, weatherDesc);

  } catch (err) {
    showStatus(err.message, "error");
  }
}

function renderApp() {
  if (!currentWeatherData) return;

  const data = currentWeatherData;
  const isF = currentUnit === 'F';

  document.getElementById("cityName").textContent = data.name;
  document.getElementById("dateTime").textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', hour: '2-digit', minute: '2-digit' });

  document.getElementById("tempVal").textContent = isF ? data.tempF : data.tempC;
  document.getElementById("tempUnit").textContent = `°${currentUnit}`;
  document.getElementById("feelsLikeVal").textContent = isF ? `${data.feelsLikeF}°F` : `${data.feelsLikeC}°C`;
  document.getElementById("humidityVal").textContent = `${data.humidity}%`;
  document.getElementById("windVal").textContent = `${data.windMph} mph`;
  document.getElementById("pressureVal").textContent = `${data.pressure} hPa`;
  document.getElementById("conditionDesc").textContent = getWeatherCodeDescription(data.weatherCode);

  const iconCode = getWeatherIconCode(data.weatherCode, data.currentHour);
  document.getElementById("weatherIconContainer").innerHTML = getOption4SVG(iconCode);

  const emojiEl = document.getElementById("outfitEmoji");
  emojiEl.classList.remove("animate-bob-limit");
  void emojiEl.offsetWidth;
  emojiEl.classList.add("animate-bob-limit");

  const outfitItems = getOutfitRecommendations(data.tempF, getWeatherCodeDescription(data.weatherCode), data.windMph);
  document.getElementById("outfitList").innerHTML = outfitItems.map(item => `<li>${item}</li>`).join("");

  document.getElementById("hourlyContainer").innerHTML = hourlyForecastData.map(item => {
    const itemIconCode = getWeatherIconCode(item.code, item.hourVal);
    const itemTemp = isF ? `${item.tempF}°` : `${item.tempC}°`;
    return `
      <div class="flex flex-col items-center justify-between min-w-[70px] bg-white/80 p-3 rounded-2xl border border-amber-200/60 shadow-sm flex-shrink-0">
        <span class="text-[11px] font-bold text-amber-900/60">${item.timeStr}</span>
        <div class="w-8 h-8 my-1.5">
          ${getOption4SVG(itemIconCode)}
        </div>
        <span class="text-sm font-bold text-slate-800">${itemTemp}</span>
      </div>
    `;
  }).join("");

  document.getElementById("dailyContainer").innerHTML = dailyForecastData.map(item => {
    const dayIconCode = getWeatherIconCode(item.code, 12);
    const maxTemp = isF ? `${item.maxF}°` : `${item.maxC}°`;
    const minTemp = isF ? `${item.minF}°` : `${item.minC}°`;
    return `
      <div class="flex flex-col items-center bg-white/70 p-2.5 rounded-2xl border border-amber-100/80 shadow-sm text-center">
        <span class="text-xs font-bold text-slate-800 font-fun">${item.dayName}</span>
        <span class="text-[10px] text-amber-900/60 font-medium">${item.dateStr}</span>
        <div class="w-7 h-7 my-1.5">
          ${getOption4SVG(dayIconCode)}
        </div>
        <div class="flex gap-1 text-xs font-bold">
          <span class="text-slate-800">${maxTemp}</span>
          <span class="text-slate-400 font-normal">${minTemp}</span>
        </div>
      </div>
    `;
  }).join("");
}

function showStatus(msg, type) {
  const statusEl = document.getElementById("statusMessage");
  statusEl.textContent = msg;
  statusEl.className = `p-3 rounded-xl text-xs font-medium text-center ${type === 'error' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-50 text-amber-900 border border-amber-200'}`;
  statusEl.classList.remove("hidden");
}

function hideStatus() {
  document.getElementById("statusMessage").classList.add("hidden");
}

window.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const cityInput = document.getElementById("cityInput");
  const unitF = document.getElementById("unitF");
  const unitC = document.getElementById("unitC");
  const refreshBtn = document.getElementById("refreshOutfitImagesBtn");

  const nextQuoteBtn = document.getElementById("nextQuoteBtn");
  const copyQuoteBtn = document.getElementById("copyQuoteBtn");

  searchBtn.addEventListener("click", () => {
    const val = cityInput.value.trim();
    if (val) fetchWeatherData(val);
  });

  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const val = cityInput.value.trim();
      if (val) fetchWeatherData(val);
    }
  });

  refreshBtn.addEventListener("click", () => {
    if (currentWeatherData) {
      const weatherDesc = getWeatherCodeDescription(currentWeatherData.weatherCode);
      displayPinterestPins(currentWeatherData.tempF, weatherDesc);
    }
  });

  unitF.addEventListener("click", () => {
    currentUnit = 'F';
    unitF.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-amber-500 text-white shadow-sm";
    unitC.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-700 hover:text-amber-700";
    renderApp();
  });

  unitC.addEventListener("click", () => {
    currentUnit = 'C';
    unitC.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-amber-500 text-white shadow-sm";
    unitF.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-700 hover:text-amber-700";
    renderApp();
  });

  nextQuoteBtn.addEventListener("click", () => {
    fetchNextQuote();
  });

  copyQuoteBtn.addEventListener("click", () => {
    const qText = document.getElementById("quoteText").textContent;
    const qAuth = document.getElementById("quoteAuthor").textContent;
    const textToCopy = `${qText} ${qAuth}`;
    
    const tempInput = document.createElement("input");
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    copyQuoteBtn.textContent = "✅ Copied!";
    setTimeout(() => {
      copyQuoteBtn.innerHTML = "📋 Copy Quote";
    }, 2000);
  });

  fetchWeatherData("Rochester");
  fetchNextQuote();
});
