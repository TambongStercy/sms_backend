/**
 * @swagger
 * components:
 *   schemas:
 *     FileUploadResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Status message
 *           example: File uploaded successfully
 *         file:
 *           type: object
 *           properties:
 *             filename:
 *               type: string
 *               description: Generated filename on the server
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
 *               description: URL to access the uploaded file
 *               example: http://localhost:3000/uploads/1620000000000-123456789.jpg
 *       description: Response after successful file upload
 *     
 *     FileDeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Status message
 *           example: File deleted successfully
 *       description: Response after successful file deletion
 *     
 *     FileError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *           example: No file uploaded
 *         details:
 *           type: string
 *           description: Detailed error information
 *           example: File size exceeds the limit
 *       description: Error response for file operations
 */

// Export empty object as this file is only used for Swagger documentation
export { }; 