import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { getFileUrl } from '../../../utils/fileUpload';
import { Request } from 'express';

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

interface FileData {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    url: string;
}

/**
 * Save file metadata to the database and return file information
 */
export const saveFileMetadata = async (
    req: Request,
    file: Express.Multer.File,
    userId?: number
): Promise<FileData> => {
    try {
        // Create file record in database if needed
        // This is optional - you can implement this if you want to track files in the database

        // For now, just return the file information
        return {
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: getFileUrl(req, file.filename)
        };
    } catch (error) {
        // If there's an error, delete the uploaded file
        const filePath = path.join(UPLOAD_DIR, file.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
};

/**
 * Delete a file from the filesystem
 */
export const deleteFile = async (filename: string): Promise<boolean> => {
    try {
        const filePath = path.join(UPLOAD_DIR, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);

            // Delete from database if you're tracking files
            // await prisma.file.delete({ where: { filename } });

            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
}; 