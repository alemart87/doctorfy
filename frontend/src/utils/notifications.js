import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import axios from 'axios';

const firebaseConfig = {
  apiKey: "AIzaSyCPQlz-uEJgk3X3ZiITelDlcWB4jYCGwbI",
  authDomain: "doctorfy-c133e.firebaseapp.com",
  projectId: "doctorfy-c133e",
  storageBucket: "doctorfy-c133e.firebasestorage.app",
  messagingSenderId: "297058658248",
  appId: "1:297058658248:web:cf26222c14d33e6942c2fd",
  measurementId: "G-R6VV09ZH5G"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Obtener el token de FCM con la configuración de vapidKey
      const token = await getToken(messaging, {
        vapidKey: 'TU_VAPID_KEY' // Necesitarás generar esto en Firebase Console
      });
      
      // Enviar token al backend
      await axios.post('/api/notifications/subscribe', { token }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error al solicitar permiso:', err);
    return false;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
}); 