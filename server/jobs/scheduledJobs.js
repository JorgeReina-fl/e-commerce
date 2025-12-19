const cron = require('node-cron');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const notificationService = require('../services/notificationService');
const emailTemplates = require('../services/emailTemplates');

/**
 * Check for abandoned carts and send reminders
 * Runs every hour
 */
const abandonedCartJob = cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running abandoned cart check...');

    try {
        // Find carts that were updated more than 24 hours ago
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const abandonedCarts = await Cart.find({
            updatedAt: { $lt: twentyFourHoursAgo },
            'items.0': { $exists: true } // Has at least one item
        }).populate('user').populate('items.product');

        for (const cart of abandonedCarts) {
            if (!cart.user) continue;

            // Check if user has placed an order since cart was last updated
            const recentOrder = await Order.findOne({
                user: cart.user._id,
                createdAt: { $gt: cart.updatedAt }
            });

            if (recentOrder) continue; // User already ordered, skip reminder

            // Check if we already sent a reminder (by checking recent notifications)
            const Notification = require('../models/Notification');
            const recentReminder = await Notification.findOne({
                user: cart.user._id,
                type: 'cart_reminder',
                createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            });

            if (recentReminder) continue; // Already reminded in last 24h

            // Calculate cart total
            const cartTotal = cart.items.reduce((sum, item) => {
                return sum + (item.product.price * item.quantity);
            }, 0);

            // Send notification
            await notificationService.sendNotification(
                cart.user._id,
                'cart_reminder',
                '¡Tu carrito te está esperando!',
                `Tienes ${cart.items.length} ${cart.items.length === 1 ? 'artículo' : 'artículos'} en tu carrito`,
                '/cart',
                cart.user.email,
                'No olvides completar tu compra en LuxeThread',
                emailTemplates.abandonedCartEmail(cart.user.name, cart.items, cartTotal)
            );

            console.log(`[CRON] Sent abandoned cart reminder to ${cart.user.email}`);
        }

        console.log(`[CRON] Abandoned cart check complete. Processed ${abandonedCarts.length} carts.`);
    } catch (error) {
        console.error('[CRON] Error in abandoned cart job:', error);
    }
}, {
    scheduled: false // Don't start automatically
});

/**
 * Monitor wishlist items for price drops
 * Runs daily at midnight
 */
const priceMonitorJob = cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running price monitoring...');

    try {
        const wishlists = await Wishlist.find({
            'items.0': { $exists: true }
        }).populate('user').populate('items.product');

        for (const wishlist of wishlists) {
            if (!wishlist.user) continue;

            for (const item of wishlist.items) {
                if (!item.product) continue;

                // Check if we have a saved price to compare
                if (item.lastPrice && item.product.price < item.lastPrice) {
                    const priceDropPercent = ((item.lastPrice - item.product.price) / item.lastPrice * 100).toFixed(0);

                    // Only notify for price drops of 5% or more
                    if (priceDropPercent >= 5) {
                        // Send notification
                        await notificationService.sendNotification(
                            wishlist.user._id,
                            'price_drop',
                            '¡Bajada de precio!',
                            `${item.product.name} ahora está €${item.product.price.toFixed(2)} (${priceDropPercent}% menos)`,
                            `/product/${item.product._id}`,
                            wishlist.user.email,
                            `¡${item.product.name} ha bajado de precio!`,
                            emailTemplates.priceDropEmail(
                                wishlist.user.name,
                                item.product,
                                item.lastPrice,
                                item.product.price
                            )
                        );

                        console.log(`[CRON] Sent price drop alert for ${item.product.name} to ${wishlist.user.email}`);
                    }
                }

                // Update last price for next check
                item.lastPrice = item.product.price;
            }

            await wishlist.save();
        }

        console.log(`[CRON] Price monitoring complete. Checked ${wishlists.length} wishlists.`);
    } catch (error) {
        console.error('[CRON] Error in price monitoring job:', error);
    }
}, {
    scheduled: false // Don't start automatically
});

/**
 * Wishlist reminder - remind users of items they saved
 * Runs weekly on Sundays at 10 AM
 */
const wishlistReminderJob = cron.schedule('0 10 * * 0', async () => {
    console.log('[CRON] Running wishlist reminder check...');

    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const Notification = require('../models/Notification');

        // Find wishlists with items added more than 7 days ago
        const wishlists = await Wishlist.find({
            'items.0': { $exists: true },
            'items.addedAt': { $lt: sevenDaysAgo }
        }).populate('user').populate('items.product');

        for (const wishlist of wishlists) {
            if (!wishlist.user || !wishlist.user.email) continue;

            // Check if we already sent a wishlist reminder in the last 7 days
            const recentReminder = await Notification.findOne({
                user: wishlist.user._id,
                type: 'wishlist_reminder',
                createdAt: { $gt: sevenDaysAgo }
            });

            if (recentReminder) continue; // Already reminded recently

            // Get items added more than 7 days ago that are still in stock
            const oldItems = wishlist.items.filter(item => {
                if (!item.product) return false;
                const addedDate = new Date(item.addedAt);
                return addedDate < sevenDaysAgo;
            }).slice(0, 4); // Limit to 4 items for email

            if (oldItems.length === 0) continue;

            // Check if user has ordered any of these products recently
            const productIds = oldItems.map(item => item.product._id);
            const recentOrder = await Order.findOne({
                user: wishlist.user._id,
                'items.product': { $in: productIds },
                createdAt: { $gt: sevenDaysAgo }
            });

            if (recentOrder) continue; // User already ordered some of these

            // Send notification
            await notificationService.sendNotification(
                wishlist.user._id,
                'wishlist_reminder',
                '¡Tu wishlist te espera!',
                `Tienes ${oldItems.length} ${oldItems.length === 1 ? 'producto esperándote' : 'productos esperándote'}`,
                '/wishlist',
                wishlist.user.email,
                '¿Sigues interesado en estos productos?',
                emailTemplates.wishlistReminderEmail(wishlist.user.name, oldItems)
            );

            console.log(`[CRON] Sent wishlist reminder to ${wishlist.user.email}`);
        }

        console.log(`[CRON] Wishlist reminder check complete. Processed ${wishlists.length} wishlists.`);
    } catch (error) {
        console.error('[CRON] Error in wishlist reminder job:', error);
    }
}, {
    scheduled: false // Don't start automatically
});

/**
 * Weekly newsletter with new arrivals
 * Runs every Friday at 10 AM
 */
const newsletterJob = cron.schedule('0 10 * * 5', async () => {
    console.log('[CRON] Running weekly newsletter...');

    try {
        const Subscriber = require('../models/Subscriber');

        // Get new products from the last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newProducts = await Product.find({
            createdAt: { $gte: sevenDaysAgo }
        }).sort({ createdAt: -1 }).limit(6);

        if (newProducts.length === 0) {
            console.log('[CRON] No new products to feature in newsletter.');
            return;
        }

        // Get all active subscribers
        const subscribers = await Subscriber.find({ isActive: true });

        if (subscribers.length === 0) {
            console.log('[CRON] No active subscribers.');
            return;
        }

        const sendEmail = require('../utils/sendEmail');
        const emailHtml = emailTemplates.newArrivalsEmail(newProducts);

        let sent = 0;
        let failed = 0;

        for (const subscriber of subscribers) {
            try {
                await sendEmail({
                    to: subscriber.email,
                    subject: '✨ Nuevas llegadas en LuxeThread',
                    htmlContent: emailHtml
                });
                sent++;
            } catch (error) {
                console.error(`[CRON] Failed to send newsletter to ${subscriber.email}:`, error.message);
                failed++;
            }
        }

        console.log(`[CRON] Newsletter sent. Success: ${sent}, Failed: ${failed}`);
    } catch (error) {
        console.error('[CRON] Error in newsletter job:', error);
    }
}, {
    scheduled: false // Don't start automatically
});

/**
 * Start all scheduled jobs
 */
function startScheduledJobs() {
    console.log('[CRON] Starting scheduled jobs...');
    abandonedCartJob.start();
    priceMonitorJob.start();
    wishlistReminderJob.start();
    newsletterJob.start();
    console.log('[CRON] ✅ Abandoned cart job scheduled (hourly)');
    console.log('[CRON] ✅ Price monitoring job scheduled (daily at midnight)');
    console.log('[CRON] ✅ Wishlist reminder job scheduled (weekly on Sundays at 10 AM)');
    console.log('[CRON] ✅ Newsletter job scheduled (weekly on Fridays at 10 AM)');
}

/**
 * Stop all scheduled jobs
 */
function stopScheduledJobs() {
    console.log('[CRON] Stopping scheduled jobs...');
    abandonedCartJob.stop();
    priceMonitorJob.stop();
    wishlistReminderJob.stop();
    newsletterJob.stop();
}

module.exports = {
    startScheduledJobs,
    stopScheduledJobs
};

