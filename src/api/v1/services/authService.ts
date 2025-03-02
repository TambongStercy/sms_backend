// src/api/v1/services/authService.ts
import prisma, { User, Gender } from '../../../config/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Define user registration data interface
interface UserRegistrationData {
    name: string;
    email: string;
    password: string;
    gender: string;
    date_of_birth: string;
    phone: string;
    address: string;
    id_card_num?: string;
    photo?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'thisschoolsappisbest';

/**
 * Authenticate user and generate JWT token
 * @param email - User email
 * @param password - User password
 * @returns Object containing JWT token and user data
 */
export async function login(email: string, password: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            user_roles: true // Include roles if the relationship exists
        }
    });

    // Check if user exists
    if (!user) {
        throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    // Return token and user (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    return {
        success: true,
        token,
        user: userWithoutPassword
    };
}

/**
 * Register a new user
 * @param userData - User registration data
 * @returns Created user data
 */
export async function register(userData: UserRegistrationData) {
    // Validate gender
    if (userData.gender && !Object.values(Gender).includes(userData.gender as any)) {
        throw new Error('Invalid gender. Choose a valid gender.');
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
    });

    if (existingUser) {
        throw new Error('Email already in use');
    }

    // Format date correctly if it's a string
    const formattedData = {
        ...userData,
        gender: userData.gender as Gender, // Cast the string to Gender enum
        date_of_birth: new Date(userData.date_of_birth)
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = await prisma.user.create({
        data: {
            name: formattedData.name,
            email: formattedData.email,
            password: hashedPassword,
            gender: formattedData.gender as Gender,
            date_of_birth: formattedData.date_of_birth,
            phone: formattedData.phone,
            address: formattedData.address,
            id_card_num: formattedData.id_card_num,
            photo: formattedData.photo
        }
    });

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

/**
 * Get user profile by ID
 * @param userId - User ID
 * @returns User data
 */
export async function getProfile(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            user_roles: true // Include roles if the relationship exists
        }
    });

    if (!user) {
        return null;
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}
