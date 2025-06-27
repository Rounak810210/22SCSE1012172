const { AffordmedLogger, PACKAGES } = require('../../../Logging_Middleware');

class ErrorHandler {
    constructor(config) {
        this.logger = new AffordmedLogger(config);
    }

    async handle(err, req, res, next) {
        await this.logger.error(PACKAGES.MIDDLEWARE, err.message, err.stack);

        // Default to 500 internal server error
        const statusCode = err.statusCode || 500;
        const message = err.message || 'Internal Server Error';

        res.status(statusCode).json({
            error: message
        });
    }
}

module.exports = ErrorHandler; 