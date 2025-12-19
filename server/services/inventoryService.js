const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');

/**
 * Log a stock movement
 */
const logStockMovement = async ({
    productId,
    type,
    quantity,
    previousStock,
    newStock,
    color = null,
    material = null,
    size = null,
    reason = '',
    orderId = null,
    userId = null
}) => {
    try {
        const movement = await StockMovement.create({
            product: productId,
            type,
            quantity,
            previousStock,
            newStock,
            color,
            material,
            size,
            reason,
            order: orderId,
            user: userId
        });

        // Check if product is now below low stock threshold
        const product = await Product.findById(productId);
        if (product && newStock <= product.lowStockThreshold) {
            // Trigger low stock alert (async, don't wait)
            sendLowStockAlert(product, size, newStock).catch(console.error);
        }

        return movement;
    } catch (error) {
        console.error('Error logging stock movement:', error);
        throw error;
    }
};

/**
 * Send low stock alert email to admin
 */
const sendLowStockAlert = async (product, size, currentStock) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            console.log('ADMIN_EMAIL not configured, skipping low stock alert');
            return;
        }

        await sendEmail({
            to: adminEmail,
            subject: `⚠️ Stock Bajo: ${product.name}`,
            htmlContent: `
                <h2>Alerta de Stock Bajo</h2>
                <p>El siguiente producto tiene stock bajo:</p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Producto:</strong> ${product.name}</p>
                    ${size ? `<p><strong>Talla:</strong> ${size}</p>` : ''}
                    <p><strong>Stock Actual:</strong> <span style="color: #dc3545; font-weight: bold;">${currentStock}</span></p>
                    <p><strong>Umbral Mínimo:</strong> ${product.lowStockThreshold}</p>
                </div>
                <p>Considera reabastecer este producto pronto.</p>
            `
        });

        console.log(`Low stock alert sent for product: ${product.name}`);
    } catch (error) {
        console.error('Error sending low stock alert:', error);
    }
};

/**
 * Get products with low stock
 */
const getLowStockProducts = async () => {
    try {
        const products = await Product.find({}).lean();
        const lowStockProducts = [];

        for (const product of products) {
            // Check sizeStock for products using legacy stock
            if (product.sizeStock && product.sizeStock.length > 0) {
                const lowStockSizes = product.sizeStock.filter(
                    ss => ss.stock <= (product.lowStockThreshold || 5) && ss.stock > 0
                );
                const outOfStockSizes = product.sizeStock.filter(ss => ss.stock === 0);

                if (lowStockSizes.length > 0 || outOfStockSizes.length > 0) {
                    lowStockProducts.push({
                        ...product,
                        lowStockSizes,
                        outOfStockSizes,
                        totalStock: product.sizeStock.reduce((sum, ss) => sum + ss.stock, 0)
                    });
                }
            }

            // Check inventory for products using new inventory system
            if (product.inventory && product.inventory.length > 0) {
                const lowStockItems = product.inventory.filter(
                    inv => inv.stock <= (product.lowStockThreshold || 5) && inv.stock > 0
                );
                const outOfStockItems = product.inventory.filter(inv => inv.stock === 0);

                if (lowStockItems.length > 0 || outOfStockItems.length > 0) {
                    lowStockProducts.push({
                        ...product,
                        lowStockItems,
                        outOfStockItems,
                        totalStock: product.inventory.reduce((sum, inv) => sum + inv.stock, 0)
                    });
                }
            }
        }

        // Sort by total stock (lowest first)
        return lowStockProducts.sort((a, b) => a.totalStock - b.totalStock);
    } catch (error) {
        console.error('Error getting low stock products:', error);
        throw error;
    }
};

/**
 * Get restock suggestions
 */
const getRestockSuggestions = async () => {
    try {
        const products = await Product.find({ autoRestockEnabled: true }).lean();
        const suggestions = [];

        for (const product of products) {
            const restockLevel = product.autoRestockLevel || 20;

            if (product.sizeStock && product.sizeStock.length > 0) {
                const sizesToRestock = product.sizeStock
                    .filter(ss => ss.stock < restockLevel)
                    .map(ss => ({
                        size: ss.size,
                        currentStock: ss.stock,
                        suggestedRestock: restockLevel - ss.stock
                    }));

                if (sizesToRestock.length > 0) {
                    suggestions.push({
                        product: {
                            _id: product._id,
                            name: product.name,
                            image: product.image,
                            category: product.category
                        },
                        restockLevel,
                        sizesToRestock
                    });
                }
            }

            if (product.inventory && product.inventory.length > 0) {
                const itemsToRestock = product.inventory
                    .filter(inv => inv.stock < restockLevel)
                    .map(inv => ({
                        color: inv.color,
                        material: inv.material,
                        size: inv.size,
                        currentStock: inv.stock,
                        suggestedRestock: restockLevel - inv.stock
                    }));

                if (itemsToRestock.length > 0) {
                    suggestions.push({
                        product: {
                            _id: product._id,
                            name: product.name,
                            image: product.image,
                            category: product.category
                        },
                        restockLevel,
                        itemsToRestock
                    });
                }
            }
        }

        return suggestions;
    } catch (error) {
        console.error('Error getting restock suggestions:', error);
        throw error;
    }
};

module.exports = {
    logStockMovement,
    sendLowStockAlert,
    getLowStockProducts,
    getRestockSuggestions
};
