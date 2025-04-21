/**
 * @swagger
 * tags:
 *   name: Student Averages
 *   description: Student average calculation and retrieval endpoints
 */

/**
 * @swagger
 * /student-averages/calculate/{examSequenceId}:
 *   post:
 *     summary: Calculate and save student averages for an exam sequence
 *     description: Calculates and saves student averages for a specific exam sequence
 *     tags: [Student Averages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examSequenceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the exam sequence
 *       - in: query
 *         name: sub_classId
 *         schema:
 *           type: integer
 *         description: Optional sub_class ID to filter students
 *     responses:
 *       200:
 *         description: Student averages calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     averages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StudentSequenceAverage'
 *                     count:
 *                       type: integer
 *                       example: 25
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /student-averages/sequence/{examSequenceId}:
 *   get:
 *     summary: Get student averages for an exam sequence
 *     description: Retrieves all student averages for a specific exam sequence
 *     tags: [Student Averages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examSequenceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the exam sequence
 *       - in: query
 *         name: sub_classId
 *         schema:
 *           type: integer
 *         description: Optional sub_class ID to filter students
 *     responses:
 *       200:
 *         description: Student averages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     averages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StudentSequenceAverage'
 *                     count:
 *                       type: integer
 *                       example: 25
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /student-averages/{enrollmentId}/{examSequenceId}:
 *   get:
 *     summary: Get a specific student's average
 *     description: Retrieves a specific student's average for a specific exam sequence
 *     tags: [Student Averages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the enrollment
 *       - in: path
 *         name: examSequenceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the exam sequence
 *     responses:
 *       200:
 *         description: Student average retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     average:
 *                       $ref: '#/components/schemas/StudentSequenceAverage'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Student average not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /student-averages/{id}/decision:
 *   patch:
 *     summary: Update decision for a student's average
 *     description: Updates the decision field for a student's average
 *     tags: [Student Averages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the student average record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentAverageDecisionUpdate'
 *     responses:
 *       200:
 *         description: Decision updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     average:
 *                       $ref: '#/components/schemas/StudentSequenceAverage'
 *       400:
 *         description: Decision is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Export empty object as this file is only used for Swagger documentation
export { }; 