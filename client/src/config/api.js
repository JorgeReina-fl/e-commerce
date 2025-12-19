/**
 * ═══════════════════════════════════════════════════════════════════════════
 * API CONFIGURATION - CENTRALIZED API URL MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This file centralizes ALL API-related configuration.
 * Use this instead of hardcoding URLs in components.
 * 
 * The API_URL is determined by:
 * 1. VITE_API_URL environment variable (set during build for Docker/production)
 * 2. Fallback to localhost:5000/api for local development
 */

// Get the API base URL from environment or use default
// In Docker/production: VITE_API_URL is set to '/api' (relative, goes through Nginx)
// In development: Falls back to 'http://localhost:5000/api' (direct to backend)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// For backwards compatibility and explicit usage
export const API_BASE = API_URL;

/**
 * Helper to build API endpoints
 * @param {string} endpoint - The endpoint path (e.g., '/products', '/users/login')
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_URL}${normalizedEndpoint}`;
};

export default API_URL;
