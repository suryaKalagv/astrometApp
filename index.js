const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html?placeId=TLNG'));
});


// Read the calendar.json file
const fs = require('fs');

// Read the calendar.json file
fs.readFile('calendar.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
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

    // Print the map with Month-Year keys and associated entries
    for (const [monthYear, entries] of monthYearMap) {
      console.log(`${monthYear}:`);
      entries.forEach(entry => {
        console.log(`  Week ${entry.weekId}: ${entry.weekRange}`);
      });
    }
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});