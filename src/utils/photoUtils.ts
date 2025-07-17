import path from 'path';
import fs from 'fs';
import { getLocalFilePath, PhotoType } from './fileUpload';

/**
 * Get the local file path for a student photo to be used in Puppeteer
 * This function ensures fast local file access for report generation
 */
export function getStudentPhotoForReport(photoFilename: string | null): string {
    if (!photoFilename) {
        return getLocalFilePath('', PhotoType.STUDENT);
    }

    return getLocalFilePath(photoFilename, PhotoType.STUDENT);
}

/**
 * Convert photo filename to data URI for embedding in HTML/PDF
 * This is useful when we need to embed the image directly in the report
 */
export function getPhotoAsDataUri(photoFilename: string | null): string {
    const filePath = getStudentPhotoForReport(photoFilename);

    try {
        if (fs.existsSync(filePath)) {
            const fileBuffer = fs.readFileSync(filePath);
            const mimeType = getMimeType(filePath);
            const base64 = fileBuffer.toString('base64');
            return `data:${mimeType};base64,${base64}`;
        }
    } catch (error) {
        console.error(`Error reading photo file ${filePath}:`, error);
    }

    // Return default photo as data URI if original fails
    const defaultPath = getLocalFilePath('', PhotoType.STUDENT);
    try {
        const fileBuffer = fs.readFileSync(defaultPath);
        const mimeType = getMimeType(defaultPath);
        const base64 = fileBuffer.toString('base64');
        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.error(`Error reading default photo:`, error);
        return ''; // Return empty string as last resort
    }
}

/**
 * Get MIME type based on file extension
 */
function getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        case '.webp':
            return 'image/webp';
        default:
            return 'image/jpeg'; // Default fallback
    }
}

/**
 * Validate if a photo file exists and is accessible
 */
export function validatePhotoFile(photoFilename: string | null): boolean {
    if (!photoFilename) return false;

    const filePath = getLocalFilePath(photoFilename, PhotoType.STUDENT);
    return fs.existsSync(filePath);
}

/**
 * Get photo file size in bytes
 */
export function getPhotoFileSize(photoFilename: string | null): number {
    if (!photoFilename) return 0;

    const filePath = getLocalFilePath(photoFilename, PhotoType.STUDENT);
    try {
        const stats = fs.statSync(filePath);
        return stats.size;
    } catch (error) {
        return 0;
    }
}

/**
 * Helper function for EJS templates to get photo path
 */
export function getReportPhotoPath(photoFilename: string | null): string {
    return getStudentPhotoForReport(photoFilename);
} 