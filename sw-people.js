self.addEventListener('push', function (event) {
    // console.log('[Service Worker] Push received:', event);
    if (!event.data) {
        console.warn('[Service Worker] Push received but no data!');
        return;
    }

    const data = event.data.json();
    // console.log('[Service Worker] Push data:', data);

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: 'people-img.png'
        })
    );

    // Send a message to the client
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clients) {
        for (const client of clients) {
            client.postMessage({ type: 'NEW_PUSH_RECEIVED', payload: data });
        }
    });

});
