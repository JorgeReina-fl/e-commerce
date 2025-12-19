import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle } from 'lucide-react';

const CartPage = () => {
    const { items, removeItem, updateQuantity, getCartTotal, clearCart, getProductStock } = useCart();

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Tu carrito está vacío
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    ¡Agrega algunos productos para empezar!
                </p>
                <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                    Ir a la tienda
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Carrito de Compras
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item, index) => {
                        const maxStock = getProductStock(item.product, item.size, item.product.selectedColor, item.product.selectedMaterial);
                        const isAtMaxStock = item.quantity >= maxStock;
                        const isLowStock = maxStock > 0 && maxStock <= 3;
                        const isOutOfStock = maxStock === 0;

                        return (
                            <div
                                key={index}
                                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex gap-4 ${isOutOfStock ? 'border-2 border-red-300' : ''}`}
                            >
                                {/* Product Image */}
                                {item.product.image ? (
                                    <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="w-24 h-24 object-cover rounded"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500 text-xs text-center p-1">
                                        Sin imagen
                                    </div>
                                )}

                                {/* Product Info */}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {item.product.name}
                                    </h3>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                                        <p>Talla: <span className="font-medium">{item.size}</span></p>
                                        {item.color && (
                                            <p>Color: <span className="font-medium">{item.color}</span></p>
                                        )}
                                        {item.material && (
                                            <p>Material: <span className="font-medium">{item.material}</span></p>
                                        )}
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                                        €{item.product.price.toFixed(2)}
                                    </p>

                                    {/* Stock Warning Messages */}
                                    {isOutOfStock && (
                                        <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                                            <AlertCircle size={14} />
                                            <span>Producto agotado</span>
                                        </div>
                                    )}
                                    {!isOutOfStock && isLowStock && (
                                        <p className="text-orange-500 text-sm mt-1">
                                            ¡Solo quedan {maxStock}!
                                        </p>
                                    )}
                                    {isAtMaxStock && !isOutOfStock && (
                                        <p className="text-blue-600 text-sm mt-1">
                                            Máximo disponible
                                        </p>
                                    )}
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex flex-col items-end justify-between">
                                    <button
                                        onClick={() => removeItem(index)}
                                        className="text-red-600 hover:text-red-700 p-2"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={20} />
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(index, item.quantity - 1)}
                                            className="p-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(index, item.quantity + 1)}
                                            className="p-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isAtMaxStock || isOutOfStock}
                                            title={isAtMaxStock ? `Máximo: ${maxStock}` : ''}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <button
                        onClick={clearCart}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                        Vaciar carrito
                    </button>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-20">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Resumen del Pedido
                        </h2>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span>€{getCartTotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Envío</span>
                                <span className="text-green-600">Gratis</span>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                                <span>Total</span>
                                <span>€{getCartTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        <Link
                            to="/checkout"
                            className="block w-full py-3 bg-primary text-white text-center rounded-lg hover:bg-primary-hover transition-colors font-medium"
                        >
                            Proceder al Pago
                        </Link>

                        <Link
                            to="/"
                            className="block w-full mt-3 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Seguir Comprando
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
