const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Image optimization service using Sharp
 */
const imageOptimizer = {
    /**
     * Optimize an image buffer
     * @param {Buffer} buffer - Image buffer
     * @param {Object} options - Optimization options
     * @returns {Promise<Buffer>} - Optimized image buffer
     */
    async optimizeBuffer(buffer, options = {}) {
        const {
            width = 1200,
            height = null,
            quality = 80,
            format = 'webp',
            fit = 'inside'
        } = options;

        let sharpInstance = sharp(buffer);

        // Resize if dimensions specified
        if (width || height) {
            sharpInstance = sharpInstance.resize(width, height, {
                fit,
                withoutEnlargement: true
            });
        }

        // Convert to specified format with quality
        switch (format) {
            case 'webp':
                sharpInstance = sharpInstance.webp({ quality });
                break;
            case 'jpeg':
            case 'jpg':
                sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
                break;
            case 'png':
                sharpInstance = sharpInstance.png({ quality, compressionLevel: 9 });
                break;
            case 'avif':
                sharpInstance = sharpInstance.avif({ quality });
                break;
            default:
                sharpInstance = sharpInstance.webp({ quality });
        }

        return sharpInstance.toBuffer();
    },

    /**
     * Generate multiple sizes for responsive images
     * @param {Buffer} buffer - Original image buffer
     * @param {Array} sizes - Array of widths to generate
     * @returns {Promise<Object>} - Map of size -> buffer
     */
    async generateResponsiveSizes(buffer, sizes = [320, 640, 1024, 1920]) {
        const results = {};

        for (const size of sizes) {
            results[size] = await this.optimizeBuffer(buffer, {
                width: size,
                format: 'webp',
                quality: 80
            });
        }

        return results;
    },

    /**
     * Generate thumbnail
     * @param {Buffer} buffer - Image buffer
     * @param {number} size - Thumbnail size (square)
     * @returns {Promise<Buffer>}
     */
    async generateThumbnail(buffer, size = 200) {
        return sharp(buffer)
            .resize(size, size, { fit: 'cover' })
            .webp({ quality: 70 })
            .toBuffer();
    },

    /**
     * Get image metadata
     * @param {Buffer} buffer - Image buffer
     * @returns {Promise<Object>}
     */
    async getMetadata(buffer) {
        const metadata = await sharp(buffer).metadata();
        return {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: buffer.length,
            hasAlpha: metadata.hasAlpha
        };
    },

    /**
     * Process upload - optimize and save locally or return buffer
     * @param {Buffer} buffer - Original image buffer
     * @param {string} filename - Original filename
     * @param {Object} options - Processing options
     */
    async processUpload(buffer, filename, options = {}) {
        const {
            maxWidth = 1920,
            quality = 85,
            generateThumbnail = true,
            thumbnailSize = 300
        } = options;

        // Get original metadata
        const originalMetadata = await this.getMetadata(buffer);

        // Optimize main image
        const optimizedBuffer = await this.optimizeBuffer(buffer, {
            width: maxWidth,
            quality,
            format: 'webp'
        });

        const result = {
            original: {
                ...originalMetadata,
                filename
            },
            optimized: {
                buffer: optimizedBuffer,
                size: optimizedBuffer.length,
                format: 'webp',
                compressionRatio: ((1 - optimizedBuffer.length / buffer.length) * 100).toFixed(1) + '%'
            }
        };

        // Generate thumbnail if requested
        if (generateThumbnail) {
            const thumbBuffer = await this.generateThumbnail(buffer, thumbnailSize);
            result.thumbnail = {
                buffer: thumbBuffer,
                size: thumbBuffer.length,
                dimensions: `${thumbnailSize}x${thumbnailSize}`
            };
        }

        return result;
    }
};

module.exports = imageOptimizer;
