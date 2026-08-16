import {
    PrismaClient, User, SchoolFees, ControlSchoolFees, AcademicYear, Gender, SubjectCategory, Role, Student, ParentStudent,
    PaymentTransaction, ControlPaymentTransaction, PaymentMethod, Announcement, MobileNotification, Audience, Class, SubClass,
    Mark, ExamSequence, Term, Subject, SubjectTeacher, SubClassSubject, StudentAbsence, TeacherAbsence,
    DisciplineIssue, RoleAssignment, AssignmentRole,
    Period, TeacherPeriod, ExamPaper, ExamPaperQuestion, Question, QuestionType, NotificationStatus,
    DayOfWeek, Enrollment, StudentSequenceAverage, AverageStatus, UserRole, ExamSequenceStatus, ReportStatus, UserStatus,
    ReportType, Prisma, QuizTemplate, QuizQuestion, QuizSubmission, QuizResponse, QuizStatus,
    SyncMetadata, SyncLog, FeeItem, FeeItemPayment, FeeItemScope,
    Refund, RefundMethod,
    FinanceRequest, FinanceRequestType, FinanceRequestStatus,
    Expenditure, ExpenditureCategory,
    SaturdayPunishment, BrokenProperty, PunishmentStatus, DisciplineType, AbsenceType,
    DisciplinaryAction, DisciplinaryActionType, DisciplinaryActionStatus,
    ReportRequest, ReportRequestStatus,
    StudentPreviousSchool, StudentWarning, ParentSummons, DMRollCall, DMRollCallEntry,
    HealthCondition, MakeupStatus, SummonsTrigger, SummonsStatus, RollCallSlot, DMRollCallStatus, WarningReason,
    NurseVisitLog, TeacherPeriodAttendance, TeacherPeriodAttendanceStatus,
    SalaryProfile, SalaryChangeRequest, SalaryAllowance, PayPeriod, SalaryPayment, SalaryWithholding, BursarCashInjection,
    SalaryType, SalaryProfileStatus, SalaryAllowanceType, SalaryApprovalStatus, PayPeriodStatus, SalaryPaymentStatus, WithholdingScope, BursarCashInjectionSource,
    ReamStockLedger, ReamStockEntryType,
    Task, TaskPriority, TaskStatus, NotificationCategory, NotificationPriority,
    UserSettings, Theme
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
    User, SchoolFees, ControlSchoolFees, AcademicYear, Gender, SubjectCategory, Role, Student, ParentStudent,
    PaymentTransaction, ControlPaymentTransaction, PaymentMethod, Announcement, MobileNotification, Audience, Class, SubClass,
    Mark, ExamSequence, Term, Subject, SubjectTeacher, SubClassSubject, StudentAbsence, TeacherAbsence,
    DisciplineIssue, RoleAssignment, AssignmentRole,
    Period, TeacherPeriod, ExamPaper, ExamPaperQuestion, Question, QuestionType, NotificationStatus,
    DayOfWeek, Enrollment, StudentSequenceAverage, AverageStatus, UserRole, ExamSequenceStatus, ReportStatus, UserStatus,
    ReportType, Prisma, QuizTemplate, QuizQuestion, QuizSubmission, QuizResponse, QuizStatus,
    SyncMetadata, SyncLog, FeeItem, FeeItemPayment, FeeItemScope,
    Refund, RefundMethod,
    FinanceRequest, FinanceRequestType, FinanceRequestStatus,
    Expenditure, ExpenditureCategory,
    SaturdayPunishment, BrokenProperty, PunishmentStatus, DisciplineType, AbsenceType,
    DisciplinaryAction, DisciplinaryActionType, DisciplinaryActionStatus,
    ReportRequest, ReportRequestStatus,
    StudentPreviousSchool, StudentWarning, ParentSummons, DMRollCall, DMRollCallEntry,
    HealthCondition, MakeupStatus, SummonsTrigger, SummonsStatus, RollCallSlot, DMRollCallStatus, WarningReason,
    NurseVisitLog, TeacherPeriodAttendance, TeacherPeriodAttendanceStatus,
    SalaryProfile, SalaryChangeRequest, SalaryAllowance, PayPeriod, SalaryPayment, SalaryWithholding, BursarCashInjection,
    SalaryType, SalaryProfileStatus, SalaryAllowanceType, SalaryApprovalStatus, PayPeriodStatus, SalaryPaymentStatus, WithholdingScope, BursarCashInjectionSource,
    ReamStockLedger, ReamStockEntryType,
    Task, TaskPriority, TaskStatus, NotificationCategory, NotificationPriority,
    UserSettings, Theme
};

export default prisma; 