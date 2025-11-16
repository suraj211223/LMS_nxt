/* ============================================================
   FULL DATABASE SCHEMA — LMS_NEXT
   2024-06-10
   used to recreate DB from scratch.
   ============================================================ */

DROP DATABASE IF EXISTS lms;
CREATE DATABASE lms;
USE lms;

--Schools
CREATE TABLE Schools (
    school_id INT PRIMARY KEY AUTO_INCREMENT,
    school_name VARCHAR(255) UNIQUE NOT NULL
) ENGINE=InnoDB;

--Programs
CREATE TABLE Programs (
    program_id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    program_code VARCHAR(50) UNIQUE,
    FOREIGN KEY (school_id) REFERENCES Schools(school_id)
) ENGINE=InnoDB;

--Roles
CREATE TABLE Roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    can_edit_courses BOOLEAN NOT NULL DEFAULT 0,
    can_manage_system BOOLEAN NOT NULL DEFAULT 0,
    can_upload_content BOOLEAN NOT NULL DEFAULT 0
) ENGINE=InnoDB;

--Users
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
) ENGINE=InnoDB;

--Courses
CREATE TABLE Courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('Draft', 'Active', 'Archived') NOT NULL DEFAULT 'Active',
    content_folder_url TEXT,
    FOREIGN KEY (program_id) REFERENCES Programs(program_id)
) ENGINE=InnoDB;

--CourseSections (Units)
CREATE TABLE CourseSections (
    section_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    unit_code VARCHAR(50),
    prof_name VARCHAR(255),
    storage_path TEXT,
    ppt_filename VARCHAR(255),
    FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE
) ENGINE=InnoDB;

--UnitMaterials
CREATE TABLE UnitMaterials (
    material_id INT PRIMARY KEY AUTO_INCREMENT,
    section_id INT NOT NULL,
    filename VARCHAR(255),
    file_path TEXT,
    file_type VARCHAR(20),
    uploaded_by INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (section_id) REFERENCES CourseSections(section_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES Users(user_id)
) ENGINE=InnoDB;

--insert base Roles
INSERT INTO Roles (role_name, can_edit_courses, can_manage_system, can_upload_content)
VALUES 
('admin', 1, 1, 1),
('teacher', 1, 0, 1),
('editor', 0, 0, 1);