const NodeCache = require('node-cache');

// Create cache instance with:
// - stdTTL: 5 minutes default TTL
// - checkperiod: Check for expired keys every 2 minutes
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

/**
 * Cache middleware factory
 * @param {number} duration - Cache duration in seconds
 * @param {function} keyGenerator - Optional function to generate cache key from req
 */
const cacheMiddleware = (duration = 300, keyGenerator = null) => {
    return (req, res, next) => {
        // Skip caching for non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Generate cache key
        const key = keyGenerator
            ? keyGenerator(req)
            : `${req.originalUrl || req.url}`;

        // Check if cached response exists
        const cachedResponse = cache.get(key);
        if (cachedResponse) {
            console.log(`[CACHE] HIT: ${key}`);
            return res.json(cachedResponse);
        }

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to cache response
        res.json = (data) => {
            // Only cache successful responses
            if (res.statusCode === 200) {
                cache.set(key, data, duration);
                console.log(`[CACHE] SET: ${key} (TTL: ${duration}s)`);
            }
            return originalJson(data);
        };

        next();
    };
};

/**
 * Invalidate cache by pattern
 * @param {string|RegExp} pattern - Key pattern to match
 */
const invalidateCache = (pattern) => {
    const keys = cache.keys();
    let invalidated = 0;

    keys.forEach(key => {
        if (typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key)) {
            cache.del(key);
            invalidated++;
        }
    });

    console.log(`[CACHE] Invalidated ${invalidated} keys matching: ${pattern}`);
    return invalidated;
};

/**
 * Clear all cache
 */
const clearCache = () => {
    cache.flushAll();
    console.log('[CACHE] All cache cleared');
};

/**
 * Get cache stats
 */
const getCacheStats = () => {
    return {
        keys: cache.keys().length,
        hits: cache.getStats().hits,
        misses: cache.getStats().misses,
        ksize: cache.getStats().ksize,
        vsize: cache.getStats().vsize
    };
};

module.exports = {
    cache,
    cacheMiddleware,
    invalidateCache,
    clearCache,
    getCacheStats
};
