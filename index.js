const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

app.use(express.static('public'));

const fs = require('fs');


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html?placeId=TLNG'));
});

// Read the calendar.json file
// Read the calendar and weather data files

app.get('/calendarData', (req, res) => {
  // Read the calendar.json file
  fs.readFile('calendar.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).json({ error: 'Error reading file' });
      return;
    }

    try {
      const calendarData = JSON.parse(data);
      const monthYearMap = new Map();

      // Iterate through the calendar data
      for (const entry of calendarData) {
        const monthYear = `${entry.Month}-${entry.Year}`;
        const weekRange = `${entry.StartDate} - ${entry.EndDate}`;

        // Initialize the array if not present
        if (!monthYearMap.has(monthYear)) {
          monthYearMap.set(monthYear, []);
        }

        // Add entry to the array (maximum of size 5)
        const entries = monthYearMap.get(monthYear);
        if (entries.length < 5) {
          entries.push({
            weekId: entry.WeekId,
            weekRange: weekRange
          });
        }
      }

      // Respond with the map as JSON
      res.json(Object.fromEntries(monthYearMap));
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      res.status(500).json({ error: 'Error parsing JSON' });
    }
  });
});

const weatherData = JSON.parse(fs.readFileSync('weather.json', 'utf8'));

// Endpoint to fetch weather data based on placeId and weekId
app.get('/weatherData', (req, res) => {
  const placeId = req.query.placeId;
  const weekId = parseInt(req.query.weekId);

  // Find the matching weather entry based on placeId and weekId
  const matchingEntry = weatherData.find(entry => entry.placeId === placeId && entry.weekId === weekId);

  if (matchingEntry) {
    console.log(" matching Entry found " + placeId + weekId );
    console.log(matchingEntry);
    res.json(matchingEntry);
  } else {
    console.log(" matching Entry found " + placeId + weekId);
    res.status(404).json({ error: 'Weather data not found' });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});