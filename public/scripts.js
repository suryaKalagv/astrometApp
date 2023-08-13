document.addEventListener('DOMContentLoaded',  async function() {
  const buttons = document.querySelectorAll('.nav-button');
  
  function updatePlaceId(placeIdSelected) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.set('placeId', placeIdSelected);
    const newUrl = `${window.location.pathname}?${urlSearchParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }

  buttons.forEach(function(button) {
    button.addEventListener('click', function() {
      const placeIdSelected = button.id;
      updatePlaceId(placeIdSelected);

      // Remove active class from all buttons
      buttons.forEach(function(btn) {
        btn.classList.remove('active');
      });

      // Add active class to the clicked button
      button.classList.add('active');
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
  } else {
    // Add active class to the button corresponding to the current placeId
    const placeId = urlSearchParams.get('placeId');
    const activeButton = document.getElementById(placeId);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }

  
    const annualCalendar = document.querySelector('#annual-calendar tbody');
  
    try {
      const response = await fetch('/calendarData');
      const monthYearMap = await response.json();
  
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
              weekLink.addEventListener('click', function(event) {
                event.preventDefault();
                const newUrl = `${window.location.pathname}?placeId=${getPlaceId()}&weekId=${weekEntry.weekId}`;
                window.history.pushState({}, '', newUrl);
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
  });
  
  function getPlaceId() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return urlSearchParams.get('placeId') || 'TLNG';
  }
