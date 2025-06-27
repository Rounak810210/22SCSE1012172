# Affordmed Logger Middleware

A logging middleware that sends structured logs to the evaluation service.

## Installation

```bash
npm install affordmed-logger
```

## Usage

```javascript
const { AffordmedLogger, LOG_LEVELS, PACKAGES } = require('affordmed-logger');

// Initialize the logger with your credentials
const logger = new AffordmedLogger({
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET'
});

// Using convenience methods
await logger.info(PACKAGES.CONTROLLER, 'Request received for URL shortening');
await logger.error(PACKAGES.SERVICE, 'Failed to create short URL', error.stack);
await logger.debug(PACKAGES.MIDDLEWARE, 'Validating request body');
await logger.warn(PACKAGES.UTIL, 'URL expiration time not provided, using default');

// Or use the generic log method
await logger.log(LOG_LEVELS.INFO, PACKAGES.CONTROLLER, 'Custom log message');
```

## Available Log Levels

- INFO
- ERROR
- DEBUG
- WARN

## Available Package Names

- CONTROLLER
- SERVICE
- MIDDLEWARE
- UTIL

## Configuration

The logger requires the following configuration:

- `clientId`: Your Affordmed client ID
- `clientSecret`: Your Affordmed client secret

These credentials must be obtained by registering with the Affordmed Test Server.

## Error Handling

The logger will:
- Validate log levels and package names
- Handle network errors gracefully
- Fallback to console.error if the logging service is unavailable

## Notes

- All logging methods are asynchronous and return promises
- Stack traces are optional for all log methods
- The logger automatically includes required headers for authentication 