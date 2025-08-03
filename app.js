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

function updateNotificationUI(notifications) {
    const list = document.getElementById('notification-list');
    list.innerHTML = ''; // Clear existing items

    notifications.forEach(notification => {
        const li = document.createElement('li');

        const p = document.createElement('p');
        p.className = 'notification-title'; // add classes
        p.textContent = notification.title;   // set text inside <p>

        li.appendChild(p);                    // add <p> to <li>

        // Optionally add the body text after the <p> tag
        const bodyText = document.createTextNode(`${notification.body}`);
        li.appendChild(bodyText);            // add body text after <p>

        list.appendChild(li);                // add <li> to the list
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
