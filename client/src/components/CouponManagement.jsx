import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, Tag, Calendar, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

const CouponManagement = () => {
    const { token } = useAuth();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [stats, setStats] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        type: 'PERCENTAGE',
        value: '',
        minPurchaseAmount: '',
        expirationDate: '',
        maxUses: '',
        maxDiscountAmount: '',
        description: ''
    });

    useEffect(() => {
        fetchCoupons();
        fetchStats();
    }, []);

    const fetchCoupons = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_URL}/coupons`, config);
            setCoupons(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            toast.error('Error al cargar cupones');
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_URL}/coupons/stats/summary`, config);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const openModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                minPurchaseAmount: coupon.minPurchaseAmount || '',
                expirationDate: coupon.expirationDate?.split('T')[0] || '',
                maxUses: coupon.maxUses,
                maxDiscountAmount: coupon.maxDiscountAmount || '',
                description: coupon.description || ''
            });
        } else {
            setEditingCoupon(null);
            setFormData({
                code: '',
                type: 'PERCENTAGE',
                value: '',
                minPurchaseAmount: '',
                expirationDate: '',
                maxUses: '',
                maxDiscountAmount: '',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCoupon(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = {
                ...formData,
                value: parseFloat(formData.value),
                minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : 0,
                maxUses: parseInt(formData.maxUses),
                maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null
            };

            if (editingCoupon) {
                await axios.put(`${API_URL}/coupons/${editingCoupon._id}`, payload, config);
                toast.success('Cupón actualizado');
            } else {
                await axios.post(`${API_URL}/coupons`, payload, config);
                toast.success('Cupón creado');
            }

            closeModal();
            fetchCoupons();
            fetchStats();
        } catch (error) {
            console.error('Error saving coupon:', error);
            toast.error(error.response?.data?.message || 'Error al guardar cupón');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este cupón?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`${API_URL}/coupons/${id}`, config);
                toast.success('Cupón eliminado');
                fetchCoupons();
                fetchStats();
            } catch (error) {
                console.error('Error deleting coupon:', error);
                toast.error('Error al eliminar cupón');
            }
        }
    };

    const isExpired = (date) => new Date(date) < new Date();
    const isMaxedOut = (coupon) => coupon.usedCount >= coupon.maxUses;

    return (
        <div>
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Cupones</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalCoupons}</p>
                            </div>
                            <Tag className="text-primary" size={32} />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Activos</p>
                                <p className="text-2xl font-bold text-green-600">{stats.activeCoupons}</p>
                            </div>
                            <TrendingUp className="text-green-500" size={32} />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Expirados</p>
                                <p className="text-2xl font-bold text-red-600">{stats.expiredCoupons}</p>
                            </div>
                            <Calendar className="text-red-500" size={32} />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Usos Totales</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.totalUsage}</p>
                            </div>
                            <Tag className="text-purple-500" size={32} />
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Gestión de Cupones</h2>
                <button
                    onClick={() => openModal()}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover flex items-center transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    Nuevo Cupón
                </button>
            </div>

            {/* Coupons Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usos</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expira</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {coupons.map((coupon) => (
                                <tr key={coupon._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono font-bold text-primary">{coupon.code}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {coupon.type === 'PERCENTAGE' ? 'Porcentaje' : 'Cantidad Fija'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `€${coupon.value}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {coupon.usedCount} / {coupon.maxUses}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(coupon.expirationDate).toLocaleDateString('es-ES')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {isExpired(coupon.expirationDate) ? (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                Expirado
                                            </span>
                                        ) : isMaxedOut(coupon) ? (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                                Agotado
                                            </span>
                                        ) : coupon.isActive ? (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                Inactivo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openModal(coupon)} className="text-primary hover:text-blue-900 mr-4">
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(coupon._id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4">
                                {editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary font-mono"
                                            placeholder="SAVE20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="PERCENTAGE">Porcentaje</option>
                                            <option value="FIXED_AMOUNT">Cantidad Fija (€)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Valor * {formData.type === 'PERCENTAGE' ? '(%)' : '(€)'}
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.value}
                                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Compra Mínima (€)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.minPurchaseAmount}
                                            onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Expiración *</label>
                                        <input
                                            type="date"
                                            value={formData.expirationDate}
                                            onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Usos Máximos *</label>
                                        <input
                                            type="number"
                                            value={formData.maxUses}
                                            onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                {formData.type === 'PERCENTAGE' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descuento Máximo (€) - Opcional
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.maxDiscountAmount}
                                            onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                                            placeholder="Ej: 50 (limita descuento a €50)"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                                        rows="2"
                                        placeholder="Nota interna sobre este cupón"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
                                    >
                                        {editingCoupon ? 'Actualizar' : 'Crear'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponManagement;


