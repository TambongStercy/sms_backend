import {
    PrismaClient, User, SchoolFees, AcademicYear, Gender, SubjectCategory, Role, Student, ParentStudent,
    PaymentTransaction, PaymentMethod, Announcement, MobileNotification, Audience, Class, Subclass,
    Mark, ExamSequence, Term, Subject, SubjectTeacher, SubclassSubject, StudentAbsence, TeacherAbsence,
    DisciplineIssue, VicePrincipalAssignment, DisciplineMasterAssignment, PrincipalAssignment, BursarAssignment,
    Period, TeacherPeriod, ExamPaper, ExamPaperQuestion, Question, QuestionType, NotificationStatus,
    DayOfWeek, Enrollment, StudentSequenceAverage, AverageStatus
} from '@prisma/client';
import * as dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Set the DATABASE_URL based on the environment
if (process.env.NODE_ENV === 'production') {
    process.env.DATABASE_URL = process.env.DATABASE_URL_PRODUCTION;
} else {
    process.env.DATABASE_URL = process.env.DATABASE_URL_DEVELOPMENT;
}

console.log(`Using database URL for ${process.env.NODE_ENV} environment`);

const prisma = new PrismaClient();

export {
    User, SchoolFees, AcademicYear, Gender, SubjectCategory, Role, Student, ParentStudent,
    PaymentTransaction, PaymentMethod, Announcement, MobileNotification, Audience, Class, Subclass,
    Mark, ExamSequence, Term, Subject, SubjectTeacher, SubclassSubject, StudentAbsence, TeacherAbsence,
    DisciplineIssue, VicePrincipalAssignment, DisciplineMasterAssignment, PrincipalAssignment, BursarAssignment,
    Period, TeacherPeriod, ExamPaper, ExamPaperQuestion, Question, QuestionType, NotificationStatus,
    DayOfWeek, Enrollment, StudentSequenceAverage, AverageStatus
};

export default prisma; 