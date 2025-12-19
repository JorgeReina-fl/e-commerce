const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        // Base URL for the Vite dev server
        baseUrl: 'http://localhost:5173',

        // Viewport settings (desktop)
        viewportWidth: 1280,
        viewportHeight: 720,

        // Timeouts
        defaultCommandTimeout: 10000,
        requestTimeout: 10000,
        responseTimeout: 30000,
        pageLoadTimeout: 60000,

        // Video recording (disable for speed, enable for debugging)
        video: false,

        // Screenshots on failure
        screenshotOnRunFailure: true,
        screenshotsFolder: 'cypress/screenshots',

        // Test patterns
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
        supportFile: 'cypress/support/e2e.js',

        // Retry failed tests
        retries: {
            runMode: 2,
            openMode: 0
        },

        // Environment variables
        env: {
            apiUrl: 'http://localhost:5000/api'
        },

        setupNodeEvents(on, config) {
            // Implement node event listeners here
            on('task', {
                log(message) {
                    console.log(message);
                    return null;
                }
            });
        },
    },
});
