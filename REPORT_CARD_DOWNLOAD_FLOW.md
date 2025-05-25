# Frontend Documentation: Asynchronous Report Card Download Flow

## Overview

To improve performance and user experience, the report card generation process has been moved to the background. Instead of generating the PDF during the download request (which could take a long time), PDFs are now generated asynchronously after an Exam Sequence is finalized.

This means the frontend workflow for downloading reports needs to adapt. Users will initiate a download, but the frontend might need to check the generation status before the actual PDF file is available.

**IMPORTANT:** All query parameters sent from the frontend to these backend endpoints **MUST** be in `camelCase` (e.g., `academicYearId`, `examSequenceId`). The backend has middleware that automatically converts these to `snake_case` for internal use.

## Workflow Steps

1.  **Prerequisites (Backend Actions):**
    *   Marks for the relevant `ExamSequence` are entered.
    *   Averages and ranks are calculated (likely triggered by an admin via `POST /student-averages/calculate/:examSequenceId`).
    *   An **Admin/Authorized User** updates the `ExamSequence` status to `FINALIZED`. This action **triggers the background PDF generation process** for all students and relevant subclasses within that sequence. The sequence status is then set to `REPORTS_GENERATING`.
    *   *(Note: End-users like students/parents do not trigger the generation directly; they only attempt to download after it's likely been triggered).*

2.  **User Initiates Download:**
    *   The user (student, parent, admin) clicks a "Download Report Card" button for a specific student or a whole subclass for a given `ExamSequence` and `AcademicYear`.

3.  **Frontend Makes Download Request:**
    *   The frontend calls the appropriate `GET` endpoint (see API Endpoint Details below), providing the necessary IDs (student or subclass, academic year, exam sequence) **using `camelCase` query parameters**.

4.  **Backend Responds with Status or File:**
    *   The backend checks the status of the requested report in the `GeneratedReport` table.
    *   **Possible Responses:**
        *   **`200 OK` (with PDF file):** The report was already generated (`COMPLETED` status) and the PDF file is streamed in the response body. The frontend should trigger a file download.
        *   **`202 Accepted` (JSON response):** The report generation is `PENDING` or `PROCESSING`. The backend hasn't finished creating the PDF yet. The response body will contain a JSON message indicating the status (e.g., `{ success: true, message: "Report generation is currently processing. Please try again later.", status: "PROCESSING" }`).
        *   **`404 Not Found` (JSON response):** No `GeneratedReport` record was found matching the criteria. This could mean the sequence was never finalized, the parameters are wrong, or (less likely) the record failed to create. The response body will contain an error message.
        *   **`500 Internal Server Error` (JSON response):** The report generation `FAILED`. The response body will contain an error message, possibly with details about the failure.

5.  **Frontend Handles Response:**
    *   **If `200 OK`:** Initiate file download using the received PDF data.
    *   **If `202 Accepted`:** Inform the user that the report is still being generated and they should check back later. Consider implementing a polling mechanism or a manual refresh button. *Disable* the download button temporarily.
    *   **If `404 Not Found`:** Inform the user the report could not be found. Verify the selected parameters.
    *   **If `500 Internal Server Error`:** Inform the user that report generation failed and they may need to contact support.

6.  **(Optional) Frontend Polling/Status Check:**
    *   To provide a better UX than just asking the user to "try again later", the frontend can periodically re-call the same `GET` endpoint after receiving a `202 Accepted` response.
    *   Implement polling with a reasonable interval (e.g., every 5-10 seconds) and potentially exponential backoff (increasing intervals).
    *   Stop polling after a certain number of attempts or duration to avoid excessive requests.
    *   Update the UI based on the polled status (e.g., show a progress indicator, enable the download button when `200 OK` is received, show an error if `500` is received).

## API Endpoint Details

**Note:** Remember to send all query parameters in `camelCase`.

**1. Download Single Student Report Card**

*   **Endpoint:** `GET /exams/report-cards/student/:studentId`
*   **Path Parameters:**
    *   `:studentId` (number): The ID of the student.
*   **Query Parameters (Required, use `camelCase`):**
    *   `academicYearId` (number): The ID of the academic year.
    *   `examSequenceId` (number): The ID of the exam sequence.
*   **Responses:**
    *   `200 OK`:
        *   `Content-Type: application/pdf`
        *   `Content-Disposition: attachment; filename="..."`
        *   Response Body: Binary PDF data.
    *   `202 Accepted`:
        *   `Content-Type: application/json`
        *   Response Body: `{ "success": true, "message": "...", "status": "PENDING" | "PROCESSING" }`
    *   `404 Not Found`:
        *   `Content-Type: application/json`
        *   Response Body: `{ "success": false, "error": "..." }`
    *   `500 Internal Server Error`:
        *   `Content-Type: application/json`
        *   Response Body: `{ "success": false, "error": "...", "message": "...", "status": "FAILED" }`

**2. Download Combined Subclass Report Card**

*   **Endpoint:** `GET /exams/report-cards/sub_class/:sub_classId`
*   **Path Parameters:**
    *   `:sub_classId` (number): The ID of the subclass.
*   **Query Parameters (Required, use `camelCase`):**
    *   `academicYearId` (number): The ID of the academic year.
    *   `examSequenceId` (number): The ID of the exam sequence.
*   **Responses:**
    *   `200 OK`:
        *   `Content-Type: application/pdf`
        *   `Content-Disposition: attachment; filename="..."`
        *   Response Body: Binary PDF data (multi-page).
    *   `202 Accepted`:
        *   `Content-Type: application/json`
        *   Response Body: `{ "success": true, "message": "...", "status": "PENDING" | "PROCESSING" }`
    *   `404 Not Found`:
        *   `Content-Type: application/json`
        *   Response Body: `{ "success": false, "error": "..." }`
    *   `500 Internal Server Error`:
        *   `Content-Type: application/json`
        *   Response Body: `{ "success": false, "error": "...", "message": "...", "status": "FAILED" }`

## Frontend Implementation Considerations

*   **UI State:** Maintain UI state to reflect the report generation status (e.g., "Generating...", "Download Ready", "Failed").
*   **Download Button:** Disable the download button initially or while status is `PENDING`/`PROCESSING`. Enable it only when a check returns status `COMPLETED` (or the initial request returns `200 OK`).
*   **Polling:** If implementing polling:
    *   Use `setInterval` or a similar mechanism.
    *   Clear the interval when the status is no longer `PENDING`/`PROCESSING` (i.e., becomes `COMPLETED`, `FAILED`, or results in `404`/`500`).
    *   Implement a maximum number of retries or a total timeout for polling.
*   **File Handling:** When receiving a `200 OK` response with PDF data:
    *   Use the `Content-Disposition` header to suggest a filename if possible.
    *   Create a `Blob` from the response data with `type: 'application/pdf'`.
    *   Create an object URL (`URL.createObjectURL(blob)`).
    *   Create a temporary link (`<a>` element), set its `href` to the object URL, set the `download` attribute, click it programmatically, and then revoke the object URL (`URL.revokeObjectURL`).
*   **User Feedback:** Provide clear messages to the user based on the API responses (Generating, Ready, Failed, Not Found). 