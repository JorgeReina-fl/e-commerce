// ***********************************************
// Cypress E2E Support File
// ***********************************************

// Import commands.js
import './commands';

// Hide fetch/XHR requests in command log (cleaner output)
const app = window.top;
if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
    const style = app.document.createElement('style');
    style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
    style.setAttribute('data-hide-command-log-request', '');
    app.document.head.appendChild(style);
}

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
    // Returning false here prevents Cypress from failing the test
    // Useful for third-party script errors (analytics, ads, etc.)
    if (err.message.includes('ResizeObserver') ||
        err.message.includes('Script error')) {
        return false;
    }
    return true;
});
