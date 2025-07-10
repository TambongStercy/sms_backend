import { Request, Response } from 'express';
import * as teacherAttendanceAnalyticsService from '../services/teacherAttendanceAnalyticsService';

// Get teacher attendance overview
export async function getTeacherAttendanceOverview(req: Request, res: Response) {
  try {
    const academicYearId = req.query.academicYearId ? parseInt(req.query.academicYearId as string) : undefined;
    
    const overview = await teacherAttendanceAnalyticsService.getTeacherAttendanceOverview(academicYearId);

    res.json({
      success: true,
      data: overview
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get detailed teacher attendance analytics
export async function getTeacherAttendanceDetails(req: Request, res: Response) {
  try {
    const {
      teacherId,
      department,
      dateFrom,
      dateTo,
      attendanceStatus,
      minAttendanceRate,
      maxAttendanceRate,
      academicYearId
    } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const filters = {
      teacherId: teacherId ? parseInt(teacherId as string) : undefined,
      department: department as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      attendanceStatus: attendanceStatus as any,
      minAttendanceRate: minAttendanceRate ? parseFloat(minAttendanceRate as string) : undefined,
      maxAttendanceRate: maxAttendanceRate ? parseFloat(maxAttendanceRate as string) : undefined
    };

    const result = await teacherAttendanceAnalyticsService.getTeacherAttendanceDetails(
      filters,
      page,
      limit,
      academicYearId ? parseInt(academicYearId as string) : undefined
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get attendance trends
export async function getAttendanceTrends(req: Request, res: Response) {
  try {
    const { dateFrom, dateTo, academicYearId } = req.query;

    if (!dateFrom || !dateTo) {
      return res.status(400).json({
        success: false,
        error: 'dateFrom and dateTo are required'
      });
    }

    const trends = await teacherAttendanceAnalyticsService.getAttendanceTrends(
      dateFrom as string,
      dateTo as string,
      academicYearId ? parseInt(academicYearId as string) : undefined
    );

    res.json({
      success: true,
      data: trends
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get teacher attendance alerts
export async function getTeacherAttendanceAlerts(req: Request, res: Response) {
  try {
    const academicYearId = req.query.academicYearId ? parseInt(req.query.academicYearId as string) : undefined;
    
    const alerts = await teacherAttendanceAnalyticsService.getTeacherAttendanceAlerts(academicYearId);

    res.json({
      success: true,
      data: alerts
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Record teacher attendance
export async function recordTeacherAttendance(req: Request, res: Response) {
  try {
    const { teacherId, status, reason, periodId } = req.body;
    const recordedBy = req.user?.id;

    if (!teacherId || !status) {
      return res.status(400).json({
        success: false,
        error: 'teacherId and status are required'
      });
    }

    const result = await teacherAttendanceAnalyticsService.recordTeacherAttendance(
      teacherId,
      status,
      reason,
      periodId,
      recordedBy
    );

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get department attendance summary
export async function getDepartmentAttendanceSummary(req: Request, res: Response) {
  try {
    const academicYearId = req.query.academicYearId ? parseInt(req.query.academicYearId as string) : undefined;
    
    const summary = await teacherAttendanceAnalyticsService.getDepartmentAttendanceSummary(academicYearId);

    res.json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get individual teacher attendance analytics
export async function getTeacherAttendanceAnalytics(req: Request, res: Response) {
  try {
    const { teacherId } = req.params;
    const { dateFrom, dateTo, academicYearId } = req.query;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        error: 'teacherId is required'
      });
    }

    const filters = {
      teacherId: parseInt(teacherId),
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    };

    const result = await teacherAttendanceAnalyticsService.getTeacherAttendanceDetails(
      filters,
      1,
      1,
      academicYearId ? parseInt(academicYearId as string) : undefined
    );

    if (result.teachers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      data: result.teachers[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get attendance comparison between periods
export async function getAttendanceComparison(req: Request, res: Response) {
  try {
    const { period1From, period1To, period2From, period2To, academicYearId } = req.query;

    if (!period1From || !period1To || !period2From || !period2To) {
      return res.status(400).json({
        success: false,
        error: 'All period dates are required'
      });
    }

    const [period1Trends, period2Trends] = await Promise.all([
      teacherAttendanceAnalyticsService.getAttendanceTrends(
        period1From as string,
        period1To as string,
        academicYearId ? parseInt(academicYearId as string) : undefined
      ),
      teacherAttendanceAnalyticsService.getAttendanceTrends(
        period2From as string,
        period2To as string,
        academicYearId ? parseInt(academicYearId as string) : undefined
      )
    ]);

    // Calculate averages for comparison
    const period1Avg = period1Trends.reduce((sum, day) => sum + day.attendanceRate, 0) / period1Trends.length;
    const period2Avg = period2Trends.reduce((sum, day) => sum + day.attendanceRate, 0) / period2Trends.length;

    const comparison = {
      period1: {
        dateFrom: period1From,
        dateTo: period1To,
        averageAttendanceRate: period1Avg,
        trends: period1Trends
      },
      period2: {
        dateFrom: period2From,
        dateTo: period2To,
        averageAttendanceRate: period2Avg,
        trends: period2Trends
      },
      improvement: period2Avg - period1Avg,
      improvementPercentage: period1Avg > 0 ? ((period2Avg - period1Avg) / period1Avg) * 100 : 0
    };

    res.json({
      success: true,
      data: comparison
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Export attendance report
export async function exportAttendanceReport(req: Request, res: Response) {
  try {
    const { format, dateFrom, dateTo, academicYearId } = req.query;

    if (!dateFrom || !dateTo) {
      return res.status(400).json({
        success: false,
        error: 'dateFrom and dateTo are required'
      });
    }

    const filters = {
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    };

    const result = await teacherAttendanceAnalyticsService.getTeacherAttendanceDetails(
      filters,
      1,
      1000, // Large limit for export
      academicYearId ? parseInt(academicYearId as string) : undefined
    );

    // For now, return JSON data
    // In a real implementation, you might generate CSV or PDF
    const reportData = {
      generatedAt: new Date().toISOString(),
      period: {
        from: dateFrom,
        to: dateTo
      },
      summary: result.summary,
      teachers: result.teachers
    };

    res.json({
      success: true,
      data: reportData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
} 