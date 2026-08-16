// Per-subclass seating limit used by dashboards, analytics, and capacity guards.
// A class's total capacity is this constant multiplied by the number of subclasses it has.
export const SUBCLASS_MAX_STUDENTS = 54;

export const getClassMaxStudents = (subclassCount: number): number =>
    subclassCount * SUBCLASS_MAX_STUDENTS;
