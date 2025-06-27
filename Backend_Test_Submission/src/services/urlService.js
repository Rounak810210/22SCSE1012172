const { nanoid } = require('nanoid');
const { AffordmedLogger, PACKAGES } = require('../../../Logging_Middleware');

// In-memory storage for URLs and stats
const urlStorage = new Map();
const clickStorage = new Map();

class UrlService {
    constructor(config) {
        this.logger = new AffordmedLogger(config);
    }

    async createShortUrl(longUrl, validity = 30, customCode = null) {
        try {
            const shortCode = customCode || nanoid(8);
            
            // Check if custom code is already taken
            if (customCode && urlStorage.has(customCode)) {
                await this.logger.error(PACKAGES.SERVICE, 'Custom shortcode already exists');
                throw new Error('Custom shortcode already exists');
            }

            const expiryTime = new Date(Date.now() + validity * 60 * 1000);

            const urlData = {
                longUrl,
                shortCode,
                createdAt: new Date(),
                expiryTime,
                clicks: 0
            };

            urlStorage.set(shortCode, urlData);
            clickStorage.set(shortCode, []);

            await this.logger.info(PACKAGES.SERVICE, `Created short URL for ${longUrl}`);
            return urlData;
        } catch (error) {
            await this.logger.error(PACKAGES.SERVICE, 'Error creating short URL', error.stack);
            throw error;
        }
    }

    async getOriginalUrl(shortCode) {
        try {
            const urlData = urlStorage.get(shortCode);

            if (!urlData) {
                await this.logger.error(PACKAGES.SERVICE, `Short URL not found: ${shortCode}`);
                throw new Error('Short URL not found');
            }

            if (new Date() > urlData.expiryTime) {
                await this.logger.warn(PACKAGES.SERVICE, `Expired short URL accessed: ${shortCode}`);
                throw new Error('Short URL has expired');
            }

            // Update click statistics
            urlData.clicks += 1;
            const clickData = {
                timestamp: new Date(),
                referrer: null, // Will be updated by the controller
                location: null  // Will be updated by the controller
            };
            clickStorage.get(shortCode).push(clickData);

            await this.logger.info(PACKAGES.SERVICE, `Redirecting to ${urlData.longUrl}`);
            return urlData;
        } catch (error) {
            await this.logger.error(PACKAGES.SERVICE, 'Error retrieving original URL', error.stack);
            throw error;
        }
    }

    async getUrlStats(shortCode) {
        try {
            const urlData = urlStorage.get(shortCode);
            
            if (!urlData) {
                await this.logger.error(PACKAGES.SERVICE, `Stats not found for: ${shortCode}`);
                throw new Error('Short URL not found');
            }

            const clicks = clickStorage.get(shortCode);
            
            await this.logger.info(PACKAGES.SERVICE, `Retrieved stats for ${shortCode}`);
            return {
                ...urlData,
                clickEvents: clicks
            };
        } catch (error) {
            await this.logger.error(PACKAGES.SERVICE, 'Error retrieving URL stats', error.stack);
            throw error;
        }
    }
}

module.exports = UrlService; 