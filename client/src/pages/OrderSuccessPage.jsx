import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';

const OrderSuccessPage = () => {
    const location = useLocation();
    const { orderId, total } = location.state || {};

    if (!orderId) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <p className="text-gray-600">No se encontró información del pedido.</p>
                <Link to="/" className="text-primary hover:underline mt-4 inline-block">
                    Volver a la tienda
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-16">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <CheckCircle className="mx-auto h-20 w-20 text-green-500" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    ¡Gracias por tu compra!
                </h1>
                <p className="text-gray-600 mb-8">
                    Tu pedido ha sido procesado exitosamente
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Package className="text-primary" size={24} />
                        <h2 className="text-lg font-semibold">Detalles del Pedido</h2>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Número de Pedido:</span>
                            <span className="font-mono font-medium">#{orderId.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Pagado:</span>
                            <span className="font-bold text-lg">€{total?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Estado:</span>
                            <span className="text-green-600 font-medium">Pagado</span>
                        </div>
                    </div>
                </div>

                <div className="bg-primary-light/50 border border-primary-light rounded-lg p-4 mb-8 text-left">
                    <h3 className="font-semibold text-blue-900 mb-2">Próximos Pasos</h3>
                    <ul className="text-sm text-primary-dark space-y-1">
                        <li>✓ Recibirás un email de confirmación en breve</li>
                        <li>✓ Tu pedido será procesado en 24-48 horas</li>
                        <li>✓ Envío estimado: 3-5 días hábiles</li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                    >
                        Seguir Comprando
                    </Link>
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Imprimir Recibo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;


