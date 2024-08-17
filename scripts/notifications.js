const notificationToggle = document.getElementById('notificationToggle');

if('Notification' in window && 'serviceWorker' in navigator) {
  switch(Notification.permission) {
    case 'default':
      notificationToggle.checked = false;
      break;
    case 'granted':
      notificationToggle.setAttribute('checked', '');
      break;
    case 'denied':
      notificationToggle.checked = false;
      break;
    default:
      notificationToggle.checked = false;
      break;
  }

  notificationToggle.addEventListener('click', () => {
    switch(Notification.permission) {
      case 'default':
        requestUserPermission();
        break;
      case 'denied':
        console.log('Permission Denied');
        break;
      case 'granted':
        console.log('Permission Granted');
        break;
    }
  });
}

// Function to request notification permission
function requestUserPermission() {
  Notification.requestPermission()
    .then((permission) => {
      if(permission == 'granted') {
        displayNotification('Permission Granted', 'You are now ready to receive notifications.');
      } else if(permission == 'denied') {
        const notDeniedModal = new bootstrap.Modal(document.getElementById('notDeniedModal'));
        notDeniedModal.show();
        notificationToggle.checked = false;
      } else {
        const notDefaultModal = new bootstrap.Modal(document.getElementById('notDefaultModal'));
        notDefaultModal.show();
        notificationToggle.checked = false;
      }
    });
}

// Function to show notification
function displayNotification(title, body) {
  const options = {
    body: body,
    actions: [
      {
        action: 'ok',
        title: 'OK'
      }
    ]
  };

  navigator.serviceWorker.ready
    .then((registration) => {
      registration.showNotification(title, options);
    });
}