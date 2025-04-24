console.log('Loaded service worker!');

self.addEventListener("push", function (event) {
  console.log("Notification data----------", event.data);
  const data = event.data?.json() || {};
  console.log('Got push', data);
  const title = data.title || "Notification";
  const options = {
    body: data.body,
    icon: "/logo192.png", // Optional
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Register event listener for the 'notificationclick' event.
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('http://localhost:3000/'));
});
