self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  event.waitUntil(
    self.registration.showNotification(data.title || "Notifikasi", {
      body: data.body || "Pesan baru diterima",
      icon: "/logo-jejak.png",
      badge: "/logo-jejak.png",
      vibrate: [100, 50, 100]
    })
  );
});

// Optional: klik notif → buka aplikasi
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/")
  );
});
