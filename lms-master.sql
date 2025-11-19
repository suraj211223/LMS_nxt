-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: lms
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `contentitems`
--

DROP TABLE IF EXISTS `contentitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contentitems` (
  `content_id` int NOT NULL AUTO_INCREMENT,
  `section_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `estimated_duration_min` int DEFAULT NULL,
  `learning_objectives` text,
  `workflow_status` enum('Planned','Scripted','Editing','Post-Editing','Ready_for_Video_Prep','Under_Review','Published') NOT NULL DEFAULT 'Planned',
  `video_link` text,
  `review_notes` text,
  `uploaded_by_editor_id` int DEFAULT NULL,
  `practice_questions_url` text,
  `reference_material_url` text,
  PRIMARY KEY (`content_id`),
  KEY `section_id` (`section_id`),
  KEY `uploaded_by_editor_id` (`uploaded_by_editor_id`),
  CONSTRAINT `contentitems_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `coursesections` (`section_id`) ON DELETE CASCADE,
  CONSTRAINT `contentitems_ibfk_2` FOREIGN KEY (`uploaded_by_editor_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contentitems`
--

LOCK TABLES `contentitems` WRITE;
/*!40000 ALTER TABLE `contentitems` DISABLE KEYS */;
/*!40000 ALTER TABLE `contentitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contentscripts`
--

DROP TABLE IF EXISTS `contentscripts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contentscripts` (
  `script_id` int NOT NULL AUTO_INCREMENT,
  `content_id` int NOT NULL,
  `ppt_file_data` longblob COMMENT 'Upload 1: PPT files',
  `doc_file_data` longblob COMMENT 'Upload 2: PDF or Doc files',
  `zip_file_data` longblob COMMENT 'Upload 3: Any file (Zip, etc)',
  `introduction_script` text,
  `instructions_for_editor` text,
  PRIMARY KEY (`script_id`),
  UNIQUE KEY `content_id` (`content_id`),
  CONSTRAINT `contentscripts_ibfk_1` FOREIGN KEY (`content_id`) REFERENCES `contentitems` (`content_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contentscripts`
--

LOCK TABLES `contentscripts` WRITE;
/*!40000 ALTER TABLE `contentscripts` DISABLE KEYS */;
/*!40000 ALTER TABLE `contentscripts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `course_id` int NOT NULL AUTO_INCREMENT,
  `program_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `course_code` varchar(50) NOT NULL,
  `status` enum('Draft','Active','Archived') NOT NULL DEFAULT 'Draft',
  `content_folder_url` text,
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `course_code` (`course_code`),
  KEY `program_id` (`program_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,1,'Banking Law & Operations - COM0101 - 2','COM0101 - 2','Active',NULL),(2,1,'Business Mathematics  Statistics','BCOM-002','Active',NULL),(3,1,'Communicative English - II','BCOM-003','Active',NULL),(4,1,'Corporate  Accounting - COMO201 - 2','COMO201 - 2','Active',NULL),(5,1,'Corporate Law & Administration - COMO102 - 2','COMO102 - 2','Active',NULL),(6,1,'Positive  Psychology','BCOM-006','Active',NULL),(7,1,'Spreadsheet for Business COMO161 - 2','COMO161 - 2','Active',NULL),(22,4,'Computational Mathematics - II','MAI-OL404-2','Active',NULL),(23,4,'Data Structures and Algorithm','MAI-OL405-2','Active',NULL),(24,4,'Deep Learining','MAI-OL424-2','Active',NULL),(25,4,'Java Programming','MAI-OL525-2','Active',NULL),(26,4,'Natural Language Processing','MAI-OL526-2','Active',NULL),(27,5,'Artificial Intelligence & Machine Learning','MCA-OL-501-2','Active',NULL),(28,5,'Data Communication & Computer Networks','MCA-OL-402-2','Active',NULL),(29,5,'Data Structures & Algorithms','MCA-OL-403-2','Active',NULL),(30,5,'Full Stack Development','MCA-OL-404-2','Active',NULL),(31,5,'Java Programming','MCA-OL-405-2','Active',NULL),(32,6,'Discrete mathematics','BCA-OL-105-2','Active',NULL),(33,6,'OPERATING SYSTEM','BCA-OL-106-2','Active',NULL),(34,6,'OBJECT ORIENTED PROGRAMMING USING C++','BCA-OL-107-2','Active',NULL),(35,6,'PRINCIPLES OF SOFTWARE DEVELOPMENT','BCA-OL-108-2','Active',NULL),(36,6,'FULL STACK DEVELOPMENT','BCA-OL-209-2','Active',NULL),(37,7,'Applied Regression Analysis','MDSO405-2','Active',NULL),(38,7,'Data Structures & Algorithms','MDSO503-3','Active',NULL),(39,7,'Data Visualization','MDSO461-2','Active',NULL),(40,7,'Database Technologies','MDSO404-2','Active',NULL),(41,7,'Machine Learning','MDSO502-2','Active',NULL),(42,7,'Machine Learning Lab','MDSO512-2','Active',NULL),(43,8,'Econometric Methods','ECO409-2','Active',NULL),(44,8,'Economics of Growth and Development','ECO406-2','Active',NULL),(45,8,'History of Economic Thought','ECO408-2','Active',NULL),(46,8,'International Trade and Finance','ECO410-2','Active',NULL),(47,8,'Public Finance and policy','ECO407-2','Active',NULL);
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coursesections`
--

DROP TABLE IF EXISTS `coursesections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coursesections` (
  `section_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `order_index` int NOT NULL,
  `unit_code` varchar(50) DEFAULT NULL COMMENT 'Eg: U01V01',
  `prof_name` varchar(255) DEFAULT NULL COMMENT 'Professor Name used in folder naming',
  `storage_path` text COMMENT 'Absolute filesystem folder path for unit content',
  `ppt_filename` varchar(512) DEFAULT NULL COMMENT 'Stored PPT file name',
  `workflow_status` enum('Planned','Scripted','Editing','Post-Editing','Ready_for_Video_Prep','Under_Review','Published') NOT NULL DEFAULT 'Planned',
  PRIMARY KEY (`section_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `coursesections_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coursesections`
--

LOCK TABLES `coursesections` WRITE;
/*!40000 ALTER TABLE `coursesections` DISABLE KEYS */;
/*!40000 ALTER TABLE `coursesections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coursesemesters`
--

DROP TABLE IF EXISTS `coursesemesters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coursesemesters` (
  `sem_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `semester_number` int NOT NULL,
  `year` year NOT NULL,
  PRIMARY KEY (`sem_id`),
  UNIQUE KEY `course_id` (`course_id`,`semester_number`,`year`),
  CONSTRAINT `coursesemesters_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coursesemesters`
--

LOCK TABLES `coursesemesters` WRITE;
/*!40000 ALTER TABLE `coursesemesters` DISABLE KEYS */;
/*!40000 ALTER TABLE `coursesemesters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programs` (
  `program_id` int NOT NULL AUTO_INCREMENT,
  `school_id` int NOT NULL,
  `program_name` varchar(255) NOT NULL,
  `program_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`program_id`),
  UNIQUE KEY `program_code` (`program_code`),
  KEY `school_id` (`school_id`),
  CONSTRAINT `programs_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`school_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programs`
--

LOCK TABLES `programs` WRITE;
/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
INSERT INTO `programs` VALUES (1,1,'Bachelor of Commerce','BCOM'),(4,4,'Master of Science in Artificial Intelligence','MAI'),(5,4,'Master of Computer Applications','MCA'),(6,4,'Bachelor of Computer Applications','BCA'),(7,4,'Master of Science in Data Science','MDS'),(8,8,'Master of Arts in Economics','MAECO');
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `can_edit_courses` tinyint(1) NOT NULL DEFAULT '0',
  `can_manage_system` tinyint(1) NOT NULL DEFAULT '0',
  `can_upload_content` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin',1,1,1),(2,'Teacher',1,0,1),(3,'Editor',0,0,1);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schools`
--

DROP TABLE IF EXISTS `schools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schools` (
  `school_id` int NOT NULL AUTO_INCREMENT,
  `school_name` varchar(255) NOT NULL,
  PRIMARY KEY (`school_id`),
  UNIQUE KEY `school_name` (`school_name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schools`
--

LOCK TABLES `schools` WRITE;
/*!40000 ALTER TABLE `schools` DISABLE KEYS */;
INSERT INTO `schools` VALUES (1,'School of Management'),(4,'School of Science'),(8,'School of Social Sciences');
/*!40000 ALTER TABLE `schools` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unitmaterials`
--

DROP TABLE IF EXISTS `unitmaterials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unitmaterials` (
  `material_id` int NOT NULL AUTO_INCREMENT,
  `section_id` int NOT NULL,
  `filename` varchar(512) NOT NULL,
  `file_path` text NOT NULL COMMENT 'Absolute or relative path on disk',
  `file_type` varchar(100) DEFAULT NULL COMMENT 'ppt, pdf, docx, image, etc',
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`material_id`),
  KEY `section_id` (`section_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `unitmaterials_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `coursesections` (`section_id`) ON DELETE CASCADE,
  CONSTRAINT `unitmaterials_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unitmaterials`
--

LOCK TABLES `unitmaterials` WRITE;
/*!40000 ALTER TABLE `unitmaterials` DISABLE KEYS */;
/*!40000 ALTER TABLE `unitmaterials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usercourseassignment`
--

DROP TABLE IF EXISTS `usercourseassignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usercourseassignment` (
  `user_course_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  PRIMARY KEY (`user_course_id`),
  UNIQUE KEY `user_id` (`user_id`,`course_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `usercourseassignment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `usercourseassignment_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usercourseassignment`
--

LOCK TABLES `usercourseassignment` WRITE;
/*!40000 ALTER TABLE `usercourseassignment` DISABLE KEYS */;
INSERT INTO `usercourseassignment` VALUES (8,10,1),(9,11,2),(10,12,3),(11,13,4),(12,14,5),(13,15,6),(14,16,7),(15,25,22),(16,26,22),(17,27,23),(28,27,29),(18,28,23),(29,28,29),(19,29,24),(30,29,30),(20,30,24),(31,30,30),(32,30,31),(21,31,25),(22,32,26),(23,33,26),(24,34,27),(25,35,27),(26,36,28),(27,37,28),(33,43,32),(34,44,33),(35,45,34),(36,46,35),(37,47,36),(38,48,37),(39,49,38),(40,50,40),(41,51,40),(42,52,41),(44,52,42),(43,53,41),(45,53,42),(46,56,43),(48,56,44),(51,56,46),(47,57,44),(49,59,45),(50,60,45),(52,62,47);
/*!40000 ALTER TABLE `usercourseassignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` text NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (9,1,'admin1@clg.edu','christ@123','Admin','1'),(10,2,'maria.fulgen@clg.edu','password123','Maria','Fulgen'),(11,2,'pooja.jain@clg.edu','password123','Pooja','Jain'),(12,2,'sudhanshu.n@clg.edu','password123','Sudhanshu','N'),(13,2,'lakshmi.b@clg.edu','password123','Lakshmi','B'),(14,2,'shaeril.michael.almeida@christuniversity.in','password123','Shaeril','Almeida'),(15,2,'Jagadesh.chander@christuniversity.in','password123','Jagadeesh',''),(16,2,'geetanjali.purswani@clg.edu','password123','Geetanjali','Purswani'),(25,2,'jinny.john@christuniversity.in','password123','Jinny','John'),(26,2,'james.joseph@christuniversity.in','password123','James','Joseph'),(27,2,'vaidhehi.v@christuniversity.in','password123','Vaidhehi','V'),(28,2,'binayak.dutta@christuniversity.in','password123','Binayak','Dutta'),(29,2,'suresh.kalaimani@christuniversity.in','password123','Suresh','Kalaimani'),(30,2,'cynthia.t@christuniversity.in','password123','Cynthia','T'),(31,2,'nizar.banu@christuniversity.in','password123','Nizar','Banu'),(32,2,'nisha.varghese@christuniversity.in','password123','Nisha','Varghese'),(33,2,'manasa.kulkarni@christuniversity.in','password123','Manasa','Kulkarni'),(34,2,'thirunavukkarasu.v@christuniversity.in','password123','Thirunavukkarasu','V'),(35,2,'rohini.v@christuniversity.in','password123','Rohini','V'),(36,2,'deepa.v.jose@christuniversity.in','password123','Deepa','V Jose'),(37,2,'sandeep.j@christuniversity.in','password123','Sandeep','J'),(43,2,'puneeth.v@christuniversity.in','password123','Puneeth','V'),(44,2,'sangeetha.g@christuniversity.in','password123','Sangeetha','G'),(45,2,'beaulah.s@christuniversity.in','password123','Beaulah','S'),(46,2,'sridevi.r@christuniversity.in','password123','Sridevi','R'),(47,2,'nismon.rio@christuniversity.in','password123','Nismon','Rio'),(48,2,'laxmi.basappa@christuniversity.in','password123','Laxmi','Basappa'),(49,2,'manimekala.b@christuniversity.in','password123','Manimekala','B'),(50,2,'balakrishnan.c@christuniversity.in','password123','Balakrishnan','C'),(51,2,'deepa.s@christuniversity.in','password123','Deepa','S'),(52,2,'jayapriya.j@christuniversity.in','password123','Jayapriya','J'),(53,2,'umamaheswari.d@christuniversity.in','password123','Umamaheswari','D'),(56,2,'arpita.teacher@clg.edu','password123','Arpita',''),(57,2,'anjali.pk@clg.edu','password123','Anjali','PK'),(59,2,'gerard.rassendren@clg.edu','password123','Gerard','Rassendren'),(60,2,'sankar.varma@clg.edu','password123','Sankar','Varma'),(62,2,'aleena.teacher@clg.edu','password123','Aleena','');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-19 14:31:04
