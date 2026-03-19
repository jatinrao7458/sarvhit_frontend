# Sarvhit Backend API

Professional backend API for the Sarvhit NGO and Volunteer Management Platform built with Express.js and MongoDB.

## Project Structure

```
Backend/
├── config/           # Configuration files (database, constants)
├── controllers/      # Business logic controllers
├── middleware/       # Express middleware (auth, error handling)
├── models/          # MongoDB schemas and models
├── routes/          # API route definitions
├── services/        # Database operations and business logic
├── utils/           # Utility functions (validators, JWT, etc.)
├── .env             # Environment variables (create from .env.example)
├── .env.example     # Template for environment variables
├── server.js        # Main Express server file
└── package.json     # Dependencies and scripts
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas connection string)
- npm or yarn

## Installation

1. **Clone or navigate to the backend folder**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/sarvhit
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:5173
   ```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5001`

## CORS Configuration

The backend is configured with proper CORS (Cross-Origin Resource Sharing) to allow requests from the frontend:

### Allowed Origins (Development)
- `http://localhost:5173` (Primary Vite dev port)
- `http://localhost:5174` - `5176` (Alternative Vite ports)
- `http://127.0.0.1:*` (IP-based localhost)
- Custom origins via `CORS_ORIGIN` env variable

### Allowed Methods
- GET, POST, PUT, DELETE, PATCH, OPTIONS

### Request Headers
- Content-Type
- Authorization

### Example CORS Request

```bash
# Test CORS preflight
curl -i -X OPTIONS http://localhost:5001/api/auth/login \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: POST"

# Should return 204 No Content with CORS headers
```

For detailed CORS configuration and troubleshooting, see [CORS_GUIDE.md](./CORS_GUIDE.md)

## API Endpoints

### Authentication Routes

#### 1. **Login**
- **Route:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "jwt_token_here",
    "user": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "userType": "volunteer"
    }
  }
  ```

#### 2. **Signup**
- **Route:** `POST /api/auth/signup`
- **Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "userType": "volunteer"
  }
  ```
- **Response:** Similar to login response

#### 3. **Get Profile** (Protected)
- **Route:** `GET /api/auth/profile`
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Response:**
  ```json
  {
    "success": true,
    "user": { ... }
  }
  ```

#### 4. **Update Profile** (Protected)
- **Route:** `PUT /api/auth/profile`
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Body:** Any user fields except email, userType, password
- **Response:** Updated user object

#### 5. **Logout** (Protected)
- **Route:** `POST /api/auth/logout`
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Logout successful"
  }
  ```

### Token Management

The API implements proper JWT token management with blacklisting:

- **Login**: Issues a new JWT token
- **Logout**: Adds the token to a blacklist, preventing further use
- **Token Validation**: Checks blacklist before allowing access to protected routes
- **Token Expiry**: Tokens automatically expire after 7 days
- **Blacklist Cleanup**: Expired tokens are automatically removed from blacklist

**Security Note**: After logout, the JWT token becomes invalid and cannot be used to access protected routes until the user logs in again.

### Health Check

- **Route:** `GET /api/health`
- **Response:**
  ```json
  {
    "message": "Server is running"
  }
  ```

## Testing

### Logout Functionality Test

To test that logout properly invalidates tokens, run:

```bash
# Install test dependencies
npm install

# Run the logout test (requires server to be running)
node test-logout.js
```

This test will:
1. Register/login a test user
2. Access a protected route (should work)
3. Logout (invalidate the token)
4. Try to access the protected route again (should fail)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

## User Types

- `ngo` - Non-Governmental Organization
- `volunteer` - Volunteer/Individual
- `sponsor` - Sponsor/Donor

## Database Schema

### User Schema
- firstName (String, required)
- lastName (String, required)
- email (String, required, unique)
- password (String, required, hashed)
- userType (String, enum: ['ngo', 'volunteer', 'sponsor'])
- profileImage (String)
- phone (String)
- address (String)
- city (String)
- state (String)
- zipCode (String)
- bio (String)
- isActive (Boolean, default: true)
- isVerified (Boolean, default: false)
- verificationToken (String)
- createdAt (Date)
- updatedAt (Date)

## Error Handling

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

## Next Steps

- Connect to MongoDB Atlas or local MongoDB
- Add more routes (Dashboard, Events, Discover, etc.)
- Implement email verification
- Add role-based access control (RBAC)
- Add logging and monitoring
- Setup CI/CD pipeline

## Frontend Integration

Set the API base URL in your frontend `.env`:
```
VITE_API_URL=http://localhost:5001/api
```

Then use the endpoints in your API calls:
```javascript
const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

## Support

For issues or questions, please contact the development team.
