import { useState, useEffect } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { Loader2, Lock } from 'lucide-react';

const CheckoutForm = ({ total, onPaymentSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!stripe) {
            return;
        }

        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );

        if (!clientSecret) {
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            switch (paymentIntent.status) {
                case "succeeded":
                    setMessage("Pago completado con éxito.");
                    break;
                case "processing":
                    setMessage("Tu pago se está procesando.");
                    break;
                case "requires_payment_method":
                    setMessage("El pago no tuvo éxito, por favor intenta de nuevo.");
                    break;
                default:
                    setMessage("Algo salió mal.");
                    break;
            }
        });
    }, [stripe]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL where the user is redirected after the payment
                return_url: "http://localhost:5173/order-success",
            },
            redirect: "if_required" // Handle redirect manually if needed, or let Stripe handle it
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
            } else {
                setMessage("Ocurrió un error inesperado.");
            }
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            // Payment successful, notify parent to create order in DB
            onPaymentSuccess(paymentIntent.id);
            setIsLoading(false);
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
            </div>

            {message && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                    {message}
                </div>
            )}

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Procesando...
                    </>
                ) : (
                    <>
                        <Lock size={20} />
                        Pagar €{total.toFixed(2)}
                    </>
                )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
                <Lock size={12} />
                <span>Pagos seguros encriptados con SSL</span>
            </div>
        </form>
    );
};

export default CheckoutForm;


