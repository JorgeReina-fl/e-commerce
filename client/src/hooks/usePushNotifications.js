import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

const usePushNotifications = (token) => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        // Check if browser supports notifications
        setIsSupported('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window);
    }, []);

    const requestPermission = async () => {
        if (!isSupported) {
            return 'unsupported';
        }

        const permission = await Notification.requestPermission();
        return permission;
    };

    const subscribeUser = async () => {
        try {
            if (!token) {
                console.log('No token available, skipping push subscription');
                return false;
            }

            // Request permission
            const permission = await requestPermission();

            if (permission !== 'granted') {
                console.log('Push notification permission denied');
                return false;
            }

            // Register service worker
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            // Get VAPID public key from server
            const { data } = await axios.get(`${API_URL}/notifications/vapid-public-key`);
            const vapidPublicKey = data.publicKey;

            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            });

            // Send subscription to backend
            await axios.post(
                `${API_URL}/notifications/subscribe`,
                subscription.toJSON(),
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSubscription(subscription);
            setIsSubscribed(true);
            console.log('Push notifications subscribed successfully');
            return true;
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            return false;
        }
    };

    const unsubscribeUser = async () => {
        try {
            if (!subscription) return false;

            await subscription.unsubscribe();

            // Remove subscription from backend
            await axios.delete(
                `${API_URL}/notifications/subscribe`,
                {
                    data: { endpoint: subscription.endpoint },
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setSubscription(null);
            setIsSubscribed(false);
            console.log('Push notifications unsubscribed successfully');
            return true;
        } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
            return false;
        }
    };

    // Helper function to convert VAPID key
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    return {
        isSubscribed,
        isSupported,
        subscribeUser,
        unsubscribeUser,
        requestPermission
    };
};

export default usePushNotifications;
