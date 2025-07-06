/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.7.2-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: postral_core
-- ------------------------------------------------------
-- Server version	11.7.2-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `id` uuid NOT NULL,
  `name` varchar(255) NOT NULL,
  `legalIdentity` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES
('b6c80c5b-c6ce-42ac-bfd7-6fb7c975f7e9','Tetakent Lotus','3131313131','COMMERCIAL'),
('bb999e95-3de3-401a-a554-da9ae47e843c','Amınoğlu İnşaat Gıda AŞ','3131313131','COMMERCIAL');
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app_comission`
--

DROP TABLE IF EXISTS `app_comission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_comission` (
  `id` uuid NOT NULL,
  `sellerAccountId` varchar(255) NOT NULL,
  `applicationAccountId` varchar(255) NOT NULL,
  `app_default` tinyint(4) NOT NULL,
  `percent` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_comission`
--

LOCK TABLES `app_comission` WRITE;
/*!40000 ALTER TABLE `app_comission` DISABLE KEYS */;
INSERT INTO `app_comission` VALUES
('269a6327-b26b-4af2-91f3-aad84772621c','','b6c80c5b-c6ce-42ac-bfd7-6fb7c975f7e9',1,5),
('a687c5f1-564e-496b-a28e-ab6f87f5cb78','bb999e95-3de3-401a-a554-da9ae47e843c','b6c80c5b-c6ce-42ac-bfd7-6fb7c975f7e9',0,15);
/*!40000 ALTER TABLE `app_comission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item`
--

DROP TABLE IF EXISTS `item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `item` (
  `id` uuid NOT NULL,
  `name` varchar(255) NOT NULL,
  `entityGroup` varchar(255) NOT NULL,
  `entityName` varchar(255) NOT NULL,
  `entityId` varchar(255) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `taxPercent` int(11) NOT NULL,
  `originalUnitAmount` int(11) NOT NULL,
  `sellerAccountId` varchar(255) NOT NULL,
  `unitAmount` int(11) NOT NULL,
  `baseCurrency` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item`
--

LOCK TABLES `item` WRITE;
/*!40000 ALTER TABLE `item` DISABLE KEYS */;
INSERT INTO `item` VALUES
('6ba9bc79-b4b1-4fbe-b462-05eaec9299b6','Tavuk Döner','','','','PIECE',20,31000,'bb999e95-3de3-401a-a554-da9ae47e843c',25000,'TRY'),
('a16429c0-3adc-46e4-a2f2-5e3ab785c91e','Kyle Broflovski Peluş oyuncak','','','','PIECE',15,0,'bb999e95-3de3-401a-a554-da9ae47e843c',50000,'TRY'),
('d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','Lotus Soru Kitabı','LOTUS','QUESTION_BOOK','c2838483-8df1-43b1-a3c0-9ab8ef1b7a11','PIECE',20,31000,'b6c80c5b-c6ce-42ac-bfd7-6fb7c975f7e9',15000,'TRY');
/*!40000 ALTER TABLE `item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_price`
--

DROP TABLE IF EXISTS `item_price`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_price` (
  `id` uuid NOT NULL,
  `itemId` varchar(255) NOT NULL,
  `variation` varchar(255) NOT NULL DEFAULT 'default',
  `itemPrice` bigint(20) NOT NULL DEFAULT 0,
  `taxPercent` bigint(20) NOT NULL DEFAULT 0,
  `region` varchar(255) NOT NULL DEFAULT 'any',
  `currency` varchar(255) NOT NULL,
  `activityOrder` bigint(20) NOT NULL DEFAULT 0,
  `activeStartAt` datetime DEFAULT NULL,
  `activeExpireAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_price`
--

LOCK TABLES `item_price` WRITE;
/*!40000 ALTER TABLE `item_price` DISABLE KEYS */;
INSERT INTO `item_price` VALUES
('fc8fe02a-80a1-485f-9c75-2871422a8780','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','Humankite',1500,20,'any','TRY',0,NULL,NULL),
('fc8fe02a-80a1-485f-9c75-2871422a8781','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','Humankite',1000,20,'any','TRY',1,'2025-07-05 12:18:00','2025-07-05 16:27:00'),
('f9628c98-20a1-4b1a-a771-36e77a827630','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','2 Years',2500,20,'any','TRY',0,NULL,NULL),
('376c042f-65e0-427f-bac3-89d456a0e1d9','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','default',1500,20,'any','TRY',0,NULL,NULL),
('3131314b-7007-44c2-b25c-92b193b9e27a','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','default',900,20,'any','TRY',3,NULL,NULL),
('3c31fc4b-7007-44c2-b25c-92b193b9e27a','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','default',1500,20,'any','TRY',0,NULL,NULL);
/*!40000 ALTER TABLE `item_price` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `id` uuid NOT NULL,
  `type` varchar(255) NOT NULL,
  `totalAmount` int(11) NOT NULL,
  `currency` varchar(255) NOT NULL,
  `taxAmount` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES
('fe6aeb3f-7631-4caa-82bb-0d68f293739b','PURCHASE',3000,'TRY',2),
('d00dcadc-eeca-409f-bc42-20d2ef7d6b6e','PURCHASE',165000,'TRY',23876),
('79ed7e68-eb69-44dc-9310-28a0c4551cf2','PURCHASE',900,'TRY',0),
('2a55ab7c-dd02-4043-86a5-6097f9968d4e','PURCHASE',65000,'TRY',10833);
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_progress`
--

DROP TABLE IF EXISTS `payment_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_progress` (
  `id` uuid NOT NULL,
  `status` varchar(255) NOT NULL,
  `paidAmountIc` int(11) NOT NULL,
  `chargeBackAmountIc` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_progress`
--

LOCK TABLES `payment_progress` WRITE;
/*!40000 ALTER TABLE `payment_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `postral_payment_item`
--

DROP TABLE IF EXISTS `postral_payment_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `postral_payment_item` (
  `id` uuid NOT NULL,
  `entityGroup` varchar(255) NOT NULL,
  `entityName` varchar(255) NOT NULL,
  `entityId` varchar(255) NOT NULL,
  `entityOwnerAccountId` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `totalAmount` int(11) NOT NULL,
  `originalUnitAmount` int(11) NOT NULL,
  `unitAmount` int(11) NOT NULL,
  `taxPercent` int(11) NOT NULL,
  `taxAmount` int(11) NOT NULL,
  `unTaxAmount` int(11) NOT NULL,
  `paymentId` uuid DEFAULT NULL,
  `itemId` varchar(255) NOT NULL,
  `variation` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_2fa2000f290cdf7e61389d40a09` (`paymentId`),
  CONSTRAINT `FK_2fa2000f290cdf7e61389d40a09` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postral_payment_item`
--

LOCK TABLES `postral_payment_item` WRITE;
/*!40000 ALTER TABLE `postral_payment_item` DISABLE KEYS */;
INSERT INTO `postral_payment_item` VALUES
('1338177f-7b50-4c5e-a10e-0ecbda26e861','LOTUS','QUESTION_BOOK','c2838483-8df1-43b1-a3c0-9ab8ef1b7a11','b6c80c5b-c6ce-42ac-bfd7-6fb7c975f7e9','Lotus Soru Kitabı',1,1500,1500,1500,20,1,1498,'fe6aeb3f-7631-4caa-82bb-0d68f293739b','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','b6c80c5b-c6ce-42ac-bfd7-6fb7c975f7e9'),
('0b3c5ebb-0cb4-463d-afb0-2fd1b812ef80','LOTUS','QUESTION_BOOK','c2838483-8df1-43b1-a3c0-9ab8ef1b7a11','b6c80c5b-c6ce-42ac-bfd7-6fb7c975f7e9','Lotus Soru Kitabı',1,15000,31000,15000,20,2500,12500,'d00dcadc-eeca-409f-bc42-20d2ef7d6b6e','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1',''),
('d2d38399-c8d0-4319-9171-481eda7f5048','','','','bb999e95-3de3-401a-a554-da9ae47e843c','Teto Kasane Peluş oyuncak',2,100000,0,50000,15,13043,86956,'d00dcadc-eeca-409f-bc42-20d2ef7d6b6e','a16429c0-3adc-46e4-a2f2-5e3ab785c91e',''),
('d57d3b9f-c163-4d13-9ba1-6d44fed5e48d','LOTUS','QUESTION_BOOK','c2838483-8df1-43b1-a3c0-9ab8ef1b7a11','b6c80c5b-c6ce-42ac-bfd7-6fb7c975f7e9','Lotus Soru Kitabı',1,1500,1500,1500,20,1,1498,'fe6aeb3f-7631-4caa-82bb-0d68f293739b','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','b6c80c5b-c6ce-42ac-bfd7-6fb7c975f7e9'),
('6607fac5-58c2-4bdb-be3e-9de8038e3bdb','','','','bb999e95-3de3-401a-a554-da9ae47e843c','Tavuk Döner',2,50000,31000,25000,20,8333,41666,'2a55ab7c-dd02-4043-86a5-6097f9968d4e','6ba9bc79-b4b1-4fbe-b462-05eaec9299b6',''),
('483f901e-8006-498d-81bb-a89b217cd5ff','LOTUS','QUESTION_BOOK','c2838483-8df1-43b1-a3c0-9ab8ef1b7a11','b6c80c5b-c6ce-42ac-bfd7-6fb7c975f7e9','Lotus Soru Kitabı',1,15000,31000,15000,20,2500,12500,'2a55ab7c-dd02-4043-86a5-6097f9968d4e','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1',''),
('6899ad53-4218-482e-b178-b8374e11ef68','','','','bb999e95-3de3-401a-a554-da9ae47e843c','Kyle Broflovski Peluş oyuncak',1,900,1500,900,20,0,899,'79ed7e68-eb69-44dc-9310-28a0c4551cf2','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','bb999e95-3de3-401a-a554-da9ae47e843c'),
('f997d565-e389-4a3a-88a3-f008de601599','','','','bb999e95-3de3-401a-a554-da9ae47e843c','Tavuk Döner',2,50000,31000,25000,20,8333,41666,'d00dcadc-eeca-409f-bc42-20d2ef7d6b6e','6ba9bc79-b4b1-4fbe-b462-05eaec9299b6','');
/*!40000 ALTER TABLE `postral_payment_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `postral_payment_tax`
--

DROP TABLE IF EXISTS `postral_payment_tax`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `postral_payment_tax` (
  `id` uuid NOT NULL,
  `taxAmount` int(11) NOT NULL,
  `untaxAmount` int(11) NOT NULL,
  `fullAmount` int(11) NOT NULL,
  `percent` int(11) NOT NULL,
  `paymentId` uuid DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_2addb7f875061879b2b7e52b4f2` (`paymentId`),
  CONSTRAINT `FK_2addb7f875061879b2b7e52b4f2` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postral_payment_tax`
--

LOCK TABLES `postral_payment_tax` WRITE;
/*!40000 ALTER TABLE `postral_payment_tax` DISABLE KEYS */;
INSERT INTO `postral_payment_tax` VALUES
('10a6e894-df2f-4523-ac29-35330f06affe',0,899,900,20,'79ed7e68-eb69-44dc-9310-28a0c4551cf2'),
('20c1663f-d2a0-40ca-bddd-896d4dda635e',13043,86956,100000,15,'d00dcadc-eeca-409f-bc42-20d2ef7d6b6e'),
('cfd4d9a6-82b6-4ecf-9a3b-aa16b58365ae',10833,54166,65000,20,'d00dcadc-eeca-409f-bc42-20d2ef7d6b6e'),
('c9657a17-e033-491e-9176-ab7b05d27c85',2,2997,3000,0,'fe6aeb3f-7631-4caa-82bb-0d68f293739b'),
('66996b44-5287-4479-a65b-b00a54336d5f',10833,54166,65000,20,'2a55ab7c-dd02-4043-86a5-6097f9968d4e');
/*!40000 ALTER TABLE `postral_payment_tax` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-07-06 10:28:21
