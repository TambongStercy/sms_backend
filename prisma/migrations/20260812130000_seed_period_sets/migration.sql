-- Seed FIRST_CYCLE + SECOND_CYCLE bell schedules for every existing academic year.
-- Idempotent: safe to re-run in staging thanks to (code, academic_year_id) uniqueness
-- and the WHERE NOT EXISTS guard.

DO $$
DECLARE
    ay RECORD;
    first_set_id  INTEGER;
    second_set_id INTEGER;
    d TEXT;
    days TEXT[] := ARRAY['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'];
BEGIN
    FOR ay IN SELECT id FROM "AcademicYear" LOOP

        -- ----- FIRST CYCLE: breaks after P2 and P5 -----
        INSERT INTO "PeriodSet" ("code","name","academic_year_id","description","created_at","updated_at")
        VALUES ('FIRST_CYCLE','First Cycle (F1–F4)', ay.id,
                'Breaks after P2 and P5. Applies to lower forms.', NOW(), NOW())
        ON CONFLICT ("code","academic_year_id") DO NOTHING;

        SELECT id INTO first_set_id
          FROM "PeriodSet"
         WHERE code = 'FIRST_CYCLE' AND academic_year_id = ay.id;

        -- ----- SECOND CYCLE: breaks after P3 and P6 -----
        INSERT INTO "PeriodSet" ("code","name","academic_year_id","description","created_at","updated_at")
        VALUES ('SECOND_CYCLE','Second Cycle (F5, LSS, USS)', ay.id,
                'Breaks after P3 and P6. Applies to F5 and Sixth Form.', NOW(), NOW())
        ON CONFLICT ("code","academic_year_id") DO NOTHING;

        SELECT id INTO second_set_id
          FROM "PeriodSet"
         WHERE code = 'SECOND_CYCLE' AND academic_year_id = ay.id;

        -- ----- One Period row per (day, slot) per set -----
        FOREACH d IN ARRAY days LOOP

            -- FIRST CYCLE
            INSERT INTO "Period"
                ("day_of_week","start_time","end_time","is_break","type","sequence","name","period_set_id")
            SELECT * FROM (VALUES
                (d::"DayOfWeek",'07:30:00','08:25:00', FALSE, 'TEACHING'::"PeriodType", 1,  'Period 1',      first_set_id),
                (d::"DayOfWeek",'08:25:00','09:20:00', FALSE, 'TEACHING'::"PeriodType", 2,  'Period 2',      first_set_id),
                (d::"DayOfWeek",'09:20:00','09:35:00', TRUE,  'BREAK'::"PeriodType",    3,  'Short Break',   first_set_id),
                (d::"DayOfWeek",'09:35:00','10:30:00', FALSE, 'TEACHING'::"PeriodType", 4,  'Period 3',      first_set_id),
                (d::"DayOfWeek",'10:30:00','11:25:00', FALSE, 'TEACHING'::"PeriodType", 5,  'Period 4',      first_set_id),
                (d::"DayOfWeek",'11:25:00','12:20:00', FALSE, 'TEACHING'::"PeriodType", 6,  'Period 5',      first_set_id),
                (d::"DayOfWeek",'12:20:00','12:50:00', TRUE,  'BREAK'::"PeriodType",    7,  'Long Break',    first_set_id),
                (d::"DayOfWeek",'12:50:00','13:45:00', FALSE, 'TEACHING'::"PeriodType", 8,  'Period 6',      first_set_id),
                (d::"DayOfWeek",'13:45:00','14:40:00', FALSE, 'TEACHING'::"PeriodType", 9,  'Period 7',      first_set_id),
                (d::"DayOfWeek",'14:40:00','15:35:00', FALSE, 'TEACHING'::"PeriodType", 10, 'Period 8',      first_set_id),
                (d::"DayOfWeek",'15:40:00','17:30:00', FALSE, 'PREP'::"PeriodType",     11, 'Preps',         first_set_id)
            ) AS v(day_of_week,start_time,end_time,is_break,type,sequence,name,period_set_id)
            WHERE NOT EXISTS (
                SELECT 1 FROM "Period" p
                 WHERE p.day_of_week   = v.day_of_week
                   AND p.start_time    = v.start_time
                   AND p.end_time      = v.end_time
                   AND p.period_set_id = v.period_set_id
            );

            -- SECOND CYCLE
            INSERT INTO "Period"
                ("day_of_week","start_time","end_time","is_break","type","sequence","name","period_set_id")
            SELECT * FROM (VALUES
                (d::"DayOfWeek",'07:30:00','08:25:00', FALSE, 'TEACHING'::"PeriodType", 1,  'Period 1',      second_set_id),
                (d::"DayOfWeek",'08:25:00','09:20:00', FALSE, 'TEACHING'::"PeriodType", 2,  'Period 2',      second_set_id),
                (d::"DayOfWeek",'09:20:00','10:15:00', FALSE, 'TEACHING'::"PeriodType", 3,  'Period 3',      second_set_id),
                (d::"DayOfWeek",'10:15:00','10:30:00', TRUE,  'BREAK'::"PeriodType",    4,  'Short Break',   second_set_id),
                (d::"DayOfWeek",'10:30:00','11:25:00', FALSE, 'TEACHING'::"PeriodType", 5,  'Period 4',      second_set_id),
                (d::"DayOfWeek",'11:25:00','12:20:00', FALSE, 'TEACHING'::"PeriodType", 6,  'Period 5',      second_set_id),
                (d::"DayOfWeek",'12:20:00','13:15:00', FALSE, 'TEACHING'::"PeriodType", 7,  'Period 6',      second_set_id),
                (d::"DayOfWeek",'13:15:00','13:45:00', TRUE,  'BREAK'::"PeriodType",    8,  'Long Break',    second_set_id),
                (d::"DayOfWeek",'13:45:00','14:40:00', FALSE, 'TEACHING'::"PeriodType", 9,  'Period 7',      second_set_id),
                (d::"DayOfWeek",'14:40:00','15:35:00', FALSE, 'TEACHING'::"PeriodType", 10, 'Period 8',      second_set_id),
                (d::"DayOfWeek",'15:40:00','17:30:00', FALSE, 'PREP'::"PeriodType",     11, 'Preps',         second_set_id)
            ) AS v(day_of_week,start_time,end_time,is_break,type,sequence,name,period_set_id)
            WHERE NOT EXISTS (
                SELECT 1 FROM "Period" p
                 WHERE p.day_of_week   = v.day_of_week
                   AND p.start_time    = v.start_time
                   AND p.end_time      = v.end_time
                   AND p.period_set_id = v.period_set_id
            );

        END LOOP;
    END LOOP;
END $$;
