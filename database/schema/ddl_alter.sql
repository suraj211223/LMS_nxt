/* ============================================================
   DDL ALTER SCRIPT — LMS_NEXT
   2024-06-10
   Purpose: Schema updates required by backend
   This file contains ONLY ALTER TABLE or CREATE TABLE statements.
   ============================================================ */

USE lms;

-- ------------------------------------------------------------
-- 1. Add missing columns for CourseSections
-- ------------------------------------------------------------

ALTER TABLE CourseSections
    ADD COLUMN IF NOT EXISTS unit_code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS prof_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS storage_path TEXT,
    ADD COLUMN IF NOT EXISTS ppt_filename VARCHAR(255);

-- ------------------------------------------------------------
-- 2. Create UnitMaterials table if not exists
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS UnitMaterials (
    material_id INT PRIMARY KEY AUTO_INCREMENT,
    section_id INT NOT NULL,
    filename VARCHAR(255),
    file_path TEXT,
    file_type VARCHAR(20),
    uploaded_by INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (section_id) REFERENCES CourseSections(section_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES Users(user_id)
);

-- ------------------------------------------------------------
-- 3. Ensure course_code is NOT NULL
-- ------------------------------------------------------------

ALTER TABLE Courses
    MODIFY COLUMN course_code VARCHAR(50) NOT NULL;

-- ------------------------------------------------------------
-- 4.Add timestamps for future features
-- (Uncomment when needed)

-- ALTER TABLE CourseSections
--     ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     ADD COLUMN updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP;

