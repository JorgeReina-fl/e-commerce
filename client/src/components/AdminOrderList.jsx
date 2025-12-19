import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, Truck, CheckCircle, Clock, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

const AdminOrderList = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.get(`${API_URL}/orders`, config);
            setOrders(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Error al cargar los pedidos.');
            toast.error('No se pudieron cargar los pedidos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [token]);

    const markAsDelivered = async (id) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            await axios.put(`${API_URL}/orders/${id}/deliver`, {}, config);
            toast.success('Pedido marcado como enviado');
            fetchOrders(); // Refresh list
        } catch (err) {
            console.error('Error updating order:', err);
            toast.error('Error al actualizar el pedido');
        }
    };

    const handleRefund = async (id) => {
        if (!window.confirm('¿Estás seguro de reembolsar este pedido? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            await axios.post(`${API_URL}/payment/refund/${id}`, {}, config);
            toast.success('Pedido reembolsado correctamente');
            fetchOrders();
        } catch (err) {
            console.error('Error refunding order:', err);
            toast.error(err.response?.data?.message || 'Error al procesar el reembolso');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
                <AlertCircle className="mr-2" />
                {error}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    #{order._id.slice(-6).toUpperCase()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.user ? order.user.name : 'Invitado'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    €{order.total.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {order.status === 'pagado' || order.status === 'enviado' || order.status === 'entregado' ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Sí
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                            No
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${order.status === 'enviado' || order.status === 'entregado' ? 'bg-green-100 text-green-800' :
                                            order.status === 'pagado' ? 'bg-primary-light text-primary-dark' :
                                                order.status === 'reembolsado' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.status !== 'enviado' && order.status !== 'entregado' && (
                                        <button
                                            onClick={() => markAsDelivered(order._id)}
                                            className="text-primary hover:text-blue-900 flex items-center"
                                            title="Marcar como Enviado"
                                        >
                                            <Truck size={18} className="mr-1" />
                                            Enviar
                                        </button>
                                    )}
                                    {(order.status === 'enviado' || order.status === 'entregado') && (
                                        <span className="text-green-600 flex items-center">
                                            <CheckCircle size={18} className="mr-1" />
                                            Enviado
                                        </span>
                                    )}
                                    {order.status === 'pagado' && (
                                        <button
                                            onClick={() => handleRefund(order._id)}
                                            className="text-red-600 hover:text-red-900 flex items-center ml-4"
                                            title="Reembolsar Pedido"
                                        >
                                            <RotateCcw size={18} className="mr-1" />
                                            Reembolsar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrderList;


