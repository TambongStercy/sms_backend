/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File upload and management for student photos and other system assets
 */

/**
 * @swagger
 * /uploads:
 *   post:
 *     summary: Upload an image file
 *     description: |
 *       Upload an image file to the server and get the image URL.
 *       This endpoint is useful for uploading student photos before creating enrollments.
 *       The uploaded file will be stored in the server's 'uploads' directory.
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload (JPEG, PNG, etc.)
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 *             example:
 *               success: true
 *               message: "File uploaded successfully"
 *               file:
 *                 filename: "1620000000000-123456789.jpg"
 *                 originalname: "student-photo.jpg"
 *                 mimetype: "image/jpeg"
 *                 size: 102400
 *                 url: "http://localhost:3000/uploads/1620000000000-123456789.jpg"
 *       400:
 *         description: No file uploaded or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileError'
 *             examples:
 *               noFile:
 *                 value:
 *                   success: false
 *                   error: "No file uploaded"
 *               invalidType:
 *                 value:
 *                   success: false
 *                   error: "Only image files are allowed!"
 *       401:
 *         description: Authentication error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noToken:
 *                 value:
 *                   success: false
 *                   error: "No token provided"
 *               invalidToken:
 *                 value:
 *                   success: false
 *                   error: "Invalid token"
 *               expiredToken:
 *                 value:
 *                   success: false
 *                   error: "Token expired"
 *       413:
 *         description: File too large (exceeds 5MB limit)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileError'
 *             example:
 *               success: false
 *               error: "File too large"
 *               details: "File size exceeds the 5MB limit"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileError'
 *             example:
 *               success: false
 *               error: "Failed to upload file"
 *               details: "Error writing file to disk"
 */

/**
 * @swagger
 * /uploads/{filename}:
 *   delete:
 *     summary: Delete an uploaded file
 *     description: |
 *       Delete a previously uploaded file by filename.
 *       This endpoint removes the file from the server's filesystem.
 *       Note that files are not automatically deleted when associated records are deleted.
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The filename of the file to delete (as returned in the upload response)
 *         example: "1620000000000-123456789.jpg"
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileDeleteResponse'
 *             example:
 *               success: true
 *               message: "File deleted successfully"
 *       401:
 *         description: Authentication error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noToken:
 *                 value:
 *                   success: false
 *                   error: "No token provided"
 *               invalidToken:
 *                 value:
 *                   success: false
 *                   error: "Invalid token"
 *               expiredToken:
 *                 value:
 *                   success: false
 *                   error: "Token expired"
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileError'
 *             example:
 *               success: false
 *               error: "File not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileError'
 *             example:
 *               success: false
 *               error: "Failed to delete file"
 *               details: "Error accessing filesystem"
 */

export { }; 