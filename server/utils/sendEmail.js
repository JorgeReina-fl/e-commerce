const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Check if SMTP is configured
    if (!process.env.EMAIL_HOST) {
        console.log('----------------------------------------------------');
        console.log('WARNING: EMAIL_HOST not configured. Email would be sent to:', options.to);
        console.log('Subject:', options.subject);
        console.log('Content:', options.htmlContent);
        console.log('----------------------------------------------------');
        return;
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

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
