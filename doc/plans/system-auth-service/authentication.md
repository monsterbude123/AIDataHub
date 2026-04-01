# Authentication Guide

## Overview

The system-auth-service uses JWT (JSON Web Token) based authentication. All API endpoints require authentication by default, except for login and health check endpoints.

## Authentication Flow

1. **Login**: Send credentials to `/auth/login` to receive a JWT token
2. **Use Token**: Include the token in the `Authorization: Bearer <token>` header for subsequent requests
3. **Token Expiry**: Tokens expire after 24 hours

## Public Endpoints

| Endpoint           | Description               |
| ------------------ | ------------------------- |
| `POST /auth/login` | User login                |
| `GET /health`      | Service health check      |
| `GET /api/docs`    | Swagger API documentation |

## Initial Admin User

On first startup, the service automatically creates an admin user with:

- **Username**: `admin`
- **Password**: Auto-generated (16 characters, logged to console)

The credentials are logged once to the console in a formatted box:

```
┌─────────────────────────────────────────────────────────────┐
│  🔐 Initial Admin Credentials (save this securely!)         │
├─────────────────────────────────────────────────────────────┤
│  Username: admin                                             │
│  Password: xK9#mP2$vL5@nQ8w                                  │
│                                                             │
│  ⚠️  Please change the password after first login!          │
└─────────────────────────────────────────────────────────────┘
```

**Security Note**: Change the admin password immediately after first login.

## Using the SDK

### Basic Login Flow

```typescript
import {
  FetchHttpClient,
  SystemAuthHttpClient,
  AuthenticatedHttpClient,
} from '@ai-datahub/sdk';

// Create base client
const http = new FetchHttpClient('http://localhost:3000');
const authClient = new SystemAuthHttpClient(http);

// Login to get token
const loginResult = await authClient.login({
  username: 'admin',
  password: 'your-password',
});

if (loginResult.ok) {
  console.log('Logged in as:', loginResult.data.user.username);
  console.log('Roles:', loginResult.data.roles);
  console.log('Token:', loginResult.data.token);
}
```

### Using AuthenticatedHttpClient

```typescript
import {
  FetchHttpClient,
  SystemAuthHttpClient,
  AuthenticatedHttpClient,
} from '@ai-datahub/sdk';

// Setup
const http = new FetchHttpClient('http://localhost:3000');
const authClient = new SystemAuthHttpClient(http);

// Login
const loginResult = await authClient.login({
  username: 'admin',
  password: 'your-password',
});

// Create authenticated client
const authedHttp = new AuthenticatedHttpClient(http, loginResult.data.token);
const authedClient = new SystemAuthHttpClient(authedHttp);

// Now all requests automatically include the Bearer token
const users = await authedClient.listUsers({ page: { page: 1, pageSize: 10 } });
```

### Token Management

```typescript
const authedHttp = new AuthenticatedHttpClient(http);

// Set token
authedHttp.setToken('your-jwt-token');

// Get current token
const token = authedHttp.getToken();

// Clear token (logout)
authedHttp.clearToken();
```

## Error Handling

When authentication fails, the API returns a 401 Unauthorized response:

```json
{
  "ok": false,
  "error": {
    "code": "Unauthorized",
    "message": "Authorization header missing"
  }
}
```

Common error messages:

| Error                                 | Description                           |
| ------------------------------------- | ------------------------------------- |
| `Authorization header missing`        | No Authorization header provided      |
| `Invalid authorization header format` | Header not in `Bearer <token>` format |
| `Token missing`                       | Bearer token is empty                 |
| `Invalid or expired token`            | Token is invalid or has expired       |

## Token Structure

The JWT token contains:

```json
{
  "userId": "user-uuid",
  "username": "admin",
  "roles": ["super-admin"],
  "iat": 1234567890,
  "exp": 1234654290
}
```

## Environment Variables

| Variable     | Default      | Description                       |
| ------------ | ------------ | --------------------------------- |
| `JWT_SECRET` | `dev-secret` | Secret key for signing JWT tokens |
| `PORT`       | `3000`       | Server port                       |

**Important**: Set `JWT_SECRET` to a secure random value in production.

## Best Practices

1. **Store tokens securely**: Use secure storage (httpOnly cookies, secure localStorage)
2. **Handle token expiry**: Implement token refresh or re-login on 401 errors
3. **Use HTTPS**: Always use HTTPS in production to protect tokens in transit
4. **Short-lived tokens**: Consider reducing token expiry time for sensitive applications
5. **Logout on client**: Clear token from client storage on logout
