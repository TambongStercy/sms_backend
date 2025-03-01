// src/api/v1/services/authService.ts
import prisma, { User, Gender } from '../../../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('Invalid credentials');
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    return { token, user };
}

export async function register(data: {
    name: string;
    email: string;
    password: string;
    gender: string;
    date_of_birth: string;
    phone: string;
    address: string;
    id_card_num?: string;
}): Promise<User> {

    if (!Object.values(Gender).includes(data.gender as Gender)) {
        throw new Error("Invalid gender. Choose a valid gender.");
    }


    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            gender: data.gender as Gender,
            date_of_birth: new Date(data.date_of_birth),
            phone: data.phone,
            address: data.address,
            id_card_num: data.id_card_num,
        },
    });
}

export async function getProfile(userId: number): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}
