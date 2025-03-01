# Mobile API Documentation

This document provides comprehensive details about the Mobile API endpoints in the School Management System.

## Base URL

All endpoints are relative to the base URL: `/api/v1/mobile`

## Authentication

All endpoints require authentication using a JWT token. The token must be included in the `Authorization` header using the Bearer scheme:

```
Authorization: Bearer <your_token>
```

## Endpoints

### Get Mobile Dashboard

Retrieves dashboard data for the mobile application.

- **URL**: `/dashboard`
- **Method**: `GET`
- **Authentication**: Required
- **Authorization**: All authenticated users

#### Response

```json
{
  "announcements": [],
  "upcomingEvents": [],
  "statistics": {
    "attendance": 0,
    "assignments": 0,
    "fees": {
      "paid": 0,
      "pending": 0
    }
  },
  "quickLinks": []
}
```

#### Error Responses

- **401 Unauthorized**: Authentication token is missing or invalid
- **500 Internal Server Error**: Server encountered an error

---

### Register Device

Registers a mobile device for push notifications.

- **URL**: `/register-device`
- **Method**: `POST`
- **Authentication**: Required
- **Authorization**: All authenticated users

#### Request Body

```json
{
  "deviceToken": "fcm-token-example-123456789",
  "deviceType": "android"
}
```

#### Response

```json
{
  "success": true,
  "message": "Device registered successfully",
  "deviceInfo": {
    "userId": 1,
    "deviceToken": "fcm-token-example-123456789",
    "deviceType": "android"
  }
}
```

#### Error Responses

- **400 Bad Request**: Missing required fields
- **401 Unauthorized**: Authentication token is missing or invalid
- **500 Internal Server Error**: Server encountered an error

---

### Get Notifications

Retrieves notifications for the authenticated user.

- **URL**: `/notifications`
- **Method**: `GET`
- **Authentication**: Required
- **Authorization**: All authenticated users

#### Response

```json
[
  {
    "id": 1,
    "message": "New announcement posted",
    "date_sent": "2023-01-01T12:00:00.000Z",
    "status": "DELIVERED"
  }
]
```

#### Error Responses

- **401 Unauthorized**: Authentication token is missing or invalid
- **500 Internal Server Error**: Server encountered an error

---

### Sync Data

Synchronizes offline data with the server.

- **URL**: `/data/sync`
- **Method**: `POST`
- **Authentication**: Required
- **Authorization**: All authenticated users

#### Request Body

```json
{
  "lastSyncTimestamp": "2023-01-01T12:00:00.000Z",
  "data": {
    "attendanceRecords": [],
    "markEntries": [],
    "formSubmissions": []
  }
}
```

#### Response

```json
{
  "success": true,
  "syncTimestamp": "2023-01-02T12:00:00.000Z",
  "updates": {
    "students": [],
    "classes": [],
    "subjects": [],
    "announcements": []
  }
}
```

#### Error Responses

- **400 Bad Request**: Invalid data format
- **401 Unauthorized**: Authentication token is missing or invalid
- **500 Internal Server Error**: Server encountered an error

## Data Models

### Notification

```typescript
interface Notification {
  id: number;
  user_id: number;
  message: string;
  date_sent: Date;
  status: "SENT" | "DELIVERED" | "READ";
  created_at: Date;
  updated_at: Date;
}
``` 