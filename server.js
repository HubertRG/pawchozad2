require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

const locations = {
  'Warszawa': { lat: 52.2297, lon: 21.0122 },
  'Kraków': { lat: 50.0647, lon: 19.9450 },
  'Lublin': { lat: 51.25, lon: 22.5667 },
  'Wrocław': { lat: 51.1079, lon: 17.0385 }
};

console.log(`Start: ${new Date()}`);
console.log(`Autor: Hubert Gosik`);
console.log(`Port: ${port}`);

app.use(express.static('public'));
app.use(express.json());

app.post('/api/pogoda', async (req, res) => {
  try {
    const { miasto } = req.body;
    
    if (!locations[miasto]) {
      return res.status(404).json({ error: 'Nieznana lokalizacja' });
    }

    const { lat, lon } = locations[miasto];
    const url = `https://api.open-meteo.com/v1/forecast`;
    
    const response = await axios.get(url, {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m',
        temperature_unit: 'celsius',
        wind_speed_unit: 'ms',
        timezone: 'Europe/Warsaw'
      }
    });

    const current = response.data.current;

    const dane = {
      temp: current.temperature_2m,
      wilgotnosc: current.relative_humidity_2m,
      cisnienie: current.pressure_msl,
      wiatr: current.wind_speed_10m
    };

    res.json(dane);
  } catch (error) {
    res.status(500).json({
      error: 'Nie udało się pobrać danych pogodowych'
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/health', (req, res) => res.sendStatus(200));

app.listen(port, () => {
  console.log(`Aplikacja działa na porcie ${port}`);
});