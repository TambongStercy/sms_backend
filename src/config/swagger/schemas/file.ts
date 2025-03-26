/**
 * @swagger
 * components:
 *   schemas:
 *     FileUploadResponse:
 *       type: object
 *       required:
 *         - success
 *         - message
 *         - file
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *           example: true
 *         message:
 *           type: string
 *           description: Status message
 *           example: File uploaded successfully
 *         file:
 *           type: object
 *           required:
 *             - filename
 *             - originalName
 *             - mimeType
 *             - size
 *             - url
 *           properties:
 *             filename:
 *               type: string
 *               example: "1620000000000-123456789.jpg"
 *             originalName:
 *               type: string
 *               example: "student-photo.jpg"
 *             mimeType:
 *               type: string
 *               example: "image/jpeg"
 *             size:
 *               type: number
 *               example: 102400
 *             url:
 *               type: string
 *               example: "http://localhost:3000/uploads/1620000000000-123456789.jpg"
 *       description: Response after successful file upload
 *     
 *     FileDeleteResponse:
 *       type: object
 *       required:
 *         - success
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *           example: true
 *         message:
 *           type: string
 *           description: Status message
 *           example: File deleted successfully
 *       description: Response after successful file deletion
 *     
 *     FileError:
 *       type: object
 *       required:
 *         - success
 *         - error
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates an error occurred
 *           example: false
 *         error:
 *           type: string
 *           description: Error message
 *           example: No file uploaded
 *         details:
 *           type: string
 *           description: Detailed error information (if available)
 *           example: File size exceeds the 5MB limit
 *       description: Error response for file operations
 */

// Export empty object as this file is only used for Swagger documentation
export { }; 
