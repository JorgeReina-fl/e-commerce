import { X, Package, MapPin, CreditCard } from 'lucide-react';

const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
                    {/* Header */}
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Detalles del Pedido #{order._id.slice(-6).toUpperCase()}
                            </h3>
                            <button
                                onClick={onClose}
                                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Realizado el {new Date(order.createdAt).toLocaleDateString()} a las {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                    </div>

                    {/* Body */}
                    <div className="bg-gray-50 px-4 py-5 sm:p-6">
                        {/* Items List */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                <Package size={16} className="mr-2" />
                                Productos
                            </h4>
                            <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-200">
                                <ul className="divide-y divide-gray-200">
                                    {order.items.map((item, index) => (
                                        <li key={index} className="px-4 py-3 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                                                    <Package size={20} />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Producto ID: {item.product}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Talla: {item.size} | Cantidad: {item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                €{(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shipping Info */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                    <MapPin size={16} className="mr-2" />
                                    Dirección de Envío
                                </h4>
                                <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200 text-sm text-gray-600">
                                    <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                                    <p>{order.shippingAddress.address}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                    <CreditCard size={16} className="mr-2" />
                                    Resumen
                                </h4>
                                <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200">
                                    <div className="flex justify-between py-1 text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">€{order.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between py-1 text-sm">
                                        <span className="text-gray-600">Envío</span>
                                        <span className="font-medium">Gratis</span>
                                    </div>
                                    <div className="border-t border-gray-100 my-2 pt-2 flex justify-between items-center">
                                        <span className="text-base font-bold text-gray-900">Total</span>
                                        <span className="text-base font-bold text-primary">€{order.total.toFixed(2)}</span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${order.status === 'pagado' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            Estado: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;


