# CORS Configuration Guide

## Overview

CORS (Cross-Origin Resource Sharing) is implemented in the backend to allow the frontend application to communicate with the API safely.

## Current CORS Setup

### Allowed Origins (Development)

The backend automatically allows requests from:

- `http://localhost:5173` (Primary Vite dev port)
- `http://localhost:5174` (Alternative Vite port)
- `http://localhost:5175` (Alternative Vite port)
- `http://localhost:5176` (Alternative Vite port)
- `http://127.0.0.1:5173` (IP-based localhost)
- `http://127.0.0.1:5174`
- `http://127.0.0.1:5175`
- `http://127.0.0.1:5176`
- Custom origin from `CORS_ORIGIN` env variable
- Custom origin from `FRONTEND_URL` env variable

### Allowed Methods

- GET
- POST
- PUT
- DELETE
- PATCH
- OPTIONS (for preflight requests)

### Allowed Headers

- Content-Type
- Authorization

### Credentials

- Cookies and authorization headers are allowed with credentials: true

### Cache

- CORS preflight responses are cached for 24 hours (86400 seconds)

## Environment Configuration

### Development (.env)

```env
# Primary frontend URL
CORS_ORIGIN=http://localhost:5173

# Optional additional frontend URL (e.g., for production)
# FRONTEND_URL=https://yourdomain.com
```

### Production Deployment

For production, update your environment variables:

```env
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://www.yourdomain.com  # if different from CORS_ORIGIN
NODE_ENV=production
```

## How CORS Works

### 1. Preflight Request (OPTIONS)

When the browser makes a cross-origin request, it first sends an OPTIONS request:

```bash
curl -i -X OPTIONS http://localhost:5001/api/auth/login \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: POST"
```

Expected response (204 No Content):

```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:5174
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS,PATCH
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### 2. Actual Request

If preflight succeeds, the browser sends the actual request:

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5174" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## Testing CORS

### Test Preflight Request

```bash
# Test from port 5174
curl -i -X OPTIONS http://localhost:5001/api/auth/login \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: POST"

# Should return 204 No Content with CORS headers
```

### Test Actual Request with CORS

```bash
# Login from different port
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5175" \
  -d '{"email":"john@example.com","password":"password123"}'

# Should return 200 OK with user data and token
```

### Test Blocked CORS Request

```bash
# Try from unauthorized origin
curl -i -X OPTIONS http://localhost:5001/api/auth/login \
  -H "Origin: http://malicious.com" \
  -H "Access-Control-Request-Method: POST"

# Should return 500 - CORS blocked
```

## Troubleshooting CORS Errors

### Frontend Error: "Access to XMLHttpRequest has been blocked by CORS policy"

**Causes:**
1. Frontend origin is not in the allowed list
2. Required headers are being sent but not included in `allowedHeaders`
3. Credentials are not being handled correctly

**Solutions:**
1. Check the exact origin URL in the browser console
2. Add the origin to the CORS configuration
3. Ensure `Authorization` and `Content-Type` headers are in `allowedHeaders`

### Example Error in Browser Console:

```
Access to XMLHttpRequest at 'http://localhost:5001/api/auth/login' 
from origin 'http://localhost:5174' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
The value of the 'Access-Control-Allow-Credentials' header in the response is '' which must be 'true' when the request's credentials mode (include) is 'credentials'.
```

**Fix:** Ensure `credentials: true` is set in CORS options (already done).

## Security Considerations

1. **Don't use wildcard ('*')** - Specifying allowed origins explicitly is more secure
2. **Use HTTPS in production** - Always use https:// URLs in production
3. **Keep allowed origins minimal** - Only add origins that actually need access
4. **Validate on backend** - CORS is a browser security feature; always validate user input on the server

## Adding New Origins

To add a new origin:

1. **Development:** Add to the `allowedOrigins` array in `server.js`
2. **Production:** Update the `CORS_ORIGIN` or `FRONTEND_URL` environment variable

### Example: Adding a custom development origin

**Update server.js:**

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
  'http://dev.local:3000',  // NEW: Add custom development origin
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL
].filter(Boolean);
```

## Related Files

- `Backend/server.js` - Main CORS configuration
- `Backend/.env` - Environment variables for CORS origins
- `Backend/.env.example` - Template for environment configuration
- `Sarvhit-/src/utils/api.js` - Frontend API service with request handling

## References

- [CORS Documentation (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Package](https://github.com/expressjs/cors)
- [OWASP CORS](https://owasp.org/www-community/Cross-Origin_Resource_Sharing_(CORS))
