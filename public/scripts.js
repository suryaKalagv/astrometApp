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
  let weekRange = "March 21 2023 to March 28 2023";

  // Set default values if parameters are missing
  if (!placeId) {
    placeId = 'TLNG';
  }
  if (!weekId) {
    weekId = '1';
  }
  if (!weekRange) {
    weekRange = "March 21 2023 to March 28 2023";
  }

  // Update the URL parameters
  urlSearchParams.set('placeId', placeId);
  urlSearchParams.set('weekId', weekId);
  const newUrl = `${window.location.pathname}?${urlSearchParams.toString()}`;
  window.history.replaceState({}, '', newUrl);
  // Fetch and populate annual calendar data on page load
  await populateAnnualCalendar(placeId);
  window.addEventListener('beforeunload', async function () {
    alert ("refresh called")
    // Fetch and populate annual calendar data on page refresh
    await populateAnnualCalendar(placeId);
  });

  await displayWeatherData(placeId, weekId, weekRange);
  const annualCalendarLinks = document.querySelectorAll('#annual-calendar a');
  annualCalendarLinks.forEach(link => {
    link.addEventListener('click', async function (event) {
      event.preventDefault();

      // Get placeId and weekId from the clicked link's data attributes
      const placeId = link.getAttribute('data-place-id');
      const weekId = link.getAttribute('data-week-id');
      const weekRange = link.getAttribute('data-weekRange-id');

      // Update the URL parameters
      urlSearchParams.set('placeId', placeId);
      urlSearchParams.set('weekId', weekId);
      const newUrl = `${window.location.pathname}?${urlSearchParams.toString()}`;
      window.history.replaceState({}, '', newUrl);

      // Call the function to display weather data based on URL parameters
      await displayWeatherData(placeId, weekId, weekRange);
    });
  });

});
async function populateAnnualCalendar(placeId) {
  try {
    const annualCalendar = document.querySelector('#annual-calendar tbody');
    const response = await fetch(`/calendarData?placeId=${placeId}`);

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
          monthYearCell.innerHTML = "<strong>" +"Month:   " + entry[0] + "</strong>";
          monthYearCell.style.whiteSpace = "nowrap";
          monthYearCell.style.lineHeight = "1";
          cell.appendChild(monthYearCell);

          const weekRangeCell = document.createElement('div');
          entry[1].forEach(weekEntry => {
            const weekLink = document.createElement('a');

            weekLink.href = `?placeId=${getPlaceId()}&weekId=${weekEntry.weekId}`;
            weekLink.textContent = `${weekEntry.weekId}: ${weekEntry.weekDisplay}`;

            // Set data attributes for placeId and weekId
            weekLink.setAttribute('data-place-id', getPlaceId());
            weekLink.setAttribute('data-week-id', weekEntry.weekId);
            weekLink.setAttribute('data-weekRange-id', weekEntry.weekRange);

            weekLink.addEventListener('click', async function (event) {
              event.preventDefault();
              const newUrl = `${window.location.pathname}?placeId=${getPlaceId()}&weekId=${weekEntry.weekId}`;
              window.history.pushState({}, '', newUrl);
              await displayWeatherData(getPlaceId(), weekEntry.weekId, weekEntry.weekRange);
            });

            const weatherAnnulaImage = document.createElement('img');
            weatherAnnulaImage.src = "images/" + weekEntry.weatherImage;
            weatherAnnulaImage.alt = "Weather Image";
            weatherAnnulaImage.style.width = "50px";
            weatherAnnulaImage.style.height = "50px";
            weekRangeCell.appendChild(weatherAnnulaImage);

            weekRangeCell.appendChild(weekLink);
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
}
function getPlaceId() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  return urlSearchParams.get('placeId') || 'TLNG';
}

function getWeekId() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  return urlSearchParams.get('weekId') || 1;
}

async function displayWeatherData(placeId, weekId, weekRange) {
  try {
    // Fetch weather data for the specified placeId and weekId
    const weatherResponse = await fetch(`/weatherData?placeId=${placeId}&weekId=${weekId}`);
    const matchingEntry = await weatherResponse.json();

    if (matchingEntry) {
      const weatherTableBody = document.querySelector('#weather-table tbody');
      weatherTableBody.innerHTML = ''; // Clear previous rows

      //image
      const imageRow = document.createElement('tr');
      const placeImageCell = document.createElement('td');
      const weatherImageCell = document.createElement('td');



      const placeIdImage = document.createElement('img');
      placeIdImage.src = "images/" + matchingEntry["placeImage"] + ".jpg"; // Assuming the image is named based on placeId
      placeIdImage.alt = matchingEntry["placeId"];
      placeIdImage.style.width = '350px'; // Set width
      placeIdImage.style.height = '350px'; // Set height

      const weatherImage = document.createElement('img');
      weatherImage.src = "images/" + matchingEntry["weatherImage"]; // Assuming the image is named based on placeId
      weatherImage.alt = matchingEntry["weatherImage"];
      weatherImage.style.width = '150px'; // Set width
      weatherImage.style.height = '150px'; // Set height

      placeImageCell.appendChild(placeIdImage);
      weatherImageCell.appendChild(weatherImage);
      imageRow.appendChild(placeImageCell);
      imageRow.appendChild(weatherImageCell);
      weatherTableBody.appendChild(imageRow);

      // place
      const placeRow = document.createElement('tr');
      const placeCell = document.createElement('td');
      placeCell.colSpan = 2;
      placeCell.innerHTML = '<strong>' +  matchingEntry["places"] + '</strong>';
      placeRow.appendChild(placeCell);
      weatherTableBody.appendChild(placeRow);



      // time
      const timeRow = document.createElement('tr');
      const timeCell = document.createElement('td');
      timeCell.colSpan = 2;
      timeCell.innerHTML = '<strong>' + "During :  " + '</strong>' + weekRange;
      timeRow.appendChild(timeCell);
      weatherTableBody.appendChild(timeRow);


      // weather
      const weatherRow = document.createElement('tr');
      const weatheCell = document.createElement('td');
      weatheCell.colSpan = 2;
      weatheCell.innerHTML = '<strong>' + matchingEntry["Summary"] + '</strong>' + " : " + matchingEntry["ExpectedWeather"];
      weatherRow.appendChild(weatheCell);
      weatherTableBody.appendChild(weatherRow);


    } else {
      console.log('No matching weather data found.');
    }
  } catch (fetchError) {
    console.error('Error fetching data:', fetchError);
  }
}

function openInNewWindow(url) {
  // Open a new window with a specific name and set its attributes
  var newWindow = window.open('', 'myWindow', 'width=600,height=400');
  
  // Set the URL of the new window
  newWindow.location.href = url;
}

