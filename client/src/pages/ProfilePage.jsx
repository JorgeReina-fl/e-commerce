import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, Calendar, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

const ProfilePage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${API_URL}/orders/myorders`);
                setOrders(response.data);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('No se pudieron cargar tus pedidos.');
                toast.error('Error al cargar historial de pedidos');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* User Profile Card */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="h-16 w-16 bg-primary-light rounded-full flex items-center justify-center text-primary text-2xl font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                                <p className="text-gray-500 text-sm">{user?.email}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex items-center text-gray-600 mb-2">
                                <Calendar size={18} className="mr-2" />
                                <span className="text-sm">Miembro desde: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Package size={18} className="mr-2" />
                                <span className="text-sm">{orders.length} Pedidos realizados</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order History */}
                <div className="md:col-span-2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <Package className="mr-2" />
                        Historial de Pedidos
                    </h3>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
                            <AlertCircle className="mr-2" />
                            {error}
                        </div>
                    )}

                    {orders.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
                            <Package size={48} className="mx-auto text-gray-300 mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">No tienes pedidos aún</h4>
                            <p className="text-gray-500 mb-6">¡Explora nuestra colección y realiza tu primera compra!</p>
                            <a href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover">
                                Ir a la tienda
                            </a>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vista Previa</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pedido</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {order.items && order.items.length > 0 && order.items[0].product?.image ? (
                                                        <img
                                                            src={order.items[0].product.image}
                                                            alt="Product preview"
                                                            className="h-10 w-10 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                                                            <Package size={16} className="text-gray-400" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    #{order._id.slice(-6).toUpperCase()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    €{order.total.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${order.status === 'pagado' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'enviado' ? 'bg-primary-light text-primary-dark' :
                                                                order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'}`}>
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <Link
                                                        to={`/order/${order._id}`}
                                                        className="text-primary hover:text-blue-900 font-medium"
                                                    >
                                                        Ver Detalles
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;


