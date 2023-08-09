document.addEventListener('DOMContentLoaded', function() {
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
 
});

