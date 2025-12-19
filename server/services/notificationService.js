const webPush = require('web-push');
const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');
const nodemailer = require('nodemailer');

// VAPID keys for web push (should be in .env in production)
const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDSxPJSXewk2Bn5k33ijC1xdI6LJEkjcGPQEWvLYqXrs',
    privateKey: process.env.VAPID_PRIVATE_KEY || 'UUxEK6J3dP6h3fFLdSqBm2sK8YGN5TqeN-wC_3OvTTU'
};

webPush.setVapidDetails(
    'mailto:admin@luxethread.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// Email transporter (using existing nodemailer config)
// Only create if email credentials are provided
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

class NotificationService {
    /**
     * Create a notification in the database
     */
    async createNotification(userId, type, title, message, link = '') {
        try {
            const notification = new Notification({
                user: userId,
                type,
                title,
                message,
                link
            });
            await notification.save();
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Send push notification to user's subscribed devices
     */
    async sendPushNotification(userId, title, message, link = '') {
        try {
            const subscriptions = await PushSubscription.find({ user: userId });

            const payload = JSON.stringify({
                title,
                body: message,
                icon: '/icon-192x192.png',
                badge: '/badge-72x72.png',
                data: { url: link }
            });

            const sendPromises = subscriptions.map(async (subscription) => {
                try {
                    await webPush.sendNotification({
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.keys.p256dh,
                            auth: subscription.keys.auth
                        }
                    }, payload);
                } catch (error) {
                    // If subscription is invalid, remove it
                    if (error.statusCode === 410) {
                        await PushSubscription.findByIdAndDelete(subscription._id);
                    }
                    console.error('Push notification error:', error);
                }
            });

            await Promise.all(sendPromises);
        } catch (error) {
            console.error('Error sending push notifications:', error);
        }
    }

    /**
     * Send email notification
     */
    async sendEmail(to, subject, html) {
        try {
            if (!transporter) {
                console.log('Email not configured, skipping email send');
                return;
            }

            await transporter.sendMail({
                from: `"LuxeThread" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html
            });
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }

    /**
     * Send notification via all available channels
     */
    async sendNotification(userId, type, title, message, link = '', email = null, emailSubject = null, emailHtml = null) {
        try {
            // Create DB notification
            await this.createNotification(userId, type, title, message, link);

            // Send push notification
            await this.sendPushNotification(userId, title, message, link);

            // Send email if provided
            if (email && emailSubject && emailHtml) {
                await this.sendEmail(email, emailSubject, emailHtml);
            }
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }

    /**
     * Get VAPID public key for frontend
     */
    getVapidPublicKey() {
        return vapidKeys.publicKey;
    }
}

module.exports = new NotificationService();
