// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service Worker registered'));

    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data?.type === 'NEW_PUSH_RECEIVED') {
            // Call your API to get the latest notifications
            fetchLatestNotifications();
        }
    });

}

fetchLatestNotifications();

async function fetchLatestNotifications() {
    try {
        const response = await fetch('https://pwa-notifications-be.onrender.com/notifications'); // adjust your endpoint
        const data = await response.json();
        updateNotificationUI(data); // render to DOM or state
    } catch (err) {
        console.error('Error fetching notifications:', err);
    }
}

// setTimeout(() => {
//     updateNotificationUI([{ title: 'title', body: 'test', timestamp: new Date() }]);
// }, 3000);

function updateNotificationUI(notifications) {
    const list = document.getElementById('notification-list');
    list.innerHTML = ''; // Clear existing items

    notifications.forEach(notification => {
        const li = document.createElement('li');

        // Title
        const title = document.createElement('p');
        title.className = 'notification-title poppins-medium';
        title.textContent = notification.title;
        li.appendChild(title);

        // Body
        const body = document.createElement('p');
        body.className = 'notification-body';
        body.textContent = notification.body;
        li.appendChild(body);

        // Date and time
        const dateTime = document.createElement('p');
        dateTime.className = 'notification-date';
        const date = new Date(notification.timestamp);
        dateTime.textContent = date.toLocaleString(); // e.g., "8/4/2025, 10:15:00 AM"
        li.appendChild(dateTime);

        list.appendChild(li);
    });
}


subscribe();
// Ask permission and subscribe

async function subscribe() {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
        const subscribeEle = document.getElementById("subscribe");
        if (subscribeEle) subscribeEle.remove();
    }

    if (permission !== 'granted') {
        return console.log('Notification permission denied');
    }

    const swReg = await navigator.serviceWorker.ready;

    const applicationServerKey = urlBase64ToUint8Array('BMHHx70B6PTXRkhgu32lSVMWbYlMtiaeJ41c-ZCS9p4240vnqlgYrAXfLW0wET9chC580-QfJU1by_02McfhYJI');

    const subscription = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    });

    await fetch('https://pwa-notifications-be.onrender.com/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    console.log('Subscribed!');
}

function pushNotification(title, body) {
    fetch("https://pwa-notifications-be.onrender.com/sendNotification", {
        method: "POST",
        body: JSON.stringify({
            title: title,
            body: body,
        }),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) =>
            response.ok
                ? console.log("Notification sent!")
                : console.log("Failed to send")
        )
        .catch((error) => {
            console.error("Error sending notification:", error);
            console.log("Error sending notification");
        });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
