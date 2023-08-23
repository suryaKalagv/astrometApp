document.addEventListener('DOMContentLoaded', async function () {
  const buttons = document.querySelectorAll('.nav-button');

  function updatePlaceId(placeIdSelected) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.set('placeId', placeIdSelected);
    const newUrl = `${window.location.pathname}?${urlSearchParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }

  buttons.forEach(async function (button) {
    button.addEventListener('click', function () {
      const placeIdSelected = button.id;
      updatePlaceId(placeIdSelected);

      // Remove active class from all buttons
      buttons.forEach(function (btn) {
        btn.classList.remove('active');
      });

      // Add active class to the clicked button
      button.classList.add('active');
      window.location.href = `/?placeId=${placeIdSelected}&weekId=${getWeekId()}`;
    });

  });

  // Check if placeId parameter is missing in the URL
  const urlSearchParams = new URLSearchParams(window.location.search);

  if (!urlSearchParams.has('placeId')) {
    updatePlaceId('TLNG');
    window.location.href = '/?placeId=TLNG';

    // Add active class to TLNG button on first page load
    const tlngButton = document.getElementById('TLNG');
    if (tlngButton) {
      tlngButton.classList.add('active');
    }
  }
  else {
    // Retrieve placeId from the URL params
    const placeId = urlSearchParams.get('placeId');
    await displayWeatherData(placeId, getWeekId());

    // Add active class to the button corresponding to the current placeId

    const activeButton = document.getElementById(placeId);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }

  // Get the URL parameters

  let placeId = urlSearchParams.get('placeId');
  let weekId = urlSearchParams.get('weekId');

  // Set default values if parameters are missing
  if (!placeId) {
    placeId = 'TLNG';
  }
  if (!weekId) {
    weekId = '1';
  }

  // Update the URL parameters
  urlSearchParams.set('placeId', placeId);
  urlSearchParams.set('weekId', weekId);
  const newUrl = `${window.location.pathname}?${urlSearchParams.toString()}`;
  window.history.replaceState({}, '', newUrl);



  try {
    const annualCalendar = document.querySelector('#annual-calendar tbody');
    const response = await fetch('/calendarData');
    const monthYearMap = await response.json();
    //  populateAnnualCalendar(monthYearMap);
    const rows = Math.ceil(Object.entries(monthYearMap).length / 4);

    for (let i = 0; i < rows; i++) {
      const row = document.createElement('tr');

      for (let j = 0; j < 4; j++) {
        const cell = document.createElement('td');
        const index = i * 4 + j;
        const entry = Object.entries(monthYearMap)[index];

        if (entry) {
          const monthYearCell = document.createElement('div');
          monthYearCell.textContent = entry[0];
          cell.appendChild(monthYearCell);

          const weekRangeCell = document.createElement('div');
          entry[1].forEach(weekEntry => {
            const weekLink = document.createElement('a');
            weekLink.href = `?placeId=${getPlaceId()}&weekId=${weekEntry.weekId}`;
            weekLink.textContent = `${weekEntry.weekId}: ${weekEntry.weekRange}`;

            // Set data attributes for placeId and weekId
            weekLink.setAttribute('data-place-id', getPlaceId());
            weekLink.setAttribute('data-week-id', weekEntry.weekId);

            weekLink.addEventListener('click', async function (event) {
              event.preventDefault();
              const newUrl = `${window.location.pathname}?placeId=${getPlaceId()}&weekId=${weekEntry.weekId}`;
              window.history.pushState({}, '', newUrl);
              await displayWeatherData(getPlaceId(), weekEntry.weekId);
            });
            weekRangeCell.appendChild(weekLink);
            weekRangeCell.appendChild(document.createElement('br'));
          });
          cell.appendChild(weekRangeCell);
        }

        row.appendChild(cell);
      }

      annualCalendar.appendChild(row);
    }
  } catch (fetchError) {
    console.error('Error fetching data:', fetchError);
  }

  await displayWeatherData(placeId, weekId);
  const annualCalendarLinks = document.querySelectorAll('#annual-calendar a');
  annualCalendarLinks.forEach(link => {
    link.addEventListener('click', async function (event) {
      event.preventDefault();

      // Get placeId and weekId from the clicked link's data attributes
      const placeId = link.getAttribute('data-place-id');
      const weekId = link.getAttribute('data-week-id');

      // Update the URL parameters
      urlSearchParams.set('placeId', placeId);
      urlSearchParams.set('weekId', weekId);
      const newUrl = `${window.location.pathname}?${urlSearchParams.toString()}`;
      window.history.replaceState({}, '', newUrl);

      // Call the function to display weather data based on URL parameters
      await displayWeatherData(placeId, weekId);
    });
  });

});

function getPlaceId() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  return urlSearchParams.get('placeId') || 'TLNG';
}

function getWeekId() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  return urlSearchParams.get('weekId') || 1;
}

async function displayWeatherData(placeId, weekId) {
  try {
    // Fetch weather data for the specified placeId and weekId
    const weatherResponse = await fetch(`/weatherData?placeId=${placeId}&weekId=${weekId}`);
    const matchingEntry = await weatherResponse.json();

    if (matchingEntry) {
      const weatherTableBody = document.querySelector('#weather-table tbody');
      weatherTableBody.innerHTML = ''; // Clear previous rows

      for (const key in matchingEntry) {
        const newRow = document.createElement('tr');
        const keyCell = document.createElement('td');
        keyCell.textContent = key;
        newRow.appendChild(keyCell);


        if (key === "placeId") {
          // Key cell
          
          const keyCell = document.createElement('td');
          keyCell.textContent = key;
          newRow.appendChild(keyCell);

          // Value cell
          const valueCell = document.createElement('td');
          valueCell.textContent = matchingEntry[key];
          const placeIdImage = document.createElement('img');
          placeIdImage.src = `images/${matchingEntry["placeId"]}.jpg`;
          placeIdImage.alt = matchingEntry[key]; // Set alt text for accessibility
          placeIdImage.style.width = '250px'; // Set width
          placeIdImage.style.height = '250px'; // Set height

          valueCell.appendChild(placeIdImage);
        } else {
         

          // Value cell
          const valueCell = document.createElement('td');
          valueCell.textContent = matchingEntry[key];
        }

        newRow.appendChild(valueCell);

        weatherTableBody.appendChild(newRow);
      }
    } else {
      console.log('No matching weather data found.');
    }
  } catch (fetchError) {
    console.error('Error fetching data:', fetchError);
  }
}


