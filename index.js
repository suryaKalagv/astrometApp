const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

app.use(express.static('public'));

const fs = require('fs');
// const weatherData = JSON.parse(fs.readFileSync('weather.json', 'utf8'));
const calendarData = JSON.parse(fs.readFileSync('calendar.json', 'utf8'));

const WEATHER_JSON_PATH = 'weather.json'; // Path to your weather.json file

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html?placeId=TLNG'));
});

const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Handle POST request to add weather data
app.post('/addWeatherData', (req, res) => {
  const newWeatherData = req.body;
  console.log('Received request:', JSON.stringify(newWeatherData));

  fs.readFile(WEATHER_JSON_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading weather.json:', err);
      return res.status(500).json({ error: 'An error occurred while reading weather data.' });
    }

    try {
      // Parse the existing weather data
      const existingWeatherData = JSON.parse(data);

      // Append the new weather data to the existing data
      existingWeatherData.push(newWeatherData);

      // Write the updated data back to weather.json
      fs.writeFile(WEATHER_JSON_PATH, JSON.stringify(existingWeatherData, null, 2), 'utf8', writeErr => {
        if (writeErr) {
          console.error('Error writing weather.json:', writeErr);
          return res.status(500).json({ error: 'An error occurred while updating weather data.' });
        }

        // Respond with a success message
        res.status(200).json({ message: 'Weather data added successfully.' });
      });
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      res.status(500).json({ error: 'An error occurred while parsing weather data.' });
    }
  });

 
});
  



// Read the calendar.json file
// Read the calendar and weather data files

app.get('/calendarData', (req, res) => {
  // Read the calendar.json file
  const weatherData = JSON.parse(fs.readFileSync('weather.json', 'utf8'));
  const placeId = req.query.placeId;
  try {
    const monthYearMap = new Map();

    // Iterate through the calendar data
    for (const entry of calendarData) {
      const monthYear = `${entry.Month}-${entry.Year}`;
      const weekDisplay = `${entry.StartDate} - ${entry.EndDate}`;
      const weekWeatherData = findMatchingEntry(placeId, entry.WeekId)
      // Initialize the array if not present
      if (!monthYearMap.has(monthYear)) {
        monthYearMap.set(monthYear, []);
      }

      // Add entry to the array (maximum of size 5)
      const entries = monthYearMap.get(monthYear);

      if (entries.length < 5) {
        entries.push({
          weekId: entry.WeekId,
          weekDisplay: weekDisplay,
          weekRange: entry.WeekRange,
          weatherImage: weekWeatherData.weatherImage

        });

      }
    }
    const jsonString = JSON.stringify(Object.fromEntries(monthYearMap));
    console.log(" monthYearMap *************" + jsonString);
    // Respond with the map as JSON
    res.json(Object.fromEntries(monthYearMap));
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
    res.status(500).json({ error: 'Error parsing JSON' });
  }
});




// Endpoint to fetch weather data based on placeId and weekId
app.get('/weatherData', (req, res) => {
  const placeId = req.query.placeId;
  const weekId = parseInt(req.query.weekId);
  console.log(" placeId  " + placeId + " weekId " + weekId);
  // Find the matching weather entry based on placeId and weekId

  const matchingEntry = findMatchingEntry(placeId, weekId);
  console.log(matchingEntry);
  res.json(matchingEntry);

});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

function findMatchingEntry(placeId, weekId) {
  const weatherData = JSON.parse(fs.readFileSync('weather.json', 'utf8'));

  const selectedEntry = weatherData.find(entry => entry.placeId === placeId && entry.weekId === weekId);
  if (selectedEntry) {
    return selectedEntry;
  }
  else {
    const noDataObject = {
      "placeId": placeId,
      "places": "No data",
      "weekId": weekId,
      "Summary": "No data",
      "weatherImage": "NA",
      "ExpectedWeather": "No data"
    };
    return noDataObject;
  }
}
