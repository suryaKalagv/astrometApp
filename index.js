const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

app.use(express.static('public'));

const fs = require('fs');
const weatherData = JSON.parse(fs.readFileSync('weather.json', 'utf8'));
const calendarData = JSON.parse(fs.readFileSync('calendar.json', 'utf8'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html?placeId=TLNG'));
});

// Read the calendar.json file
// Read the calendar and weather data files

app.get('/calendarData', (req, res) => {
  // Read the calendar.json file
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
      "weatherImage": "No data",
      "ExpectedWeather": "No data"
    };
    return noDataObject;
  }
}
