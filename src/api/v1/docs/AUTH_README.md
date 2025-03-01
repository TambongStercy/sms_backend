# Authentication System Documentation

## Overview

The School Management System uses JWT (JSON Web Tokens) for secure authentication. This document provides detailed information about the authentication system, its components, and how to use it in both backend and frontend applications.

## Table of Contents

- [Authentication Components](#authentication-components)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
- [Token Management](#token-management)
- [Role-Based Authorization](#role-based-authorization)
- [Security Considerations](#security-considerations)
- [Integration Examples](#integration-examples)

## Authentication Components

The authentication system consists of several key components:

1. **Auth Routes** (`src/api/v1/routes/authRoutes.ts`): Defines the API endpoints for authentication operations.
2. **Auth Controller** (`src/api/v1/controllers/authController.ts`): Contains the logic for processing authentication requests.
3. **Auth Service** (`src/api/v1/services/authService.ts`): Implements core authentication functionality.
4. **Auth Middleware** (`src/api/v1/middleware/auth.middleware.ts`): Handles token validation and role-based authorization.
5. **Token Blacklist Service** (`src/api/v1/services/tokenBlacklistService.ts`): Manages invalidated tokens.

## Authentication Flow

### Registration Process

1. Client submits registration data (name, email, password, etc.)
2. Server validates the data and checks for existing users with the same email
3. If validation passes, password is hashed using bcrypt
4. User is created in the database
5. A JWT token is generated and returned to the client

### Login Process

1. Client submits credentials (email and password)
2. Server validates credentials against the database
3. If validation passes, a JWT token is generated with user information
4. Token is returned to the client for future authenticated requests

### Authentication for Protected Routes

1. Client includes the JWT token in the Authorization header (`Bearer {token}`)
2. The `authenticate` middleware validates the token
3. If valid, the user information is extracted and added to the request
4. The request proceeds to the route handler
5. If invalid, an error response is returned

### Logout Process

1. Client sends a request to the logout endpoint with their token
2. Server adds the token to the blacklist
3. Future requests with that token will be rejected

## API Endpoints

### POST /auth/register

Registers a new user in the system.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "TEACHER"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "TEACHER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/login

Authenticates a user and provides a JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "TEACHER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/logout

Invalidates the current JWT token.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

### GET /auth/me

Retrieves the current user's profile.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "TEACHER"
}
```

## Token Management

### Token Format

The JWT token consists of three parts separated by dots:
- **Header**: Contains the token type and algorithm used
- **Payload**: Contains the user information and token metadata
- **Signature**: Ensures the token hasn't been tampered with

Example payload:
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "role": "TEACHER",
  "iat": 1625097600,
  "exp": 1625184000
}
```

### Token Lifetime

- Tokens are valid for **24 hours** after issuance
- After expiration, clients must obtain a new token via login
- Tokens can be manually invalidated before expiration using the logout endpoint

### Token Blacklisting

- The Token Blacklist Service tracks invalidated tokens
- When a user logs out, their token is added to the blacklist
- The authentication middleware checks if tokens are blacklisted
- Blacklisted tokens are automatically removed after expiration

## Role-Based Authorization

The system supports role-based access control (RBAC) through the `authorize` middleware:

```typescript
// Allow only teachers and principals to access a route
router.get('/grades', authenticate, authorize(['TEACHER', 'PRINCIPAL']), gradesController.getGrades);
```

### Available Roles

- `ADMIN`: System administrators with full access
- `PRINCIPAL`: School principals with access to school-wide data
- `TEACHER`: Teachers with access to their classes and students
- `STUDENT`: Students with limited access to their own data
- `PARENT`: Parents with access to their children's data

## Security Considerations

- Passwords are hashed using bcrypt with appropriate salt rounds
- JWT tokens are signed with a secure secret
- Token validation includes signature verification and expiration checking
- Token blacklisting prevents session reuse after logout
- HTTPS should be used in production to protect token transmission
- The JWT secret should be stored securely in environment variables

## Integration Examples

### Frontend Integration (JavaScript)

```javascript
// Registration
async function register(userData) {
  const response = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('token', data.token);
    return data;
  } else {
    throw new Error(data.error);
  }
}

// Login
async function login(credentials) {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });
  
  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('token', data.token);
    return data;
  } else {
    throw new Error(data.error);
  }
}

// Authenticated request
async function fetchProtectedData(url) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token available');
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    // Token expired or invalid, redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }
  
  return await response.json();
}

// Logout
async function logout() {
  const token = localStorage.getItem('token');
  if (!token) return;
  
  const response = await fetch('/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    localStorage.removeItem('token');
  }
}
```

### Flutter Integration (Dart)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  final String baseUrl = 'https://your-api.com/api/v1';
  
  // Register a new user
  Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(userData)
    );
    
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      // Save token to shared preferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['token']);
      return data;
    } else {
      throw Exception(data['error'] ?? 'Registration failed');
    }
  }
  
  // Login user
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password
      })
    );
    
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      // Save token to shared preferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['token']);
      return data;
    } else {
      throw Exception(data['error'] ?? 'Login failed');
    }
  }
  
  // Get current user profile
  Future<Map<String, dynamic>> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    
    if (token == null) {
      throw Exception('Not authenticated');
    }
    
    final response = await http.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: {'Authorization': 'Bearer $token'}
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      // Token expired or invalid, clear it
      await prefs.remove('token');
      throw Exception('Authentication expired');
    } else {
      throw Exception('Failed to get user profile');
    }
  }
  
  // Logout user
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    
    if (token != null) {
      await http.post(
        Uri.parse('$baseUrl/auth/logout'),
        headers: {'Authorization': 'Bearer $token'}
      );
    }
    
    await prefs.remove('token');
  }
  
  // Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token') != null;
  }
} 