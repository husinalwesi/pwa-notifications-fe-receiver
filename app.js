// Register service worker
// console.log(currentTeam);
var innerTeam = "";
// subscribe(currentTeam);

var baseURL = "https://pwa-notifications-be.onrender.com";
// var baseURL = "https://doorapp.ihorizons.org/backend";

initialize();
async function initialize() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(currentTeam === 'peopledynamics' ? 'sw-people.js' : 'sw.js')
            .then(() => {
                // console.log('Service Worker registered')
            });


        // check if user is already subscribed or not
        const reg = await navigator.serviceWorker.ready;
        const subscription = await reg.pushManager.getSubscription();

        if (subscription) {
            // console.log("✅ User is already subscribed:", subscription);

            const response = await fetch(`${baseURL}/getmysubscribtion`, {
                method: 'POST',
                body: JSON.stringify(subscription),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const res = await response.json();
            if (res.team === currentTeam) {
                if (res.innerteam) {
                    innerTeam = res.innerteam;
                    document.querySelector(".main-links").remove();
                    fetchLatestNotifications();
                    showSelection();
                }
            } else {
                document.querySelector(".main-links").remove();
                document.querySelector(".notification-list").remove();
                document.querySelector(".errors").classList.add("active");
            }
            // console.log('from the api::');

            // console.log(res);


            // return true;
        } else {
            showSelection();
        }
        // else {
        //     console.log("❌ User is not subscribed yet");
        //     // return false;
        // }




        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data?.type === 'NEW_PUSH_RECEIVED') {
                // Call your API to get the latest notifications
                fetchLatestNotifications();
            }
        });

    }
}

function showSelection() {
    document.querySelectorAll(".hide-js").forEach(el => {
        el.classList.remove("hide-js");
    });
}

async function fetchLatestNotifications() {
    if (!innerTeam) return;
    try {
        // use this innerTeam
        const response = await fetch(`${baseURL}/notifications?team=${currentTeam}&innerteam=${innerTeam}`); // adjust your endpoint
        const data = await response.json();
        if (data.length > 0) updateNotificationUI(data); // render to DOM or state
        else updateNotificationUIEmpty();
    } catch (err) {
        console.error('Error fetching notifications:', err);
    }
}

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
        // const body = document.createElement('p');
        // body.className = 'notification-body';
        // body.textContent = notification.body;
        // li.appendChild(body);

        // Date and time
        const dateTime = document.createElement('p');
        dateTime.className = 'notification-date poppins-medium';
        const date = new Date(notification.timestamp);
        dateTime.textContent = date.toLocaleString(); // e.g., "8/4/2025, 10:15:00 AM"
        li.appendChild(dateTime);

        list.appendChild(li);
    });
}

function updateNotificationUIEmpty() {
    const list = document.getElementById('notification-list');
    list.innerHTML = ''; // Clear existing items

    const li = document.createElement('li');

    // Title
    const title = document.createElement('p');
    title.className = 'notification-title poppins-medium';
    title.textContent = 'There is no data!';
    li.appendChild(title);

    list.appendChild(li);
}

function selectPurpose(purpose) {
    // console.log(purpose);
    document.querySelector(".main-links").remove();
    subscribe(currentTeam, purpose);
}

// Ask permission and subscribe

async function subscribe(team, innerteamvar) {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
        // const subscribeEle = document.getElementById("subscribe");
        // if (subscribeEle) subscribeEle.remove();


    }

    if (permission !== 'granted') {
        return;
        // console.log('Notification permission denied');
    }

    const swReg = await navigator.serviceWorker.ready;

    const applicationServerKey = urlBase64ToUint8Array('BMHHx70B6PTXRkhgu32lSVMWbYlMtiaeJ41c-ZCS9p4240vnqlgYrAXfLW0wET9chC580-QfJU1by_02McfhYJI');

    const subscription = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    });

    const payload = {
        subscription,
        team: team,
        innerteam: innerteamvar
    };

    const response = await fetch(`${baseURL}/subscribe`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const res = await response.json();

    innerTeam = innerteamvar;
    // selectPurpose(innerTeam);
    fetchLatestNotifications();

    // console.log('Subscribed!', res);
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
