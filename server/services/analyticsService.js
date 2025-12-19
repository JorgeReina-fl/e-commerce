const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');

class AnalyticsService {
    /**
     * Get top selling products
     */
    async getTopProducts(limit = 10, startDate = null, endDate = null) {
        const matchStage = { status: { $in: ['pagado', 'enviado', 'entregado'] } };

        if (startDate && endDate) {
            matchStage.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const topProducts = await Order.aggregate([
            { $match: matchStage },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } }
        ]);

        return topProducts.map(item => ({
            productId: item._id,
            name: item.productInfo?.name || 'Producto eliminado',
            image: item.productInfo?.image || '',
            totalQuantity: item.totalQuantity,
            totalRevenue: item.totalRevenue,
            orderCount: item.orderCount,
            averagePrice: item.totalRevenue / item.totalQuantity
        }));
    }

    /**
     * Get cart abandonment analysis
     */
    async getCartAbandonment(startDate = null, endDate = null) {
        const matchStage = { 'items.0': { $exists: true } }; // Has at least one item

        if (startDate && endDate) {
            matchStage.updatedAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // Get all carts with items
        const carts = await Cart.find(matchStage).populate('items.product');

        // Get completed orders in the same period
        const orderMatchStage = { status: { $in: ['pagado', 'enviado', 'entregado'] } };
        if (startDate && endDate) {
            orderMatchStage.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        const completedOrders = await Order.countDocuments(orderMatchStage);

        // Calculate abandoned carts (carts that haven't resulted in orders)
        const userIdsWithOrders = await Order.distinct('user', orderMatchStage);
        const abandonedCarts = carts.filter(cart =>
            cart.user && !userIdsWithOrders.some(id => id.toString() === cart.user.toString())
        );

        // Calculate total value of abandoned carts
        const abandonedValue = abandonedCarts.reduce((sum, cart) => {
            const cartValue = cart.items.reduce((itemSum, item) => {
                return itemSum + (item.product?.price || 0) * item.quantity;
            }, 0);
            return sum + cartValue;
        }, 0);

        const totalCarts = carts.length;
        const abandonmentRate = totalCarts > 0 ? (abandonedCarts.length / totalCarts) * 100 : 0;

        return {
            totalCarts,
            abandonedCarts: abandonedCarts.length,
            completedOrders,
            abandonmentRate: parseFloat(abandonmentRate.toFixed(2)),
            abandonedValue: parseFloat(abandonedValue.toFixed(2)),
            averageAbandonedValue: abandonedCarts.length > 0
                ? parseFloat((abandonedValue / abandonedCarts.length).toFixed(2))
                : 0
        };
    }

    /**
     * Get customer segmentation (RFM Analysis)
     */
    async getCustomerSegmentation() {
        const now = new Date();

        const customers = await Order.aggregate([
            { $match: { user: { $exists: true }, status: { $in: ['pagado', 'enviado', 'entregado'] } } },
            {
                $group: {
                    _id: '$user',
                    recency: { $max: '$createdAt' }, // Most recent order date
                    frequency: { $sum: 1 }, // Number of orders
                    monetary: { $sum: '$total' } // Total spent
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } }
        ]);

        // Calculate recency in days
        const customersWithMetrics = customers.map(customer => {
            const recencyDays = Math.floor((now - new Date(customer.recency)) / (1000 * 60 * 60 * 24));
            return {
                userId: customer._id,
                name: customer.userInfo?.name || 'Usuario eliminado',
                email: customer.userInfo?.email || '',
                recency: recencyDays,
                frequency: customer.frequency,
                monetary: parseFloat(customer.monetary.toFixed(2))
            };
        });

        // Segment customers
        const segments = {
            champions: [], // High frequency, high monetary, low recency
            loyalCustomers: [], // High frequency, medium monetary
            potentialLoyalists: [], // Medium frequency, medium monetary, low recency
            atRisk: [], // High frequency, high monetary, high recency
            needsAttention: [], // Medium frequency, medium monetary, high recency
            aboutToSleep: [], // Low frequency, low monetary, medium recency
            hibernating: [] // Low frequency, low monetary, high recency
        };

        // Simple segmentation logic
        customersWithMetrics.forEach(customer => {
            if (customer.frequency >= 5 && customer.monetary >= 500 && customer.recency <= 30) {
                segments.champions.push(customer);
            } else if (customer.frequency >= 3 && customer.recency <= 60) {
                segments.loyalCustomers.push(customer);
            } else if (customer.frequency >= 2 && customer.recency <= 90) {
                segments.potentialLoyalists.push(customer);
            } else if (customer.frequency >= 3 && customer.recency > 90) {
                segments.atRisk.push(customer);
            } else if (customer.frequency >= 2 && customer.recency > 60) {
                segments.needsAttention.push(customer);
            } else if (customer.frequency === 1 && customer.recency > 90) {
                segments.hibernating.push(customer);
            } else {
                segments.aboutToSleep.push(customer);
            }
        });

        return {
            totalCustomers: customersWithMetrics.length,
            segments: {
                champions: { count: segments.champions.length, customers: segments.champions.slice(0, 10) },
                loyalCustomers: { count: segments.loyalCustomers.length, customers: segments.loyalCustomers.slice(0, 10) },
                potentialLoyalists: { count: segments.potentialLoyalists.length, customers: segments.potentialLoyalists.slice(0, 10) },
                atRisk: { count: segments.atRisk.length, customers: segments.atRisk.slice(0, 10) },
                needsAttention: { count: segments.needsAttention.length, customers: segments.needsAttention.slice(0, 10) },
                aboutToSleep: { count: segments.aboutToSleep.length, customers: segments.aboutToSleep.slice(0, 10) },
                hibernating: { count: segments.hibernating.length, customers: segments.hibernating.slice(0, 10) }
            }
        };
    }

    /**
     * Get comprehensive KPIs
     */
    async getKPIs(startDate = null, endDate = null) {
        const matchStage = {};
        if (startDate && endDate) {
            matchStage.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // Total revenue
        const revenueData = await Order.aggregate([
            { $match: { ...matchStage, status: { $in: ['pagado', 'enviado', 'entregado'] } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total' },
                    orderCount: { $sum: 1 },
                    averageOrderValue: { $avg: '$total' }
                }
            }
        ]);

        // New customers
        const newCustomers = await User.countDocuments(matchStage);

        // Product stats
        const totalProducts = await Product.countDocuments();
        const lowStockProducts = await Product.countDocuments({
            $expr: {
                $lte: [
                    { $sum: '$sizeStock.stock' },
                    10
                ]
            }
        });

        const revenue = revenueData[0] || { totalRevenue: 0, orderCount: 0, averageOrderValue: 0 };

        return {
            totalRevenue: parseFloat(revenue.totalRevenue.toFixed(2)),
            totalOrders: revenue.orderCount,
            averageOrderValue: parseFloat(revenue.averageOrderValue.toFixed(2)),
            newCustomers,
            totalProducts,
            lowStockProducts,
            conversionRate: 0 // Can be calculated with more data
        };
    }

    /**
     * Get revenue trends by day/week/month
     */
    async getRevenueTrends(period = 'day', limit = 30) {
        const groupFormat = period === 'day'
            ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            : period === 'week'
                ? { $dateToString: { format: '%Y-W%V', date: '$createdAt' } }
                : { $dateToString: { format: '%Y-%m', date: '$createdAt' } };

        const trends = await Order.aggregate([
            { $match: { status: { $in: ['pagado', 'enviado', 'entregado'] } } },
            {
                $group: {
                    _id: groupFormat,
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } },
            { $limit: limit }
        ]);

        return trends.reverse().map(item => ({
            period: item._id,
            revenue: parseFloat(item.revenue.toFixed(2)),
            orders: item.orders
        }));
    }
}

module.exports = new AnalyticsService();
