// ***********************************************
// Custom Cypress Commands
// ***********************************************

/**
 * Add product to cart from product page
 * Selects first available size if no size specified
 */
Cypress.Commands.add('addToCart', (size = null) => {
    // Wait for product page to load
    cy.get('[data-testid="product-detail"], .product-detail, [class*="product"]').should('be.visible');

    // Select size if available
    if (size) {
        cy.get(`[data-testid="size-${size}"], button:contains("${size}")`).click();
    } else {
        // Click first available size button
        cy.get('[data-testid^="size-"], [class*="size-btn"]:not([disabled])')
            .first()
            .click({ force: true });
    }

    // Click add to cart button
    cy.contains(/añadir al carrito|add to cart/i).click();

    // Wait for toast notification or cart update
    cy.wait(500);
});

/**
 * Navigate to cart
 */
Cypress.Commands.add('goToCart', () => {
    cy.get('[data-testid="cart-icon"], [href*="cart"], a:contains("Carrito")')
        .first()
        .click({ force: true });

    cy.url().should('include', '/cart');
});

/**
 * Fill shipping form for guest checkout
 */
Cypress.Commands.add('fillShippingForm', (data = {}) => {
    const defaults = {
        name: 'Test User',
        email: 'test@cypress.io',
        phone: '612345678',
        address: 'Calle Test 123',
        city: 'Madrid',
        postalCode: '28001',
        country: 'España'
    };

    const formData = { ...defaults, ...data };

    // Fill each field - using flexible selectors
    cy.get('input[name="name"], input[placeholder*="nombre" i]')
        .first()
        .clear()
        .type(formData.name);

    cy.get('input[name="email"], input[type="email"]')
        .first()
        .clear()
        .type(formData.email);

    cy.get('input[name="phone"], input[placeholder*="teléfono" i], input[type="tel"]')
        .first()
        .clear()
        .type(formData.phone);

    cy.get('input[name="address"], input[placeholder*="dirección" i]')
        .first()
        .clear()
        .type(formData.address);

    cy.get('input[name="city"], input[placeholder*="ciudad" i]')
        .first()
        .clear()
        .type(formData.city);

    cy.get('input[name="postalCode"], input[placeholder*="postal" i]')
        .first()
        .clear()
        .type(formData.postalCode);
});

/**
 * Login via UI
 */
Cypress.Commands.add('login', (email, password) => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Wait for redirect
    cy.url().should('not.include', '/login');
});

/**
 * Login via API (faster for setup)
 */
Cypress.Commands.add('loginByApi', (email, password) => {
    cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/auth/login`,
        body: { email, password }
    }).then((response) => {
        window.localStorage.setItem('user', JSON.stringify(response.body));
    });
});

/**
 * Clear all app state
 */
Cypress.Commands.add('clearAppState', () => {
    cy.clearLocalStorage();
    cy.clearCookies();
});
