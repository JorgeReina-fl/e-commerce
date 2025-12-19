import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import axios from 'axios';
import usePushNotifications from '../hooks/usePushNotifications';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user, token } = useAuth();
    const { socket, isConnected } = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const pushNotifications = usePushNotifications(token);

    // Fetch notifications when user logs in
    useEffect(() => {
        if (user && token) {
            fetchNotifications();
            // Auto-subscribe to push notifications
            if (pushNotifications.isSupported && !pushNotifications.isSubscribed) {
                pushNotifications.subscribeUser();
            }
        }
    }, [user, token]);

    // Listen for real-time notifications via WebSocket
    useEffect(() => {
        if (!socket || !isConnected || !user) return;

        const handleNewNotification = (data) => {
            console.log('[Notification] Real-time notification received:', data);

            const { notification } = data;

            // Add new notification to the top of the list
            setNotifications(prev => [notification, ...prev]);

            // Increment unread count
            setUnreadCount(prev => prev + 1);

            // Show toast notification
            toast.custom((t) => (
                <div
                    className={`${t.visible ? 'animate-enter' : 'animate-leave'
                        } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                >
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <span className="text-2xl">🔔</span>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {notification.title}
                                </p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {notification.message}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:text-primary-dark focus:outline-none"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            ), { duration: 5000 });
        };

        socket.on('notification:new', handleNewNotification);

        return () => {
            socket.off('notification:new', handleNewNotification);
        };
    }, [socket, isConnected, user]);

    const fetchNotifications = async (page = 1) => {
        if (!token) return;

        try {
            setLoading(true);
            const { data } = await axios.get(
                `${API_URL}/notifications?page=${page}&limit=20`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        if (!token) return;

        try {
            await axios.put(
                `${API_URL}/notifications/${notificationId}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif._id === notificationId ? { ...notif, read: true } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!token) return;

        try {
            await axios.put(
                `${API_URL}/notifications/read-all`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );
            setUnreadCount(0);
            toast.success('Todas las notificaciones marcadas como leídas');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Error al marcar notificaciones como leídas');
        }
    };

    const deleteNotification = async (notificationId) => {
        if (!token) return;

        try {
            await axios.delete(
                `${API_URL}/notifications/${notificationId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            const deleted = notifications.find(n => n._id === notificationId);
            setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
            if (deleted && !deleted.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            toast.success('Notificación eliminada');
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Error al eliminar notificación');
        }
    };

    const value = {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        pushNotifications,
        isRealTimeConnected: isConnected
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};
