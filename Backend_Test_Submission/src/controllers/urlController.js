const { AffordmedLogger, PACKAGES } = require('../../../Logging_Middleware');

class UrlController {
    constructor(urlService, config) {
        this.urlService = urlService;
        this.logger = new AffordmedLogger(config);
    }

    async createShortUrl(req, res) {
        try {
            await this.logger.info(PACKAGES.CONTROLLER, 'Received request to create short URL');
            
            const { longUrl, validity, customCode } = req.body;

            if (!longUrl) {
                await this.logger.error(PACKAGES.CONTROLLER, 'Missing longUrl in request');
                return res.status(400).json({ error: 'longUrl is required' });
            }

            const urlData = await this.urlService.createShortUrl(longUrl, validity, customCode);
            
            const response = {
                shortLink: `${req.protocol}://${req.get('host')}/${urlData.shortCode}`,
                expiry: urlData.expiryTime
            };

            await this.logger.info(PACKAGES.CONTROLLER, 'Successfully created short URL');
            res.status(201).json(response);
        } catch (error) {
            await this.logger.error(PACKAGES.CONTROLLER, 'Error in createShortUrl controller', error.stack);
            
            if (error.message === 'Custom shortcode already exists') {
                return res.status(409).json({ error: error.message });
            }
            
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async redirectToOriginalUrl(req, res) {
        try {
            const { shortcode } = req.params;
            await this.logger.info(PACKAGES.CONTROLLER, `Received redirect request for ${shortcode}`);

            const urlData = await this.urlService.getOriginalUrl(shortcode);
            
            await this.logger.info(PACKAGES.CONTROLLER, `Redirecting to ${urlData.longUrl}`);
            res.redirect(urlData.longUrl);
        } catch (error) {
            await this.logger.error(PACKAGES.CONTROLLER, 'Error in redirect controller', error.stack);
            
            if (error.message === 'Short URL not found') {
                return res.status(404).json({ error: 'Short URL not found' });
            }
            if (error.message === 'Short URL has expired') {
                return res.status(410).json({ error: 'Short URL has expired' });
            }
            
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getUrlStats(req, res) {
        try {
            const { shortcode } = req.params;
            await this.logger.info(PACKAGES.CONTROLLER, `Received stats request for ${shortcode}`);

            const stats = await this.urlService.getUrlStats(shortcode);
            
            await this.logger.info(PACKAGES.CONTROLLER, 'Successfully retrieved URL stats');
            res.json(stats);
        } catch (error) {
            await this.logger.error(PACKAGES.CONTROLLER, 'Error in getUrlStats controller', error.stack);
            
            if (error.message === 'Short URL not found') {
                return res.status(404).json({ error: 'Short URL not found' });
            }
            
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = UrlController; 