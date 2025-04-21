# Timetable Feature: Backend & Database Requirements

This document outlines the necessary database changes and API endpoints required to support the frontend timetable management feature for both Vice Principals and Super Managers.

## 1. Database Schema Considerations

The following tables and relationships are likely needed. Adjust names and fields based on your existing schema conventions.

*   **`Periods` Table:**
    *   `id`: Primary Key (INT or UUID)
    *   `name`: VARCHAR (e.g., "Period 1", "Lunch Break")
    *   `start_time`: TIME (e.g., "07:30:00")
    *   `end_time`: TIME (e.g., "08:25:00")
    *   `is_break`: BOOLEAN (Indicates if this is a break/lunch period, default: false)
    *   *(Optional)* `sort_order`: INT (To ensure periods appear in the correct sequence)

*   **`Subjects` Table:** (Likely already exists)
    *   `id`: Primary Key
    *   `name`: VARCHAR

*   **`Teachers` Table:** (Likely part of `Users` or `Personnel` table)
    *   `id`: Primary Key (User ID)
    *   `name`: VARCHAR
    *   *(Ensure a way to link teachers to subjects they can teach)*

*   **`Teacher_Subjects` Table (Many-to-Many Join):**
    *   `teacher_id`: Foreign Key referencing Teachers/Users Table
    *   `subject_id`: Foreign Key referencing Subjects Table
    *   *(Primary Key: composite of teacher_id, subject_id)*

*   **`Classes` Table:** (Likely already exists)
    *   `id`: Primary Key
    *   `name`: VARCHAR

*   **`SubClasses` Table:** (Likely already exists)
    *   `id`: Primary Key
    *   `name`: VARCHAR
    *   `class_id`: Foreign Key referencing Classes Table

*   **`TimetableSlots` Table:** (New table to store assignments)
    *   `id`: Primary Key (INT or UUID)
    *   `subclass_id`: Foreign Key referencing SubClasses Table (Required)
    *   `day_of_week`: VARCHAR or ENUM (e.g., "Monday", "Tuesday", ..., "Friday") (Required)
    *   `period_id`: Foreign Key referencing Periods Table (Required)
    *   `subject_id`: Foreign Key referencing Subjects Table (Nullable)
    *   `teacher_id`: Foreign Key referencing Teachers/Users Table (Nullable)
    *   `created_at`, `updated_at`: Timestamps
    *   **Constraints:**
        *   Consider a UNIQUE constraint on (`subclass_id`, `day_of_week`, `period_id`) to prevent duplicate slots for the same time in the same class.
        *   Consider database-level checks or application logic to enforce teacher availability constraints if desired, though this is often handled during the save operation.

## 2. API Endpoints

The following API endpoints are needed to support the frontend interactions:

*   **`GET /api/v1/classes`:**
    *   **Purpose:** Fetch list of all parent classes.
    *   **Response:** `[{ id, name }, ...]`
    *   *(Already used by the context)*

*   **`GET /api/v1/classes/sub-classes`:**
    *   **Purpose:** Fetch list of all subclasses, ideally with parent class info.
    *   **Response:** `[{ id, name, class: { id, name } }, ...]`
    *   *(Already used by the context)*

*   **`GET /api/v1/subjects`:**
    *   **Purpose:** Fetch list of all available subjects.
    *   **Response:** `[{ id, name }, ...]`
    *   *(Already used by the context)*

*   **`GET /api/v1/periods`:**
    *   **Purpose:** Fetch the defined list of school periods.
    *   **Response:** `[{ id, name, startTime, endTime, isBreak }, ...]` (Ensure consistent casing, e.g., `isBreak` or `is_break`)
    *   *(Currently missing - Causes 404)*

*   **`GET /api/v1/teachers`:**
    *   **Purpose:** Fetch list of users designated as teachers. Should include subjects they teach.
    *   **Optional Query Params:** `?subjectId={subject_id}` (To filter teachers qualified for a specific subject).
    *   **Response:** `[{ id, name, subjects: [{ id, name }, ...] }, ...]` (Return nested subjects for easier frontend use).

*   **`GET /api/v1/timetables` (or `/api/v1/subclasses/{subclassId}/timetable`)**
    *   **Purpose:** Fetch the *assigned* timetable slots for a specific subclass.
    *   **Required Query Params:** `?subClassId={subclass_id}`
    *   **Response:** Array of assigned slots, ideally with nested details:
        ```json
        [
          {
            "id": 123, // TimetableSlot ID
            "subclassId": "sc1a",
            "day": "Monday",
            "periodId": "p1",
            "subjectId": "sub1",
            "teacherId": "teacher1",
            // Include nested details for display:
            "period": { "id": "p1", "name": "Period 1", "startTime": "07:30", ... },
            "subject": { "id": "sub1", "name": "Mathematics" },
            "teacher": { "id": "teacher1", "name": "Mr. Johnson" }
          },
          // ... other assigned slots
        ]
        ```
    *   *(This endpoint is needed to populate the grid with saved data)*

*   **`POST /api/v1/timetables/bulk-update` (Recommended Approach)**
    *   **Purpose:** Save multiple timetable slot changes for a specific subclass at once.
    *   **Request Body:**
        ```json
        {
          "subClassId": "sc1a",
          "slots": [
            // Array of slots to create/update
            // Include nulls for subject/teacher to clear a slot
            { "day": "Monday", "periodId": "p1", "subjectId": "sub1", "teacherId": "teacher1" },
            { "day": "Monday", "periodId": "p2", "subjectId": null, "teacherId": null },
            // ... other slots being modified
          ]
        }
        ```
    *   **Logic:**
        *   Iterate through the provided `slots`.
        *   For each slot, find or create the corresponding record in `TimetableSlots` for the given `subClassId`, `day`, and `periodId`.
        *   **Validation:** Before saving each slot, perform checks:
            *   Is `teacherId` valid and assigned to teach `subjectId`?
            *   Is `teacherId` already assigned elsewhere at this exact `day` and `periodId` (excluding the current `subClassId`)? Return a conflict error if so.
        *   Update the `subject_id` and `teacher_id` in the database record.
    *   **Response:** Success message or detailed error/conflict information.

*   **(Alternative) `PUT /api/v1/timetables/slot/{slotId}`:**
    *   **Purpose:** Update a single timetable slot. Less efficient for grid changes.
    *   **Request Body:** `{ "subjectId": "sub1", "teacherId": "teacher1" }`
    *   **Logic:** Similar validation as the bulk update.

*   **(Alternative) `DELETE /api/v1/timetables/slot/{slotId}`:**
    *   **Purpose:** Clear the subject/teacher assignment for a single slot (set subject/teacher to null).

## 3. Important Considerations

*   **Authorization:** Ensure all endpoints are protected and verify the user (Super Manager or Vice Principal) has the necessary permissions.
*   **Validation:** Implement robust validation on the backend for all inputs, especially IDs and constraints (teacher availability/qualification).
*   **Error Handling:** Provide clear error messages from the API (e.g., "Teacher conflict: Mr. Johnson already assigned to Class 7B during Monday Period 1").
*   **Data Consistency:** Ensure field names (snake_case vs. camelCase) are handled consistently between the database, backend API, and frontend mapping.
*   **Performance:** For `GET /timetables`, ensure efficient database queries, possibly using joins to fetch nested data if needed. 