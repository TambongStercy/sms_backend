# Report Card Generation API Endpoints

This document explains the functionality of the endpoints used to generate student report cards in PDF format.

## Endpoints

1.  **Generate Single Student Report Card:**
    *   **Method:** `GET`
    *   **Path:** `/api/v1/report-cards/student/:studentId`
    *   **Purpose:** Generates a PDF report card for a specific student.

2.  **Generate Subclass Report Cards:**
    *   **Method:** `GET`
    *   **Path:** `/api/v1/report-cards/sub_class/:sub_classId`
    *   **Purpose:** Generates a single multi-page PDF containing report cards for all enrolled students in a specific subclass.

## Authorization

Both endpoints require the user to be authenticated.

## Parameters

*   **Path Parameters:**
    *   `:studentId` (integer, required for single student endpoint)
    *   `:sub_classId` (integer, required for subclass endpoint)
*   **Query Parameters (Required for both endpoints):**
    *   `academic_year_id` (integer): The ID of the academic year for the report.
    *   `exam_sequence_id` (integer): The ID of the specific exam sequence (evaluation) the report is for.

    *Example Request:* `GET /api/v1/report-cards/student/5?academic_year_id=2&exam_sequence_id=1`

## Workflow

1.  **Request Received:** The appropriate controller (`generateStudentReportCard` or `generateSubclassReportCards`) receives the request.
2.  **Parameter Parsing:** Path and query parameters (`studentId`/`sub_classId`, `academic_year_id`, `exam_sequence_id`) are parsed and validated.
3.  **Service Call:** The controller calls the core service function `examService.generateReportCard`.
4.  **Data Aggregation (`generateStudentReportData`):** This is the central data collection step (called for each student):
    *   Fetches the student's `Enrollment` record for the specified `academic_year_id`.
    *   Retrieves the student's `Mark` records associated with the specified `exam_sequence_id`.
    *   Fetches related data: `Student`, `SubClass`, `Class`, `AcademicYear`, `Term`, `Subject`, `Teacher` (who recorded marks), `User` (class master).
    *   Fetches *all* marks for *all students* in the same `sub_class` for the same `exam_sequence_id` to calculate class-wide statistics.
    *   Calculates:
        *   Weighted marks per subject.
        *   Category summaries (averages, ranks based on subject category).
        *   Overall student average and grade.
        *   Student's rank within the subclass for the sequence.
        *   Class statistics (lowest/highest average, class average, success rate, standard deviation).
        *   Subject-specific statistics (min/max/avg score, success rate within the class).
    *   Calls `StudentAverageService.calculateAndSaveStudentAverages` to update the average table (side effect).
    *   Formats all collected and calculated data into a structured `ReportData` object.
5.  **HTML Rendering:** The `ReportData` object(s) are passed to an EJS template (`src/view/report-template.ejs`) to generate HTML markup for the report card(s).
6.  **PDF Generation (Puppeteer):**
    *   The generated HTML is processed using Puppeteer (a headless browser).
    *   A PDF file is created:
        *   Single page PDF for `generateSingleReportCard`.
        *   Multi-page PDF (one report per page) for `generateSubclassReportCards`.
    *   The PDF is saved to a temporary location within `/src/reports/`.
7.  **Response Streaming:**
    *   The controller sets the HTTP response headers (`Content-Type: application/pdf`, `Content-Disposition: attachment; filename=...`).
    *   The generated PDF file is streamed back to the client.
8.  **Cleanup:** The temporary PDF file is deleted from the server shortly after the stream ends.

## Key Dependencies & Considerations

*   **Accurate Data:** The accuracy of the generated report depends heavily on:
    *   Correct `Enrollment` records for students in the specified academic year.
    *   Accurate `Mark` entries linked to the correct `ExamSequence`, `Enrollment`, and `SubClassSubject`.
    *   Valid links between `SubClass` and `Subject` via `SubClassSubject`, including correct coefficients.
*   **Performance:** Generating reports for a large subclass involves significant data fetching and calculation, which might take time.
*   **Template:** The visual appearance is controlled by `src/view/report-template.ejs`. 