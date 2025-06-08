import prisma from '../config/db';
import { Role } from '@prisma/client';

const STAFF_MATRICULE_PREFIX = 'SS';
const STUDENT_MATRICULE_PREFIX = 'SS'; // As per your format SS{YY}STU{NNN}
const STUDENT_TYPE_CODE = 'STU';

const POSITION_CODES = {
    SUPER_MANAGER: 'CEO',
    MANAGER: 'SA',
    TEACHER: 'ST',
    OTHERS: 'SO' // For other staff roles like Principal, Bursar etc.
};

// Defines the hierarchy for determining the matricule position code.
// Highest role in this list that the user has will determine the code.
const MATRICULE_ROLE_PRIORITY: Role[] = [
    Role.SUPER_MANAGER,
    Role.MANAGER,
    Role.TEACHER,
    // Add other specific roles here if they need a code other than SO 
    // and have a specific position in the hierarchy above general 'OTHERS'.
    // For now, any role not SUPER_MANAGER, MANAGER, or TEACHER will become OTHERS (SO).
];

/**
 * Determines the position code based on user roles and hierarchy.
 * @param roles Array of user roles.
 * @returns The position code (CEO, SA, ST, SO).
 */
export function getPositionCodeForRoles(roles: Role[] | undefined | null): string {
    if (!roles || roles.length === 0) {
        return POSITION_CODES.OTHERS; // Or handle as an error/specific default
    }

    for (const priorityRole of MATRICULE_ROLE_PRIORITY) {
        if (roles.includes(priorityRole)) {
            switch (priorityRole) {
                case Role.SUPER_MANAGER:
                    return POSITION_CODES.SUPER_MANAGER;
                case Role.MANAGER:
                    return POSITION_CODES.MANAGER;
                case Role.TEACHER:
                    return POSITION_CODES.TEACHER;
                // Add other cases here if MATRICULE_ROLE_PRIORITY is expanded
            }
        }
    }
    // If none of the priority roles for CEO, SA, ST are found, but the user has roles,
    // they are considered 'OTHERS'. This covers Principal, VP, Bursar, etc.
    return POSITION_CODES.OTHERS;
}

/**
 * Generates the next sequence number for a staff matricule based on year and position.
 * @param yearLastTwoDigits YY (e.g., "23")
 * @param positionCode CEO, SA, ST, SO
 * @returns Next 4-digit sequence number (e.g., "0001")
 */
async function getNextStaffSequenceNumber(yearLastTwoDigits: string, positionCode: string): Promise<string> {
    const prefix = `${STAFF_MATRICULE_PREFIX}${yearLastTwoDigits}${positionCode}`;
    const lastUser = await prisma.user.findFirst({
        where: {
            matricule: {
                startsWith: prefix,
            },
        },
        orderBy: {
            matricule: 'desc',
        },
    });

    let nextNumber = 1;
    if (lastUser && lastUser.matricule) {
        try {
            const lastNumberStr = lastUser.matricule.substring(prefix.length);
            const lastNumber = parseInt(lastNumberStr, 10);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        } catch (e) {
            console.error(`Error parsing sequence number from matricule: ${lastUser.matricule}`, e);
            // Fallback to 1 or throw error
        }
    }

    if (nextNumber > 9999) {
        throw new Error(`Maximum matricule number (9999) reached for prefix ${prefix}`);
    }
    return nextNumber.toString().padStart(4, '0');
}

/**
 * Generates a new staff matricule.
 * SS{year}{position}{number}
 * @param roles Array of user roles.
 * @param customYear Optional: Full year (e.g., 2023). Defaults to current year.
 * @returns Generated staff matricule string.
 */
export async function generateStaffMatricule(roles: Role[], customYear?: number): Promise<string> {
    const year = customYear || new Date().getFullYear();
    const yearLastTwoDigits = year.toString().slice(-2);
    const positionCode = getPositionCodeForRoles(roles);
    const sequenceNumber = await getNextStaffSequenceNumber(yearLastTwoDigits, positionCode);
    return `${STAFF_MATRICULE_PREFIX}${yearLastTwoDigits}${positionCode}${sequenceNumber}`;
}

/**
 * Generates the next sequence number for a student matricule based on year.
 * @param yearLastTwoDigits YY (e.g., "23")
 * @returns Next 3-digit sequence number (e.g., "001")
 */
async function getNextStudentSequenceNumber(yearLastTwoDigits: string): Promise<string> {
    const prefix = `${STUDENT_MATRICULE_PREFIX}${yearLastTwoDigits}${STUDENT_TYPE_CODE}`;
    const lastStudent = await prisma.student.findFirst({
        where: {
            matricule: {
                startsWith: prefix,
            },
        },
        orderBy: {
            matricule: 'desc',
        },
    });

    let nextNumber = 1;
    if (lastStudent && lastStudent.matricule) {
        try {
            const lastNumberStr = lastStudent.matricule.substring(prefix.length);
            const lastNumber = parseInt(lastNumberStr, 10);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        } catch (e) {
            console.error(`Error parsing sequence number from student matricule: ${lastStudent.matricule}`, e);
        }
    }

    if (nextNumber > 999) {
        throw new Error(`Maximum student matricule number (999) reached for prefix ${prefix}`);
    }
    return nextNumber.toString().padStart(3, '0');
}

/**
 * Generates a new student matricule.
 * SS{YY}STU{NNN}
 * @param customYear Optional: Full year (e.g., 2023). Defaults to current year.
 * @returns Generated student matricule string.
 */
export async function generateStudentMatricule(customYear?: number): Promise<string> {
    const year = customYear || new Date().getFullYear();
    const yearLastTwoDigits = year.toString().slice(-2);
    const sequenceNumber = await getNextStudentSequenceNumber(yearLastTwoDigits);
    return `${STUDENT_MATRICULE_PREFIX}${yearLastTwoDigits}${STUDENT_TYPE_CODE}${sequenceNumber}`;
} 