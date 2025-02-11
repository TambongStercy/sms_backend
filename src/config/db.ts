import {
    PrismaClient, User, SchoolFees, AcademicYear, Gender, SubjectCategory, Role, Student, Parent_Student, PaymentTransaction, PaymentMethod, Announcement, MobileNotification, Audience, Class, SubClass
} from '@prisma/client';

const prisma = new PrismaClient();

export {
    User, SchoolFees, AcademicYear, Gender, SubjectCategory, Role, Student, Parent_Student, PaymentTransaction, PaymentMethod, Announcement, MobileNotification, Audience, Class, SubClass
};

export default prisma; 