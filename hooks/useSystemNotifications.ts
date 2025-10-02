import { useCallback } from 'react';

export const useSystemNotifications = () => {

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }

    // Let's check whether notification permissions have already been granted
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted.");
      }
    }
  }, []);

  const sendSystemNotification = useCallback((title: string, options?: NotificationOptions, onClick?: () => void) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        ...options,
        icon: 'https://i.postimg.cc/YhvKDdRc/Logo-for-Conecta-Mente-Clean-Sans-Serif-Abstract-Design.png', // Optional: Add an icon for brand recognition
      });

      if (onClick) {
        notification.onclick = () => {
          window.focus(); // Bring the window to the front
          onClick();
          notification.close();
        };
      }
    }
  }, []);

  return { requestPermission, sendSystemNotification };
};