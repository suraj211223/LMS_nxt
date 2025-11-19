USE lms;

/* Insert base roles if they don't exist */
INSERT INTO Roles (role_name, can_edit_courses, can_manage_system, can_upload_content)
VALUES 
('admin', 1, 1, 1),
('teacher', 1, 0, 1),
('editor', 0, 0, 1)
ON DUPLICATE KEY UPDATE role_name = role_name;

/* Test teacher account (used for login during development) */
INSERT INTO Users (role_id, email, password_hash, first_name, last_name)
VALUES (
    (SELECT role_id FROM Roles WHERE role_name='teacher'),
    'testteacher@CU.in',
    'dummy',
    'Test',
    'Teacher'
)
ON DUPLICATE KEY UPDATE email = email;

/* Also insert admin and editor for completeness */
INSERT INTO Users (role_id, email, password_hash, first_name, last_name)
VALUES (
    (SELECT role_id FROM Roles WHERE role_name='admin'),
    'admin@CU.in',
    'dummy',
    'Admin',
    'User'
)
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO Users (role_id, email, password_hash, first_name, last_name)
VALUES (
    (SELECT role_id FROM Roles WHERE role_name='editor'),
    'editor@CU.in',
    'dummy',
    'Editor',
    'User'
)
ON DUPLICATE KEY UPDATE email = email;

/* Verify the users were created */
SELECT 
    u.user_id, 
    u.email, 
    u.first_name, 
    u.last_name, 
    r.role_name,
    r.can_edit_courses,
    r.can_upload_content,
    r.can_manage_system
FROM Users u 
JOIN Roles r ON u.role_id = r.role_id 
WHERE u.email IN ('testteacher@CU.in', 'admin@CU.in', 'editor@CU.in')
ORDER BY r.role_name;

SELECT 'DUMMY ACCOUNTS INSERTED SUCCESSFULLY!' AS status;
