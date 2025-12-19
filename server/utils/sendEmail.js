const nodemailer = require('nodemailer');

/**
 * Send email using Nodemailer
 * 
 * IMPORTANT: For Render.com deployment, use Brevo (Sendinblue) instead of Gmail
 * because Render blocks standard SMTP ports (25, 465, 587).
 * 
 * Brevo Setup (FREE - 300 emails/day):
 * 1. Create account at brevo.com
 * 2. Go to SMTP & API > SMTP
 * 3. Get your SMTP key
 * 4. Set these env vars in Render:
 *    - EMAIL_HOST=smtp-relay.brevo.com
 *    - EMAIL_PORT=587
 *    - EMAIL_USER=your-brevo-login-email
 *    - EMAIL_PASS=your-brevo-smtp-key
 *    - FROM_EMAIL=your-verified-sender@domain.com
 *    - FROM_NAME=LuxeThread
 */

const sendEmail = async (options) => {
    // Check if SMTP is configured
    if (!process.env.EMAIL_HOST) {
        console.log('----------------------------------------------------');
        console.log('[EMAIL] WARNING: EMAIL_HOST not configured.');
        console.log('[EMAIL] To enable emails, set up Brevo (recommended for Render):');
        console.log('[EMAIL]   EMAIL_HOST=smtp-relay.brevo.com');
        console.log('[EMAIL]   EMAIL_PORT=587');
        console.log('[EMAIL] Email would be sent to:', options.to);
        console.log('[EMAIL] Subject:', options.subject);
        console.log('----------------------------------------------------');
        return;
    }

    const port = parseInt(process.env.EMAIL_PORT) || 587;

    // Create transporter with optimized settings for cloud providers
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: port,
        secure: port === 465, // true only for port 465
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        // Extended timeouts for cloud environments
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 30000,
        socketTimeout: 30000,
        // TLS settings
        tls: {
            rejectUnauthorized: true, // Keep true for production security
            minVersion: 'TLSv1.2'
        },
        // Debug in development
        debug: process.env.NODE_ENV !== 'production',
        logger: process.env.NODE_ENV !== 'production'
    });

    // Verify connection (with graceful handling)
    try {
        await transporter.verify();
        console.log('[EMAIL] ✓ SMTP connection verified');
    } catch (verifyError) {
        console.error('[EMAIL] ✗ SMTP verification failed:', verifyError.message);
        console.error('[EMAIL] Host:', process.env.EMAIL_HOST, 'Port:', port);
        throw new Error(`SMTP connection failed: ${verifyError.message}`);
    }

    // Email Template
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
                background-color: #1a1a1a;
                color: #ffffff;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .content {
                padding: 40px 30px;
            }
            .footer {
                background-color: #f9f9f9;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #888;
            }
            .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #000;
                color: #fff;
                text-decoration: none;
                border-radius: 4px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>LuxeThread</h1>
            </div>
            <div class="content">
                ${options.htmlContent}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} LuxeThread. Todos los derechos reservados.</p>
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Send email
    const info = await transporter.sendMail({
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: htmlTemplate
    });

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
