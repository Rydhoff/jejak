// Workbox will replace this array automatically
self.__WB_MANIFEST = [];

// Push notification
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  event.waitUntil(
    self.registration.showNotification(data.title || "Notifikasi", {
      body: data.body || "Pesan baru dari Jejak",
      icon: "/logo-jejak.png",
      badge: "/logo-jejak.png",
    })
  );
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
