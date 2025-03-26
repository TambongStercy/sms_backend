export interface StudentSequenceAverage {
    id: number;
    enrollment_id: number;
    exam_sequence_id: number;
    average: number;
    rank?: number;
    total_students?: number;
    decision?: string;
    status: 'PENDING' | 'CALCULATED' | 'VERIFIED';
    created_at: Date;
    updated_at: Date;
} 