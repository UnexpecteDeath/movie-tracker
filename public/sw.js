self.addEventListener("push", (event) => {
    let payload = {};
    console.log("RAW PUSH EVENT:", event);
    try {
        payload = event.data ? event.data.json() : {};
    } catch {
        payload = {
            body: event.data ? event.data.text() : "",
        };
    }

    const title = payload.title || "Our Cinema";
    const options = {
        body: payload.body || "New notification",
        icon: payload.icon || "/icon-192.png",
        badge: payload.badge || "/icon-192.png",
        data: payload.data || {},
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || "/";

    event.waitUntil(
        self.clients
            .matchAll({
                type: "window",
                includeUncontrolled: true,
            })
            .then((clientList) => {
                const existingClient = clientList.find((client) => {
                    return "focus" in client && client.url.includes(targetUrl);
                });

                if (existingClient) {
                    return existingClient.focus();
                }

                if (self.clients.openWindow) {
                    return self.clients.openWindow(targetUrl);
                }

                return undefined;
            }),
    );
});
