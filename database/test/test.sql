CREATE DATABASE IF NOT EXISTS lms;
USE lms;


CREATE TABLE IF NOT EXISTS Schools (
    school_id INT PRIMARY KEY AUTO_INCREMENT,
    school_name VARCHAR(255) UNIQUE NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Programs (
    program_id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    program_code VARCHAR(50) UNIQUE,
    FOREIGN KEY (school_id) REFERENCES Schools(school_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    can_edit_courses BOOLEAN NOT NULL DEFAULT 0,
    can_manage_system BOOLEAN NOT NULL DEFAULT 0,
    can_upload_content BOOLEAN NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('Draft', 'Active', 'Archived') NOT NULL DEFAULT 'Active',
    content_folder_url TEXT,
    FOREIGN KEY (program_id) REFERENCES Programs(program_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS CourseSections (
    section_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE
) ENGINE=InnoDB;



ALTER TABLE CourseSections
    ADD COLUMN unit_code VARCHAR(50) DEFAULT NULL,
    ADD COLUMN prof_name VARCHAR(255) DEFAULT NULL,
    ADD COLUMN storage_path TEXT DEFAULT NULL,
    ADD COLUMN ppt_filename VARCHAR(512) DEFAULT NULL;

CREATE TABLE IF NOT EXISTS UnitMaterials (
    material_id INT PRIMARY KEY AUTO_INCREMENT,
    section_id INT NOT NULL,
    filename VARCHAR(512) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(100) DEFAULT NULL,
    uploaded_by INT DEFAULT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES CourseSections(section_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES Users(user_id)
);

ALTER TABLE Courses
    MODIFY COLUMN course_code VARCHAR(50) NOT NULL;


INSERT INTO Roles (role_name, can_edit_courses, can_manage_system, can_upload_content)
VALUES 
('admin', 1, 1, 1),
('teacher', 1, 0, 1),
('editor', 0, 0, 1)
ON DUPLICATE KEY UPDATE role_name = role_name;

INSERT INTO Users (role_id, email, password_hash, first_name, last_name)
VALUES (
    (SELECT role_id FROM Roles WHERE role_name='teacher'),
    'testteacher@college.edu',
    'dummy',
    'Test',
    'Teacher'
)
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO Schools (school_name)
VALUES ('School of Science')
ON DUPLICATE KEY UPDATE school_name = school_name;

INSERT INTO Programs (school_id, program_name, program_code)
VALUES (
    (SELECT school_id FROM Schools WHERE school_name='School of Science'),
    'BSc Computer Science',
    'BSC'
)
ON DUPLICATE KEY UPDATE program_name = program_name;

INSERT INTO Courses (program_id, title, course_code, status)
VALUES (
    (SELECT program_id FROM Programs WHERE program_code='BSC'),
    'Operating Systems',
    'BSC-OS-101',
    'Active'
)
ON DUPLICATE KEY UPDATE title = title;


SELECT 'TEST DATABASE READY' AS status;
