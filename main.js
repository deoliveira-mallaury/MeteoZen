// cordonate -> lon / lat
let weatherApiKey = "`YOU_API`";
let cityInput = document.getElementById("city");
let cityInfo;

async function findCity(search) {
  try {
    const response = await fetch(
      `https://geo.api.gouv.fr/communes?codePostal=${search}&fields=code,nom,centre,codesPostaux`
    );

    if (!response.ok) {
      throw new Error("Erreur réseau : " + response.status);
    }
    let currentLocalisations = [];
    const datas = await response.json();
    datas.forEach((data) => {
      currentLocalisations.push({
        name: data.nom,
        cp: data.codesPostaux[0],
        lon: data.centre.coordinates[0],
        lat: data.centre.coordinates[1],
      });
    });

    return currentLocalisations;
  } catch (error) {
    console.error("Une erreur s'est produite :", error.message);
    return null; 
  }
}
async function weather(lon, lat) {
  try {
    const response = await fetch(
      `
      https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=f6fed325385bde59b45bd6ba4d528e13
`
    );

    if (!response.ok) {
      throw new Error("Erreur réseau : " + response.status);
    }
    const datas = await response.json();

    let weatherData = {}; 
    let options = {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Paris",
    };

    datas.list.forEach((data) => {
      let hours = new Date(data.dt_txt).toLocaleTimeString("fr-FR", options);
      let parsedDate = new Date(data.dt_txt);
      let day = parsedDate.getDate();
      let date = parsedDate.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      if (!weatherData[date]) {
        weatherData[date] = [];
      }
      let weatherEntry = {
        time: hours, // Heure formatée
        weather: data.weather[0].description, // Conditions météo
        temp: data.main.temp, // Température
      };
      weatherData[date].push(weatherEntry);
    });

    return weatherData;
  } catch (error) {
    console.error("Une erreur s'est produite :", error.message);
    return null; // Retourner une valeur en cas d'erreur
  }
}
async function translateText(text, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
    text
  )}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data[0][0][0]; // Extraction du texte traduit
  } catch (error) {
    console.error("Erreur lors de la traduction :", error);
    return text;
  }
}

let autoCompleteList = document.querySelector(".autoCompleteList");
let li = document.createElement("li");
let currentLocalisation = [];
let currVal;
cityInput.addEventListener("input", function (e) {
  currVal = cityInput.value;
  e.preventDefault();
  findCity(currVal)
    .then((cities) => {
      cities.map((city) => {
        currentLocalisation.push({
          name: city.name,
          cp: city.cp,
          lon: city.lon,
          lat: city.lat,
        });
        let li = document.createElement("li");
        li.classList.add("cities");
        let a = document.createElement("a");
        a.id = `cp-${city.cp}`;
        a.className = "city";
        a.innerHTML = city.name;
        autoCompleteList.appendChild(li);
        li.appendChild(a);
      });
    })
    .catch((error) => console.error("Erreur :", error));
});
document
  .querySelector(".autoCompleteList")
  .addEventListener("click", async function (e) {
    let day = document.createElement("h3");
    let weatherInfo;

    if (e.target && e.target.textContent) {
      cityInput.value = e.target.textContent; // Utilise textContent au lieu de name
      let selectedCity = currentLocalisation.find(
        (city) => city.name === e.target.textContent
      );
      document.getElementById(
        "currCity"
      ).textContent = `${selectedCity.name} - (${selectedCity.cp})`;
      weatherInfo = weather(selectedCity.lon, selectedCity.lat)
        .then(async (weatherDatas) => {
          let dates = Object.keys(weatherDatas);
          let meteoContainer = document.querySelector(".meteo");

          for (const date of dates) {
            let div = document.createElement("div");
            let dayTitle = document.createElement("h2");
            let ul = document.createElement("ul");
            div.classList.add("weatherByDay");
            dayTitle.textContent = date;
            meteoContainer.appendChild(div);
            div.appendChild(dayTitle);

            // function traduction API info to render
            let translatedEntries = await Promise.all(
              weatherDatas[date].map(async (entry) => {
                let weatherDescription = await translateText(
                  entry.weather,
                  "fr"
                );
                return { ...entry, translatedWeather: weatherDescription };
              })
            );

            translatedEntries.forEach((entry) => {
              let weatherByHours = document.createElement("li");
              weatherByHours.classList.add("prevision");
              let weathericon = entry.weather.replace(/ /g, "");
              if (weathericon === "scatteredclouds") {
                weathericon = "fewclouds";
              }

              weatherByHours.innerHTML = `
              <h4 class="hour">${entry.time}</h4>
              <img class="weathericon" src="./assets/icons/${weathericon}.svg" alt="search"/>
              <span class="weatherdescr">${entry.translatedWeather}</span>
              <span class="weathertemp">${entry.temp}°C</span>`;
              ul.appendChild(weatherByHours);
            });

            div.appendChild(ul);
          }
        })

        .catch((error) => console.error("Erreur :", error));
    }
    e.preventDefault();
    autoCompleteList.innerHTML = "";
  });
