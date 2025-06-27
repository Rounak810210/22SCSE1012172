require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { AffordmedLogger, PACKAGES } = require('../../Logging_Middleware');
const UrlService = require('./services/urlService');
const UrlController = require('./controllers/urlController');
const ErrorHandler = require('./middleware/errorHandler');

// Configuration
const config = {
    clientId: process.env.AFFORDMED_CLIENT_ID,
    clientSecret: process.env.AFFORDMED_CLIENT_SECRET
};

// Initialize logger
const logger = new AffordmedLogger(config);

// Initialize services and controllers
const urlService = new UrlService(config);
const urlController = new UrlController(urlService, config);
const errorHandler = new ErrorHandler(config);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/shorturls', (req, res) => urlController.createShortUrl(req, res));
app.get('/:shortcode', (req, res) => urlController.redirectToOriginalUrl(req, res));
app.get('/shorturls/:shortcode', (req, res) => urlController.getUrlStats(req, res));

// Error handling
app.use((err, req, res, next) => errorHandler.handle(err, req, res, next));

// Start server
const PORT = process.env.PORT || 3000;
try {
    app.listen(PORT, async () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        await logger.info(PACKAGES.UTIL, `Server is running on port ${PORT}`);
    });
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}