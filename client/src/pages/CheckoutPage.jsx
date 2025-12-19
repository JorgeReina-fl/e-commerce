import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Loader2, Tag, X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

// Initialize Stripe outside of component to avoid recreating object on renders
// NOTE: This should be an env variable in production
const stripePromise = loadStripe('pk_test_51SaboaCPsqYhQQr9QFrXhim7yA4vOLC92358gysxxbLybYpRrOaEXnxPhC9R7dMxzmaoQl3QtWOrhD4DZpL89xoB00HNgTbdd8');

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { items, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [clientSecret, setClientSecret] = useState("");
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [subtotal, setSubtotal] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [total, setTotal] = useState(0);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: ''
    });

    // Pre-fill data if user is logged in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    // Redirect if cart is empty
    useEffect(() => {
        if (items.length === 0 && !orderPlaced) {
            navigate('/cart');
        }
    }, [items.length, navigate, orderPlaced]);

    // Create PaymentIntent when moving to payment step
    useEffect(() => {
        if (step === 2 && items.length > 0) {
            // Create PaymentIntent with optional coupon
            axios.post(`${API_URL}/payment/create-payment-intent`, {
                items: items,
                couponCode: appliedCoupon?.code || null
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
                .then((res) => {
                    setClientSecret(res.data.clientSecret);
                    setSubtotal(res.data.subtotal);
                    setDiscountAmount(res.data.discountAmount || 0);
                    setTotal(res.data.total);
                })
                .catch((err) => {
                    console.error("Error creating payment intent:", err);
                    if (err.response?.data?.couponError) {
                        toast.error(err.response.data.message);
                        setAppliedCoupon(null);
                    }
                });
        }
    }, [step, items, appliedCoupon]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleShippingSubmit = (e) => {
        e.preventDefault();
        setStep(2); // Move to payment step
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Ingresa un código de cupón');
            return;
        }

        setCouponLoading(true);
        try {
            const response = await axios.post(`${API_URL}/coupons/validate`, {
                code: couponCode,
                cartTotal: getCartTotal()
            });

            if (response.data.valid) {
                setAppliedCoupon(response.data);
                toast.success(`Cupón ${response.data.code} aplicado!`);
                setCouponCode('');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cupón inválido');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        toast.success('Cupón removido');
    };

    const handlePaymentSuccess = async (paymentIntentId) => {
        try {
            // Prepare order data
            const orderData = {
                items: items.map(item => ({
                    productId: item.product._id,
                    quantity: item.quantity,
                    size: item.size
                })),
                shippingAddress: {
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.postalCode
                },
                email: formData.email,
                phone: formData.phone,
                user: user?._id || 'Guest',
                paymentIntentId: paymentIntentId,
                paymentMethod: 'Stripe',
                status: 'pagado', // Confirmed by Stripe
                // Include coupon data if applied
                couponId: appliedCoupon?.couponId || null,
                couponCode: appliedCoupon?.code || null,
                discountAmount: discountAmount,
                subtotal: subtotal || getCartTotal()
            };

            // Send order to backend
            const response = await axios.post(`${API_URL}/orders`, orderData);

            // Navigate to order details page
            const orderId = response.data.orderId;
            setOrderPlaced(true);
            clearCart();
            navigate(`/order/${orderId}`);
        } catch (error) {
            console.error('Error creating order after payment:', error);
            alert('El pago fue exitoso pero hubo un error al crear el pedido. Por favor contacta a soporte.');
        }
    };

    if (items.length === 0) {
        return null;
    }

    const appearance = {
        theme: 'stripe',
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Finalizar Compra
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Forms */}
                <div>
                    {/* Steps Indicator */}
                    <div className="flex items-center mb-6 text-sm">
                        <div className={`flex items-center ${step >= 1 ? 'text-primary font-bold' : 'text-gray-400'}`}>
                            <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center mr-2">1</span>
                            Envío
                        </div>
                        <div className="w-12 h-0.5 bg-gray-300 mx-4"></div>
                        <div className={`flex items-center ${step >= 2 ? 'text-primary font-bold' : 'text-gray-400'}`}>
                            <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center mr-2">2</span>
                            Pago
                        </div>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleShippingSubmit} className="space-y-4">
                            <h2 className="text-xl font-semibold mb-4">Datos de Envío</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                    placeholder="Para confirmación y seguimiento del pedido"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                    placeholder="Para contacto y seguimiento del envío"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal *</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                            >
                                Continuar al Pago
                            </button>
                        </form>
                    ) : (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Pago Seguro</h2>
                            <div className="mb-4 p-4 bg-gray-50 rounded text-sm text-gray-600">
                                <p>Enviando a: <strong>{formData.address}, {formData.city}</strong></p>
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-primary hover:underline mt-1"
                                >
                                    Editar envío
                                </button>
                            </div>

                            {clientSecret ? (
                                <Elements options={options} stripe={stripePromise}>
                                    <CheckoutForm total={getCartTotal()} onPaymentSuccess={handlePaymentSuccess} />
                                </Elements>
                            ) : (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="animate-spin text-primary" size={32} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Order Summary */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4 sticky top-24">
                        {items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    {item.product.name} ({item.size}) x{item.quantity}
                                </span>
                                <span className="font-medium">
                                    €{(item.product.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}

                        {/* Coupon Input (only show in step 1) */}
                        {step === 1 && (
                            <div className="border-t pt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ¿Tienes un cupón?
                                </label>
                                {!appliedCoupon ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="CÓDIGO"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary font-mono"
                                            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading}
                                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-gray-400 text-sm flex items-center"
                                        >
                                            {couponLoading ? (
                                                <Loader2 className="animate-spin" size={16} />
                                            ) : (
                                                <Tag size={16} />
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <Tag size={16} className="text-green-600" />
                                            <span className="font-mono font-bold text-green-700 text-sm">
                                                {appliedCoupon.code}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>€{getCartTotal().toFixed(2)}</span>
                            </div>

                            {/* Show discount if coupon applied - IMMEDIATE UPDATE */}
                            {appliedCoupon && (
                                <div className="flex justify-between text-green-600 font-medium">
                                    <span>Descuento ({appliedCoupon.code})</span>
                                    <span>-€{appliedCoupon.discountAmount.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-gray-600">
                                <span>Envío</span>
                                <span className="text-green-600">Gratis</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>Total</span>
                                <span>
                                    {appliedCoupon
                                        ? `€${appliedCoupon.newTotal.toFixed(2)}`
                                        : `€${getCartTotal().toFixed(2)}`
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default CheckoutPage;



