import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Package, Loader2, AlertCircle } from 'lucide-react';
import { API_URL } from '../config/api';

const OrderTrackingPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        orderId: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [order, setOrder] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.orderId) {
            setError('El número de pedido es obligatorio');
            return;
        }

        if (!formData.email && !formData.phone) {
            setError('Debes proporcionar el email o el teléfono asociado al pedido');
            return;
        }

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const response = await axios.post(`${API_URL}/orders/track`, {
                orderId: formData.orderId,
                email: formData.email || undefined,
                phone: formData.phone || undefined
            });
            setOrder(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al buscar el pedido');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pagado': return 'bg-primary-light text-primary-dark';
            case 'enviado': return 'bg-green-100 text-green-800';
            case 'entregado': return 'bg-green-100 text-green-800';
            case 'reembolsado': return 'bg-gray-100 text-gray-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pendiente': return 'Pendiente';
            case 'pagado': return 'Pagado';
            case 'enviado': return 'Enviado';
            case 'entregado': return 'Entregado';
            case 'reembolsado': return 'Reembolsado';
            default: return status;
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
                <Package className="mx-auto h-12 w-12 text-primary mb-4" />
                <h1 className="text-3xl font-bold text-gray-900">Seguimiento de Pedido</h1>
                <p className="mt-2 text-gray-600">
                    Introduce tu número de pedido y el email o teléfono que usaste al realizar la compra
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Pedido *
                    </label>
                    <input
                        type="text"
                        name="orderId"
                        value={formData.orderId}
                        onChange={handleChange}
                        placeholder="Ej: 6931637..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="tu@email.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="600123456"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                </div>

                <p className="text-sm text-gray-500">
                    * Introduce el email O el teléfono que usaste en tu pedido
                </p>

                {error && (
                    <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="mr-2" size={20} />
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 className="animate-spin mr-2" size={20} />
                    ) : (
                        <Search className="mr-2" size={20} />
                    )}
                    Buscar Pedido
                </button>
            </form>

            {/* Order Result */}
            {order && (
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Pedido #{order._id.slice(-8).toUpperCase()}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {new Date(order.createdAt).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                        </span>
                    </div>

                    {/* Order Timeline */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-3">Estado del Pedido</h3>
                        <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status !== 'pendiente' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                                ✓
                            </div>
                            <div className={`flex-1 h-1 ${order.status === 'enviado' || order.status === 'entregado' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'enviado' || order.status === 'entregado' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                                📦
                            </div>
                            <div className={`flex-1 h-1 ${order.status === 'entregado' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'entregado' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                                🏠
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Pagado</span>
                            <span>Enviado</span>
                            <span>Entregado</span>
                        </div>
                    </div>

                    {/* Items */}
                    <h3 className="font-semibold mb-3">Productos</h3>
                    <div className="space-y-3 mb-4">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4">
                                <img
                                    src={item.product.image || '/placeholder.jpg'}
                                    alt={item.product.name}
                                    className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-sm text-gray-500">Talla: {item.size} | Cantidad: {item.quantity}</p>
                                </div>
                                <p className="font-medium">€{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="border-t pt-4 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>€{order.total.toFixed(2)}</span>
                    </div>

                    {/* Shipping Address */}
                    <div className="mt-4 pt-4 border-t">
                        <h3 className="font-semibold mb-2">Dirección de Envío</h3>
                        <p className="text-gray-600">
                            {order.shippingAddress.name}<br />
                            {order.shippingAddress.address}<br />
                            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderTrackingPage;


