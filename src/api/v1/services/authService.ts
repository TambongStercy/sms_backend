// src/api/v1/services/authService.ts
import { PrismaClient, User, Role, Gender, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../../../config/auth';
import prisma from '../../../config/db';
import { generateStaffMatricule } from '../../../utils/matriculeGenerator';
import { getAcademicYearId } from '../../../utils/academicYear';

interface LoginCredentials {
    email?: string;
    matricule?: string;
    password: string;
}

// Define user registration data interface
interface UserRegistrationData {
    name: string;
    email: string;
    password: string;
    gender: "Male" | "Female";
    date_of_birth: string;
    phone: string;
    address: string;
    id_card_num?: string;
    photo?: string;
    status?: UserStatus;
}

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}

const TOKEN_EXPIRY = '24h';

/**
 * Logs a user in.
 * @param credentials - The user's login credentials (email or matricule, and password).
 * @returns The JWT token and user data.
 */
export const login = async (credentials: LoginCredentials): Promise<any> => {
    const { email, matricule, password } = credentials;

    if (!password || (!email && !matricule)) {
        throw new Error('Email/Matricule and password are required');
    }

    const findCondition = email ? { email: email?.toLowerCase() } : { matricule: matricule?.toUpperCase() };

    const user = await prisma.user.findUnique({
        where: findCondition,
        include: {
            user_roles: true,
        },
    });

    if (!user) {
        console.error(`Login failed: User not found with identifier - ${email || matricule}`);
        throw new Error('User not found');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        console.error(`Login failed: Password mismatch for user ${user.email}`);
        throw new Error('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
        throw new Error('User account is not active');
    }

    // Get unique roles only (user might have same role across multiple academic years)
    const userActiveRoles = [...new Set(user.user_roles.map(ur => ur.role))];
    const token = generateToken({ id: user.id, roles: userActiveRoles });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return { token, expiresIn: '24h', user: userWithoutPassword };
};

/**
 * Registers a new user.
 * @param userData - User registration data
 * @returns The newly created user.
 */
export const register = async (userData: UserRegistrationData): Promise<User> => {
    console.log('Registration data received:', userData);
    
    const {
        name,
        email,
        password,
        gender,
        date_of_birth: dateOfBirth,
        phone,
        address,
        id_card_num: idCardNum,
        photo,
        status,
    } = userData;

    // Validate required fields
    if (!password) {
        throw new Error('Password is required');
    }
    if (!name) {
        throw new Error('Name is required');
    }
    if (!email) {
        throw new Error('Email is required');
    }
    if (!phone) {
        throw new Error('Phone is required');
    }
    if (!gender) {
        throw new Error('Gender is required');
    }
    if (!dateOfBirth) {
        throw new Error('Date of birth is required');
    }
    if (!address) {
        throw new Error('Address is required');
    }

    console.log('Password received:', password ? 'YES' : 'NO');

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email: email?.toLowerCase() } });
    if (existingUser) {
        throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate matricule for the default PARENT role
    const matricule = await generateStaffMatricule([Role.PARENT]);

    // Get current academic year for role assignment tracking
    const currentAcademicYearId = await getAcademicYearId();
    if (!currentAcademicYearId) {
        throw new Error('No academic year found. Please ensure at least one academic year exists.');
    }

    const createdUser = await prisma.user.create({
        data: {
            name,
            email: email?.toLowerCase(),
            password: hashedPassword,
            gender: gender,
            date_of_birth: new Date(dateOfBirth),
            phone,
            address,
            matricule, // Add the generated matricule
            ...(idCardNum && { id_card_num: idCardNum }),
            ...(photo && { photo }),
            status: status || 'ACTIVE',
            user_roles: {
                create: [{
                    role: Role.PARENT,
                    academic_year_id: currentAcademicYearId // Track when role was assigned
                }],
            },
        },
        include: {
            user_roles: true,
        },
    });

    return createdUser;
};

/**
 * Get user profile by ID
 * @param userId - User ID
 * @returns User data
 */
export async function getProfile(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            user_roles: true
        }
    });

    if (!user) {
        return null;
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}
