import { Request, Response } from 'express';
import { saveFileMetadata, deleteFile } from '../services/fileService';

interface CustomRequest extends Request {
    file: Express.Multer.File;
}

/**
 * Upload a single file
 * @route POST /api/v1/uploads
 */
export const uploadFile = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
            return;
        }

        const userId = req.user?.id; // If you have authentication middleware that sets req.user
        const fileData = await saveFileMetadata(req, req.file, userId);

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            file: fileData
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload file',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Delete a file
 * @route DELETE /api/v1/uploads/:filename
 */
export const removeFile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { filename } = req.params;
        const deleted = await deleteFile(filename);

        if (deleted) {
            res.status(200).json({
                success: true,
                message: 'File deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete file',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}; 