# Authentication Flow Diagrams

This document provides visual representations of the authentication flows in the School Management System.

## Registration Flow

```
+--------+                                  +--------+                          +--------+
| Client |                                  | Server |                          |   DB   |
+--------+                                  +--------+                          +--------+
    |                                           |                                   |
    | POST /auth/register                       |                                   |
    | {name, email, password, role}             |                                   |
    |------------------------------------------>|                                   |
    |                                           |                                   |
    |                                           | Check if email exists             |
    |                                           |---------------------------------->|
    |                                           |                                   |
    |                                           | Result                            |
    |                                           |<----------------------------------|
    |                                           |                                   |
    |                                           | If email exists:                  |
    |                                           | Return conflict error             |
    |                                           |                                   |
    |                                           | Else:                             |
    |                                           | Hash password with bcrypt         |
    |                                           |                                   |
    |                                           | Save user                         |
    |                                           |---------------------------------->|
    |                                           |                                   |
    |                                           | User created                      |
    |                                           |<----------------------------------|
    |                                           |                                   |
    |                                           | Generate JWT token                |
    |                                           | (valid for 24 hours)              |
    |                                           |                                   |
    | 200 OK                                    |                                   |
    | {user, token}                             |                                   |
    |<------------------------------------------|                                   |
    |                                           |                                   |
```

## Login Flow

```
+--------+                                  +--------+                          +--------+
| Client |                                  | Server |                          |   DB   |
+--------+                                  +--------+                          +--------+
    |                                           |                                   |
    | POST /auth/login                          |                                   |
    | {email, password}                         |                                   |
    |------------------------------------------>|                                   |
    |                                           |                                   |
    |                                           | Find user by email                |
    |                                           |---------------------------------->|
    |                                           |                                   |
    |                                           | User data                         |
    |                                           |<----------------------------------|
    |                                           |                                   |
    |                                           | If user not found:                |
    |                                           | Return 401 Unauthorized           |
    |                                           |                                   |
    |                                           | Else:                             |
    |                                           | Compare password with bcrypt      |
    |                                           |                                   |
    |                                           | If password invalid:              |
    |                                           | Return 401 Unauthorized           |
    |                                           |                                   |
    |                                           | Else:                             |
    |                                           | Generate JWT token                |
    |                                           | (valid for 24 hours)              |
    |                                           |                                   |
    | 200 OK                                    |                                   |
    | {user, token}                             |                                   |
    |<------------------------------------------|                                   |
    |                                           |                                   |
```

## Authentication Flow for Protected Routes

```
+--------+                                  +--------+                      +---------------+
| Client |                                  | Auth   |                      | Route Handler |
+--------+                                  | Middle-|                      +---------------+
    |                                       | ware   |                              |
    | GET /protected-route                  +--------+                              |
    | Authorization: Bearer {token}               |                                 |
    |-------------------------------------->|                                       |
    |                                       |                                       |
    |                                       | Extract token from header             |
    |                                       |                                       |
    |                                       | Check if token is blacklisted         |
    |                                       |                                       |
    |                                       | If blacklisted:                       |
    |                                       | Return 401 Unauthorized               |
    |                                       |                                       |
    |                                       | Else:                                 |
    |                                       | Verify token signature                |
    |                                       |                                       |
    |                                       | If invalid signature:                 |
    |                                       | Return 401 Unauthorized               |
    |                                       |                                       |
    |                                       | If token expired:                     |
    |                                       | Return 401 Unauthorized               |
    |                                       |                                       |
    |                                       | Else:                                 |
    |                                       | Add user data to request              |
    |                                       |                                       |
    |                                       | Forward request                       |
    |                                       |-------------------------------------->|
    |                                       |                                       |
    |                                       |                                       | Process request
    |                                       |                                       |
    |                                       |              Response                 |
    |                                       |<--------------------------------------|
    |                                       |                                       |
    |              Response                 |                                       |
    |<--------------------------------------|                                       |
    |                                       |                                       |
```

## Logout Flow

```
+--------+                                  +--------+                      +-------------+
| Client |                                  | Server |                      | Blacklist   |
+--------+                                  +--------+                      | Service     |
    |                                           |                           +-------------+
    | POST /auth/logout                         |                                 |
    | Authorization: Bearer {token}             |                                 |
    |------------------------------------------>|                                 |
    |                                           |                                 |
    |                                           | Extract token from header       |
    |                                           |                                 |
    |                                           | Add token to blacklist          |
    |                                           |-------------------------------->|
    |                                           |                                 |
    |                                           | Token blacklisted               |
    |                                           |<--------------------------------|
    |                                           |                                 |
    | 200 OK                                    |                                 |
    | {message: "Logged out successfully"}      |                                 |
    |<------------------------------------------|                                 |
    |                                           |                                 |
```

## Role-Based Authorization

```
+--------+                             +--------+                       +--------+               +--------+
| Client |                             | Auth   |                       | Role   |               | Route   |
+--------+                             | Middle-|                       | Middle-|               | Handler |
    |                                  | ware   |                       | ware   |               +--------+
    |                                  +--------+                       +--------+                   |
    | GET /restricted-route                |                                |                        |
    | Authorization: Bearer {token}        |                                |                        |
    |--------------------------------->|                                |                        |
    |                                  |                                |                        |
    |                                  | Verify token                   |                        |
    |                                  | Add user to request            |                        |
    |                                  |                                |                        |
    |                                  | Forward request                |                        |
    |                                  |------------------------------->|                        |
    |                                  |                                |                        |
    |                                  |                                | Check user role        |
    |                                  |                                | against allowed roles  |
    |                                  |                                |                        |
    |                                  |                                | If role not allowed:   |
    |                                  |                                | Return 403 Forbidden   |
    |                                  |                                |                        |
    |                                  |                                | Else:                  |
    |                                  |                                | Forward request        |
    |                                  |                                |----------------------->|
    |                                  |                                |                        |
    |                                  |                                |                        | Process 
    |                                  |                                |                        | request
    |                                  |                                |       Response         |
    |                                  |                                |<-----------------------|
    |                                  |         Response               |                        |
    |                                  |<-------------------------------|                        |
    |         Response                 |                                                         |
    |<---------------------------------|                                                         |
    |                                  |                                                         |
```

## Token Management and Lifecycle

```
  JWT Token Created
         |
         v
 +----------------+     +----------------+     +----------------+
 | Active Token   |---->| Blacklisted    |---->| Expired Token  |
 | - Valid for    |     | Token          |     | - Beyond the   |
 |   24 hours     |     | - Still within |     |   validity     |
 | - Used for     |     |   validity     |     |   period       |
 |   authentication |     |   period but  |     | - Automatically|
 +----------------+     |   invalid for  |     |   rejected by  |
         ^              |   auth         |     |   JWT verify   |
         |              +----------------+     +----------------+
         |                     ^                       ^
         |                     |                       |
   User Login                  |                       |
                         User Logout              Time passes
                                                   (24 hours)
```

## Authentication Implementation Architecture

```
+----------------+     +----------------+     +----------------+
| Auth Routes    |---->| Auth           |---->| Auth Service   |
| - Register     |     | Controller     |     | - Core auth    |
| - Login        |     | - Request      |     |   logic        |
| - Logout       |     |   handling     |     | - Token        |
| - Get profile  |     | - Response     |     |   generation   |
+----------------+     |   formatting   |     | - Password     |
         |             +----------------+     |   hashing      |
         v                     |             +----------------+
+----------------+             |                     |
| Auth           |             |                     v
| Middleware     |<------------+             +----------------+
| - Token        |                           | Token          |
|   validation   |                           | Blacklist      |
| - Role-based   |                           | Service        |
|   access       |                           | - Track        |
+----------------+                           |   invalidated  |
                                             |   tokens       |
                                             +----------------+
``` 