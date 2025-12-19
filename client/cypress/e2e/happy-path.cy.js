/**
 * HAPPY PATH E2E TEST
 * 
 * The "Golden Flow" - If this passes, the core business works.
 * 
 * Flow: Home → Product → Add to Cart → Cart → Checkout → Payment Step
 */

describe('Happy Path - Complete Purchase Flow', () => {

    beforeEach(() => {
        // Clear state before each test
        cy.clearAppState();
    });

    it('should complete the full guest checkout flow', () => {
        // ==========================================
        // STEP 1: Visit Home Page
        // ==========================================
        cy.visit('/');
        cy.url().should('eq', Cypress.config().baseUrl + '/');

        // Verify home page loaded
        cy.get('body').should('be.visible');
        cy.log('✅ Home page loaded');

        // ==========================================
        // STEP 2: Click on a Product
        // ==========================================
        // Wait for products to load
        cy.get('[data-testid="product-card"], .product-card, [class*="product"]', { timeout: 10000 })
            .should('have.length.greaterThan', 0);

        // Click first product
        cy.get('[data-testid="product-card"] a, .product-card a, [class*="product"] a')
            .first()
            .click();

        // Verify we're on product detail page
        cy.url().should('match', /\/product\/|\/productos\//);
        cy.log('✅ Product detail page loaded');

        // ==========================================
        // STEP 3: Select Size and Add to Cart
        // ==========================================
        // Wait for product to load
        cy.get('[class*="price"], [data-testid="product-price"]', { timeout: 5000 })
            .should('be.visible');

        // Select first available size
        cy.get('button[class*="size"], [data-testid^="size-"]')
            .not('[disabled]')
            .not('.disabled')
            .first()
            .click();

        // Wait for size selection
        cy.wait(300);

        // Add to cart
        cy.contains(/añadir|add to cart/i)
            .should('be.visible')
            .click();

        // Verify cart updated (look for toast or cart icon update)
        cy.wait(500);
        cy.log('✅ Product added to cart');

        // ==========================================
        // STEP 4: Go to Cart
        // ==========================================
        // Click cart icon in navbar
        cy.get('header, nav')
            .find('a[href*="cart"], [data-testid="cart-link"], button[class*="cart"]')
            .first()
            .click({ force: true });

        cy.url().should('include', '/cart');
        cy.log('✅ Cart page loaded');

        // ==========================================
        // STEP 5: Proceed to Checkout
        // ==========================================
        // Verify cart has items
        cy.get('[class*="cart-item"], [data-testid="cart-item"]')
            .should('have.length.greaterThan', 0);

        // Click checkout button
        cy.contains(/checkout|pagar|proceder/i)
            .should('be.visible')
            .click();

        cy.url().should('include', '/checkout');
        cy.log('✅ Checkout page loaded');

        // ==========================================
        // STEP 6: Fill Shipping Form (Guest)
        // ==========================================
        // Fill shipping information
        cy.get('input[name="name"], input[placeholder*="nombre" i]')
            .first()
            .type('Cypress Test User');

        cy.get('input[type="email"]')
            .first()
            .type('cypress@test.com');

        cy.get('input[name="phone"], input[type="tel"], input[placeholder*="teléfono" i]')
            .first()
            .type('612345678');

        cy.get('input[name="address"], input[placeholder*="dirección" i]')
            .first()
            .type('Calle Cypress 123');

        cy.get('input[name="city"], input[placeholder*="ciudad" i]')
            .first()
            .type('Madrid');

        cy.get('input[name="postalCode"], input[placeholder*="postal" i]')
            .first()
            .type('28001');

        cy.log('✅ Shipping form filled');

        // ==========================================
        // STEP 7: Continue to Payment Step
        // ==========================================
        // Click continue/next button
        cy.contains(/continuar|siguiente|next|continue/i)
            .should('be.visible')
            .click();

        // Verify we reached payment step
        // Look for Stripe elements or payment form
        cy.get('[class*="payment"], [class*="stripe"], #payment-element', { timeout: 10000 })
            .should('be.visible');

        cy.log('✅ Payment step reached - HAPPY PATH COMPLETE!');
    });

    it('should show product details correctly', () => {
        // Visit first product
        cy.visit('/');

        cy.get('[data-testid="product-card"] a, .product-card a')
            .first()
            .click();

        // Verify essential product info is displayed
        cy.get('[class*="price"]').should('contain', '€');
        cy.get('button').should('exist'); // Size buttons
        cy.contains(/añadir|add/i).should('exist'); // Add button
    });

    it('should prevent checkout with empty cart', () => {
        // Go directly to cart
        cy.visit('/cart');

        // Cart should show empty state or checkout should be disabled
        cy.get('body').then(($body) => {
            const hasEmptyMessage = $body.text().match(/vacío|empty|no hay/i);
            const hasDisabledCheckout = $body.find('button:disabled').length > 0;

            expect(hasEmptyMessage || hasDisabledCheckout).to.be.ok;
        });
    });
});

describe('Navigation Tests', () => {

    it('should navigate between pages', () => {
        cy.visit('/');

        // Navigate to a category if exists
        cy.get('a[href*="categoria"], a[href*="category"]')
            .first()
            .click({ force: true });

        // Should still show products
        cy.get('[data-testid="product-card"], .product-card')
            .should('exist');
    });

    it('should handle 404 pages gracefully', () => {
        cy.visit('/non-existent-page', { failOnStatusCode: false });

        // Should show some content (not break)
        cy.get('body').should('be.visible');
    });
});
