const StockAlert = require('../models/StockAlert');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

/**
 * Check and send stock notifications when a product's stock is updated
 * @param {Object} product - The product that was updated
 * @param {Array} updatedSizes - Array of {size, stock} that were updated
 */
const checkAndSendStockNotifications = async (product, updatedSizes = []) => {
    try {
        // Find sizes that now have stock
        const sizesWithStock = updatedSizes.filter(s => s.stock > 0).map(s => s.size);

        if (sizesWithStock.length === 0) {
            return { notified: 0 };
        }

        // Find all active, non-notified alerts for this product
        const alerts = await StockAlert.find({
            product: product._id,
            active: true,
            notified: false,
            $or: [
                { size: null }, // Alerts for any size
                { size: { $in: sizesWithStock } } // Alerts for specific sizes
            ]
        }).populate('user', 'name email');

        if (alerts.length === 0) {
            return { notified: 0 };
        }

        let notifiedCount = 0;

        for (const alert of alerts) {
            try {
                // Create in-app notification
                await Notification.create({
                    user: alert.user._id,
                    title: '¡Producto disponible!',
                    message: `${product.name} vuelve a estar disponible${alert.size ? ` en talla ${alert.size}` : ''}.`,
                    type: 'stock_alert',
                    link: `/product/${product._id}`,
                    metadata: {
                        productId: product._id,
                        productName: product.name,
                        productImage: product.image,
                        size: alert.size
                    }
                });

                // Send email notification
                const emailContent = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2563eb;">¡Buenas noticias, ${alert.user.name}!</h2>
                        <p style="font-size: 16px; color: #374151;">
                            El producto que estabas esperando vuelve a estar disponible:
                        </p>
                        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <img src="${product.image}" alt="${product.name}" style="max-width: 200px; border-radius: 8px;"/>
                            <h3 style="margin: 10px 0 5px;">${product.name}</h3>
                            <p style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 5px 0;">
                                €${product.price.toFixed(2)}
                            </p>
                            ${alert.size ? `<p style="color: #6b7280;">Talla: ${alert.size}</p>` : ''}
                        </div>
                        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/product/${product._id}" 
                           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Ver Producto
                        </a>
                        <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                            Has recibido este email porque activaste alertas de stock en LuxeThread.
                        </p>
                    </div>
                `;

                await sendEmail({
                    to: alert.email,
                    subject: `¡${product.name} vuelve a estar disponible! - LuxeThread`,
                    htmlContent: emailContent
                });

                // Mark alert as notified
                alert.notified = true;
                alert.notifiedAt = new Date();
                await alert.save();

                notifiedCount++;
            } catch (alertError) {
                console.error(`Error notifying alert ${alert._id}:`, alertError);
            }
        }

        return { notified: notifiedCount };
    } catch (error) {
        console.error('Stock notification service error:', error);
        return { notified: 0, error: error.message };
    }
};

/**
 * Get pending alerts count for a product
 */
const getPendingAlertsCount = async (productId) => {
    return await StockAlert.countDocuments({
        product: productId,
        active: true,
        notified: false
    });
};

module.exports = {
    checkAndSendStockNotifications,
    getPendingAlertsCount
};
