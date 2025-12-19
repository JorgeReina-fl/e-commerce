import { useState, useEffect } from 'react';
import { Bell, Trash2, CheckCheck, Filter, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const NotificationCenter = () => {
    const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const [filter, setFilter] = useState('all'); // all, unread, order, price_drop, cart_reminder

    useEffect(() => {
        fetchNotifications();
    }, []);

    const filteredNotifications = filter === 'all'
        ? notifications
        : filter === 'unread'
            ? notifications.filter(n => !n.read)
            : notifications.filter(n => n.type === filter);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeIcon = (type) => {
        const icons = {
            order: '🛍️',
            price_drop: '💰',
            cart_reminder: '🛒',
            system: '🔔'
        };
        return icons[type] || '🔔';
    };

    const getTypeColor = (type) => {
        const colors = {
            order: 'bg-green-100 text-green-800',
            price_drop: 'bg-purple-100 text-purple-800',
            cart_reminder: 'bg-yellow-100 text-yellow-800',
            system: 'bg-primary-light text-primary-dark'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getTypeLabel = (type) => {
        const labels = {
            order: 'Pedido',
            price_drop: 'Precio',
            cart_reminder: 'Carrito',
            system: 'Sistema'
        };
        return labels[type] || type;
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification._id);
        }
    };

    if (loading && notifications.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Notificaciones</h1>
                <p className="text-gray-600">
                    {unreadCount > 0 ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer` : 'No tienes notificaciones sin leer'}
                </p>
            </div>

            {/* Actions Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter size={20} className="text-gray-500" />
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'unread' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Sin leer ({unreadCount})
                        </button>
                        <button
                            onClick={() => setFilter('order')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'order' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🛍️ Pedidos
                        </button>
                        <button
                            onClick={() => setFilter('price_drop')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'price_drop' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            💰 Precios
                        </button>
                        <button
                            onClick={() => setFilter('cart_reminder')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'cart_reminder' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🛒 Carrito
                        </button>
                    </div>

                    {/* Mark all as read */}
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                        >
                            <CheckCheck size={18} />
                            Marcar todas como leídas
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <Bell size={64} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay notificaciones</h3>
                    <p className="text-gray-600">
                        {filter === 'unread'
                            ? 'No tienes notificaciones sin leer'
                            : filter === 'all'
                                ? 'Aún no tienes notificaciones'
                                : `No tienes notificaciones de tipo "${getTypeLabel(filter)}"`
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredNotifications.map((notification) => {
                        const NotificationWrapper = notification.link ? Link : 'div';
                        const wrapperProps = notification.link
                            ? { to: notification.link, onClick: () => handleNotificationClick(notification) }
                            : {};

                        return (
                            <NotificationWrapper
                                key={notification._id}
                                {...wrapperProps}
                                className={`block bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md ${!notification.read ? 'border-l-4 border-l-primary bg-primary-light/50' : ''
                                    } ${notification.link ? 'cursor-pointer' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="text-4xl flex-shrink-0">
                                        {getTypeIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.read && (
                                                        <span className="w-2 h-2 bg-primary rounded-full" />
                                                    )}
                                                </div>
                                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>
                                                    {getTypeLabel(notification.type)}
                                                </span>
                                            </div>

                                            {/* Delete button */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    deleteNotification(notification._id);
                                                }}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                                title="Eliminar notificación"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <p className="text-gray-700 mb-2">{notification.message}</p>
                                        <p className="text-sm text-gray-500">{formatDate(notification.createdAt)}</p>
                                    </div>
                                </div>
                            </NotificationWrapper>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;


