const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

app.use(express.static('public'));

const fs = require('fs');


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html?placeId=TLNG'));
});

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

// Read the calendar.json file


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});