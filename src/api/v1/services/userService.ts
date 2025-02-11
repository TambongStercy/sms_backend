// src/api/v1/services/userService.ts

import prisma, { Gender, User, Role } from '../../../config/db';
import bcrypt from 'bcrypt';


export async function getAllUsers(): Promise<User[]> {
    return prisma.user.findMany();
}

export async function createUser(data: {
    name: string;
    email: string;
    password: string;
    gender: string;
    date_of_birth: string;
    phone: string;
    address: string;
}): Promise<User> {
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
        },
    });
}

export async function getUserById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
}

export async function updateUser(id: number, data: Partial<User>): Promise<User> {
    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }
    return prisma.user.update({
        where: { id },
        data,
    });
}

export async function deleteUser(id: number): Promise<User> {
    return prisma.user.delete({ where: { id } });
}

export async function assignRole(user_id: number, data: { role: Role; academic_year_id?: number }): Promise<any> {
    return prisma.userRole.create({
        data: {
            user_id,
            role: data.role,
            academic_year_id: data.academic_year_id,
        },
    });
}

export async function removeRole(user_id: number, role: Role): Promise<any> {
    return prisma.userRole.deleteMany({
        where: { user_id, role },
    });
}
