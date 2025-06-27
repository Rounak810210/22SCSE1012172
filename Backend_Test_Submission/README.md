# URL Shortener Microservice

A production-grade URL shortener microservice built with Node.js and Express.

## Features

- Create short URLs with optional custom codes and validity periods
- Redirect short URLs to original URLs
- Track URL statistics including click counts and event details
- Comprehensive error handling
- Structured logging using Affordmed's logging service

## API Endpoints

### Create Short URL
```http
POST /shorturls
```
Request body:
```json
{
    "longUrl": "https://example.com/very/long/url",
    "validity": 30,  // optional, in minutes, defaults to 30
    "customCode": "custom123"  // optional
}
```
Response:
```json
{
    "shortLink": "http://localhost:3000/abc123",
    "expiry": "2024-02-15T12:30:00.000Z"
}
```

### Redirect to Original URL
```http
GET /:shortcode
```
- Redirects to the original URL if valid
- Returns appropriate error status codes for invalid or expired URLs

### Get URL Statistics
```http
GET /shorturls/:shortcode
```
Response:
```json
{
    "longUrl": "https://example.com/very/long/url",
    "shortCode": "abc123",
    "createdAt": "2024-02-15T12:00:00.000Z",
    "expiryTime": "2024-02-15T12:30:00.000Z",
    "clicks": 5,
    "clickEvents": [
        {
            "timestamp": "2024-02-15T12:15:00.000Z",
            "referrer": "https://example.com",
            "location": "US"
        }
    ]
}
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
AFFORDMED_CLIENT_ID=your_client_id
AFFORDMED_CLIENT_SECRET=your_client_secret
PORT=3000  # optional, defaults to 3000
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Project Structure

```
src/
├── controllers/     # Request handlers
├── services/       # Business logic
├── middleware/     # Custom middleware
├── utils/         # Utility functions
└── index.js       # Application entry point
```

## Error Handling

The service returns appropriate HTTP status codes:

- 201: Short URL created successfully
- 400: Invalid request (missing required fields)
- 404: Short URL not found
- 409: Custom shortcode already exists
- 410: Short URL has expired
- 500: Internal server error

## Logging

The service uses Affordmed's logging service to track all API calls and important events. Logs are structured and include:
- Level (info, error, debug, warn)
- Package (controller, service, middleware, util)
- Message
- Stack trace (for errors) 