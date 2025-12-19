import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, Package, ShoppingBag, BarChart3, MessageSquare, Warehouse, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminOrderList from '../components/AdminOrderList';
import AdminReviews from '../components/AdminReviews';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import ProductFormModal from '../components/ProductFormModal';
import InventoryManagement from '../components/InventoryManagement';
import CouponManagement from '../components/CouponManagement';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_URL } from '../config/api';

const AdminDashboard = () => {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('analytics');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [sizeType, setSizeType] = useState('letters');
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Hombre',
        sizeStock: [
            { size: 'S', stock: 0 },
            { size: 'M', stock: 0 },
            { size: 'L', stock: 0 },
            { size: 'XL', stock: 0 }
        ],
        image: ''
    });

    // Size templates for each type
    const sizeTemplates = {
        unique: ['Única'],
        numeric: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
        letters: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    };

    const [selectedCategory, setSelectedCategory] = useState('Todos');

    useEffect(() => {
        fetchProducts();
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setStatsLoading(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_URL}/orders/stats`, config);
            setStats(response.data);
            setStatsLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Error al cargar estadísticas');
            setStatsLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_URL}/products?pageSize=1000`);
            setProducts(response.data.products || response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Error al cargar productos');
            setLoading(false);
        }
    };

    const getTotalStock = (product) => {
        if (product.sizeStock && product.sizeStock.length > 0) {
            return product.sizeStock.reduce((acc, curr) => acc + curr.stock, 0);
        }
        return product.stock || 0;
    };

    const openModal = (product = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingProduct(null);
        setIsModalOpen(false);
    };

    const filteredProducts = selectedCategory === 'Todos'
        ? products
        : products.filter(p => p.category === selectedCategory);

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`${API_URL}/products/${id}`, config);
                toast.success('Producto eliminado');
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error('Error al eliminar producto');
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="mt-2 text-gray-600">Gestiona tus productos, pedidos y estadísticas</p>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'analytics'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                >
                    <BarChart3 size={20} className="mr-2" />
                    Estadísticas
                </button>
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'products'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                >
                    <Package size={20} className="mr-2" />
                    Productos
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'orders'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                >
                    <ShoppingBag size={20} className="mr-2" />
                    Pedidos
                </button>
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'reviews'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                >
                    <MessageSquare size={20} className="mr-2" />
                    Reseñas
                </button>
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'inventory'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                >
                    <Warehouse size={20} className="mr-2" />
                    Inventario
                </button>
                <button
                    onClick={() => setActiveTab('coupons')}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'coupons'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                >
                    <Ticket size={20} className="mr-2" />
                    Cupones
                </button>
            </div>

            {activeTab === 'analytics' && (
                <AdvancedAnalytics />
            )}

            {activeTab === 'products' && (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="Todos">Todas las categorías</option>
                                <option value="Hombre">Hombre</option>
                                <option value="Mujer">Mujer</option>
                                <option value="Niños">Niños</option>
                                <option value="Accesorios">Accesorios</option>
                            </select>
                            <span className="text-sm text-gray-500">
                                {filteredProducts.length} productos
                            </span>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover flex items-center transition-colors"
                        >
                            <Plus size={20} className="mr-2" />
                            Nuevo Producto
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Total</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProducts.map((product) => (
                                        <tr key={product._id} className="hover:bg-gray-50">
                                            {/* ... (keep existing row content) */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {product.image ? (
                                                            <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt="" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 text-center leading-none">
                                                                Sin img
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">€{product.price}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTotalStock(product)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openModal(product)} className="text-primary hover:text-blue-900 mr-4">
                                                    <Pencil size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'orders' && (
                <AdminOrderList />
            )}

            {activeTab === 'reviews' && (
                <AdminReviews />
            )}

            {activeTab === 'inventory' && (
                <InventoryManagement />
            )}

            {activeTab === 'coupons' && (
                <CouponManagement />
            )}

            {isModalOpen && (
                <ProductFormModal
                    product={editingProduct}
                    token={token}
                    onClose={closeModal}
                    onSave={() => {
                        closeModal();
                        fetchProducts();
                    }}
                />
            )}
        </div>
    );
};

export default AdminDashboard;


