-- CreateTable
CREATE TABLE `schools` (
    `school_id` INTEGER NOT NULL AUTO_INCREMENT,
    `school_name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `schools_school_name_key`(`school_name`),
    PRIMARY KEY (`school_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `programs` (
    `program_id` INTEGER NOT NULL AUTO_INCREMENT,
    `school_id` INTEGER NOT NULL,
    `program_name` VARCHAR(191) NOT NULL,
    `program_code` VARCHAR(191) NULL,

    UNIQUE INDEX `programs_program_code_key`(`program_code`),
    PRIMARY KEY (`program_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `role_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(191) NOT NULL,
    `can_edit_courses` BOOLEAN NOT NULL DEFAULT false,
    `can_manage_system` BOOLEAN NOT NULL DEFAULT false,
    `can_upload_content` BOOLEAN NOT NULL DEFAULT false,
    `can_approve_content` BOOLEAN NOT NULL DEFAULT false,
    `can_publish_content` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `roles_role_name_key`(`role_name`),
    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_id` INTEGER NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NULL,
    `last_name` VARCHAR(191) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `course_id` INTEGER NOT NULL AUTO_INCREMENT,
    `program_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `course_code` VARCHAR(191) NOT NULL,
    `status` ENUM('Draft', 'Active', 'Archived') NOT NULL DEFAULT 'Active',
    `content_folder_url` VARCHAR(191) NULL,

    UNIQUE INDEX `courses_course_code_key`(`course_code`),
    PRIMARY KEY (`course_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coursesections` (
    `section_id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `order_index` INTEGER NOT NULL,
    `unit_code` VARCHAR(191) NULL,
    `prof_name` VARCHAR(191) NULL,
    `storage_path` VARCHAR(191) NULL,
    `ppt_filename` VARCHAR(191) NULL,
    `workflow_status` ENUM('Planned', 'Scripted', 'Editing', 'Post-Editing', 'Ready_for_Video_Prep', 'Under_Review', 'Approved', 'Published') NOT NULL DEFAULT 'Planned',

    UNIQUE INDEX `coursesections_course_id_title_key`(`course_id`, `title`),
    PRIMARY KEY (`section_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unitmaterials` (
    `material_id` INTEGER NOT NULL AUTO_INCREMENT,
    `section_id` INTEGER NOT NULL,
    `filename` VARCHAR(191) NULL,
    `file_path` VARCHAR(191) NULL,
    `file_type` VARCHAR(191) NULL,
    `uploaded_by` INTEGER NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`material_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contentitems` (
    `content_id` INTEGER NOT NULL AUTO_INCREMENT,
    `section_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `estimated_duration_min` INTEGER NULL,
    `learning_objectives` VARCHAR(191) NULL,
    `workflow_status` ENUM('Planned', 'Scripted', 'Editing', 'Post-Editing', 'Ready_for_Video_Prep', 'Under_Review', 'Approved', 'Published') NOT NULL DEFAULT 'Planned',
    `video_link` VARCHAR(191) NULL,
    `additional_link` VARCHAR(191) NULL,
    `review_notes` VARCHAR(191) NULL,
    `uploaded_by_editor_id` INTEGER NULL,
    `assigned_editor_id` INTEGER NULL,
    `practice_questions_url` VARCHAR(191) NULL,
    `reference_material_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `uploaded_at` DATETIME(3) NULL,
    `review_request_at` DATETIME(3) NULL,
    `approved_at` DATETIME(3) NULL,
    `published_at` DATETIME(3) NULL,

    UNIQUE INDEX `contentitems_section_id_title_key`(`section_id`, `title`),
    PRIMARY KEY (`content_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contentscripts` (
    `script_id` INTEGER NOT NULL AUTO_INCREMENT,
    `content_id` INTEGER NOT NULL,
    `ppt_file_data` LONGBLOB NULL,
    `doc_file_data` LONGBLOB NULL,
    `zip_file_data` LONGBLOB NULL,
    `introduction_script` VARCHAR(191) NULL,
    `instructions_for_editor` VARCHAR(191) NULL,

    UNIQUE INDEX `contentscripts_content_id_key`(`content_id`),
    PRIMARY KEY (`script_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usercourseassignment` (
    `user_course_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `course_id` INTEGER NOT NULL,

    UNIQUE INDEX `usercourseassignment_user_id_course_id_key`(`user_id`, `course_id`),
    PRIMARY KEY (`user_course_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coursesemesters` (
    `sem_id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `semester_number` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,

    UNIQUE INDEX `coursesemesters_course_id_semester_number_year_key`(`course_id`, `semester_number`, `year`),
    PRIMARY KEY (`sem_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `programs` ADD CONSTRAINT `programs_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_program_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `programs`(`program_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coursesections` ADD CONSTRAINT `coursesections_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `unitmaterials` ADD CONSTRAINT `unitmaterials_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `coursesections`(`section_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `unitmaterials` ADD CONSTRAINT `unitmaterials_uploaded_by_fkey` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contentitems` ADD CONSTRAINT `contentitems_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `coursesections`(`section_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contentitems` ADD CONSTRAINT `contentitems_uploaded_by_editor_id_fkey` FOREIGN KEY (`uploaded_by_editor_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contentitems` ADD CONSTRAINT `contentitems_assigned_editor_id_fkey` FOREIGN KEY (`assigned_editor_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contentscripts` ADD CONSTRAINT `contentscripts_content_id_fkey` FOREIGN KEY (`content_id`) REFERENCES `contentitems`(`content_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usercourseassignment` ADD CONSTRAINT `usercourseassignment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usercourseassignment` ADD CONSTRAINT `usercourseassignment_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coursesemesters` ADD CONSTRAINT `coursesemesters_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) ON DELETE CASCADE ON UPDATE CASCADE;
