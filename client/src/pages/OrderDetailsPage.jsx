import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Package, Truck, CheckCircle, ArrowLeft, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const { data } = await axios.get(`${API_URL}/orders/${id}`, config);
            setOrder(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Error al cargar el pedido');
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pendiente': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
            'pagado': { bg: 'bg-green-100', text: 'text-green-800', label: 'Pagado' },
            'enviado': { bg: 'bg-primary-light', text: 'text-primary-dark', label: 'Enviado' }
        };
        const config = statusConfig[status] || statusConfig['pendiente'];
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">Cargando pedido...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <p className="text-gray-600 mb-4">No se encontró el pedido.</p>
                <Link to="/" className="text-primary hover:underline">
                    Volver a la tienda
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 print:w-full print:max-w-none print:p-0 print:m-0 print:bg-white print:text-black">
            {/* Header */}
            <div className="mb-6 print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft size={20} />
                    Volver
                </button>
            </div>

            {/* Success Banner */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 print:shadow-none">
                <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="text-green-500" size={32} />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">¡Pedido Confirmado!</h1>
                        <p className="text-gray-600">Gracias por tu compra</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Pedido #</span>
                        <span className="font-mono font-semibold ml-2">
                            {order._id.slice(-8).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Estado:</span>
                        <span className="ml-2">{getStatusBadge(order.status)}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Fecha:</span>
                        <span className="font-medium ml-2">
                            {new Date(order.createdAt).toLocaleDateString('es-ES')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 print:shadow-none">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package size={20} />
                    Productos
                </h2>
                <div className="space-y-4">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                            {/* Product Image */}
                            <Link to={`/product/${item.product._id || item.product}`} className="print:pointer-events-none">
                                <img
                                    src={item.product?.image || '/placeholder.png'}
                                    alt={item.product?.name || 'Producto'}
                                    className="w-16 h-16 object-cover rounded"
                                />
                            </Link>

                            {/* Product Details */}
                            <div className="flex-grow">
                                <Link
                                    to={`/product/${item.product._id || item.product}`}
                                    className="font-medium text-gray-900 hover:text-primary print:text-black print:no-underline"
                                >
                                    {item.product?.name || 'Producto'}
                                </Link>
                                <p className="text-sm text-gray-600">
                                    Talla: {item.size}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {item.quantity} x €{item.price.toFixed(2)} = €{(item.quantity * item.price).toFixed(2)}
                                </p>
                            </div>

                            {/* Item Total */}
                            <div className="text-right">
                                <p className="font-semibold">
                                    €{(item.quantity * item.price).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Total */}
                <div className="mt-6 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>€{order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Envío</span>
                        <span className="text-green-600">Gratis</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total</span>
                        <span>€{order.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 print:shadow-none">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Truck size={20} />
                    Dirección de Envío
                </h2>
                <div className="text-gray-700">
                    <p className="font-medium">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 print:hidden">
                <Link
                    to="/"
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-center"
                >
                    Seguir Comprando
                </Link>
                <button
                    onClick={() => window.print()}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                    <Printer size={18} />
                    Imprimir Recibo
                </button>
            </div>
        </div>
    );
};

export default OrderDetailsPage;


