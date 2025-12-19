const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');
const notificationService = require('../services/notificationService');

// @route   GET /api/notifications
// @desc    Get user notifications (paginated)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Notification.countDocuments({ user: req.user._id });
        const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

        res.json({
            notifications,
            total,
            unreadCount,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.read = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, read: false },
            { $set: { read: true } }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/notifications/vapid-public-key
// @desc    Get VAPID public key for push subscriptions
// @access  Public
router.get('/vapid-public-key', (req, res) => {
    res.json({ publicKey: notificationService.getVapidPublicKey() });
});

// @route   POST /api/notifications/subscribe
// @desc    Subscribe to push notifications
// @access  Private
router.post('/subscribe', protect, async (req, res) => {
    try {
        const { endpoint, keys } = req.body;

        if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
            return res.status(400).json({ message: 'Invalid subscription data' });
        }

        // Check if subscription already exists
        const existingSubscription = await PushSubscription.findOne({ endpoint });

        if (existingSubscription) {
            // Update user if changed
            if (existingSubscription.user.toString() !== req.user._id.toString()) {
                existingSubscription.user = req.user._id;
                await existingSubscription.save();
            }
            return res.json({ message: 'Subscription already exists' });
        }

        // Create new subscription
        const subscription = new PushSubscription({
            user: req.user._id,
            endpoint,
            keys: {
                p256dh: keys.p256dh,
                auth: keys.auth
            }
        });

        await subscription.save();
        res.status(201).json({ message: 'Subscribed to push notifications' });
    } catch (error) {
        console.error('Error subscribing to push:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/notifications/subscribe
// @desc    Unsubscribe from push notifications
// @access  Private
router.delete('/subscribe', protect, async (req, res) => {
    try {
        const { endpoint } = req.body;

        if (!endpoint) {
            return res.status(400).json({ message: 'Endpoint required' });
        }

        await PushSubscription.findOneAndDelete({
            user: req.user._id,
            endpoint
        });

        res.json({ message: 'Unsubscribed from push notifications' });
    } catch (error) {
        console.error('Error unsubscribing:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
