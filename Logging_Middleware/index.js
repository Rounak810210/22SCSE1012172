const axios = require('axios');

const LOG_LEVELS = {
    INFO: 'info',
    ERROR: 'error',
    DEBUG: 'debug',
    WARN: 'warn'
};

const PACKAGES = {
    CONTROLLER: 'controller',
    SERVICE: 'service',
    MIDDLEWARE: 'middleware',
    UTIL: 'util'
};

class AffordmedLogger {
    constructor(config) {
        this.config = {
            baseUrl: 'http://20.244.56.144/evaluation-service',
            clientId: config.clientId || 'default_client_id',
            clientSecret: config.clientSecret || 'default_client_secret',
            maxRetries: 3,
            retryDelay: 1000 // 1 second
        };
        this.authToken = null;
        console.log('Logger initialized with client ID:', this.config.clientId);
    }

    async register() {
        try {
            const response = await axios.post(`${this.config.baseUrl}/register`, {
                email: "ramkrishna@abc.edu",
                name: "ram krishna",
                rollNo: "aalbb",
                accessCode: "xgAsNC",
                mobileNo: "9999999999",
                githubUsername: "github"
            });
            console.log('Registration response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Failed to register:', error.message);
            throw error;
        }
    }

    async getAuthToken() {
        try {
            const response = await axios.post(`${this.config.baseUrl}/auth`, {
                email: "ramkrishna@abc.edu", name: "ram krishna", rollNo: "aalbb", accessCode: "xyzabc", clientID: "d9cbb699-6a27-44a5-8d59-8b1befa816da", clientSecret: "tVJaaaRBSeXCRXEM"
            });
            this.authToken = response.data.token;
            return this.authToken;
        } catch (error) {
            console.error('Failed to obtain auth token:', error.message);
            throw error;
        }
    }

    async retryWithDelay(fn, retries = this.config.maxRetries) {
        try {
            return await fn();
        } catch (error) {
            if (retries > 0) {
                console.log(`Retrying... (${retries} attempts remaining)`);
                await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                return this.retryWithDelay(fn, retries - 1);
            }
            throw error;
        }
    }

    async log(level, packageName, message, stack = '') {
        // Validate with warnings instead of throwing errors
        if (!Object.values(LOG_LEVELS).includes(level)) {
            console.warn(`Warning: Invalid log level '${level}'. Using 'info' instead. Valid levels are: ${Object.values(LOG_LEVELS).join(', ')}`);
            level = LOG_LEVELS.INFO;
        }

        if (!Object.values(PACKAGES).includes(packageName)) {
            console.warn(`Warning: Invalid package name '${packageName}'. Using 'util' instead. Valid packages are: ${Object.values(PACKAGES).join(', ')}`);
            packageName = PACKAGES.UTIL;
        }

        const logData = {
            level,
            package: packageName,
            message,
            stack
        };

        // Always log to console first
        console.log(`[${level.toUpperCase()}] [${packageName}] ${message}${stack ? '\nStack: ' + stack : ''}`);

        try {
            if (!this.authToken) {
                await this.getAuthToken();
            }
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.authToken}`,
                'X-Client-ID': this.config.clientId
            };

            console.log('Attempting to send log to remote server...');
            console.log('Request details:', {
                url: this.config.logServerUrl,
                headers: { ...headers, 'X-Client-Secret': '***' },
                data: logData
            });

            await this.retryWithDelay(async () => {
                const response = await axios.post(`${this.config.baseUrl}/logs`, logData, { 
                    headers,
                    timeout: 5000 // 5 seconds timeout
                });
                if (response.status !== 200) {
                    throw new Error(`Server responded with status ${response.status}`);
                }
                console.log('Log sent successfully to remote server');
                return response;
            });
        } catch (error) {
            const errorDetails = error.response ? {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            } : error.message;

            console.warn(`Note: Failed to send log to remote server after ${this.config.maxRetries} retries.`);
            console.warn('Error details:', errorDetails);
            console.warn('Continuing normal operation...');
        }
    }

    // Convenience methods for different log levels
    async info(packageName, message, stack = '') {
        return this.log(LOG_LEVELS.INFO, packageName, message, stack);
    }

    async error(packageName, message, stack = '') {
        return this.log(LOG_LEVELS.ERROR, packageName, message, stack);
    }

    async debug(packageName, message, stack = '') {
        return this.log(LOG_LEVELS.DEBUG, packageName, message, stack);
    }

    async warn(packageName, message, stack = '') {
        return this.log(LOG_LEVELS.WARN, packageName, message, stack);
    }
}

// Export constants and logger class
module.exports = {
    AffordmedLogger,
    LOG_LEVELS,
    PACKAGES
};