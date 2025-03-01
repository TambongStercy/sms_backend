# Authentication Documentation

## Overview

The School Management System uses JWT (JSON Web Token) based authentication. This document explains the authentication flow, security practices, and provides examples of how to implement authentication in your client applications.

## Authentication Flow

1. **Registration**: New users must register using the `/auth/register` endpoint, providing necessary personal information.
2. **Login**: Users authenticate using the `/auth/login` endpoint with their email and password.
3. **Token Usage**: After successful login, users receive a JWT token which must be included in the `Authorization` header for subsequent API calls.
4. **Token Validation**: The server validates the token for each request to protected resources.
5. **Logout**: Users can invalidate their token using the `/auth/logout` endpoint.

## Security Features

- Passwords are hashed using bcrypt with a cost factor of 10
- Authentication tokens expire after 24 hours
- The token blacklist prevents the use of logged-out tokens
- Role-based authorization controls access to sensitive endpoints

## Token Format

The authentication token is a JSON Web Token (JWT) with the following structure:

```
header.payload.signature
```

**Header** (Algorithm & Token Type):
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload** (Claims):
```json
{
  "id": 1,               // User ID
  "email": "user@example.com",
  "iat": 1646022400,     // Issued at timestamp
  "exp": 1646108800      // Expiration timestamp (24 hours after issuance)
}
```

## Using Authentication in Client Applications

### Registration Example

```javascript
// Example: Register a new user
const response = await fetch('https://api.schoolmanagementsystem.com/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "John Doe",
    email: "john.doe@example.com",
    password: "SecurePass123",
    gender: "Male",
    date_of_birth: "1990-01-01",
    phone: "+237 680123456",
    address: "123 Main Street, Yaoundé",
    id_card_num: "ID12345678"
  })
});

const data = await response.json();
console.log(data); // User information
```

### Login Example

```javascript
// Example: Login
const response = await fetch('https://api.schoolmanagementsystem.com/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: "john.doe@example.com",
    password: "SecurePass123"
  })
});

const data = await response.json();
const token = data.token;
localStorage.setItem('authToken', token); // Store token for later use
console.log(data.user); // User information
```

### Authenticated Request Example

```javascript
// Example: Fetch user profile with authentication
const token = localStorage.getItem('authToken');

const response = await fetch('https://api.schoolmanagementsystem.com/api/v1/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const profile = await response.json();
console.log(profile); // User profile information
```

### Logout Example

```javascript
// Example: Logout
const token = localStorage.getItem('authToken');

const response = await fetch('https://api.schoolmanagementsystem.com/api/v1/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Clear local storage after logout
localStorage.removeItem('authToken');
```

## Role-Based Authorization

The system uses role-based authorization to control access to endpoints. Roles include:

- `SUPER_MANAGER`: System administrator with full access
- `MANAGER`: School management staff
- `PRINCIPAL`: School principal
- `VICE_PRINCIPAL`: School vice principal
- `BURSAR`: Financial management
- `TEACHER`: Teacher with access to student and class information
- `DISCIPLINE_MASTER`: Handles discipline issues
- `GUIDANCE_COUNSELOR`: Student guidance and counseling
- `PARENT`: Parent access to child information

To access endpoints requiring specific roles, the user must have the appropriate role assigned. The role information is encoded in the JWT token during authentication.

## Error Handling

Authentication can fail for several reasons:

- **Invalid Credentials**: Email and password don't match (401 Unauthorized)
- **Missing Token**: No authentication token provided (401 Unauthorized)
- **Invalid Token**: Token is malformed or has invalid signature (401 Unauthorized)
- **Expired Token**: Token has expired (401 Unauthorized)
- **Insufficient Permissions**: User doesn't have the required role (403 Forbidden)

All authentication errors return a JSON response with an `error` field containing a descriptive message.

## Security Best Practices

When implementing authentication in your client applications:

1. **Never store tokens in code**: Always use secure storage mechanisms
2. **Use HTTPS**: Always communicate with the API over HTTPS
3. **Implement token refresh**: Handle token expiration gracefully
4. **Log out unused sessions**: Call the logout endpoint when users are done
5. **Validate user input**: Sanitize and validate all user input before submission
6. **Handle errors gracefully**: Provide appropriate user feedback for authentication failures 