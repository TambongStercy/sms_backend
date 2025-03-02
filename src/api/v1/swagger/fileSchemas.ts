/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File upload and management for student photos and other system assets
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FileUploadResponse:
 *       type: object
 *       required:
 *         - message
 *         - file
 *       properties:
 *         message:
 *           type: string
 *           description: Status message
 *           example: File uploaded successfully
 *         file:
 *           type: object
 *           required:
 *             - filename
 *             - originalname
 *             - mimetype
 *             - size
 *             - url
 *           properties:
 *             filename:
 *               type: string
 *               description: Generated filename on the server (unique identifier)
 *               example: 1620000000000-123456789.jpg
 *             originalname:
 *               type: string
 *               description: Original filename from the client
 *               example: student-photo.jpg
 *             mimetype:
 *               type: string
 *               description: MIME type of the file
 *               example: image/jpeg
 *             size:
 *               type: number
 *               description: Size of the file in bytes
 *               example: 102400
 *             url:
 *               type: string
 *               description: Full URL to access the uploaded file
 *               example: http://localhost:3000/uploads/1620000000000-123456789.jpg
 *       description: Response after successful file upload
 *     
 *     FileDeleteResponse:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           description: Status message
 *           example: File deleted successfully
 *       description: Response after successful file deletion
 *     
 *     FileError:
 *       type: object
 *       required:
 *         - error
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *           example: No file uploaded
 *         details:
 *           type: string
 *           description: Detailed error information (if available)
 *           example: File size exceeds the limit
 *       description: Error response for file operations
 */

// Export empty object as this file is only used for Swagger documentation
export { }; 