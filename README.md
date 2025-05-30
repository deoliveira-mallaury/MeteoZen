# 🌤️ MétéoZen - Application de Prévisions Météo

## 📌 Description
MétéoZen est une application qui permet aux utilisateurs de consulter les prévisions météo en temps réel en fonction de leur ville ou code postal.  
Elle offre aussi une **traduction automatique** des descriptions météo pour une meilleure compréhension.

## 🚀 Technologies utilisées
- **HTML/CSS/JavaScript** : Développement du front-end et de la logique applicative.
- **API OpenWeatherMap** : Récupération des prévisions météo détaillées.
- **API GeoGouv** : Recherche des coordonnées géographiques des villes.
- **Google Translate API** : Traduction dynamique des descriptions météorologiques.

## 🔎 APIs utilisées

### **1️⃣ API OpenWeatherMap**
🔹 Fournit des prévisions météo complètes (température, heure, icônes météo…).  
🔹 Exemple de requête :
```js
const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=VOTRE_API_KEY`;
```
### **2️⃣ API OpenWeatherMap**
🔹 Récupère les coordonnées géographiques (longitude/latitude) d'une ville en fonction du code postal. 
🔹 Exemple de requête :
```js
const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${search}&fields=code,nom,centre,codesPostaux`);
```
### **3️⃣ API Google Translate**
🔹 Traduit automatiquement les descriptions météo en français. 
🔹 Exemple d'utilisation :
```js
async function translateText(text, targetLang) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data[0][0][0]; // Texte traduit
}
```