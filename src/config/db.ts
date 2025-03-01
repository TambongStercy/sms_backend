import {
    PrismaClient, User, SchoolFees, AcademicYear, Gender, SubjectCategory, Role, Student, ParentStudent,
    PaymentTransaction, PaymentMethod, Announcement, MobileNotification, Audience, Class, Subclass,
    Mark, ExamSequence, Term, Subject, SubjectTeacher, SubclassSubject, StudentAbsence, TeacherAbsence,
    DisciplineIssue, VicePrincipalAssignment, DisciplineMasterAssignment, PrincipalAssignment, BursarAssignment,
    Period, TeacherPeriod, ExamPaper, ExamPaperQuestion, Question, QuestionType, NotificationStatus,
    DayOfWeek, Enrollment
} from '@prisma/client';

const prisma = new PrismaClient();

export {
    User, SchoolFees, AcademicYear, Gender, SubjectCategory, Role, Student, ParentStudent,
    PaymentTransaction, PaymentMethod, Announcement, MobileNotification, Audience, Class, Subclass,
    Mark, ExamSequence, Term, Subject, SubjectTeacher, SubclassSubject, StudentAbsence, TeacherAbsence,
    DisciplineIssue, VicePrincipalAssignment, DisciplineMasterAssignment, PrincipalAssignment, BursarAssignment,
    Period, TeacherPeriod, ExamPaper, ExamPaperQuestion, Question, QuestionType, NotificationStatus,
    DayOfWeek, Enrollment
};

export default prisma; 