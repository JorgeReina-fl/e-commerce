/**
 * Email templates for various notification types
 * Uses centralized branding configuration
 */

const { branding, getEmailHeader, getEmailFooter, getEmailButton, getEmailWrapper } = require('../config/branding');

/**
 * Abandoned cart email template
 */
exports.abandonedCartEmail = (userName, cartItems, cartTotal) => {
    const itemsHtml = cartItems.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid ${branding.colors.border};">
                <img src="${item.product.image}" alt="${item.product.name}" 
                     style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; vertical-align: middle;">
            </td>
            <td style="padding: 10px; border-bottom: 1px solid ${branding.colors.border};">
                <strong>${item.product.name}</strong><br>
                <small style="color: ${branding.colors.textMuted};">Talla: ${item.size} | Cantidad: ${item.quantity}</small>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid ${branding.colors.border}; text-align: right;">
                €${(item.product.price * item.quantity).toFixed(2)}
            </td>
        </tr>
    `).join('');

    const content = `
        ${getEmailHeader('¡Olvidaste algo!', 'Tu carrito te está esperando')}
        <div style="padding: 30px;">
            <p>Hola ${userName || 'Cliente'},</p>
            <p>Notamos que dejaste algunos artículos increíbles en tu carrito. ¡No los pierdas!</p>
            
            <h3 style="margin-top: 30px; color: ${branding.colors.textDark};">Tu carrito:</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                ${itemsHtml}
                <tr>
                    <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold;">Total:</td>
                    <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: ${branding.colors.primary};">
                        €${cartTotal.toFixed(2)}
                    </td>
                </tr>
            </table>
            
            <center>
                ${getEmailButton('Completar mi compra', `${branding.clientUrl}/cart`)}
            </center>
            
            <p style="margin-top: 30px; color: ${branding.colors.textMuted}; font-size: 14px;">
                ¿Necesitas ayuda? Contáctanos en cualquier momento.
            </p>
        </div>
        ${getEmailFooter('Este es un recordatorio automático. Si ya completaste tu compra, ignora este mensaje.')}
    `;

    return getEmailWrapper(content);
};

/**
 * Price drop email template
 */
exports.priceDropEmail = (userName, product, oldPrice, newPrice) => {
    const discount = ((oldPrice - newPrice) / oldPrice * 100).toFixed(0);

    const content = `
        ${getEmailHeader('¡Bajada de Precio! 🎉', 'Un producto de tu wishlist está más barato')}
        <div style="padding: 30px;">
            <p>Hola ${userName || 'Cliente'},</p>
            <p>¡Tenemos buenas noticias! Un producto que te gusta ha bajado de precio.</p>
            
            <div style="border: 1px solid ${branding.colors.border}; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <center>
                    <img src="${product.image}" alt="${product.name}" 
                         style="max-width: 200px; border-radius: 8px; margin-bottom: 15px;">
                    <h2 style="margin: 10px 0; color: ${branding.colors.textDark};">${product.name}</h2>
                </center>
                
                <div style="background: linear-gradient(135deg, ${branding.colors.primary} 0%, ${branding.colors.primaryDark} 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <div style="font-size: 14px; opacity: 0.9; text-decoration: line-through;">
                        Antes: €${oldPrice.toFixed(2)}
                    </div>
                    <div style="font-size: 32px; font-weight: bold; margin: 10px 0;">
                        €${newPrice.toFixed(2)}
                    </div>
                    <div style="font-size: 18px; background: white; color: ${branding.colors.error}; display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold;">
                        ¡${discount}% de descuento!
                    </div>
                </div>
            </div>
            
            <center>
                ${getEmailButton('Ver producto', `${branding.clientUrl}/product/${product._id}`)}
            </center>
            
            <p style="margin-top: 30px; color: ${branding.colors.textMuted}; font-size: 14px;">
                ⏰ ¡No esperes más! Los productos populares se agotan rápido.
            </p>
        </div>
        ${getEmailFooter('Has recibido este email porque tienes este producto en tu wishlist.')}
    `;

    return getEmailWrapper(content);
};

/**
 * Order status update email template
 */
exports.orderStatusEmail = (userName, orderId, status, trackingNumber = null) => {
    const statusMessages = {
        pagado: { title: 'Pedido Confirmado', message: '¡Tu pedido ha sido confirmado y está siendo preparado!' },
        enviado: { title: 'Pedido Enviado', message: 'Tu pedido está en camino. ¡Pronto lo tendrás!' },
        entregado: { title: 'Pedido Entregado', message: '¡Tu pedido ha sido entregado! Esperamos que lo disfrutes.' }
    };

    const statusInfo = statusMessages[status] || { title: 'Actualización de Pedido', message: 'Tu pedido ha sido actualizado.' };

    const content = `
        ${getEmailHeader(statusInfo.title, `Pedido #${orderId.slice(-8).toUpperCase()}`)}
        <div style="padding: 30px;">
            <p>Hola ${userName || 'Cliente'},</p>
            <p>${statusInfo.message}</p>
            
            <div style="background: ${branding.colors.bgLight}; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Número de pedido:</strong> ${orderId}</p>
                <p style="margin: 5px 0;"><strong>Estado:</strong> ${status}</p>
                ${trackingNumber ? `<p style="margin: 5px 0;"><strong>Número de seguimiento:</strong> ${trackingNumber}</p>` : ''}
            </div>
            
            <center>
                ${getEmailButton('Ver detalles del pedido', `${branding.clientUrl}/order/${orderId}`)}
            </center>
        </div>
        ${getEmailFooter('Gracias por tu compra.')}
    `;

    return getEmailWrapper(content);
};

/**
 * Wishlist reminder email template
 */
exports.wishlistReminderEmail = (userName, wishlistItems) => {
    const itemsHtml = wishlistItems.slice(0, 4).map(item => `
        <div style="display: inline-block; width: 45%; margin: 10px 2%; vertical-align: top; text-align: center;">
            <img src="${item.product.image}" alt="${item.product.name}" 
                 style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
            <h4 style="margin: 5px 0; font-size: 14px; color: ${branding.colors.textDark};">${item.product.name}</h4>
            <p style="margin: 5px 0; color: ${branding.colors.primary}; font-weight: bold;">€${item.product.price.toFixed(2)}</p>
            <a href="${branding.clientUrl}/product/${item.product._id}" 
               style="display: inline-block; padding: 8px 16px; background: ${branding.colors.primary}; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; margin-top: 8px;">
                Ver producto
            </a>
        </div>
    `).join('');

    const content = `
        ${getEmailHeader('💝 ¿Aún te gustan?', 'Te acordamos de tus productos favoritos')}
        <div style="padding: 30px;">
            <p>Hola ${userName || 'Cliente'},</p>
            <p>Hace tiempo que añadiste estos productos a tu lista de deseos. ¡Siguen ahí esperándote!</p>
            
            <h3 style="margin-top: 30px; border-bottom: 2px solid ${branding.colors.accent}; padding-bottom: 10px; color: ${branding.colors.textDark};">Tu wishlist:</h3>
            <div style="margin: 20px 0; text-align: center;">
                ${itemsHtml}
            </div>
            
            <center>
                ${getEmailButton('Ver mi lista completa', `${branding.clientUrl}/wishlist`)}
            </center>
            
            <p style="margin-top: 30px; color: ${branding.colors.textMuted}; font-size: 14px;">
                🔥 ¡No esperes mucho! Los productos populares se agotan rápido.
            </p>
        </div>
        ${getEmailFooter('Recibes este email porque tienes productos guardados en tu wishlist.')}
    `;

    return getEmailWrapper(content);
};

/**
 * New arrivals newsletter email template
 */
exports.newArrivalsEmail = (products) => {
    const productsHtml = products.slice(0, 6).map(product => `
        <div style="display: inline-block; width: 30%; margin: 10px 1.5%; vertical-align: top; text-align: center;">
            <a href="${branding.clientUrl}/product/${product._id}" style="text-decoration: none; color: inherit;">
                <img src="${product.image}" alt="${product.name}" 
                     style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
                <h4 style="margin: 5px 0; font-size: 14px; color: ${branding.colors.textDark};">${product.name}</h4>
                <p style="margin: 5px 0; color: ${branding.colors.primary}; font-weight: bold; font-size: 16px;">€${product.price.toFixed(2)}</p>
            </a>
        </div>
    `).join('');

    const content = `
        ${getEmailHeader('✨ Nuevas Llegadas', 'Descubre lo último en moda premium')}
        <div style="padding: 30px;">
            <p style="font-size: 16px;">¡Tenemos novedades que te encantarán!</p>
            <p>Echa un vistazo a nuestros productos recién añadidos:</p>
            
            <div style="margin: 30px 0; text-align: center;">
                ${productsHtml}
            </div>
            
            <center>
                ${getEmailButton('Ver todas las novedades', `${branding.clientUrl}/?sort=newest`)}
            </center>
        </div>
        ${getEmailFooter('Recibes este email porque estás suscrito a nuestra newsletter.')}
    `;

    return getEmailWrapper(content);
};

/**
 * Promotions/Sale email template
 */
exports.promotionEmail = (title, subtitle, products, promoCode = null) => {
    const productsHtml = products.slice(0, 6).map(product => {
        const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;
        return `
        <div style="display: inline-block; width: 30%; margin: 10px 1.5%; vertical-align: top; text-align: center;">
            <a href="${branding.clientUrl}/product/${product._id}" style="text-decoration: none;">
                <div style="position: relative; display: inline-block;">
                    <img src="${product.image}" alt="${product.name}" 
                         style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px;">
                    ${product.discount > 0 ? `<span style="position: absolute; top: 8px; right: 8px; background: ${branding.colors.error}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">-${product.discount}%</span>` : ''}
                </div>
                <h4 style="margin: 10px 0 5px 0; font-size: 14px; color: ${branding.colors.textDark};">${product.name}</h4>
                ${product.discount > 0 ? `
                    <p style="margin: 2px 0; color: ${branding.colors.error}; font-weight: bold; font-size: 16px;">€${discountedPrice.toFixed(2)} <span style="color: ${branding.colors.textLight}; text-decoration: line-through; font-size: 12px;">€${product.price.toFixed(2)}</span></p>
                ` : `
                    <p style="margin: 2px 0; color: ${branding.colors.primary}; font-weight: bold; font-size: 16px;">€${product.price.toFixed(2)}</p>
                `}
            </a>
        </div>
    `;
    }).join('');

    const content = `
        <div style="background: linear-gradient(135deg, ${branding.colors.error} 0%, ${branding.colors.accent} 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
            ${branding.logo.url
            ? `<img src="${branding.logo.url}" alt="${branding.logo.altText}" style="max-width: 150px; margin-bottom: 20px;">`
            : `<h2 style="margin: 0 0 10px 0; font-size: 24px; letter-spacing: 2px;">${branding.name.toUpperCase()}</h2>`
        }
            <h1 style="margin: 0; font-size: 32px;">${title}</h1>
            <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">${subtitle}</p>
            ${promoCode ? `
                <div style="margin-top: 20px; background: rgba(255,255,255,0.2); padding: 15px 25px; border-radius: 8px; display: inline-block;">
                    <span style="font-size: 14px;">Usa el código:</span>
                    <span style="font-size: 22px; font-weight: bold; margin-left: 8px; letter-spacing: 2px;">${promoCode}</span>
                </div>
            ` : ''}
        </div>
        <div style="padding: 30px;">
            <div style="margin: 20px 0; text-align: center;">
                ${productsHtml}
            </div>
            
            <center>
                ${getEmailButton('Ver todas las ofertas', `${branding.clientUrl}/?filter=sale`)}
            </center>
        </div>
        ${getEmailFooter()}
    `;

    return getEmailWrapper(content);
};

/**
 * Stock notification email template
 */
exports.stockNotificationEmail = (userName, product, sizes) => {
    const sizesText = sizes.map(s => s.size).join(', ');

    const content = `
        ${getEmailHeader('¡Producto disponible! 🎉', 'Un producto de tu lista de alertas está de nuevo en stock')}
        <div style="padding: 30px;">
            <p>Hola ${userName || 'Cliente'},</p>
            <p>¡Buenas noticias! El producto que esperabas ya está disponible.</p>
            
            <div style="border: 1px solid ${branding.colors.border}; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                <img src="${product.image}" alt="${product.name}" 
                     style="max-width: 200px; border-radius: 8px; margin-bottom: 15px;">
                <h2 style="margin: 10px 0; color: ${branding.colors.textDark};">${product.name}</h2>
                <p style="color: ${branding.colors.success}; font-weight: bold;">
                    ✓ Tallas disponibles: ${sizesText}
                </p>
                <p style="color: ${branding.colors.primary}; font-weight: bold; font-size: 20px;">
                    €${product.price.toFixed(2)}
                </p>
            </div>
            
            <center>
                ${getEmailButton('Comprar ahora', `${branding.clientUrl}/product/${product._id}`)}
            </center>
            
            <p style="margin-top: 30px; color: ${branding.colors.textMuted}; font-size: 14px;">
                ⏰ ¡Date prisa! El stock es limitado.
            </p>
        </div>
        ${getEmailFooter('Recibes este email porque configuraste una alerta de stock para este producto.')}
    `;

    return getEmailWrapper(content);
};
