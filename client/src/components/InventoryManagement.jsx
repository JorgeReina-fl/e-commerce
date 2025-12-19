import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Package, AlertTriangle, TrendingUp, History, Settings,
    RefreshCw, Plus, Minus, Search, Filter, ChevronDown,
    ChevronUp, Edit2, Save, X, Bell, ArrowUpDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

const InventoryManagement = () => {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState('alerts');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [restockSuggestions, setRestockSuggestions] = useState([]);
    const [movements, setMovements] = useState([]);
    const [movementsPagination, setMovementsPagination] = useState(null);

    // Filters
    const [movementFilter, setMovementFilter] = useState({ type: '', productId: '' });
    const [movementPage, setMovementPage] = useState(1);

    // Stock adjustment modal
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [adjustData, setAdjustData] = useState({
        productId: '',
        productName: '',
        size: '',
        quantity: 0,
        reason: '',
        type: 'ajuste'
    });

    // Settings modal
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [settingsData, setSettingsData] = useState({
        productId: '',
        productName: '',
        lowStockThreshold: 5,
        autoRestockEnabled: false,
        autoRestockLevel: 20
    });


    useEffect(() => {
        fetchStats();
        fetchLowStock();
    }, []);

    useEffect(() => {
        if (activeTab === 'restock') {
            fetchRestockSuggestions();
        } else if (activeTab === 'history') {
            fetchMovements();
        }
    }, [activeTab, movementPage, movementFilter]);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/inventory/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchLowStock = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/inventory/low-stock`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLowStockProducts(data);
        } catch (error) {
            console.error('Error fetching low stock:', error);
            toast.error('Error al cargar productos con stock bajo');
        } finally {
            setLoading(false);
        }
    };

    const fetchRestockSuggestions = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/inventory/restock-suggestions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRestockSuggestions(data);
        } catch (error) {
            console.error('Error fetching restock suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMovements = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: movementPage,
                limit: 20
            });
            if (movementFilter.type) params.append('type', movementFilter.type);
            if (movementFilter.productId) params.append('productId', movementFilter.productId);

            const { data } = await axios.get(`${API_URL}/inventory/movements?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMovements(data.movements);
            setMovementsPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching movements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustStock = async () => {
        if (!adjustData.productId || !adjustData.size || adjustData.quantity === 0) {
            toast.error('Completa todos los campos');
            return;
        }

        try {
            await axios.post(`${API_URL}/inventory/adjust`, {
                productId: adjustData.productId,
                size: adjustData.size,
                quantity: adjustData.quantity,
                reason: adjustData.reason,
                type: adjustData.type
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Stock ajustado correctamente');
            setShowAdjustModal(false);
            setAdjustData({ productId: '', productName: '', size: '', quantity: 0, reason: '', type: 'ajuste' });
            fetchLowStock();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al ajustar stock');
        }
    };

    const handleUpdateSettings = async () => {
        try {
            await axios.put(`${API_URL}/inventory/settings/${settingsData.productId}`, {
                lowStockThreshold: settingsData.lowStockThreshold,
                autoRestockEnabled: settingsData.autoRestockEnabled,
                autoRestockLevel: settingsData.autoRestockLevel
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Configuración actualizada');
            setShowSettingsModal(false);
            fetchLowStock();
        } catch (error) {
            toast.error('Error al actualizar configuración');
        }
    };

    const openAdjustModal = (product, size, currentStock) => {
        setAdjustData({
            productId: product._id,
            productName: product.name,
            size,
            currentStock,
            quantity: 0,
            reason: '',
            type: 'entrada'
        });
        setShowAdjustModal(true);
    };

    const openSettingsModal = (product) => {
        setSettingsData({
            productId: product._id,
            productName: product.name,
            lowStockThreshold: product.lowStockThreshold || 5,
            autoRestockEnabled: product.autoRestockEnabled || false,
            autoRestockLevel: product.autoRestockLevel || 20
        });
        setShowSettingsModal(true);
    };

    const getMovementTypeLabel = (type) => {
        const labels = {
            entrada: { text: 'Entrada', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
            salida: { text: 'Salida', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
            ajuste: { text: 'Ajuste', color: 'bg-primary-light text-primary-dark dark:bg-primary-dark dark:text-primary-light' },
            venta: { text: 'Venta', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
            devolucion: { text: 'Devolución', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' }
        };
        return labels[type] || { text: type, color: 'bg-gray-100 text-gray-800' };
    };

    const tabs = [
        { id: 'alerts', label: 'Alertas de Stock', icon: AlertTriangle },
        { id: 'restock', label: 'Sugerencias', icon: TrendingUp },
        { id: 'history', label: 'Historial', icon: History }
    ];

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Productos</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts}</p>
                            </div>
                            <Package className="text-primary" size={32} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Stock Bajo</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.lowStockCount}</p>
                            </div>
                            <AlertTriangle className="text-yellow-500" size={32} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Sin Stock</p>
                                <p className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</p>
                            </div>
                            <Package className="text-red-500" size={32} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Valor Stock</p>
                                <p className="text-2xl font-bold text-green-600">€{stats.totalStockValue?.toFixed(2)}</p>
                            </div>
                            <TrendingUp className="text-green-500" size={32} />
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                ? 'border-primary text-primary dark:text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <RefreshCw className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <>
                        {/* Alerts Tab */}
                        {activeTab === 'alerts' && (
                            <div className="space-y-4">
                                {lowStockProducts.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <Package size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>No hay productos con stock bajo</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {lowStockProducts.map(product => (
                                            <div
                                                key={product._id}
                                                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                                {product.name}
                                                            </h3>
                                                            <button
                                                                onClick={() => openSettingsModal(product)}
                                                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                                title="Configurar alertas"
                                                            >
                                                                <Settings size={18} />
                                                            </button>
                                                        </div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                            Stock total: {product.totalStock} | Umbral: {product.lowStockThreshold || 5}
                                                        </p>

                                                        {/* Low Stock Sizes */}
                                                        {product.lowStockSizes?.length > 0 && (
                                                            <div className="mb-2">
                                                                <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                                                                    Stock bajo:
                                                                </span>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    {product.lowStockSizes.map(ss => (
                                                                        <button
                                                                            key={ss.size}
                                                                            onClick={() => openAdjustModal(product, ss.size, ss.stock)}
                                                                            className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800"
                                                                        >
                                                                            {ss.size}: {ss.stock}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Out of Stock Sizes */}
                                                        {product.outOfStockSizes?.length > 0 && (
                                                            <div>
                                                                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                                                    Sin stock:
                                                                </span>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    {product.outOfStockSizes.map(ss => (
                                                                        <button
                                                                            key={ss.size}
                                                                            onClick={() => openAdjustModal(product, ss.size, 0)}
                                                                            className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full hover:bg-red-200 dark:hover:bg-red-800"
                                                                        >
                                                                            {ss.size}: 0
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Restock Suggestions Tab */}
                        {activeTab === 'restock' && (
                            <div className="space-y-4">
                                {restockSuggestions.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>No hay sugerencias de reabastecimiento</p>
                                        <p className="text-sm mt-2">Activa el reabastecimiento automático en los productos</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {restockSuggestions.map((suggestion, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <img
                                                        src={suggestion.product.image}
                                                        alt={suggestion.product.name}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                                            {suggestion.product.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                            Nivel objetivo: {suggestion.restockLevel} unidades
                                                        </p>

                                                        <div className="overflow-x-auto">
                                                            <table className="min-w-full text-sm">
                                                                <thead>
                                                                    <tr className="text-left text-gray-500 dark:text-gray-400">
                                                                        <th className="pr-4">Talla</th>
                                                                        <th className="pr-4">Actual</th>
                                                                        <th className="pr-4">Sugerido</th>
                                                                        <th></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {(suggestion.sizesToRestock || suggestion.itemsToRestock)?.map((item, i) => (
                                                                        <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                                                                            <td className="py-2 pr-4 text-gray-900 dark:text-white">
                                                                                {item.size}
                                                                            </td>
                                                                            <td className="py-2 pr-4 text-red-600">
                                                                                {item.currentStock}
                                                                            </td>
                                                                            <td className="py-2 pr-4 text-green-600 font-medium">
                                                                                +{item.suggestedRestock}
                                                                            </td>
                                                                            <td className="py-2">
                                                                                <button
                                                                                    onClick={() => openAdjustModal(
                                                                                        suggestion.product,
                                                                                        item.size,
                                                                                        item.currentStock
                                                                                    )}
                                                                                    className="text-primary hover:text-primary-dark text-xs"
                                                                                >
                                                                                    Ajustar
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* History Tab */}
                        {activeTab === 'history' && (
                            <div className="space-y-4">
                                {/* Filters */}
                                <div className="flex gap-4">
                                    <select
                                        value={movementFilter.type}
                                        onChange={(e) => {
                                            setMovementFilter(prev => ({ ...prev, type: e.target.value }));
                                            setMovementPage(1);
                                        }}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    >
                                        <option value="">Todos los tipos</option>
                                        <option value="entrada">Entrada</option>
                                        <option value="salida">Salida</option>
                                        <option value="ajuste">Ajuste</option>
                                        <option value="venta">Venta</option>
                                        <option value="devolucion">Devolución</option>
                                    </select>
                                </div>

                                {/* Movements Table */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                    Fecha
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                    Producto
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                    Tipo
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                    Talla
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                    Cantidad
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                    Stock
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                    Razón
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {movements.map((movement) => {
                                                const typeInfo = getMovementTypeLabel(movement.type);
                                                return (
                                                    <tr key={movement._id}>
                                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                            {new Date(movement.createdAt).toLocaleString('es-ES', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                {movement.product?.image && (
                                                                    <img
                                                                        src={movement.product.image}
                                                                        alt=""
                                                                        className="w-8 h-8 rounded object-cover"
                                                                    />
                                                                )}
                                                                <span className="text-sm text-gray-900 dark:text-white">
                                                                    {movement.product?.name || 'Producto eliminado'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
                                                                {typeInfo.text}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                            {movement.size || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-medium">
                                                            <span className={movement.quantity >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                                {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                            {movement.previousStock} → {movement.newStock}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                                            {movement.reason || '-'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {movementsPagination && movementsPagination.pages > 1 && (
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => setMovementPage(prev => Math.max(1, prev - 1))}
                                            disabled={movementPage === 1}
                                            className="px-3 py-1 border rounded disabled:opacity-50"
                                        >
                                            Anterior
                                        </button>
                                        <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                                            Página {movementPage} de {movementsPagination.pages}
                                        </span>
                                        <button
                                            onClick={() => setMovementPage(prev => Math.min(movementsPagination.pages, prev + 1))}
                                            disabled={movementPage === movementsPagination.pages}
                                            className="px-3 py-1 border rounded disabled:opacity-50"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Stock Adjustment Modal */}
            {showAdjustModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Ajustar Stock
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Producto
                                </label>
                                <p className="text-gray-900 dark:text-white">{adjustData.productName}</p>
                                <p className="text-sm text-gray-500">Talla: {adjustData.size} | Stock actual: {adjustData.currentStock}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tipo de movimiento
                                </label>
                                <select
                                    value={adjustData.type}
                                    onChange={(e) => setAdjustData(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="entrada">Entrada (compra/recepción)</option>
                                    <option value="salida">Salida (pérdida/daño)</option>
                                    <option value="ajuste">Ajuste (corrección)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Cantidad
                                </label>
                                <input
                                    type="number"
                                    value={adjustData.quantity}
                                    onChange={(e) => setAdjustData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Cantidad a añadir o quitar"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Use números positivos para añadir, negativos para quitar
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Razón (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={adjustData.reason}
                                    onChange={(e) => setAdjustData(prev => ({ ...prev, reason: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Ej: Inventario físico, Producto dañado..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowAdjustModal(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAdjustStock}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Configuración de Inventario
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400 mb-4">{settingsData.productName}</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Umbral de stock bajo
                                </label>
                                <input
                                    type="number"
                                    value={settingsData.lowStockThreshold}
                                    onChange={(e) => setSettingsData(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    min="0"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Se mostrará alerta cuando el stock sea igual o menor a este valor
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Reabastecimiento automático
                                    </label>
                                    <p className="text-xs text-gray-500">
                                        Mostrar sugerencias de restock
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSettingsData(prev => ({ ...prev, autoRestockEnabled: !prev.autoRestockEnabled }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settingsData.autoRestockEnabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settingsData.autoRestockEnabled ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {settingsData.autoRestockEnabled && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nivel objetivo de reabastecimiento
                                    </label>
                                    <input
                                        type="number"
                                        value={settingsData.autoRestockLevel}
                                        onChange={(e) => setSettingsData(prev => ({ ...prev, autoRestockLevel: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        min="1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Stock objetivo para cada variante
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowSettingsModal(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdateSettings}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManagement;


