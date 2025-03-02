# File Upload API

This API provides endpoints for uploading and managing files, particularly images for student profiles and other system needs.

## Upload a File

Upload an image file to the server and get the image URL.

**URL**: `/api/v1/uploads`

**Method**: `POST`

**Auth required**: Yes (JWT token)

**Permissions required**: Authenticated user

**Content-Type**: `multipart/form-data`

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | The image file to upload (JPEG, PNG, etc.) |

### Implementation Details

- Maximum file size: 5MB
- Accepted file types: Images only (MIME types starting with `image/`)
- Files are stored in the `uploads` directory on the server
- Each file is given a unique filename based on timestamp and random number
- Original file extension is preserved

### Success Response

**Code**: `201 Created`

**Content example**:

```json
{
  "message": "File uploaded successfully",
  "file": {
    "filename": "1620000000000-123456789.jpg",
    "originalname": "student-photo.jpg",
    "mimetype": "image/jpeg",
    "size": 102400,
    "url": "http://localhost:3000/uploads/1620000000000-123456789.jpg"
  }
}
```

### Error Responses

**Condition**: No file uploaded.

**Code**: `400 Bad Request`

**Content**:

```json
{
  "error": "No file uploaded"
}
```

**Condition**: File type not allowed.

**Code**: `400 Bad Request`

**Content**:

```json
{
  "error": "Only image files are allowed!"
}
```

**Condition**: File size exceeds limit.

**Code**: `413 Payload Too Large`

**Content**:

```json
{
  "error": "File too large",
  "details": "File size exceeds the 5MB limit"
}
```

**Condition**: User is not authenticated.

**Code**: `401 Unauthorized`

**Content**:

```json
{
  "error": "No token provided"
}
```

OR

```json
{
  "error": "Invalid token"
}
```

OR

```json
{
  "error": "Token expired"
}
```

**Condition**: Server error during upload.

**Code**: `500 Internal Server Error`

**Content**:

```json
{
  "error": "Failed to upload file",
  "details": "Error message details"
}
```

## Delete a File

Delete a previously uploaded file by filename.

**URL**: `/api/v1/uploads/:filename`

**Method**: `DELETE`

**Auth required**: Yes (JWT token)

**Permissions required**: Authenticated user

**URL Parameters**:

| Parameter | Description |
|-----------|-------------|
| filename | The filename of the file to delete (as returned in the upload response) |

### Implementation Details

- This endpoint removes the file from the server's filesystem
- The filename should be the one returned from the upload endpoint (e.g., `1620000000000-123456789.jpg`)
- Files are not automatically deleted when associated records (like student profiles) are deleted
- You must explicitly delete files when they are no longer needed

### Success Response

**Code**: `200 OK`

**Content example**:

```json
{
  "message": "File deleted successfully"
}
```

### Error Responses

**Condition**: File not found.

**Code**: `404 Not Found`

**Content**:

```json
{
  "error": "File not found"
}
```

**Condition**: User is not authenticated.

**Code**: `401 Unauthorized`

**Content**:

```json
{
  "error": "No token provided"
}
```

OR

```json
{
  "error": "Invalid token"
}
```

OR

```json
{
  "error": "Token expired"
}
```

**Condition**: Server error during deletion.

**Code**: `500 Internal Server Error`

**Content**:

```json
{
  "error": "Failed to delete file",
  "details": "Error message details"
}
```

## Usage Example

### Uploading a Student Photo

```javascript
// Example using fetch API
const uploadStudentPhoto = async (photoFile) => {
  const formData = new FormData();
  formData.append('file', photoFile);
  
  const response = await fetch('/api/v1/uploads', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_JWT_TOKEN'
    },
    body: formData
  });
  
  const result = await response.json();
  
  if (response.ok) {
    // Use the URL when creating a student
    const photoUrl = result.file.url;
    return photoUrl;
  } else {
    throw new Error(result.error || 'Failed to upload photo');
  }
};
```

### Creating a Student with Photo URL

```javascript
// After uploading the photo, use the URL in the student creation
const createStudent = async (studentData, photoUrl) => {
  const response = await fetch('/api/v1/students', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_JWT_TOKEN',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...studentData,
      photo: photoUrl
    })
  });
  
  return await response.json();
};
``` 