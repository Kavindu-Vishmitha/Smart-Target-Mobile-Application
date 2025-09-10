-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.32 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.4.0.6659
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for smart_target
CREATE DATABASE IF NOT EXISTS `smart_target` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `smart_target`;

-- Dumping structure for table smart_target.target
CREATE TABLE IF NOT EXISTS `target` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sub_name` varchar(15) NOT NULL,
  `tg_date` date NOT NULL,
  `note` varchar(100) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_target_user_idx` (`user_id`),
  CONSTRAINT `fk_target_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table smart_target.target: ~1 rows (approximately)
INSERT INTO `target` (`id`, `sub_name`, `tg_date`, `note`, `user_id`) VALUES
	(45, 'SFT', '2025-09-08', 'Paper Discussion ', 2);

-- Dumping structure for table smart_target.user
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(70) NOT NULL,
  `username` varchar(45) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(15) NOT NULL,
  `profile_image` varchar(150) NOT NULL,
  `created_at` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table smart_target.user: ~3 rows (approximately)
INSERT INTO `user` (`id`, `full_name`, `username`, `email`, `password`, `profile_image`, `created_at`) VALUES
	(2, 'Kavindu Vishmitha ', 'Kavindu ', 'kavindu@gmail.com', '123KG#ta', '1757314605129_profile.jpg', '2025-09-06'),
	(3, 'Chamindu Induwara ', 'Chamindu', 'chamindu@gmail.com', '123CH#ch', '1757318874564_profile.png', '2025-09-08'),
	(4, 'Kavindu Vishmitha ', 'Kaveesha', 'kaveesha@gmail.com', '123KAcf@', '1757390377145_profile.png', '2025-09-09');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
