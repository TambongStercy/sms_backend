// src/api/v1/services/authService.ts
import { PrismaClient, User, Role, Gender, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../../../config/auth';
import prisma from '../../../config/db';

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

    const findCondition = email ? { email } : { matricule };

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

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            gender: gender,
            date_of_birth: new Date(dateOfBirth),
            phone,
            address,
            id_card_num: idCardNum,
            photo,
            status: status || 'ACTIVE',
            user_roles: {
                create: [{ role: Role.PARENT }], // Default role for new users is PARENT
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
