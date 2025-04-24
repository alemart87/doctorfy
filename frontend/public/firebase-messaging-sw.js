importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCPQlz-uEJgk3X3ZiITelDlcWB4jYCGwbI",
  authDomain: "doctorfy-c133e.firebaseapp.com",
  projectId: "doctorfy-c133e",
  storageBucket: "doctorfy-c133e.firebasestorage.app",
  messagingSenderId: "297058658248",
  appId: "1:297058658248:web:cf26222c14d33e6942c2fd"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
}); 