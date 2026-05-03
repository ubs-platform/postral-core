DROP DATABASE IF EXISTS `postral_core`;
CREATE DATABASE IF NOT EXISTS `postral_core` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci;
USE `postral_core`;
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.1.2-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: postral_core
-- ------------------------------------------------------
-- Server version	12.1.2-MariaDB-ubu2404

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
  `defaultAddressId` uuid DEFAULT NULL,
  `deactivated` tinyint(4) NOT NULL DEFAULT 0,
  `bankName` varchar(255) DEFAULT NULL,
  `bankIban` varchar(255) DEFAULT NULL,
  `bankBic` varchar(255) DEFAULT NULL,
  `bankSwift` varchar(255) DEFAULT NULL,
  `taxOffice` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_cd82ac522ea5f9407c049b8f39b` (`defaultAddressId`),
  CONSTRAINT `FK_cd82ac522ea5f9407c049b8f39b` FOREIGN KEY (`defaultAddressId`) REFERENCES `address` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `account` VALUES
('a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','44516019088','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'Akbank',NULL,NULL,NULL,'Bahçelievler'),
('a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','1111111111','INDIVIDUAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'',NULL,NULL,NULL,NULL),
('5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','1111111111','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'Esen Yayınları YGS Matematik soru bankası','TR31313113131','31313131',NULL,NULL),
('cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','1111111111','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'Jerry Acelesi Yok',NULL,NULL,NULL,NULL),
('bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','11111111111','INDIVIDUAL','287c8d95-9fe2-4a22-a79b-97500dbbc8f6',0,'TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('913252c1-d094-40de-a13c-8dc1142b9222','Lotus Eğitim','1111111111','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1111111111','COMMERCIAL','91587983-a95f-4934-895f-a3f9f5fdaed1',0,'Kısmet XNXX','TR760009901234567800100001','',NULL,'Testo'),
('eb191f6a-60ef-4450-8877-e9c1a31e2197','New Account','','INDIVIDUAL',NULL,1,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `account_payment_transaction`
--

DROP TABLE IF EXISTS `account_payment_transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_payment_transaction` (
  `id` uuid NOT NULL,
  `corelationId` varchar(255) NOT NULL,
  `accountId` varchar(255) NOT NULL,
  `accountName` varchar(255) NOT NULL,
  `paymentId` varchar(255) NOT NULL,
  `paymentSellerOrderId` varchar(255) DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `status` varchar(20) NOT NULL,
  `creationDate` datetime NOT NULL DEFAULT current_timestamp(),
  `updateDate` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `operationNote` mediumtext DEFAULT '',
  `description` mediumtext DEFAULT '',
  `amount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `taxAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_payment_transaction`
--

LOCK TABLES `account_payment_transaction` WRITE;
/*!40000 ALTER TABLE `account_payment_transaction` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `account_payment_transaction` VALUES
('72f6d3ee-6e3d-4f9f-89e1-00018d51fe2b','e66911ba-6b44-4d23-a9c7-4756aaf1f55b','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','5c94c159-611c-4a6d-8498-b0daaea9b234',NULL,'CREDIT','COMPLETED','2026-04-30 22:16:40','2026-04-30 22:16:40','','Payment purchase for payment id 5c94c159-611c-4a6d-8498-b0daaea9b234. Customer: Frisk Dreemurr',66.0000,11.0000),
('2ba316ff-ff53-4858-b0c5-006aa2511613','92f41d0a-e91e-4fd5-8329-08ba2ba86ce8','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','a515959c-24ee-470b-86cd-698646ee3ae9',NULL,'DEBIT','COMPLETED','2026-04-11 12:05:42','2026-04-11 12:05:42','','Payment purchase for payment id a515959c-24ee-470b-86cd-698646ee3ae9. Sellers: Omodog',0.0000,0.0000),
('6325b276-e49a-4d78-a2bf-04bdd49b9808','005c15be-55c5-46c8-8fca-b9cba0d9ed23','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','28100ad5-150e-4139-a68d-ff874dbb7104',NULL,'DEBIT','COMPLETED','2026-04-13 12:07:05','2026-04-13 12:07:05','','Payment purchase for payment id 28100ad5-150e-4139-a68d-ff874dbb7104. Sellers: Tetakent (H.C.G), Omodog',0.0000,0.0000),
('c7005053-1b24-4d49-8154-079143307f9d','93e117ea-bd6c-46e1-95a5-d633602ed730','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c067f04c-a728-41bc-bb22-c940f487b445',NULL,'DEBIT','COMPLETED','2026-04-30 23:23:33','2026-04-30 23:23:33','','Payment purchase for payment id c067f04c-a728-41bc-bb22-c940f487b445. Sellers: Omodog',1372.0000,228.6667),
('a1d7441b-9143-401c-b960-08e250bda114','d4c6f778-46c9-4daa-bd7a-b5ec09ce7d81','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','69e44495-cab2-4dde-ae7e-70c89451c286',NULL,'DEBIT','COMPLETED','2026-03-29 21:04:58','2026-03-29 21:04:58','','Payment purchase for payment id 69e44495-cab2-4dde-ae7e-70c89451c286. Sellers: Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('431d0208-e0b8-4821-aa2b-0a4ae26b1212','d4cc7675-c6ad-43ee-a493-aa5d8768ee0c','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','46447df0-7deb-4677-9caa-45b4ff585820',NULL,'CREDIT','COMPLETED','2026-04-27 15:22:49','2026-04-27 15:22:49','','Payment purchase for payment id 46447df0-7deb-4677-9caa-45b4ff585820. Customer: Frisk Dreemurr',66.0000,11.0000),
('37dbd81b-0972-4746-8316-0a5d3fea05f2','c054ce4e-6521-4b2b-9b68-1aaf1b326379','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','d52dbec7-70cc-4033-8efc-9cda518bc009',NULL,'DEBIT','WAITING','2026-04-29 14:22:32','2026-04-29 14:22:32','','Payment refund for payment id d52dbec7-70cc-4033-8efc-9cda518bc009. Customer: Frisk Dreemurr',369.0000,35.5909),
('5cf39e34-dac8-4683-be80-0aba57742b04','a78e3d9d-0c35-445c-b341-97bd0bcd2990','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','6bfdea2e-5e43-495c-9d89-d1d27540304e',NULL,'CREDIT','COMPLETED','2026-04-13 12:41:47','2026-04-13 12:41:47','','Payment purchase for payment id 6bfdea2e-5e43-495c-9d89-d1d27540304e. Customer: Frisk Dreemurr',0.0000,0.0000),
('4439fd15-ae00-47b8-ac96-0e0d8d9bc98f','57d30692-60bc-49f9-9147-e41d8c29d59f','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','30e09c8d-d8b2-405b-ac5c-b5c498d4bddc',NULL,'DEBIT','COMPLETED','2026-04-14 12:48:16','2026-04-14 12:48:16','','Payment purchase for payment id 30e09c8d-d8b2-405b-ac5c-b5c498d4bddc. Sellers: Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('52f8a3e1-d08d-4fc9-ab5c-1052d7dbbce5','8d44d12a-5d62-40f9-b3d5-26278096d5e9','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','acebf506-e0ca-42d2-b9e1-6e192b86e53f',NULL,'DEBIT','COMPLETED','2026-04-13 09:26:45','2026-04-13 09:26:45','','Payment purchase for payment id acebf506-e0ca-42d2-b9e1-6e192b86e53f. Sellers: Omodog',0.0000,0.0000),
('6029a2c6-7a29-4e1f-85d0-105c9234e43d','e66911ba-6b44-4d23-a9c7-4756aaf1f55b','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','5c94c159-611c-4a6d-8498-b0daaea9b234',NULL,'DEBIT','COMPLETED','2026-04-30 22:16:40','2026-04-30 22:16:40','','Payment purchase for payment id 5c94c159-611c-4a6d-8498-b0daaea9b234. Sellers: Esenler Motionstar Incorporated, Doofenshmirtz Evil Inc, Tetakent (H.C.G), Omodog',1976.0000,277.5152),
('6d86f58d-485b-480e-ba8d-10bb73ca9306','450ae594-635c-4f2a-9449-4252e0c56a67','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','01950684-f005-499c-8e8c-c07d62d3b85d',NULL,'CREDIT','COMPLETED','2026-04-30 22:54:54','2026-04-30 22:54:54','','Payment purchase for payment id 01950684-f005-499c-8e8c-c07d62d3b85d. Customer: Frisk Dreemurr',560.0000,93.3333),
('a7edc317-3efc-431c-a7a8-1340752d0f98','d5dfebc0-4c35-429b-8253-de801939673f','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','cbb58ca9-25c4-4f15-a903-f67d59d1ede1',NULL,'CREDIT','COMPLETED','2026-03-28 14:21:07','2026-03-28 14:21:07','','Payment purchase for payment id cbb58ca9-25c4-4f15-a903-f67d59d1ede1. Customer: Frisk Dreemurr',0.0000,0.0000),
('7dce1756-261a-42ca-9396-13c1a177936e','e66911ba-6b44-4d23-a9c7-4756aaf1f55b','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','5c94c159-611c-4a6d-8498-b0daaea9b234',NULL,'CREDIT','COMPLETED','2026-04-30 22:16:40','2026-04-30 22:16:40','','Payment purchase for payment id 5c94c159-611c-4a6d-8498-b0daaea9b234. Customer: Frisk Dreemurr',1212.0000,202.0000),
('a3f6920d-bf1e-480b-89d7-13d159ab56e7','febbfa56-580c-4219-8c73-719b50531c32','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','ed2b84ab-8476-42f8-b8ef-64e38b0b4872',NULL,'DEBIT','COMPLETED','2026-04-11 12:27:26','2026-04-11 12:27:26','','Payment purchase for payment id ed2b84ab-8476-42f8-b8ef-64e38b0b4872. Sellers: Omodog',0.0000,0.0000),
('43801b98-29f0-40f5-a25c-1879eae775d3','26dc1521-9c78-4732-9f4c-5e403c01d1c1','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a',NULL,'DEBIT','COMPLETED','2026-03-31 10:58:52','2026-03-31 10:58:52','','Payment purchase for payment id cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a. Sellers: Omodog',0.0000,0.0000),
('8bade2c0-e2ba-43bb-86ac-1997ecdf2583','26dc1521-9c78-4732-9f4c-5e403c01d1c1','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a',NULL,'CREDIT','COMPLETED','2026-03-31 10:58:52','2026-03-31 10:58:52','','Payment purchase for payment id cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a. Customer: Frisk Dreemurr',0.0000,0.0000),
('0de56aa2-085b-404b-9372-1cbef8ffdde2','53448fb3-9d45-410b-8da7-e2189fcca34c','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','97ce01db-fe13-428e-8b3f-ad9e49c2953b',NULL,'CREDIT','COMPLETED','2026-04-30 23:19:31','2026-04-30 23:19:31','','Payment purchase for payment id 97ce01db-fe13-428e-8b3f-ad9e49c2953b. Customer: Frisk Dreemurr',88.0000,14.6667),
('73a83802-46c4-4295-9e4f-1ce82cc22907','2732ac9c-98e4-4b59-9348-b770c9cd50ee','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','b0a028b8-c701-4e43-9d5f-1e182b236640',NULL,'DEBIT','COMPLETED','2026-04-14 12:43:14','2026-04-14 12:43:14','','Payment purchase for payment id b0a028b8-c701-4e43-9d5f-1e182b236640. Sellers: Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('cc875da8-0b37-4685-9807-1de19ca59b4e','ce119dca-4000-4c05-987e-982a90508ec1','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','6ed605eb-41d2-4eba-ba88-e5b5ec76cb67',NULL,'CREDIT','COMPLETED','2026-03-31 11:59:13','2026-03-31 11:59:13','','Payment purchase for payment id 6ed605eb-41d2-4eba-ba88-e5b5ec76cb67. Customer: Frisk Dreemurr',0.0000,0.0000),
('d4a8e2e5-d464-4230-b8ce-1eaedad9d086','ab5da9f1-a2e6-4c97-b539-987762d65493','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','21a1914c-2f02-468a-9969-c82851f5cde7',NULL,'DEBIT','COMPLETED','2026-03-31 11:41:43','2026-03-31 11:41:43','','Payment purchase for payment id 21a1914c-2f02-468a-9969-c82851f5cde7. Sellers: Omodog',0.0000,0.0000),
('b4f39290-89db-430a-b572-1f4da2b293fb','6b8ad375-e6ea-40fa-be3f-c74c2fbe9658','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','90b7bd2a-6723-4265-b782-242720019812',NULL,'CREDIT','COMPLETED','2026-04-11 12:48:28','2026-04-11 12:48:28','','Payment purchase for payment id 90b7bd2a-6723-4265-b782-242720019812. Customer: Frisk Dreemurr',0.0000,0.0000),
('273a0e76-d47c-4a39-be38-20bf535de24a','61627381-5591-4b77-b03f-dadd02637923','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','c2f20787-32ee-4e8a-9385-4938bc36dff6',NULL,'CREDIT','COMPLETED','2026-04-14 12:53:12','2026-04-14 12:53:12','','Payment purchase for payment id c2f20787-32ee-4e8a-9385-4938bc36dff6. Customer: Frisk Dreemurr',0.0000,0.0000),
('8877a4c6-09e1-41e9-bde3-21425b5e13df','c4296c87-1418-4465-8d3d-efefe07c5eed','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','5564f851-c835-4667-b894-c654b69a93f6',NULL,'CREDIT','COMPLETED','2026-03-28 14:23:53','2026-03-28 14:23:53','','Payment purchase for payment id 5564f851-c835-4667-b894-c654b69a93f6. Customer: Frisk Dreemurr',0.0000,0.0000),
('6bdd24cc-f0a8-4928-9204-2528c362d67d','a082003e-a2c9-4458-94f9-e0832d877504','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','9d7a02a8-6a03-4abe-98e4-15ad3416852a',NULL,'CREDIT','COMPLETED','2026-04-27 14:31:39','2026-04-27 14:31:39','','Payment purchase for payment id 9d7a02a8-6a03-4abe-98e4-15ad3416852a. Customer: Frisk Dreemurr',8484.0000,1414.0000),
('48ff143f-58cf-4fef-8f34-2707ef1b5195','098d595b-af3f-4511-ba22-431c9a963a76','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','fadd1328-7198-408e-8405-9eda402b9dda',NULL,'CREDIT','COMPLETED','2026-04-29 13:57:45','2026-04-29 13:57:45','','Payment purchase for payment id fadd1328-7198-408e-8405-9eda402b9dda. Customer: Frisk Dreemurr',1080.0000,102.2727),
('fa90a5b8-2f67-468b-a46c-278a99aa938f','a082003e-a2c9-4458-94f9-e0832d877504','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','9d7a02a8-6a03-4abe-98e4-15ad3416852a',NULL,'CREDIT','COMPLETED','2026-04-27 14:31:39','2026-04-27 14:31:39','','Payment purchase for payment id 9d7a02a8-6a03-4abe-98e4-15ad3416852a. Customer: Frisk Dreemurr',724.0000,120.6667),
('3eb2464c-be5d-4aa6-8d68-2848d86a3809','d5dfebc0-4c35-429b-8253-de801939673f','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','cbb58ca9-25c4-4f15-a903-f67d59d1ede1',NULL,'DEBIT','COMPLETED','2026-03-28 14:21:07','2026-03-28 14:21:07','','Payment purchase for payment id cbb58ca9-25c4-4f15-a903-f67d59d1ede1. Sellers: Omodog, Tetakent (H.C.G), Esenler Motionstar Incorporated',0.0000,0.0000),
('e8a37a5f-2eb2-4b38-bca1-284f7566321c','9f7a91ba-1674-4bcd-aa84-883fcd57ac34','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','7c5d86a3-fe30-4496-88d4-45b9d4501888',NULL,'DEBIT','COMPLETED','2026-04-13 08:54:32','2026-04-13 08:54:32','','Payment purchase for payment id 7c5d86a3-fe30-4496-88d4-45b9d4501888. Sellers: Omodog',0.0000,0.0000),
('c3996155-37a7-42f8-95be-292558c18325','2732ac9c-98e4-4b59-9348-b770c9cd50ee','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','b0a028b8-c701-4e43-9d5f-1e182b236640',NULL,'CREDIT','COMPLETED','2026-04-14 12:43:14','2026-04-14 12:43:14','','Payment purchase for payment id b0a028b8-c701-4e43-9d5f-1e182b236640. Customer: Frisk Dreemurr',0.0000,0.0000),
('fe8792da-96af-4bf9-a113-2d2ced76702c','946e4903-c899-4bb6-a320-26d37f3cdf57','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','b4912aeb-5c11-403c-81bb-588da87592ed',NULL,'CREDIT','COMPLETED','2026-03-28 14:38:32','2026-03-28 14:38:32','','Payment purchase for payment id b4912aeb-5c11-403c-81bb-588da87592ed. Customer: Frisk Dreemurr',0.0000,0.0000),
('ec0cf43c-a813-4b98-87aa-2d984190cc28','c75e19e1-8a7c-432f-b0e3-173eb2f4b4a6','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','bd8e8e57-269a-4d27-b1ad-698289104c89',NULL,'DEBIT','COMPLETED','2026-04-29 14:36:06','2026-04-29 14:36:06','','Payment purchase for payment id bd8e8e57-269a-4d27-b1ad-698289104c89. Sellers: Omodog, Tetakent (H.C.G)',1778.0000,270.4242),
('1c715dda-3a17-4213-9b1d-2e4196e488e2','2a333f87-b924-46a4-ba69-d699b1b374aa','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4',NULL,'CREDIT','COMPLETED','2026-04-29 14:20:56','2026-04-29 14:20:56','','Payment purchase for payment id 2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4. Customer: Frisk Dreemurr',1134.0000,111.2727),
('2a3238a2-9786-4418-925f-2e58d3d42922','309b68be-f65e-4a34-b7cf-8568ab4f244a','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','2f6dc481-f941-4b12-90d3-acc9554773f4',NULL,'DEBIT','COMPLETED','2026-04-13 12:34:50','2026-04-13 12:34:50','','Payment purchase for payment id 2f6dc481-f941-4b12-90d3-acc9554773f4. Sellers: Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('fb15d636-3f49-44ed-8d21-3089cedc3aeb','36a81cdb-532d-4746-bad3-8fc25b454989','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','5250a81a-6d49-4d3c-ad7e-56013dba864d',NULL,'DEBIT','COMPLETED','2026-03-28 14:33:27','2026-03-28 14:33:27','','Payment purchase for payment id 5250a81a-6d49-4d3c-ad7e-56013dba864d. Sellers: Omodog, Doofenshmirtz Evil Inc, Esenler Motionstar Incorporated, Tetakent (H.C.G)',0.0000,0.0000),
('eae4dbd2-4f5f-4bb3-b192-31042dff0f5c','8e1d661e-3135-4bb0-9891-9e690bff993f','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','e8a977da-ec64-454e-bcc6-aa14aab609b5',NULL,'CREDIT','COMPLETED','2026-04-30 22:57:40','2026-04-30 22:57:40','','Payment purchase for payment id e8a977da-ec64-454e-bcc6-aa14aab609b5. Customer: Frisk Dreemurr',2424.0000,404.0000),
('05fe6289-aead-48d5-adc2-310a6479ade4','6f271261-8978-4134-a0c4-64ca63dbbf1f','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','bdc318a1-2832-42fc-8cba-7a75a8d112d8',NULL,'CREDIT','COMPLETED','2026-04-01 12:18:00','2026-04-01 12:18:00','','Payment purchase for payment id bdc318a1-2832-42fc-8cba-7a75a8d112d8. Customer: Frisk Dreemurr',0.0000,0.0000),
('a4611bee-3d73-4bee-b357-345cc146b44b','73ab76ab-e9c2-4a81-9fa8-5b6dd0ecc24f','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c2a6c7f0-d11d-4aef-ba23-556aad150050',NULL,'DEBIT','COMPLETED','2026-03-31 12:07:20','2026-03-31 12:07:20','','Payment purchase for payment id c2a6c7f0-d11d-4aef-ba23-556aad150050. Sellers: Omodog',0.0000,0.0000),
('62133446-e84e-492e-bbcf-3669cc4597ff','4d6c363a-51f1-4d62-a62e-3c9e91f996f2','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c676457a-b61a-4fa2-a67e-f963453ebb03',NULL,'DEBIT','COMPLETED','2026-03-28 10:53:06','2026-03-28 10:53:06','','Payment purchase for payment id c676457a-b61a-4fa2-a67e-f963453ebb03. Sellers: Omodog',0.0000,0.0000),
('a97f1069-c7f3-4562-b3cd-3984ec56dd4f','5367f248-d8b8-483b-9463-5492edcd5923','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','ddca578b-583d-4008-8497-39bd8e360304',NULL,'DEBIT','COMPLETED','2026-04-01 12:31:41','2026-04-01 12:31:41','','Payment purchase for payment id ddca578b-583d-4008-8497-39bd8e360304. Sellers: Omodog',0.0000,0.0000),
('8d90e84c-5427-42ac-ba38-3c5dbb3b7234','fba90408-9952-4ae0-85b2-40851cbc59e3','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','d85e328f-fea2-4558-9cb7-f163a8c2e655',NULL,'DEBIT','COMPLETED','2026-03-30 19:49:33','2026-03-30 19:49:33','','Payment purchase for payment id d85e328f-fea2-4558-9cb7-f163a8c2e655. Sellers: Omodog',0.0000,0.0000),
('4469104a-735f-4c1c-ac60-3e1b8dcfd9c4','73ab76ab-e9c2-4a81-9fa8-5b6dd0ecc24f','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c2a6c7f0-d11d-4aef-ba23-556aad150050',NULL,'CREDIT','COMPLETED','2026-03-31 12:07:20','2026-03-31 12:07:20','','Payment purchase for payment id c2a6c7f0-d11d-4aef-ba23-556aad150050. Customer: Frisk Dreemurr',0.0000,0.0000),
('ff780ea7-5090-4120-b3d6-3f7584bda21f','76d0dd57-3ad8-4493-b0ef-326fce854716','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','be446f77-c6cf-4394-8f84-f852b0ac1e8d',NULL,'DEBIT','COMPLETED','2026-05-01 21:19:11','2026-05-01 21:19:11','','Payment purchase for payment id be446f77-c6cf-4394-8f84-f852b0ac1e8d. Sellers: Omodog',290.0000,48.3333),
('aecce6c0-fa68-41da-b039-3f93c1f07124','8cd99303-310e-46bd-b468-28b701affb8c','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','b63fd97f-f09e-4ef8-875c-fcc40009bf46',NULL,'DEBIT','COMPLETED','2026-03-28 10:51:31','2026-03-28 10:51:31','','Payment purchase for payment id b63fd97f-f09e-4ef8-875c-fcc40009bf46. Sellers: Omodog',0.0000,0.0000),
('87c962b3-b193-4f0e-8c5d-40b54f240ca4','11625c02-2413-49dd-9e89-220e4e2cd253','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c4eed229-155b-48fe-8d93-a6adf4d96140',NULL,'CREDIT','COMPLETED','2026-04-21 02:32:15','2026-04-21 02:32:15','','Payment purchase for payment id c4eed229-155b-48fe-8d93-a6adf4d96140. Customer: Kyle Broflovski',467.0000,51.9243),
('14da2798-2bea-44f2-94c1-40f85935e5ce','a820ab13-eed3-44e6-9b0f-82ae20e55878','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',NULL,'CREDIT','COMPLETED','2026-04-27 15:26:08','2026-04-27 15:26:08','','Payment purchase for payment id 86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5. Customer: Frisk Dreemurr',2424.0000,404.0000),
('c0e8bff5-dc57-42de-9fe4-43412a36a137','ee75733d-2605-4143-8001-7148093bca55','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c937dfe7-68d2-4884-be98-0b9b77df1196',NULL,'DEBIT','COMPLETED','2026-03-28 10:54:12','2026-03-28 10:54:12','','Payment purchase for payment id c937dfe7-68d2-4884-be98-0b9b77df1196. Sellers: Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('a238781e-2d0d-4911-b773-44409a8f857e','946e4903-c899-4bb6-a320-26d37f3cdf57','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','b4912aeb-5c11-403c-81bb-588da87592ed',NULL,'CREDIT','COMPLETED','2026-03-28 14:38:32','2026-03-28 14:38:32','','Payment purchase for payment id b4912aeb-5c11-403c-81bb-588da87592ed. Customer: Frisk Dreemurr',0.0000,0.0000),
('aa0f98b5-e291-4833-8b8d-45803d8bba17','d4cc7675-c6ad-43ee-a493-aa5d8768ee0c','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','46447df0-7deb-4677-9caa-45b4ff585820',NULL,'CREDIT','COMPLETED','2026-04-27 15:22:49','2026-04-27 15:22:49','','Payment purchase for payment id 46447df0-7deb-4677-9caa-45b4ff585820. Customer: Frisk Dreemurr',4848.0000,808.0000),
('5232b2ed-af59-481e-b601-4a81db162ce3','9f7a91ba-1674-4bcd-aa84-883fcd57ac34','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','7c5d86a3-fe30-4496-88d4-45b9d4501888',NULL,'CREDIT','COMPLETED','2026-04-13 08:54:32','2026-04-13 08:54:32','','Payment purchase for payment id 7c5d86a3-fe30-4496-88d4-45b9d4501888. Customer: Frisk Dreemurr',0.0000,0.0000),
('84f81d1b-3220-46c9-a703-4b18f6406ba4','9b2a433d-d6dc-497c-9780-59fed73f3091','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','af94372d-4a92-4409-a49b-4d3f079129a8',NULL,'CREDIT','COMPLETED','2026-03-29 21:03:00','2026-03-29 21:03:00','','Payment purchase for payment id af94372d-4a92-4409-a49b-4d3f079129a8. Customer: Frisk Dreemurr',0.0000,0.0000),
('cb3eb26d-dbfe-42b9-9bec-4e3017d65e62','36a81cdb-532d-4746-bad3-8fc25b454989','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','5250a81a-6d49-4d3c-ad7e-56013dba864d',NULL,'CREDIT','COMPLETED','2026-03-28 14:33:27','2026-03-28 14:33:27','','Payment purchase for payment id 5250a81a-6d49-4d3c-ad7e-56013dba864d. Customer: Frisk Dreemurr',0.0000,0.0000),
('cc381bd4-ac0a-4a13-bb50-4f9fb98203e6','da7d2580-e8c4-45b0-a62f-cd777bc3397b','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','dce665d2-1d97-4cf1-9529-7e4ef5c12b1f',NULL,'DEBIT','COMPLETED','2026-03-28 14:23:17','2026-03-28 14:23:17','','Payment purchase for payment id dce665d2-1d97-4cf1-9529-7e4ef5c12b1f. Sellers: Omodog',0.0000,0.0000),
('c33afa97-d707-4811-95af-56c44c9951e5','ce119dca-4000-4c05-987e-982a90508ec1','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','6ed605eb-41d2-4eba-ba88-e5b5ec76cb67',NULL,'DEBIT','COMPLETED','2026-03-31 11:59:13','2026-03-31 11:59:13','','Payment purchase for payment id 6ed605eb-41d2-4eba-ba88-e5b5ec76cb67. Sellers: Omodog',0.0000,0.0000),
('0bd08d95-4765-4641-8d9a-57390d883ae4','744f7ffe-e6ae-4ece-ac7f-7063017a0091','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','c5cef75d-bb65-46b3-9375-3a5cc39920b6',NULL,'CREDIT','COMPLETED','2026-04-27 15:07:26','2026-04-27 15:07:26','','Payment purchase for payment id c5cef75d-bb65-46b3-9375-3a5cc39920b6. Customer: Frisk Dreemurr',33.0000,5.5000),
('12fff0f9-2686-4253-ad03-58f6e290d890','005c15be-55c5-46c8-8fca-b9cba0d9ed23','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','28100ad5-150e-4139-a68d-ff874dbb7104',NULL,'CREDIT','COMPLETED','2026-04-13 12:07:05','2026-04-13 12:07:05','','Payment purchase for payment id 28100ad5-150e-4139-a68d-ff874dbb7104. Customer: Frisk Dreemurr',0.0000,0.0000),
('e575deb4-3fff-4162-8358-59571cc1fce9','ee75733d-2605-4143-8001-7148093bca55','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','c937dfe7-68d2-4884-be98-0b9b77df1196',NULL,'CREDIT','COMPLETED','2026-03-28 10:54:12','2026-03-28 10:54:12','','Payment purchase for payment id c937dfe7-68d2-4884-be98-0b9b77df1196. Customer: Frisk Dreemurr',0.0000,0.0000),
('2ed91201-9b56-49a2-852b-59ac0e041af4','309b68be-f65e-4a34-b7cf-8568ab4f244a','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','2f6dc481-f941-4b12-90d3-acc9554773f4',NULL,'CREDIT','COMPLETED','2026-04-13 12:34:50','2026-04-13 12:34:50','','Payment purchase for payment id 2f6dc481-f941-4b12-90d3-acc9554773f4. Customer: Frisk Dreemurr',0.0000,0.0000),
('1aa9b2a4-67f9-4622-8aef-5f332c607c0a','60eeebcf-c46c-458b-b45e-3a7a2abcc2e9','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','c26de1c7-9b65-4305-b0e8-ccc8d8fbb219',NULL,'CREDIT','COMPLETED','2026-04-18 12:22:47','2026-04-18 12:22:47','','Payment purchase for payment id c26de1c7-9b65-4305-b0e8-ccc8d8fbb219. Customer: Frisk Dreemurr',0.0000,0.0000),
('af81f1e3-547a-4531-93e0-5fde49e3c233','91d36acb-42c5-4812-b832-ee9c67b3f050','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','1b2f201a-15d0-47eb-8084-d9019c1e4970',NULL,'CREDIT','COMPLETED','2026-04-29 13:59:15','2026-04-29 13:59:15','','Payment refund for payment id 1b2f201a-15d0-47eb-8084-d9019c1e4970. Sellers: Omodog',357.0000,33.5909),
('044135fd-733c-4499-a759-650a2eead104','da7d2580-e8c4-45b0-a62f-cd777bc3397b','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','dce665d2-1d97-4cf1-9529-7e4ef5c12b1f',NULL,'CREDIT','COMPLETED','2026-03-28 14:23:17','2026-03-28 14:23:17','','Payment purchase for payment id dce665d2-1d97-4cf1-9529-7e4ef5c12b1f. Customer: Frisk Dreemurr',0.0000,0.0000),
('8c1ffc0d-bbfa-4755-8a04-668bd1c91a54','a78e3d9d-0c35-445c-b341-97bd0bcd2990','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','6bfdea2e-5e43-495c-9d89-d1d27540304e',NULL,'DEBIT','COMPLETED','2026-04-13 12:41:47','2026-04-13 12:41:47','','Payment purchase for payment id 6bfdea2e-5e43-495c-9d89-d1d27540304e. Sellers: Tetakent (H.C.G), Omodog, Doofenshmirtz Evil Inc, Esenler Motionstar Incorporated',0.0000,0.0000),
('3e220c70-07b0-4cb8-8bfa-674ad4d83dd2','c054ce4e-6521-4b2b-9b68-1aaf1b326379','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','d52dbec7-70cc-4033-8efc-9cda518bc009',NULL,'CREDIT','WAITING','2026-04-29 14:22:32','2026-04-29 14:22:32','','Payment refund for payment id d52dbec7-70cc-4033-8efc-9cda518bc009. Sellers: Omodog',369.0000,35.5909),
('584b4727-ad69-4f68-b243-67d06010f5f1','f77a5004-a061-4cef-a84c-ae445713f63d','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','eb6eadf1-a396-4eaf-b537-225ed0997447',NULL,'DEBIT','COMPLETED','2026-03-28 10:59:43','2026-03-28 10:59:43','','Payment purchase for payment id eb6eadf1-a396-4eaf-b537-225ed0997447. Sellers: Omodog',0.0000,0.0000),
('9e780c92-bbfc-4dd1-952b-683606532a6d','6f271261-8978-4134-a0c4-64ca63dbbf1f','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','bdc318a1-2832-42fc-8cba-7a75a8d112d8',NULL,'CREDIT','COMPLETED','2026-04-01 12:18:00','2026-04-01 12:18:00','','Payment purchase for payment id bdc318a1-2832-42fc-8cba-7a75a8d112d8. Customer: Frisk Dreemurr',0.0000,0.0000),
('36c118ce-0813-41f4-9735-68c5f0d719b6','61627381-5591-4b77-b03f-dadd02637923','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','c2f20787-32ee-4e8a-9385-4938bc36dff6',NULL,'CREDIT','COMPLETED','2026-04-14 12:53:12','2026-04-14 12:53:12','','Payment purchase for payment id c2f20787-32ee-4e8a-9385-4938bc36dff6. Customer: Frisk Dreemurr',0.0000,0.0000),
('969d3645-0670-4f75-a873-6a3b4116ec46','a78e3d9d-0c35-445c-b341-97bd0bcd2990','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','6bfdea2e-5e43-495c-9d89-d1d27540304e',NULL,'CREDIT','COMPLETED','2026-04-13 12:41:47','2026-04-13 12:41:47','','Payment purchase for payment id 6bfdea2e-5e43-495c-9d89-d1d27540304e. Customer: Frisk Dreemurr',0.0000,0.0000),
('073a81d7-085e-49e4-b783-6d39bae91ebe','005c15be-55c5-46c8-8fca-b9cba0d9ed23','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','28100ad5-150e-4139-a68d-ff874dbb7104',NULL,'CREDIT','COMPLETED','2026-04-13 12:07:05','2026-04-13 12:07:05','','Payment purchase for payment id 28100ad5-150e-4139-a68d-ff874dbb7104. Customer: Frisk Dreemurr',0.0000,0.0000),
('986eab8a-da8a-4e4b-bc18-6e6d8d15d009','8e1d661e-3135-4bb0-9891-9e690bff993f','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','e8a977da-ec64-454e-bcc6-aa14aab609b5',NULL,'CREDIT','COMPLETED','2026-04-30 22:57:40','2026-04-30 22:57:40','','Payment purchase for payment id e8a977da-ec64-454e-bcc6-aa14aab609b5. Customer: Frisk Dreemurr',14.0000,2.3333),
('bf3448ba-3ba8-4f0d-9603-7290f4e92a7f','a820ab13-eed3-44e6-9b0f-82ae20e55878','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',NULL,'CREDIT','COMPLETED','2026-04-27 15:26:08','2026-04-27 15:26:08','','Payment purchase for payment id 86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5. Customer: Frisk Dreemurr',924.0000,154.0000),
('9f061610-40d8-4169-a4ae-72dc055f47a3','b0bc0b1f-0944-4e4f-a230-03ebeb236bc4','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','e15efeb5-20d4-4f81-9ba7-275034539e14',NULL,'CREDIT','COMPLETED','2026-04-27 15:14:48','2026-04-27 15:14:48','','Payment purchase for payment id e15efeb5-20d4-4f81-9ba7-275034539e14. Customer: Frisk Dreemurr',765.0000,75.6818),
('bafc6ade-bf9c-4ffb-8bbb-75d81c395362','053f0a4a-bcac-4cf7-a979-665bf6693d78','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','2684e28d-ff4b-49c1-9da0-d445df284489',NULL,'DEBIT','COMPLETED','2026-04-29 13:25:29','2026-04-29 13:25:29','','Payment purchase for payment id 2684e28d-ff4b-49c1-9da0-d445df284489. Sellers: Doofenshmirtz Evil Inc, Omodog, Tetakent (H.C.G)',1799.0000,273.9242),
('d07cae81-433a-4bfb-9104-761eb194c735','61627381-5591-4b77-b03f-dadd02637923','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c2f20787-32ee-4e8a-9385-4938bc36dff6',NULL,'DEBIT','COMPLETED','2026-04-14 12:53:12','2026-04-14 12:53:12','','Payment purchase for payment id c2f20787-32ee-4e8a-9385-4938bc36dff6. Sellers: Esenler Motionstar Incorporated, Doofenshmirtz Evil Inc, Tetakent (H.C.G), Omodog',0.0000,0.0000),
('4a6d0ab4-6949-4e17-8980-76e222143b70','d5dfebc0-4c35-429b-8253-de801939673f','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','cbb58ca9-25c4-4f15-a903-f67d59d1ede1',NULL,'CREDIT','COMPLETED','2026-03-28 14:21:07','2026-03-28 14:21:07','','Payment purchase for payment id cbb58ca9-25c4-4f15-a903-f67d59d1ede1. Customer: Frisk Dreemurr',0.0000,0.0000),
('e176b76a-6595-4bce-9c92-775e10adab50','eb9f9199-f049-4d26-902d-b033ee52d8c5','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','a815c450-c725-4563-8ab1-8446c0397ef5',NULL,'CREDIT','COMPLETED','2026-04-27 15:10:27','2026-04-27 15:10:27','','Payment purchase for payment id a815c450-c725-4563-8ab1-8446c0397ef5. Customer: Frisk Dreemurr',27.0000,4.5000),
('e2d56183-4d2d-4126-8fa3-79f5e841521c','11625c02-2413-49dd-9e89-220e4e2cd253','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','c4eed229-155b-48fe-8d93-a6adf4d96140',NULL,'DEBIT','COMPLETED','2026-04-21 02:32:15','2026-04-21 02:32:15','','Payment purchase for payment id c4eed229-155b-48fe-8d93-a6adf4d96140. Sellers: Omodog, Tetakent (H.C.G)',1679.0000,253.9242),
('20dfb10a-7f14-4c36-8e33-7b6fb40d7596','aefa3606-55ea-4b32-9b98-94a6cf7657cc','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','20f53c55-86ec-43fd-82a6-41225df5fd58',NULL,'CREDIT','COMPLETED','2026-04-13 09:34:44','2026-04-13 09:34:44','','Payment purchase for payment id 20f53c55-86ec-43fd-82a6-41225df5fd58. Customer: Frisk Dreemurr',0.0000,0.0000),
('db692c89-a7d9-411f-a3ef-7e7662330117','a78e3d9d-0c35-445c-b341-97bd0bcd2990','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','6bfdea2e-5e43-495c-9d89-d1d27540304e',NULL,'CREDIT','COMPLETED','2026-04-13 12:41:47','2026-04-13 12:41:47','','Payment purchase for payment id 6bfdea2e-5e43-495c-9d89-d1d27540304e. Customer: Frisk Dreemurr',0.0000,0.0000),
('40cf236b-9f2f-412a-96b9-8164184ae69c','d4cc7675-c6ad-43ee-a493-aa5d8768ee0c','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','46447df0-7deb-4677-9caa-45b4ff585820',NULL,'DEBIT','COMPLETED','2026-04-27 15:22:49','2026-04-27 15:22:49','','Payment purchase for payment id 46447df0-7deb-4677-9caa-45b4ff585820. Sellers: Esenler Motionstar Incorporated, Omodog, Tetakent (H.C.G)',5414.0000,902.3333),
('d76fb9ef-6862-4d0c-8308-827912a0cfa6','d5dfebc0-4c35-429b-8253-de801939673f','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','cbb58ca9-25c4-4f15-a903-f67d59d1ede1',NULL,'CREDIT','COMPLETED','2026-03-28 14:21:07','2026-03-28 14:21:07','','Payment purchase for payment id cbb58ca9-25c4-4f15-a903-f67d59d1ede1. Customer: Frisk Dreemurr',0.0000,0.0000),
('bbff330f-5bc0-4f71-9fee-8285d4f7bcc8','11625c02-2413-49dd-9e89-220e4e2cd253','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','c4eed229-155b-48fe-8d93-a6adf4d96140',NULL,'CREDIT','COMPLETED','2026-04-21 02:32:15','2026-04-21 02:32:15','','Payment purchase for payment id c4eed229-155b-48fe-8d93-a6adf4d96140. Customer: Kyle Broflovski',1212.0000,202.0000),
('5c0032ed-f6d3-47fd-bf83-8311e8d005a2','f7ae3ad6-59e8-4c0b-973f-a4a2bef9676d','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1263a16c-8f45-4a42-8d2d-eebbb17fbaa4',NULL,'CREDIT','COMPLETED','2026-04-13 12:08:16','2026-04-13 12:08:16','','Payment purchase for payment id 1263a16c-8f45-4a42-8d2d-eebbb17fbaa4. Customer: Frisk Dreemurr',0.0000,0.0000),
('038232dd-d2c2-4853-a746-834a7caeb4f2','60eeebcf-c46c-458b-b45e-3a7a2abcc2e9','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','c26de1c7-9b65-4305-b0e8-ccc8d8fbb219',NULL,'CREDIT','COMPLETED','2026-04-18 12:22:47','2026-04-18 12:22:47','','Payment purchase for payment id c26de1c7-9b65-4305-b0e8-ccc8d8fbb219. Customer: Frisk Dreemurr',0.0000,0.0000),
('a7314bcd-e316-4bbd-ad7f-839e19c04504','3fdf6b3a-3e68-4dd2-a63f-3037e69aa8f9','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','f6e28e3d-fd4e-49f6-b740-cfcf04571146',NULL,'DEBIT','COMPLETED','2026-04-01 12:02:21','2026-04-01 12:02:21','','Payment purchase for payment id f6e28e3d-fd4e-49f6-b740-cfcf04571146. Sellers: Omodog',0.0000,0.0000),
('6a6c9bce-3dd2-4a36-b694-84712b639295','a18026e2-b710-4a4b-9c3f-a3ccbbdfc64e','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','5c474860-602f-4e3a-a6f9-a11fc1c7de86',NULL,'CREDIT','COMPLETED','2026-03-28 14:06:31','2026-03-28 14:06:31','','Payment purchase for payment id 5c474860-602f-4e3a-a6f9-a11fc1c7de86. Customer: Frisk Dreemurr',0.0000,0.0000),
('cb0fc66e-33ae-4608-a57a-84f183a00936','053f0a4a-bcac-4cf7-a979-665bf6693d78','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','2684e28d-ff4b-49c1-9da0-d445df284489',NULL,'CREDIT','COMPLETED','2026-04-29 13:25:29','2026-04-29 13:25:29','','Payment purchase for payment id 2684e28d-ff4b-49c1-9da0-d445df284489. Customer: Frisk Dreemurr',573.0000,69.5909),
('0937bf4d-63b7-4c53-b4b1-861067a5d13e','61627381-5591-4b77-b03f-dadd02637923','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c2f20787-32ee-4e8a-9385-4938bc36dff6',NULL,'CREDIT','COMPLETED','2026-04-14 12:53:12','2026-04-14 12:53:12','','Payment purchase for payment id c2f20787-32ee-4e8a-9385-4938bc36dff6. Customer: Frisk Dreemurr',0.0000,0.0000),
('d915ffc6-c2c2-465d-93e7-862333661702','c4296c87-1418-4465-8d3d-efefe07c5eed','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','5564f851-c835-4667-b894-c654b69a93f6',NULL,'CREDIT','COMPLETED','2026-03-28 14:23:53','2026-03-28 14:23:53','','Payment purchase for payment id 5564f851-c835-4667-b894-c654b69a93f6. Customer: Frisk Dreemurr',0.0000,0.0000),
('102ce0df-7b01-402e-b205-86b9787221a6','4d6c363a-51f1-4d62-a62e-3c9e91f996f2','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c676457a-b61a-4fa2-a67e-f963453ebb03',NULL,'CREDIT','COMPLETED','2026-03-28 10:53:06','2026-03-28 10:53:06','','Payment purchase for payment id c676457a-b61a-4fa2-a67e-f963453ebb03. Customer: Frisk Dreemurr',0.0000,0.0000),
('b08c4ade-5b51-4327-afd1-86cc3b9edda0','586944a1-eb1e-4135-895b-f7ad1dfdd0e7','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','31eaa473-24b9-415d-b78c-78d46c67e5cd',NULL,'CREDIT','COMPLETED','2026-04-30 23:00:12','2026-04-30 23:00:12','','Payment purchase for payment id 31eaa473-24b9-415d-b78c-78d46c67e5cd. Customer: Frisk Dreemurr',22.0000,3.6667),
('65638a97-e984-48ff-94fb-8732426bfca5','053f0a4a-bcac-4cf7-a979-665bf6693d78','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','2684e28d-ff4b-49c1-9da0-d445df284489',NULL,'CREDIT','COMPLETED','2026-04-29 13:25:29','2026-04-29 13:25:29','','Payment purchase for payment id 2684e28d-ff4b-49c1-9da0-d445df284489. Customer: Frisk Dreemurr',14.0000,2.3333),
('cc473cef-7256-42f4-800b-8756348557d1','586944a1-eb1e-4135-895b-f7ad1dfdd0e7','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','31eaa473-24b9-415d-b78c-78d46c67e5cd',NULL,'CREDIT','COMPLETED','2026-04-30 23:00:12','2026-04-30 23:00:12','','Payment purchase for payment id 31eaa473-24b9-415d-b78c-78d46c67e5cd. Customer: Frisk Dreemurr',239.0000,39.8333),
('22206e63-c2d6-4154-ab55-885b7ea129ea','053f0a4a-bcac-4cf7-a979-665bf6693d78','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','2684e28d-ff4b-49c1-9da0-d445df284489',NULL,'CREDIT','COMPLETED','2026-04-29 13:25:29','2026-04-29 13:25:29','','Payment purchase for payment id 2684e28d-ff4b-49c1-9da0-d445df284489. Customer: Frisk Dreemurr',1212.0000,202.0000),
('b71dc076-aeb0-4145-9f09-88c14bc989c5','334cdb54-d55c-4e99-a265-1c64f628e082','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','3fbb1567-580e-4254-adac-427adb667854',NULL,'CREDIT','COMPLETED','2026-04-14 12:51:20','2026-04-14 12:51:20','','Payment purchase for payment id 3fbb1567-580e-4254-adac-427adb667854. Customer: Frisk Dreemurr',0.0000,0.0000),
('25a1d2f3-f266-4541-953b-89a6053e949a','946e4903-c899-4bb6-a320-26d37f3cdf57','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','b4912aeb-5c11-403c-81bb-588da87592ed',NULL,'CREDIT','COMPLETED','2026-03-28 14:38:32','2026-03-28 14:38:32','','Payment purchase for payment id b4912aeb-5c11-403c-81bb-588da87592ed. Customer: Frisk Dreemurr',0.0000,0.0000),
('a954f2d5-4b9d-4305-9bc4-8b8b1a1d42c6','53448fb3-9d45-410b-8da7-e2189fcca34c','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','97ce01db-fe13-428e-8b3f-ad9e49c2953b',NULL,'DEBIT','COMPLETED','2026-04-30 23:19:31','2026-04-30 23:19:31','','Payment purchase for payment id 97ce01db-fe13-428e-8b3f-ad9e49c2953b. Sellers: Tetakent (H.C.G), Esenler Motionstar Incorporated',6844.0000,1140.6667),
('59dd7ba5-a552-4636-b0c5-8b98b10b5bc2','f3275dc6-188a-4879-9240-eba4ea0ba438','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','55242586-5b62-4fbc-957d-42739f898b2f',NULL,'DEBIT','COMPLETED','2026-04-14 12:49:38','2026-04-14 12:49:38','','Payment purchase for payment id 55242586-5b62-4fbc-957d-42739f898b2f. Sellers: Omodog',0.0000,0.0000),
('4c9e6c92-d11b-4d75-9585-8bee01c9e2f9','60eeebcf-c46c-458b-b45e-3a7a2abcc2e9','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c26de1c7-9b65-4305-b0e8-ccc8d8fbb219',NULL,'CREDIT','COMPLETED','2026-04-18 12:22:47','2026-04-18 12:22:47','','Payment purchase for payment id c26de1c7-9b65-4305-b0e8-ccc8d8fbb219. Customer: Frisk Dreemurr',0.0000,0.0000),
('15308a0f-6df6-49ac-95ff-8ca12abd0f14','93e117ea-bd6c-46e1-95a5-d633602ed730','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c067f04c-a728-41bc-bb22-c940f487b445',NULL,'CREDIT','COMPLETED','2026-04-30 23:23:33','2026-04-30 23:23:33','','Payment purchase for payment id c067f04c-a728-41bc-bb22-c940f487b445. Customer: Frisk Dreemurr',1372.0000,228.6667),
('59bf14d9-700b-4be5-bd3b-8cf77305e85f','8cd99303-310e-46bd-b468-28b701affb8c','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','b63fd97f-f09e-4ef8-875c-fcc40009bf46',NULL,'CREDIT','COMPLETED','2026-03-28 10:51:31','2026-03-28 10:51:31','','Payment purchase for payment id b63fd97f-f09e-4ef8-875c-fcc40009bf46. Customer: Frisk Dreemurr',0.0000,0.0000),
('bc241e32-4bac-4464-baed-8d04e109ee46','76d0dd57-3ad8-4493-b0ef-326fce854716','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','be446f77-c6cf-4394-8f84-f852b0ac1e8d',NULL,'CREDIT','COMPLETED','2026-05-01 21:19:11','2026-05-01 21:19:11','','Payment purchase for payment id be446f77-c6cf-4394-8f84-f852b0ac1e8d. Customer: Frisk Dreemurr',290.0000,48.3333),
('9f7d8507-48cd-49b9-8040-913341230a27','3fdf6b3a-3e68-4dd2-a63f-3037e69aa8f9','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','f6e28e3d-fd4e-49f6-b740-cfcf04571146',NULL,'CREDIT','COMPLETED','2026-04-01 12:02:21','2026-04-01 12:02:21','','Payment purchase for payment id f6e28e3d-fd4e-49f6-b740-cfcf04571146. Customer: Frisk Dreemurr',0.0000,0.0000),
('66dc876f-f36e-4a66-8f7d-92a66ef207fd','aefa3606-55ea-4b32-9b98-94a6cf7657cc','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','20f53c55-86ec-43fd-82a6-41225df5fd58',NULL,'DEBIT','COMPLETED','2026-04-13 09:34:44','2026-04-13 09:34:44','','Payment purchase for payment id 20f53c55-86ec-43fd-82a6-41225df5fd58. Sellers: Tetakent (H.C.G)',0.0000,0.0000),
('6094d828-8ae2-4836-a04c-9596551f6611','36a81cdb-532d-4746-bad3-8fc25b454989','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','5250a81a-6d49-4d3c-ad7e-56013dba864d',NULL,'CREDIT','COMPLETED','2026-03-28 14:33:27','2026-03-28 14:33:27','','Payment purchase for payment id 5250a81a-6d49-4d3c-ad7e-56013dba864d. Customer: Frisk Dreemurr',0.0000,0.0000),
('42bfccc9-fddc-4f64-b3f8-95b5c6be9c77','36e258d5-58fa-4019-b627-64cc1481436a','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','65fb3419-cb50-4c5b-b31e-98dbfe1bb430',NULL,'DEBIT','COMPLETED','2026-04-05 11:41:27','2026-04-05 11:41:27','','Payment purchase for payment id 65fb3419-cb50-4c5b-b31e-98dbfe1bb430. Sellers: Omodog',0.0000,0.0000),
('f9fae7f0-2bec-4d22-9906-96c7b438e499','67f40595-19b0-4b78-adfd-ca82894dded1','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','3377a6d8-0ae0-4e1e-a2d7-c8885587eb0f',NULL,'CREDIT','COMPLETED','2026-03-28 14:20:07','2026-03-28 14:20:07','','Payment purchase for payment id 3377a6d8-0ae0-4e1e-a2d7-c8885587eb0f. Customer: Frisk Dreemurr',0.0000,0.0000),
('9c40888b-4f25-43af-bec9-98b3c8b53bdb','e66911ba-6b44-4d23-a9c7-4756aaf1f55b','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','5c94c159-611c-4a6d-8498-b0daaea9b234',NULL,'CREDIT','COMPLETED','2026-04-30 22:16:40','2026-04-30 22:16:40','','Payment purchase for payment id 5c94c159-611c-4a6d-8498-b0daaea9b234. Customer: Frisk Dreemurr',14.0000,2.3333),
('88eb2456-254f-4b73-b9be-996c53f6193a','c75e19e1-8a7c-432f-b0e3-173eb2f4b4a6','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','bd8e8e57-269a-4d27-b1ad-698289104c89',NULL,'CREDIT','COMPLETED','2026-04-29 14:36:06','2026-04-29 14:36:06','','Payment purchase for payment id bd8e8e57-269a-4d27-b1ad-698289104c89. Customer: Frisk Dreemurr',566.0000,68.4242),
('43f2e930-9ef0-48de-8775-9c520deb6321','8e1d661e-3135-4bb0-9891-9e690bff993f','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','e8a977da-ec64-454e-bcc6-aa14aab609b5',NULL,'CREDIT','COMPLETED','2026-04-30 22:57:40','2026-04-30 22:57:40','','Payment purchase for payment id e8a977da-ec64-454e-bcc6-aa14aab609b5. Customer: Frisk Dreemurr',55.0000,9.1667),
('33990d6c-a218-4e88-8680-9c52d6bbaeaa','d025e637-0b54-4748-93a3-18b00fc50674','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','d4668779-7454-4f6a-b81c-ba9aa510e070',NULL,'DEBIT','COMPLETED','2026-03-31 12:08:07','2026-03-31 12:08:07','','Payment purchase for payment id d4668779-7454-4f6a-b81c-ba9aa510e070. Sellers: Omodog',0.0000,0.0000),
('4c3ff9d8-0534-40ed-bcba-9df4390ffb89','8d44d12a-5d62-40f9-b3d5-26278096d5e9','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','acebf506-e0ca-42d2-b9e1-6e192b86e53f',NULL,'CREDIT','COMPLETED','2026-04-13 09:26:45','2026-04-13 09:26:45','','Payment purchase for payment id acebf506-e0ca-42d2-b9e1-6e192b86e53f. Customer: Frisk Dreemurr',0.0000,0.0000),
('213383a1-8bf2-47af-afda-9f3d3daf11f8','8e1d661e-3135-4bb0-9891-9e690bff993f','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','e8a977da-ec64-454e-bcc6-aa14aab609b5',NULL,'DEBIT','COMPLETED','2026-04-30 22:57:40','2026-04-30 22:57:40','','Payment purchase for payment id e8a977da-ec64-454e-bcc6-aa14aab609b5. Sellers: Doofenshmirtz Evil Inc, Tetakent (H.C.G), Omodog, Esenler Motionstar Incorporated',2847.0000,448.5909),
('2b2ed591-60df-47c6-9326-9fcad7b31c7e','c75e19e1-8a7c-432f-b0e3-173eb2f4b4a6','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','bd8e8e57-269a-4d27-b1ad-698289104c89',NULL,'CREDIT','COMPLETED','2026-04-29 14:36:06','2026-04-29 14:36:06','','Payment purchase for payment id bd8e8e57-269a-4d27-b1ad-698289104c89. Customer: Frisk Dreemurr',1212.0000,202.0000),
('03330afa-72c2-45d9-84bb-a0cd06d1f09b','4508d7c2-fa05-4eb0-9c97-50266e31dc94','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','d535fbc3-69f4-4b8a-ac31-ab4073dbb889',NULL,'DEBIT','COMPLETED','2026-04-13 12:19:24','2026-04-13 12:19:24','','Payment purchase for payment id d535fbc3-69f4-4b8a-ac31-ab4073dbb889. Sellers: Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('ed3e23b4-212e-4e0d-ad08-a190dff1d2bb','53448fb3-9d45-410b-8da7-e2189fcca34c','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','97ce01db-fe13-428e-8b3f-ad9e49c2953b',NULL,'CREDIT','COMPLETED','2026-04-30 23:19:31','2026-04-30 23:19:31','','Payment purchase for payment id 97ce01db-fe13-428e-8b3f-ad9e49c2953b. Customer: Frisk Dreemurr',6756.0000,1126.0000),
('370707cb-372b-4ccd-b467-a2213e852096','068edcd6-40a1-4f47-b25c-35b40b3dc1b6','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','9dfd48f2-f25b-4903-bed0-47e340260c33',NULL,'DEBIT','COMPLETED','2026-03-31 11:35:26','2026-03-31 11:35:26','','Payment purchase for payment id 9dfd48f2-f25b-4903-bed0-47e340260c33. Sellers: Omodog',0.0000,0.0000),
('561e9c43-27d4-499c-8cb4-a2629c074d52','586944a1-eb1e-4135-895b-f7ad1dfdd0e7','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','31eaa473-24b9-415d-b78c-78d46c67e5cd',NULL,'CREDIT','COMPLETED','2026-04-30 23:00:12','2026-04-30 23:00:12','','Payment purchase for payment id 31eaa473-24b9-415d-b78c-78d46c67e5cd. Customer: Frisk Dreemurr',2140.0000,356.6667),
('e166229b-b19c-42cd-a929-a47c21129e53','309b68be-f65e-4a34-b7cf-8568ab4f244a','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','2f6dc481-f941-4b12-90d3-acc9554773f4',NULL,'CREDIT','COMPLETED','2026-04-13 12:34:50','2026-04-13 12:34:50','','Payment purchase for payment id 2f6dc481-f941-4b12-90d3-acc9554773f4. Customer: Frisk Dreemurr',0.0000,0.0000),
('f6231f57-da9d-48d1-9e18-a635ae875b6b','098d595b-af3f-4511-ba22-431c9a963a76','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','fadd1328-7198-408e-8405-9eda402b9dda',NULL,'DEBIT','COMPLETED','2026-04-29 13:57:45','2026-04-29 13:57:45','','Payment purchase for payment id fadd1328-7198-408e-8405-9eda402b9dda. Sellers: Omodog',1080.0000,102.2727),
('15c8c8f4-3f4f-4b8b-9da5-a642f428b5c1','a082003e-a2c9-4458-94f9-e0832d877504','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','9d7a02a8-6a03-4abe-98e4-15ad3416852a',NULL,'DEBIT','COMPLETED','2026-04-27 14:31:39','2026-04-27 14:31:39','','Payment purchase for payment id 9d7a02a8-6a03-4abe-98e4-15ad3416852a. Sellers: Tetakent (H.C.G), Omodog',9208.0000,1534.6667),
('357668e4-bc30-4e07-9e90-a752688a86b3','36a81cdb-532d-4746-bad3-8fc25b454989','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','5250a81a-6d49-4d3c-ad7e-56013dba864d',NULL,'CREDIT','COMPLETED','2026-03-28 14:33:27','2026-03-28 14:33:27','','Payment purchase for payment id 5250a81a-6d49-4d3c-ad7e-56013dba864d. Customer: Frisk Dreemurr',0.0000,0.0000),
('12a9a947-16d7-4d70-9a3f-a77803c29e07','586944a1-eb1e-4135-895b-f7ad1dfdd0e7','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','31eaa473-24b9-415d-b78c-78d46c67e5cd',NULL,'DEBIT','COMPLETED','2026-04-30 23:00:12','2026-04-30 23:00:12','','Payment purchase for payment id 31eaa473-24b9-415d-b78c-78d46c67e5cd. Sellers: Omodog, Tetakent (H.C.G), Esenler Motionstar Incorporated',2401.0000,400.1667),
('f9655d14-95af-4ab9-b3bb-a88e57ae912d','67f40595-19b0-4b78-adfd-ca82894dded1','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','3377a6d8-0ae0-4e1e-a2d7-c8885587eb0f',NULL,'DEBIT','COMPLETED','2026-03-28 14:20:07','2026-03-28 14:20:07','','Payment purchase for payment id 3377a6d8-0ae0-4e1e-a2d7-c8885587eb0f. Sellers: Omodog',0.0000,0.0000),
('fd236dd4-c8b1-4639-b634-a8b89c97a99e','d4c6f778-46c9-4daa-bd7a-b5ec09ce7d81','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','69e44495-cab2-4dde-ae7e-70c89451c286',NULL,'CREDIT','COMPLETED','2026-03-29 21:04:58','2026-03-29 21:04:58','','Payment purchase for payment id 69e44495-cab2-4dde-ae7e-70c89451c286. Customer: Frisk Dreemurr',0.0000,0.0000),
('a4d392f3-ef46-4189-b8ff-a8ca3ef208fd','e5def9e7-753f-43e9-9cf5-47998bcff335','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','b7a0f68b-ff5a-4840-8287-fef707e17ac1',NULL,'DEBIT','COMPLETED','2026-04-05 11:31:48','2026-04-05 11:31:48','','Payment purchase for payment id b7a0f68b-ff5a-4840-8287-fef707e17ac1. Sellers: Omodog',0.0000,0.0000),
('d77f8a56-6c0f-408d-9ade-aa25a1125318','4279e074-f4ba-40b8-aa28-4cc0ee46ad35','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','33b8b817-fa78-461c-8abd-60ecb0493698',NULL,'CREDIT','COMPLETED','2026-04-09 13:09:43','2026-04-09 13:09:43','','Payment purchase for payment id 33b8b817-fa78-461c-8abd-60ecb0493698. Customer: Frisk Dreemurr',0.0000,0.0000),
('8ca56521-d565-4f3f-b28f-aa44d99cc7b8','334cdb54-d55c-4e99-a265-1c64f628e082','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','3fbb1567-580e-4254-adac-427adb667854',NULL,'CREDIT','COMPLETED','2026-04-14 12:51:20','2026-04-14 12:51:20','','Payment purchase for payment id 3fbb1567-580e-4254-adac-427adb667854. Customer: Frisk Dreemurr',0.0000,0.0000),
('9c23be60-4699-4aa0-861b-aab6955f571a','fba90408-9952-4ae0-85b2-40851cbc59e3','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','d85e328f-fea2-4558-9cb7-f163a8c2e655',NULL,'CREDIT','COMPLETED','2026-03-30 19:49:33','2026-03-30 19:49:33','','Payment purchase for payment id d85e328f-fea2-4558-9cb7-f163a8c2e655. Customer: Frisk Dreemurr',0.0000,0.0000),
('1813ee82-596d-4152-b602-ac6c6075bbb5','60eeebcf-c46c-458b-b45e-3a7a2abcc2e9','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c26de1c7-9b65-4305-b0e8-ccc8d8fbb219',NULL,'DEBIT','COMPLETED','2026-04-18 12:22:47','2026-04-18 12:22:47','','Payment purchase for payment id c26de1c7-9b65-4305-b0e8-ccc8d8fbb219. Sellers: Omodog, Esenler Motionstar Incorporated, Doofenshmirtz Evil Inc, Tetakent (H.C.G)',0.0000,0.0000),
('3be535fc-b774-4bf2-b966-ac8b7f014764','ee75733d-2605-4143-8001-7148093bca55','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c937dfe7-68d2-4884-be98-0b9b77df1196',NULL,'CREDIT','COMPLETED','2026-03-28 10:54:12','2026-03-28 10:54:12','','Payment purchase for payment id c937dfe7-68d2-4884-be98-0b9b77df1196. Customer: Frisk Dreemurr',0.0000,0.0000),
('71679a2a-e1ac-4c26-8855-aea18ccf6471','334cdb54-d55c-4e99-a265-1c64f628e082','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','3fbb1567-580e-4254-adac-427adb667854',NULL,'DEBIT','COMPLETED','2026-04-14 12:51:20','2026-04-14 12:51:20','','Payment purchase for payment id 3fbb1567-580e-4254-adac-427adb667854. Sellers: Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('e1dc27c4-10ed-40b8-ae43-af263c32a68f','e5def9e7-753f-43e9-9cf5-47998bcff335','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','b7a0f68b-ff5a-4840-8287-fef707e17ac1',NULL,'CREDIT','COMPLETED','2026-04-05 11:31:48','2026-04-05 11:31:48','','Payment purchase for payment id b7a0f68b-ff5a-4840-8287-fef707e17ac1. Customer: Frisk Dreemurr',0.0000,0.0000),
('18e74e14-297e-43e0-b4d6-af56fc30e7e7','744f7ffe-e6ae-4ece-ac7f-7063017a0091','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','c5cef75d-bb65-46b3-9375-3a5cc39920b6',NULL,'CREDIT','COMPLETED','2026-04-27 15:07:26','2026-04-27 15:07:26','','Payment purchase for payment id c5cef75d-bb65-46b3-9375-3a5cc39920b6. Customer: Frisk Dreemurr',14.0000,2.3333),
('f5522243-7750-45cc-8324-af74b1074856','4508d7c2-fa05-4eb0-9c97-50266e31dc94','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','d535fbc3-69f4-4b8a-ac31-ab4073dbb889',NULL,'CREDIT','COMPLETED','2026-04-13 12:19:24','2026-04-13 12:19:24','','Payment purchase for payment id d535fbc3-69f4-4b8a-ac31-ab4073dbb889. Customer: Frisk Dreemurr',0.0000,0.0000),
('48e061bb-3e38-41b7-948e-b1f09b0f16d4','36a81cdb-532d-4746-bad3-8fc25b454989','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','5250a81a-6d49-4d3c-ad7e-56013dba864d',NULL,'CREDIT','COMPLETED','2026-03-28 14:33:27','2026-03-28 14:33:27','','Payment purchase for payment id 5250a81a-6d49-4d3c-ad7e-56013dba864d. Customer: Frisk Dreemurr',0.0000,0.0000),
('31c39a0b-5ec6-4af6-b520-b275d12f6f18','a18026e2-b710-4a4b-9c3f-a3ccbbdfc64e','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','5c474860-602f-4e3a-a6f9-a11fc1c7de86',NULL,'DEBIT','COMPLETED','2026-03-28 14:06:31','2026-03-28 14:06:31','','Payment purchase for payment id 5c474860-602f-4e3a-a6f9-a11fc1c7de86. Sellers: Omodog',0.0000,0.0000),
('5e329efd-00f7-42ff-9573-b62c15c66fd9','4508d7c2-fa05-4eb0-9c97-50266e31dc94','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','d535fbc3-69f4-4b8a-ac31-ab4073dbb889',NULL,'CREDIT','COMPLETED','2026-04-13 12:19:24','2026-04-13 12:19:24','','Payment purchase for payment id d535fbc3-69f4-4b8a-ac31-ab4073dbb889. Customer: Frisk Dreemurr',0.0000,0.0000),
('32f2fe20-f7a0-4a89-9917-b6f6090a5caf','b9969eae-4619-495a-b891-6c07ee08dfb0','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','725ee06e-78fc-48aa-ba01-ac936fc7190d',NULL,'DEBIT','COMPLETED','2026-04-13 12:06:29','2026-04-13 12:06:29','','Payment purchase for payment id 725ee06e-78fc-48aa-ba01-ac936fc7190d. Sellers: Tetakent (H.C.G)',0.0000,0.0000),
('e0c93553-326b-49de-b7ec-b7969f508658','6f271261-8978-4134-a0c4-64ca63dbbf1f','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','bdc318a1-2832-42fc-8cba-7a75a8d112d8',NULL,'DEBIT','COMPLETED','2026-04-01 12:18:00','2026-04-01 12:18:00','','Payment purchase for payment id bdc318a1-2832-42fc-8cba-7a75a8d112d8. Sellers: Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('3cce1308-8880-46c7-9b52-b7b4daa3719d','a820ab13-eed3-44e6-9b0f-82ae20e55878','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',NULL,'DEBIT','COMPLETED','2026-04-27 15:26:08','2026-04-27 15:26:08','','Payment purchase for payment id 86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5. Sellers: Tetakent (H.C.G), Omodog',3348.0000,558.0000),
('458d5ab0-254d-44b3-9bb4-bfa0fdc1f359','8e1d661e-3135-4bb0-9891-9e690bff993f','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','e8a977da-ec64-454e-bcc6-aa14aab609b5',NULL,'CREDIT','COMPLETED','2026-04-30 22:57:40','2026-04-30 22:57:40','','Payment purchase for payment id e8a977da-ec64-454e-bcc6-aa14aab609b5. Customer: Frisk Dreemurr',354.0000,33.0909),
('4eda3f04-70a4-4227-98e3-c107d34fa7ef','6b8ad375-e6ea-40fa-be3f-c74c2fbe9658','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','90b7bd2a-6723-4265-b782-242720019812',NULL,'CREDIT','COMPLETED','2026-04-11 12:48:28','2026-04-11 12:48:28','','Payment purchase for payment id 90b7bd2a-6723-4265-b782-242720019812. Customer: Frisk Dreemurr',0.0000,0.0000),
('69f2e889-786a-42bd-9ec3-c1e5447e36a6','744f7ffe-e6ae-4ece-ac7f-7063017a0091','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c5cef75d-bb65-46b3-9375-3a5cc39920b6',NULL,'CREDIT','COMPLETED','2026-04-27 15:07:26','2026-04-27 15:07:26','','Payment purchase for payment id c5cef75d-bb65-46b3-9375-3a5cc39920b6. Customer: Frisk Dreemurr',467.0000,51.9243),
('d8607eaf-af91-4bd1-948d-c87477880a94','068edcd6-40a1-4f47-b25c-35b40b3dc1b6','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','9dfd48f2-f25b-4903-bed0-47e340260c33',NULL,'CREDIT','COMPLETED','2026-03-31 11:35:26','2026-03-31 11:35:26','','Payment purchase for payment id 9dfd48f2-f25b-4903-bed0-47e340260c33. Customer: Frisk Dreemurr',0.0000,0.0000),
('69b7a283-9795-4974-b301-c9252cff4adf','2a333f87-b924-46a4-ba69-d699b1b374aa','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4',NULL,'DEBIT','COMPLETED','2026-04-29 14:20:56','2026-04-29 14:20:56','','Payment purchase for payment id 2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4. Sellers: Omodog',1134.0000,111.2727),
('c3550e37-a503-4be0-8f1d-cd26e006781e','946e4903-c899-4bb6-a320-26d37f3cdf57','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','b4912aeb-5c11-403c-81bb-588da87592ed',NULL,'DEBIT','COMPLETED','2026-03-28 14:38:32','2026-03-28 14:38:32','','Payment purchase for payment id b4912aeb-5c11-403c-81bb-588da87592ed. Sellers: Esenler Motionstar Incorporated, Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('f18a6a58-da66-4942-9017-cefadbc8312d','d4c6f778-46c9-4daa-bd7a-b5ec09ce7d81','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','69e44495-cab2-4dde-ae7e-70c89451c286',NULL,'CREDIT','COMPLETED','2026-03-29 21:04:58','2026-03-29 21:04:58','','Payment purchase for payment id 69e44495-cab2-4dde-ae7e-70c89451c286. Customer: Frisk Dreemurr',0.0000,0.0000),
('ae2328d1-0a28-41d1-b958-d0893e54ab6b','c4296c87-1418-4465-8d3d-efefe07c5eed','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','5564f851-c835-4667-b894-c654b69a93f6',NULL,'DEBIT','COMPLETED','2026-03-28 14:23:53','2026-03-28 14:23:53','','Payment purchase for payment id 5564f851-c835-4667-b894-c654b69a93f6. Sellers: Tetakent (H.C.G), Omodog',0.0000,0.0000),
('616ec240-64dd-43f0-afb3-d23e37ead0ab','e66911ba-6b44-4d23-a9c7-4756aaf1f55b','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','5c94c159-611c-4a6d-8498-b0daaea9b234',NULL,'CREDIT','COMPLETED','2026-04-30 22:16:40','2026-04-30 22:16:40','','Payment purchase for payment id 5c94c159-611c-4a6d-8498-b0daaea9b234. Customer: Frisk Dreemurr',684.0000,62.1818),
('f41c8ac0-174c-42af-836c-d30cb3055095','febbfa56-580c-4219-8c73-719b50531c32','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','ed2b84ab-8476-42f8-b8ef-64e38b0b4872',NULL,'CREDIT','COMPLETED','2026-04-11 12:27:26','2026-04-11 12:27:26','','Payment purchase for payment id ed2b84ab-8476-42f8-b8ef-64e38b0b4872. Customer: Kyle Broflovski',0.0000,0.0000),
('39f965d1-a7a7-4bb0-99a4-d5405bbaf42d','36e258d5-58fa-4019-b627-64cc1481436a','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','65fb3419-cb50-4c5b-b31e-98dbfe1bb430',NULL,'CREDIT','COMPLETED','2026-04-05 11:41:27','2026-04-05 11:41:27','','Payment purchase for payment id 65fb3419-cb50-4c5b-b31e-98dbfe1bb430. Customer: Frisk Dreemurr',0.0000,0.0000),
('22d7007d-02b6-4e75-b61a-d737d2954a69','d4cc7675-c6ad-43ee-a493-aa5d8768ee0c','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','46447df0-7deb-4677-9caa-45b4ff585820',NULL,'CREDIT','COMPLETED','2026-04-27 15:22:49','2026-04-27 15:22:49','','Payment purchase for payment id 46447df0-7deb-4677-9caa-45b4ff585820. Customer: Frisk Dreemurr',500.0000,83.3334),
('2ba404eb-c6a3-4e54-9afc-d7d8b679e1f8','744f7ffe-e6ae-4ece-ac7f-7063017a0091','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','c5cef75d-bb65-46b3-9375-3a5cc39920b6',NULL,'CREDIT','COMPLETED','2026-04-27 15:07:26','2026-04-27 15:07:26','','Payment purchase for payment id c5cef75d-bb65-46b3-9375-3a5cc39920b6. Customer: Frisk Dreemurr',1212.0000,202.0000),
('388e64ea-e147-4684-88bc-d84244be01bd','2732ac9c-98e4-4b59-9348-b770c9cd50ee','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','b0a028b8-c701-4e43-9d5f-1e182b236640',NULL,'CREDIT','COMPLETED','2026-04-14 12:43:14','2026-04-14 12:43:14','','Payment purchase for payment id b0a028b8-c701-4e43-9d5f-1e182b236640. Customer: Frisk Dreemurr',0.0000,0.0000),
('b84e2dff-fe6a-4b75-ad15-d8d526c2d184','a78e3d9d-0c35-445c-b341-97bd0bcd2990','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','6bfdea2e-5e43-495c-9d89-d1d27540304e',NULL,'CREDIT','COMPLETED','2026-04-13 12:41:47','2026-04-13 12:41:47','','Payment purchase for payment id 6bfdea2e-5e43-495c-9d89-d1d27540304e. Customer: Frisk Dreemurr',0.0000,0.0000),
('8b4ccd60-b5dd-4708-bf6f-d9fcc6ad2bee','f77a5004-a061-4cef-a84c-ae445713f63d','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','eb6eadf1-a396-4eaf-b537-225ed0997447',NULL,'CREDIT','COMPLETED','2026-03-28 10:59:43','2026-03-28 10:59:43','','Payment purchase for payment id eb6eadf1-a396-4eaf-b537-225ed0997447. Customer: Frisk Dreemurr',0.0000,0.0000),
('56a9c0df-2359-4d5d-9c17-daea84a1c467','6b8ad375-e6ea-40fa-be3f-c74c2fbe9658','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','90b7bd2a-6723-4265-b782-242720019812',NULL,'DEBIT','COMPLETED','2026-04-11 12:48:28','2026-04-11 12:48:28','','Payment purchase for payment id 90b7bd2a-6723-4265-b782-242720019812. Sellers: Esenler Motionstar Incorporated, Doofenshmirtz Evil Inc, Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('eb1efab3-2b25-4d99-b768-dbd4efc3a6af','4279e074-f4ba-40b8-aa28-4cc0ee46ad35','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','33b8b817-fa78-461c-8abd-60ecb0493698',NULL,'DEBIT','COMPLETED','2026-04-09 13:09:43','2026-04-09 13:09:43','','Payment purchase for payment id 33b8b817-fa78-461c-8abd-60ecb0493698. Sellers: Omodog',0.0000,0.0000),
('66ed407b-1f2a-4784-b21e-dd6e4ccc5164','b0bc0b1f-0944-4e4f-a230-03ebeb236bc4','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','e15efeb5-20d4-4f81-9ba7-275034539e14',NULL,'DEBIT','COMPLETED','2026-04-27 15:14:48','2026-04-27 15:14:48','','Payment purchase for payment id e15efeb5-20d4-4f81-9ba7-275034539e14. Sellers: Omodog',765.0000,75.6818),
('10043ab8-d833-4dd5-bd46-e01b43a8aa56','f7ae3ad6-59e8-4c0b-973f-a4a2bef9676d','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','1263a16c-8f45-4a42-8d2d-eebbb17fbaa4',NULL,'DEBIT','COMPLETED','2026-04-13 12:08:16','2026-04-13 12:08:16','','Payment purchase for payment id 1263a16c-8f45-4a42-8d2d-eebbb17fbaa4. Sellers: Omodog',0.0000,0.0000),
('75c75e0d-29af-490c-9d12-e1576c7701e3','6b8ad375-e6ea-40fa-be3f-c74c2fbe9658','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','90b7bd2a-6723-4265-b782-242720019812',NULL,'CREDIT','COMPLETED','2026-04-11 12:48:28','2026-04-11 12:48:28','','Payment purchase for payment id 90b7bd2a-6723-4265-b782-242720019812. Customer: Frisk Dreemurr',0.0000,0.0000),
('2c625bb8-941f-4c61-97c3-e57517aad86b','5367f248-d8b8-483b-9463-5492edcd5923','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','ddca578b-583d-4008-8497-39bd8e360304',NULL,'CREDIT','COMPLETED','2026-04-01 12:31:41','2026-04-01 12:31:41','','Payment purchase for payment id ddca578b-583d-4008-8497-39bd8e360304. Customer: Frisk Dreemurr',0.0000,0.0000),
('1acb2940-5dbe-4675-ad57-e606dfc0ad70','6b8ad375-e6ea-40fa-be3f-c74c2fbe9658','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','90b7bd2a-6723-4265-b782-242720019812',NULL,'CREDIT','COMPLETED','2026-04-11 12:48:28','2026-04-11 12:48:28','','Payment purchase for payment id 90b7bd2a-6723-4265-b782-242720019812. Customer: Frisk Dreemurr',0.0000,0.0000),
('8934d435-e482-4666-8765-e61884f68f36','60eeebcf-c46c-458b-b45e-3a7a2abcc2e9','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','c26de1c7-9b65-4305-b0e8-ccc8d8fbb219',NULL,'CREDIT','COMPLETED','2026-04-18 12:22:47','2026-04-18 12:22:47','','Payment purchase for payment id c26de1c7-9b65-4305-b0e8-ccc8d8fbb219. Customer: Frisk Dreemurr',0.0000,0.0000),
('f27e5835-dfe9-40f8-943f-ea390291412c','f3275dc6-188a-4879-9240-eba4ea0ba438','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','55242586-5b62-4fbc-957d-42739f898b2f',NULL,'CREDIT','COMPLETED','2026-04-14 12:49:38','2026-04-14 12:49:38','','Payment purchase for payment id 55242586-5b62-4fbc-957d-42739f898b2f. Customer: Frisk Dreemurr',0.0000,0.0000),
('0688470a-3509-422a-9c42-ebe690378cb8','57d30692-60bc-49f9-9147-e41d8c29d59f','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','30e09c8d-d8b2-405b-ac5c-b5c498d4bddc',NULL,'CREDIT','COMPLETED','2026-04-14 12:48:16','2026-04-14 12:48:16','','Payment purchase for payment id 30e09c8d-d8b2-405b-ac5c-b5c498d4bddc. Customer: Frisk Dreemurr',0.0000,0.0000),
('8bd79276-3cf5-47c4-b72e-ef8d51dc0989','744f7ffe-e6ae-4ece-ac7f-7063017a0091','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c5cef75d-bb65-46b3-9375-3a5cc39920b6',NULL,'DEBIT','COMPLETED','2026-04-27 15:07:26','2026-04-27 15:07:26','','Payment purchase for payment id c5cef75d-bb65-46b3-9375-3a5cc39920b6. Sellers: Omodog, Tetakent (H.C.G), Esenler Motionstar Incorporated, Doofenshmirtz Evil Inc',1726.0000,261.7576),
('98bf6f70-45d1-4982-953f-f07570315f40','450ae594-635c-4f2a-9449-4252e0c56a67','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','01950684-f005-499c-8e8c-c07d62d3b85d',NULL,'DEBIT','COMPLETED','2026-04-30 22:54:54','2026-04-30 22:54:54','','Payment purchase for payment id 01950684-f005-499c-8e8c-c07d62d3b85d. Sellers: Omodog',560.0000,93.3333),
('a9a0f732-e535-40b2-bd9a-f22304908329','b9969eae-4619-495a-b891-6c07ee08dfb0','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','725ee06e-78fc-48aa-ba01-ac936fc7190d',NULL,'CREDIT','COMPLETED','2026-04-13 12:06:29','2026-04-13 12:06:29','','Payment purchase for payment id 725ee06e-78fc-48aa-ba01-ac936fc7190d. Customer: Frisk Dreemurr',0.0000,0.0000),
('2f136be2-2805-481b-bd03-f404148c66f9','ab5da9f1-a2e6-4c97-b539-987762d65493','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','21a1914c-2f02-468a-9969-c82851f5cde7',NULL,'CREDIT','COMPLETED','2026-03-31 11:41:43','2026-03-31 11:41:43','','Payment purchase for payment id 21a1914c-2f02-468a-9969-c82851f5cde7. Customer: Frisk Dreemurr',0.0000,0.0000),
('777a98d5-ea9d-4cd0-9ba9-f59c2bc588cc','d025e637-0b54-4748-93a3-18b00fc50674','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','d4668779-7454-4f6a-b81c-ba9aa510e070',NULL,'CREDIT','COMPLETED','2026-03-31 12:08:07','2026-03-31 12:08:07','','Payment purchase for payment id d4668779-7454-4f6a-b81c-ba9aa510e070. Customer: Frisk Dreemurr',0.0000,0.0000),
('a3761199-9bc4-4fef-9178-f6d248418c1b','eb9f9199-f049-4d26-902d-b033ee52d8c5','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','a815c450-c725-4563-8ab1-8446c0397ef5',NULL,'CREDIT','COMPLETED','2026-04-27 15:10:27','2026-04-27 15:10:27','','Payment purchase for payment id a815c450-c725-4563-8ab1-8446c0397ef5. Customer: Frisk Dreemurr',6756.0000,1126.0000),
('966f7bad-f06f-4778-b015-f85cc388f1bc','57d30692-60bc-49f9-9147-e41d8c29d59f','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','30e09c8d-d8b2-405b-ac5c-b5c498d4bddc',NULL,'CREDIT','COMPLETED','2026-04-14 12:48:16','2026-04-14 12:48:16','','Payment purchase for payment id 30e09c8d-d8b2-405b-ac5c-b5c498d4bddc. Customer: Frisk Dreemurr',0.0000,0.0000),
('df5afce1-8b89-451b-908f-f85f98c2dedf','61627381-5591-4b77-b03f-dadd02637923','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','c2f20787-32ee-4e8a-9385-4938bc36dff6',NULL,'CREDIT','COMPLETED','2026-04-14 12:53:12','2026-04-14 12:53:12','','Payment purchase for payment id c2f20787-32ee-4e8a-9385-4938bc36dff6. Customer: Frisk Dreemurr',0.0000,0.0000),
('ffd52e53-a162-453a-9ef8-fdf648f121bb','92f41d0a-e91e-4fd5-8329-08ba2ba86ce8','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','a515959c-24ee-470b-86cd-698646ee3ae9',NULL,'CREDIT','COMPLETED','2026-04-11 12:05:42','2026-04-11 12:05:42','','Payment purchase for payment id a515959c-24ee-470b-86cd-698646ee3ae9. Customer: Frisk Dreemurr',0.0000,0.0000),
('642dbfef-df61-4bf9-9aaa-fe729a2b3ae2','91d36acb-42c5-4812-b832-ee9c67b3f050','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1b2f201a-15d0-47eb-8084-d9019c1e4970',NULL,'DEBIT','COMPLETED','2026-04-29 13:59:15','2026-04-29 13:59:15','','Payment refund for payment id 1b2f201a-15d0-47eb-8084-d9019c1e4970. Customer: Frisk Dreemurr',357.0000,33.5909),
('ba8110e8-5bb3-4020-821f-feab95c67f7b','eb9f9199-f049-4d26-902d-b033ee52d8c5','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','a815c450-c725-4563-8ab1-8446c0397ef5',NULL,'DEBIT','COMPLETED','2026-04-27 15:10:27','2026-04-27 15:10:27','','Payment purchase for payment id a815c450-c725-4563-8ab1-8446c0397ef5. Sellers: Omodog, Tetakent (H.C.G)',6783.0000,1130.5000),
('84744b98-7624-48cd-86e8-ffc1fd1a2320','9b2a433d-d6dc-497c-9780-59fed73f3091','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','af94372d-4a92-4409-a49b-4d3f079129a8',NULL,'DEBIT','COMPLETED','2026-03-29 21:03:00','2026-03-29 21:03:00','','Payment purchase for payment id af94372d-4a92-4409-a49b-4d3f079129a8. Sellers: Omodog',0.0000,0.0000);
/*!40000 ALTER TABLE `account_payment_transaction` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `address` (
  `id` uuid NOT NULL,
  `name` varchar(255) NOT NULL,
  `buildingNumber` varchar(255) DEFAULT NULL,
  `buildingName` varchar(255) DEFAULT NULL,
  `room` varchar(255) DEFAULT NULL,
  `floor` varchar(255) DEFAULT NULL,
  `blockName` varchar(255) DEFAULT NULL,
  `streetName` varchar(255) NOT NULL,
  `additionalStreetName` varchar(255) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `citySubdivisionName` varchar(255) NOT NULL,
  `cityName` varchar(255) NOT NULL,
  `postalZone` varchar(255) NOT NULL,
  `region` varchar(255) DEFAULT NULL,
  `postbox` varchar(255) DEFAULT NULL,
  `country` varchar(255) NOT NULL,
  `countrySubentity` varchar(255) DEFAULT NULL,
  `countrySubentityCode` varchar(255) DEFAULT NULL,
  `addressFormatCode` varchar(255) DEFAULT NULL,
  `addressTypeCode` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `markAttention` varchar(255) DEFAULT NULL,
  `markCare` varchar(255) DEFAULT NULL,
  `plotIdentification` varchar(255) DEFAULT NULL,
  `cityCode` varchar(255) DEFAULT NULL,
  `inhaleName` varchar(255) DEFAULT NULL,
  `timezone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
/*!40000 ALTER TABLE `address` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `address` VALUES
('76aca33c-20dc-4159-adad-849719fdd056','Yeni adres','42',NULL,'5','3',NULL,'Deneme Sokak',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('287c8d95-9fe2-4a22-a79b-97500dbbc8f6','EBOTT DAĞI','42','','5','3','','EBOTT DAĞI','','','BAHÇELİEVLER','İSTANBUL','34180','','','TURKIYE','','','','','','','','','','',''),
('91587983-a95f-4934-895f-a3f9f5fdaed1','Faraway','42','','5','3','','Deneme Sokak','','','BAHÇELİEVLER','İSTANBUL','34180','','','TURKIYE','','','','','','','','','','',''),
('21011b61-eb6e-4039-bc9a-baa274f95fc1','Bahçelievler / İstanbul','42',NULL,'5','3',NULL,'Akarsu yokuş sokak 3/4 😽',NULL,NULL,'BEYOĞLU','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `address` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `admin_settings`
--

DROP TABLE IF EXISTS `admin_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_settings` (
  `id` uuid NOT NULL,
  `sellerPaysPaymentServiceFee` tinyint(4) NOT NULL DEFAULT 0,
  `comissionsCalculatedFromNet` tinyint(4) NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `comissionItemTaxId` uuid DEFAULT NULL,
  `billingAccountId` uuid DEFAULT NULL,
  `billingDays` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_d1ef54d8e91e90c62628d3f0395` (`comissionItemTaxId`),
  KEY `FK_1e3033e4d8a159183d504a4c297` (`billingAccountId`),
  CONSTRAINT `FK_1e3033e4d8a159183d504a4c297` FOREIGN KEY (`billingAccountId`) REFERENCES `account` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_d1ef54d8e91e90c62628d3f0395` FOREIGN KEY (`comissionItemTaxId`) REFERENCES `item_tax_entity` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_settings`
--

LOCK TABLES `admin_settings` WRITE;
/*!40000 ALTER TABLE `admin_settings` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `admin_settings` VALUES
('d894351b-f29b-4e32-8ecd-77acb27dec8d',1,1,'2026-04-09 16:09:31','2026-04-09 16:09:31','927c6994-7d2d-43ab-80cd-17cc74de5196','5e72f829-e4ed-4ccd-8971-509708f42212','[2,9,15,23]');
/*!40000 ALTER TABLE `admin_settings` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `app_comission`
--

DROP TABLE IF EXISTS `app_comission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_comission` (
  `id` uuid NOT NULL,
  `percent` float NOT NULL,
  `itemClass` varchar(255) DEFAULT NULL,
  `bias` bigint(20) NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `sellerAccountId` uuid DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_6d18c0778efc1749258e8ad3bb` (`sellerAccountId`,`itemClass`),
  CONSTRAINT `FK_942bae509746cee90374daaebd5` FOREIGN KEY (`sellerAccountId`) REFERENCES `account` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_comission`
--

LOCK TABLES `app_comission` WRITE;
/*!40000 ALTER TABLE `app_comission` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `app_comission` VALUES
('419e7df7-0e83-499a-b4fb-94da46a02942',0,'',3,'2026-04-05 13:55:44','2026-04-05 13:55:44','5e72f829-e4ed-4ccd-8971-509708f42212'),
('2be23507-5a46-4ed9-bb8f-e76d196c97fa',5,'',1,'2026-04-05 13:53:45','2026-04-05 13:53:45',NULL);
/*!40000 ALTER TABLE `app_comission` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `dummy_ecommerce_operation`
--

DROP TABLE IF EXISTS `dummy_ecommerce_operation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dummy_ecommerce_operation` (
  `operationId` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`operationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dummy_ecommerce_operation`
--

LOCK TABLES `dummy_ecommerce_operation` WRITE;
/*!40000 ALTER TABLE `dummy_ecommerce_operation` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `dummy_ecommerce_operation` VALUES
('01950684-f005-499c-8e8c-c07d62d3b85d','COMPLETED','2026-04-30 19:54:53','2026-04-30 19:54:53'),
('31eaa473-24b9-415d-b78c-78d46c67e5cd','COMPLETED','2026-04-30 20:00:11','2026-04-30 20:00:11'),
('5c94c159-611c-4a6d-8498-b0daaea9b234','COMPLETED','2026-04-30 19:16:40','2026-04-30 19:16:40'),
('97ce01db-fe13-428e-8b3f-ad9e49c2953b','COMPLETED','2026-04-30 20:19:30','2026-04-30 20:19:30'),
('bd8e8e57-269a-4d27-b1ad-698289104c89','COMPLETED','2026-04-29 11:36:05','2026-04-29 11:36:05'),
('be446f77-c6cf-4394-8f84-f852b0ac1e8d','COMPLETED','2026-05-01 18:19:10','2026-05-01 18:19:10'),
('c067f04c-a728-41bc-bb22-c940f487b445','COMPLETED','2026-04-30 20:23:33','2026-04-30 20:23:33'),
('d52dbec7-70cc-4033-8efc-9cda518bc009','COMPLETED','2026-04-29 11:38:18','2026-04-29 11:38:18'),
('e8a977da-ec64-454e-bcc6-aa14aab609b5','COMPLETED','2026-04-30 19:57:40','2026-04-30 19:57:40');
/*!40000 ALTER TABLE `dummy_ecommerce_operation` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `id` uuid NOT NULL,
  `paymentId` uuid DEFAULT NULL,
  `sellerPaymentOrderId` uuid DEFAULT NULL,
  `invoiceNumber` varchar(100) DEFAULT NULL,
  `invoiceDate` date DEFAULT NULL,
  `uploadedByUserId` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `finalized` tinyint(4) NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `customerInvoiceAddressId` uuid DEFAULT NULL,
  `customerAccountId` uuid DEFAULT NULL,
  `sellerInvoiceAccountId` uuid DEFAULT NULL,
  `sellerInvoiceAddressId` uuid DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_bb1192d730c0fa301d85018341` (`customerInvoiceAddressId`),
  UNIQUE KEY `REL_9c3999d01f068a9476b225bba6` (`customerAccountId`),
  UNIQUE KEY `REL_49fd7d5e5ecdc03a802ffe7f66` (`sellerInvoiceAccountId`),
  UNIQUE KEY `REL_2e8ca57c01ef57486ce9bbd3ca` (`sellerInvoiceAddressId`),
  KEY `FK_03ccf846238db85401525e07cd2` (`paymentId`),
  KEY `FK_62fd7f644f383a2bb80fec7e4a5` (`sellerPaymentOrderId`),
  CONSTRAINT `FK_03ccf846238db85401525e07cd2` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_2e8ca57c01ef57486ce9bbd3cab` FOREIGN KEY (`sellerInvoiceAddressId`) REFERENCES `invoice_address` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_49fd7d5e5ecdc03a802ffe7f66c` FOREIGN KEY (`sellerInvoiceAccountId`) REFERENCES `invoice_account` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_62fd7f644f383a2bb80fec7e4a5` FOREIGN KEY (`sellerPaymentOrderId`) REFERENCES `seller_payment_order` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_9c3999d01f068a9476b225bba62` FOREIGN KEY (`customerAccountId`) REFERENCES `invoice_account` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_bb1192d730c0fa301d850183419` FOREIGN KEY (`customerInvoiceAddressId`) REFERENCES `invoice_address` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice`
--

LOCK TABLES `invoice` WRITE;
/*!40000 ALTER TABLE `invoice` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `invoice` VALUES
('88015a8e-8f28-47f1-ad8a-14525211b986','e8a977da-ec64-454e-bcc6-aa14aab609b5','8d9af870-b837-4e0b-96e2-c37af7d27dd2','','2026-04-30','','',1,'2026-04-30 20:01:39.684903','2026-04-30 20:01:53.000000','9028b295-3d88-44f5-8e33-1b05571490d8','3ba67b4b-874c-44f5-b4ad-eeaecc674998','00bd1347-4a6f-43f5-9b33-42e18d3111e8','f6ccccdf-b0e3-44ea-b5d0-c4b265577ead'),
('b1a04e13-f636-41ee-b794-d6ee46b301b3','31eaa473-24b9-415d-b78c-78d46c67e5cd','db4dd9ad-b555-4e26-97d0-65cfa6f88076','','2026-04-30','','',1,'2026-04-30 20:01:13.427832','2026-04-30 20:01:19.000000','330b2059-8644-4cef-87db-1729bef5e832','45183146-fab9-4b5a-a7d5-05440bf9879e','d816d890-0e4a-499b-843b-3ce8f96d856a','1c7e9a45-92fd-40c6-8a79-29a6b3d2fee3');
/*!40000 ALTER TABLE `invoice` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `invoice_account`
--

DROP TABLE IF EXISTS `invoice_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_account` (
  `id` uuid NOT NULL,
  `realAccountId` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `legalIdentity` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `bankName` varchar(255) DEFAULT NULL,
  `bankIban` varchar(255) DEFAULT NULL,
  `bankBic` varchar(255) DEFAULT NULL,
  `bankSwift` varchar(255) DEFAULT NULL,
  `taxOffice` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_account`
--

LOCK TABLES `invoice_account` WRITE;
/*!40000 ALTER TABLE `invoice_account` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `invoice_account` VALUES
('45183146-fab9-4b5a-a7d5-05440bf9879e','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','11111111111','INDIVIDUAL','TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('d816d890-0e4a-499b-843b-3ce8f96d856a','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1111111111','COMMERCIAL','Kısmet XNXX','TR760009901234567800100001','',NULL,NULL),
('00bd1347-4a6f-43f5-9b33-42e18d3111e8','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1111111111','COMMERCIAL','Kısmet XNXX','TR760009901234567800100001','',NULL,NULL),
('3ba67b4b-874c-44f5-b4ad-eeaecc674998','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','11111111111','INDIVIDUAL','TC Ziraat Bankası',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `invoice_account` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `invoice_address`
--

DROP TABLE IF EXISTS `invoice_address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_address` (
  `id` uuid NOT NULL,
  `name` varchar(255) NOT NULL,
  `buildingNumber` varchar(255) DEFAULT NULL,
  `buildingName` varchar(255) DEFAULT NULL,
  `room` varchar(255) DEFAULT NULL,
  `floor` varchar(255) DEFAULT NULL,
  `blockName` varchar(255) DEFAULT NULL,
  `streetName` varchar(255) NOT NULL,
  `additionalStreetName` varchar(255) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `citySubdivisionName` varchar(255) NOT NULL,
  `cityName` varchar(255) NOT NULL,
  `postalZone` varchar(255) NOT NULL,
  `region` varchar(255) DEFAULT NULL,
  `postbox` varchar(255) DEFAULT NULL,
  `country` varchar(255) NOT NULL,
  `countrySubentity` varchar(255) DEFAULT NULL,
  `countrySubentityCode` varchar(255) DEFAULT NULL,
  `addressFormatCode` varchar(255) DEFAULT NULL,
  `addressTypeCode` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `markAttention` varchar(255) DEFAULT NULL,
  `markCare` varchar(255) DEFAULT NULL,
  `plotIdentification` varchar(255) DEFAULT NULL,
  `cityCode` varchar(255) DEFAULT NULL,
  `inhaleName` varchar(255) DEFAULT NULL,
  `timezone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_address`
--

LOCK TABLES `invoice_address` WRITE;
/*!40000 ALTER TABLE `invoice_address` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `invoice_address` VALUES
('330b2059-8644-4cef-87db-1729bef5e832','EBOTT DAĞI','42','','5','3','','EBOTT DAĞI','','','BAHÇELİEVLER','İSTANBUL','34180','','','TURKIYE','','','','','','','','','','',''),
('9028b295-3d88-44f5-8e33-1b05571490d8','EBOTT DAĞI','42','','5','3','','EBOTT DAĞI','','','BAHÇELİEVLER','İSTANBUL','34180','','','TURKIYE','','','','','','','','','','',''),
('1c7e9a45-92fd-40c6-8a79-29a6b3d2fee3','Faraway','42','','5','3','','Deneme Sokak','','','BAHÇELİEVLER','İSTANBUL','34180','','','TURKIYE','','','','','','','','','','',''),
('f6ccccdf-b0e3-44ea-b5d0-c4b265577ead','Faraway','42','','5','3','','Deneme Sokak','','','BAHÇELİEVLER','İSTANBUL','34180','','','TURKIYE','','','','','','','','','','','');
/*!40000 ALTER TABLE `invoice_address` ENABLE KEYS */;
UNLOCK TABLES;
commit;

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
  `sellerAccountId` varchar(255) NOT NULL,
  `baseCurrency` varchar(255) NOT NULL,
  `itemTaxId` varchar(255) NOT NULL,
  `itemClass` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item`
--

LOCK TABLES `item` WRITE;
/*!40000 ALTER TABLE `item` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `item` VALUES
('9dd18852-2002-46a6-87cb-0de0d0ef4ccf','Something','','','','C62','c783e9dc-07aa-4fe4-95e9-be16246156bb','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196','automotive'),
('dbf8a42f-69f0-4181-8373-2a0b3ea01061','Tost','','','','KPO','c783e9dc-07aa-4fe4-95e9-be16246156bb','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196','electronics'),
('a7d0eb1b-0c3f-4b45-8b6e-44ed9d7205a9','Hayat Reçeli','','','','TON','c783e9dc-07aa-4fe4-95e9-be16246156bb','TRY','18202eba-0abb-4a63-8112-d3ef034173d2','books_media'),
('739263f4-a5e9-4f70-a368-8ea4891fec10','Kyle Broflovski Peluş','','','','GFI','5e72f829-e4ed-4ccd-8971-509708f42212','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196','electronics'),
('3954ca25-330d-4e83-aef9-96f0da591b53','Drillinator','','','','C62','cbf3e25f-5586-4e5c-b0d8-7463a83da274','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196',''),
('e2e402c4-ef53-40df-8591-98adfd4a1afc','Esenler Note Calculation','','','','C62','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196','');
/*!40000 ALTER TABLE `item` ENABLE KEYS */;
UNLOCK TABLES;
commit;

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
  `region` varchar(255) NOT NULL DEFAULT 'any',
  `currency` varchar(255) NOT NULL,
  `activityOrder` bigint(20) NOT NULL DEFAULT 0,
  `activeStartAt` datetime DEFAULT NULL,
  `activeExpireAt` datetime DEFAULT NULL,
  `automaticExchangeFromCurrency` varchar(255) DEFAULT NULL,
  `itemPrice` decimal(19,4) NOT NULL DEFAULT 0.0000,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_price`
--

LOCK TABLES `item_price` WRITE;
/*!40000 ALTER TABLE `item_price` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `item_price` VALUES
('571cf63a-6189-41ed-819b-1adacc9b178d','dbf8a42f-69f0-4181-8373-2a0b3ea01061','kel','any','TRY',0,NULL,NULL,NULL,12.0000),
('3933ee4f-61c6-4636-a41e-22731066c9f7','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','basils','any','TRY',0,NULL,NULL,NULL,13.0000),
('71c01ee3-d730-4f41-8db7-25147142adcd','3954ca25-330d-4e83-aef9-96f0da591b53','default','any','TRY',0,NULL,NULL,NULL,14.0000),
('fc8fe02a-80a1-485f-9c75-2871422a8780','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','Humankite','any','TRY',0,NULL,NULL,NULL,16.0000),
('fc8fe02a-80a1-485f-9c75-2871422a8781','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','Humankite','any','TRY',1,'2025-07-05 12:18:00','2025-07-05 16:27:00',NULL,15.0000),
('d4d41b0c-4262-4031-91e9-342a0dd20cf0','dbf8a42f-69f0-4181-8373-2a0b3ea01061','hero','any','TRY',0,NULL,NULL,NULL,121.0000),
('a8b8e8b2-0b0c-4470-b255-3450aec10a76','e2e402c4-ef53-40df-8591-98adfd4a1afc','1years','any','TRY',0,NULL,NULL,NULL,22.0000),
('f9628c98-20a1-4b1a-a771-36e77a827630','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','2 Years','any','TRY',0,NULL,NULL,NULL,22.0000),
('b0e0d341-d1d2-48d6-9b3b-3f0388d7245b','e2e402c4-ef53-40df-8591-98adfd4a1afc','2years-dagestan','any','TRY',0,NULL,NULL,NULL,33.0000),
('376c042f-65e0-427f-bac3-89d456a0e1d9','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','default','any','TRY',0,NULL,NULL,NULL,12.0000),
('176b2b7c-721d-4ca1-95eb-8df2d880dbe7','739263f4-a5e9-4f70-a368-8ea4891fec10','default','any','TRY',0,NULL,NULL,NULL,232.0000),
('41d6cd8e-ce6a-4a2b-9093-8f256fa00b09','739263f4-a5e9-4f70-a368-8ea4891fec10','humankite','any','TRY',0,NULL,NULL,NULL,1212.0000),
('3131314b-7007-44c2-b25c-92b193b9e27a','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','default','any','TRY',3,NULL,NULL,NULL,232.0000),
('3c31fc4b-7007-44c2-b25c-92b193b9e27a','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','default','any','TRY',0,NULL,NULL,NULL,1212.0000),
('c8345fd4-436a-4190-95ba-9c71734767ee','a7d0eb1b-0c3f-4b45-8b6e-44ed9d7205a9','default','any','TRY',0,NULL,NULL,NULL,342.0000),
('af17e972-0b8c-4573-88f9-b295919da74a','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','any','TRY',0,NULL,NULL,NULL,15.0000),
('ffcb6316-ea49-42b1-8276-c5fe0aa6c468','739263f4-a5e9-4f70-a368-8ea4891fec10','jew-elf-king','any','TRY',0,NULL,NULL,NULL,1212.0000),
('c7b82dfe-684a-47b9-bef6-cc0cfa302cb0','dbf8a42f-69f0-4181-8373-2a0b3ea01061','mari','any','TRY',0,NULL,NULL,NULL,231.0000),
('8f9b0333-412c-47d3-80b4-d5c9acc677e7','dbf8a42f-69f0-4181-8373-2a0b3ea01061','aubrey','any','TRY',0,NULL,NULL,NULL,112.0000),
('180513eb-6fa8-4bb7-94e0-db996e68c465','dbf8a42f-69f0-4181-8373-2a0b3ea01061','basil','any','TRY',0,NULL,NULL,NULL,12.0000);
/*!40000 ALTER TABLE `item_price` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `item_tax_entity`
--

DROP TABLE IF EXISTS `item_tax_entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_tax_entity` (
  `id` uuid NOT NULL,
  `taxName` varchar(255) NOT NULL,
  `isPublic` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_tax_entity`
--

LOCK TABLES `item_tax_entity` WRITE;
/*!40000 ALTER TABLE `item_tax_entity` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `item_tax_entity` VALUES
('927c6994-7d2d-43ab-80cd-17cc74de5196','Yüzde 20',1),
('18202eba-0abb-4a63-8112-d3ef034173d2','Testo',0);
/*!40000 ALTER TABLE `item_tax_entity` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `item_tax_variation`
--

DROP TABLE IF EXISTS `item_tax_variation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_tax_variation` (
  `id` uuid NOT NULL,
  `taxMode` varchar(255) NOT NULL,
  `taxRate` int(11) NOT NULL,
  `itemTaxId` uuid DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_6aa912e3cd2cdc3772b1e66cf31` (`itemTaxId`),
  CONSTRAINT `FK_6aa912e3cd2cdc3772b1e66cf31` FOREIGN KEY (`itemTaxId`) REFERENCES `item_tax_entity` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_tax_variation`
--

LOCK TABLES `item_tax_variation` WRITE;
/*!40000 ALTER TABLE `item_tax_variation` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `item_tax_variation` VALUES
('462cedc2-4a01-4768-9c37-0d8ce11e589c','DEFAULT',18,NULL),
('67b13d80-453d-4387-90c0-22e2b8659b55','DEFAULT',20,'927c6994-7d2d-43ab-80cd-17cc74de5196'),
('46939475-7f59-44af-a9ad-398d4b8dbbab','DEFAULT',10,NULL),
('e69a2143-f051-4a66-b9b5-757909ac88fd','DEFAULT',10,'18202eba-0abb-4a63-8112-d3ef034173d2'),
('695221ba-5366-42e3-85aa-ab04b1698c20','DEFAULT',10,NULL);
/*!40000 ALTER TABLE `item_tax_variation` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `id` uuid NOT NULL,
  `type` varchar(255) NOT NULL,
  `currency` varchar(255) NOT NULL,
  `billingCode` varchar(200) DEFAULT NULL,
  `paymentStatus` varchar(255) NOT NULL,
  `errorStatus` varchar(255) DEFAULT NULL,
  `paymentChannelId` varchar(255) DEFAULT NULL,
  `paymentChannelOperationId` varchar(255) DEFAULT NULL,
  `paymentChannelOperationUrl` varchar(255) DEFAULT NULL,
  `channelUrlExpiryDate` datetime DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `refundRequestId` varchar(255) DEFAULT NULL,
  `totalAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `taxAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `includeInReportDigestion` tinyint(4) NOT NULL DEFAULT 1,
  `customerAccountId` uuid DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f8b7c24ce00e8cf0f643445559` (`billingCode`),
  KEY `FK_a368741b0fc447722cd572f10ab` (`customerAccountId`),
  CONSTRAINT `FK_a368741b0fc447722cd572f10ab` FOREIGN KEY (`customerAccountId`) REFERENCES `account` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `payment` VALUES
('31eaa473-24b9-415d-b78c-78d46c67e5cd','PURCHASE','TRY',NULL,'COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-04-30 20:00:09','2026-04-30 20:00:12',NULL,2401.0000,400.1667,1,NULL),
('e8a977da-ec64-454e-bcc6-aa14aab609b5','PURCHASE','TRY',NULL,'COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-04-30 19:57:20','2026-04-30 19:57:40',NULL,2847.0000,448.5909,1,NULL),
('97ce01db-fe13-428e-8b3f-ad9e49c2953b','PURCHASE','TRY',NULL,'COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-04-30 20:19:28','2026-04-30 20:19:31',NULL,6844.0000,1140.6667,1,NULL),
('5c94c159-611c-4a6d-8498-b0daaea9b234','PURCHASE','TRY',NULL,'COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-04-30 19:16:28','2026-04-30 19:16:40',NULL,1976.0000,277.5152,1,NULL),
('01950684-f005-499c-8e8c-c07d62d3b85d','PURCHASE','TRY',NULL,'COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-04-30 19:54:51','2026-04-30 19:54:54',NULL,560.0000,93.3333,1,NULL),
('c067f04c-a728-41bc-bb22-c940f487b445','PURCHASE','TRY',NULL,'COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-04-30 20:23:30','2026-04-30 20:23:33',NULL,1372.0000,228.6667,1,NULL),
('be446f77-c6cf-4394-8f84-f852b0ac1e8d','PURCHASE','TRY',NULL,'COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-05-01 18:19:07','2026-05-01 18:19:11',NULL,290.0000,48.3333,1,'bb251590-67d6-4165-8321-7a04fa357242');
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `payment_channel_operation`
--

DROP TABLE IF EXISTS `payment_channel_operation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_channel_operation` (
  `id` uuid NOT NULL,
  `paymentChannelId` varchar(255) NOT NULL,
  `operationId` varchar(255) DEFAULT NULL,
  `redirectUrl` varchar(255) DEFAULT NULL,
  `currency` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `paymentId` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `providerFeeDebitFrom` varchar(255) NOT NULL DEFAULT 'PLATFORM',
  `feeCutInstantly` tinyint(4) NOT NULL DEFAULT 0,
  `amount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `providerFee` decimal(19,4) NOT NULL DEFAULT 0.0000,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_channel_operation`
--

LOCK TABLES `payment_channel_operation` WRITE;
/*!40000 ALTER TABLE `payment_channel_operation` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `payment_channel_operation` VALUES
('41126fc4-88b2-464e-8ca3-127125a9f70b','dummy-ecommerce','5c94c159-611c-4a6d-8498-b0daaea9b234','','TRY','COMPLETED','5c94c159-611c-4a6d-8498-b0daaea9b234','2026-04-30 22:16:39','2026-04-30 19:16:40','SELLER',1,1976.0000,197.7000),
('62e4223e-eeb3-4322-825c-1a4c8bfc05b7','dummy-ecommerce','01950684-f005-499c-8e8c-c07d62d3b85d','','TRY','COMPLETED','01950684-f005-499c-8e8c-c07d62d3b85d','2026-04-30 22:54:52','2026-04-30 19:54:53','SELLER',1,560.0000,56.1000),
('be999829-cf2b-4160-8bc5-2f5c18c263c5','dummy-ecommerce','97ce01db-fe13-428e-8b3f-ad9e49c2953b','','TRY','COMPLETED','97ce01db-fe13-428e-8b3f-ad9e49c2953b','2026-04-30 23:19:29','2026-04-30 20:19:30','SELLER',1,6844.0000,684.5000),
('42ff4dbe-04ae-45a7-9469-5d23df732304','dummy-ecommerce','be446f77-c6cf-4394-8f84-f852b0ac1e8d','','TRY','COMPLETED','be446f77-c6cf-4394-8f84-f852b0ac1e8d','2026-05-01 21:19:09','2026-05-01 18:19:10','SELLER',1,290.0000,29.1000),
('ac4324ae-260f-4973-af2d-7d8ba22bc8d5','dummy-ecommerce','31eaa473-24b9-415d-b78c-78d46c67e5cd','','TRY','COMPLETED','31eaa473-24b9-415d-b78c-78d46c67e5cd','2026-04-30 23:00:10','2026-04-30 20:00:11','SELLER',1,2401.0000,240.2000),
('3cfad984-3eef-4f5a-a403-c243c75f5888','dummy-ecommerce','e8a977da-ec64-454e-bcc6-aa14aab609b5','','TRY','COMPLETED','e8a977da-ec64-454e-bcc6-aa14aab609b5','2026-04-30 22:57:22','2026-04-30 19:57:40','SELLER',1,2847.0000,284.8000),
('b02c803a-b926-47a4-ab18-f4b3cea52aed','dummy-ecommerce','c067f04c-a728-41bc-bb22-c940f487b445','','TRY','COMPLETED','c067f04c-a728-41bc-bb22-c940f487b445','2026-04-30 23:23:31','2026-04-30 20:23:33','SELLER',1,1372.0000,137.3000);
/*!40000 ALTER TABLE `payment_channel_operation` ENABLE KEYS */;
UNLOCK TABLES;
commit;

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
set autocommit=0;
/*!40000 ALTER TABLE `payment_progress` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `payment_transaction`
--

DROP TABLE IF EXISTS `payment_transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_transaction` (
  `id` uuid NOT NULL,
  `amount` float NOT NULL,
  `taxAmount` float NOT NULL,
  `untaxedAmount` float NOT NULL,
  `currency` varchar(255) NOT NULL,
  `paymentId` varchar(255) NOT NULL,
  `targetAccountId` uuid NOT NULL,
  `sourceAccountId` uuid NOT NULL,
  `paymentStatus` varchar(255) NOT NULL,
  `errorStatus` varchar(255) DEFAULT NULL,
  `transactionType` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `lastOperationDate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `operationNote` mediumtext DEFAULT '',
  `description` mediumtext DEFAULT '',
  `invoiceCount` int(11) NOT NULL DEFAULT 0,
  `hasFinalizedInvoice` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FK_4a395270f7edcc6978b89d0021a` (`targetAccountId`),
  KEY `FK_aaf9d1788150334b2012a986e16` (`sourceAccountId`),
  CONSTRAINT `FK_4a395270f7edcc6978b89d0021a` FOREIGN KEY (`targetAccountId`) REFERENCES `account` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_aaf9d1788150334b2012a986e16` FOREIGN KEY (`sourceAccountId`) REFERENCES `account` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_transaction`
--

LOCK TABLES `payment_transaction` WRITE;
/*!40000 ALTER TABLE `payment_transaction` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `payment_transaction` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `postral_payment_event`
--

DROP TABLE IF EXISTS `postral_payment_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `postral_payment_event` (
  `id` uuid NOT NULL,
  `eventType` varchar(100) NOT NULL,
  `aggregateType` varchar(100) NOT NULL,
  `aggregateId` varchar(255) NOT NULL,
  `sellerAccountId` varchar(255) DEFAULT NULL,
  `accountId` varchar(255) DEFAULT NULL,
  `payload` longtext NOT NULL,
  `occurredAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postral_payment_event`
--

LOCK TABLES `postral_payment_event` WRITE;
/*!40000 ALTER TABLE `postral_payment_event` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `postral_payment_event` ENABLE KEYS */;
UNLOCK TABLES;
commit;

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
  `name` varchar(255) NOT NULL,
  `paymentId` uuid DEFAULT NULL,
  `itemId` varchar(255) NOT NULL,
  `variation` varchar(255) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `refunded` tinyint(4) NOT NULL DEFAULT 0,
  `refundPaymentId` uuid DEFAULT NULL,
  `refundDate` timestamp NULL DEFAULT NULL,
  `itemClass` varchar(255) NOT NULL,
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `quantity` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `totalAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `originalUnitAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `unitAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `taxPercent` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `taxAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `unTaxAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `refundCount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `appComissionAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `appComissionPercent` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `paymentServiceFeeAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `paymentServiceFeePercent` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `sellerAccountId` uuid DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_2fa2000f290cdf7e61389d40a09` (`paymentId`),
  KEY `FK_8cf52215637c9a41aefa3f50202` (`refundPaymentId`),
  KEY `FK_16bd42c96f7163e276bdf356813` (`sellerAccountId`),
  CONSTRAINT `FK_16bd42c96f7163e276bdf356813` FOREIGN KEY (`sellerAccountId`) REFERENCES `account` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_2fa2000f290cdf7e61389d40a09` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_8cf52215637c9a41aefa3f50202` FOREIGN KEY (`refundPaymentId`) REFERENCES `payment` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postral_payment_item`
--

LOCK TABLES `postral_payment_item` WRITE;
/*!40000 ALTER TABLE `postral_payment_item` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `postral_payment_item` VALUES
('50457ba0-de9b-4487-bcfd-183ce36642b1','','','','Kyle Broflovski Peluş','97ce01db-fe13-428e-8b3f-ad9e49c2953b','739263f4-a5e9-4f70-a368-8ea4891fec10','humankite','GFI',0,NULL,NULL,'electronics','2026-04-30 20:19:28','2026-04-30 20:19:28',5.0000,6060.0000,1212.0000,1212.0000,20.0000,1010.0000,5050.0000,0.0000,0.0000,0.0000,0.0000,0.0000,NULL),
('4c20ef30-5801-4bc7-803c-2db189923278','','','','Tost','01950684-f005-499c-8e8c-c07d62d3b85d','dbf8a42f-69f0-4181-8373-2a0b3ea01061','aubrey','KPO',0,NULL,NULL,'electronics','2026-04-30 19:54:51','2026-04-30 19:54:51',5.0000,560.0000,112.0000,112.0000,20.0000,93.3333,466.6667,0.0000,23.3333,5.0000,0.0000,0.0000,NULL),
('8ba8db03-5869-46eb-ad4e-4564f1392dab','','','','Drillinator','e8a977da-ec64-454e-bcc6-aa14aab609b5','3954ca25-330d-4e83-aef9-96f0da591b53','default','C62',0,NULL,NULL,'','2026-04-30 19:57:20','2026-04-30 19:57:20',1.0000,14.0000,14.0000,14.0000,20.0000,2.3333,11.6667,0.0000,0.5833,5.0000,0.0000,0.0000,NULL),
('506b9463-6b1d-4430-9eab-461249a4e181','','','','Kyle Broflovski Peluş','e8a977da-ec64-454e-bcc6-aa14aab609b5','739263f4-a5e9-4f70-a368-8ea4891fec10','humankite','GFI',0,NULL,NULL,'electronics','2026-04-30 19:57:20','2026-04-30 19:57:20',1.0000,1212.0000,1212.0000,1212.0000,20.0000,202.0000,1010.0000,0.0000,0.0000,0.0000,0.0000,0.0000,NULL),
('c7b942eb-c590-410e-8408-513b4323ae41','','','','Tost','e8a977da-ec64-454e-bcc6-aa14aab609b5','dbf8a42f-69f0-4181-8373-2a0b3ea01061','basil','KPO',0,NULL,NULL,'electronics','2026-04-30 19:57:20','2026-04-30 19:57:20',1.0000,12.0000,12.0000,12.0000,20.0000,2.0000,10.0000,0.0000,0.5000,5.0000,0.0000,0.0000,NULL),
('9dc59a30-98dc-4adb-972e-5420e1e6dedc','','','','Tost','c067f04c-a728-41bc-bb22-c940f487b445','dbf8a42f-69f0-4181-8373-2a0b3ea01061','mari','KPO',0,NULL,NULL,'electronics','2026-04-30 20:23:30','2026-04-30 20:23:30',4.0000,924.0000,231.0000,231.0000,20.0000,154.0000,770.0000,0.0000,38.5000,5.0000,0.0000,0.0000,NULL),
('5299557b-b250-4380-9497-56b551122ee8','','','','Tost','31eaa473-24b9-415d-b78c-78d46c67e5cd','dbf8a42f-69f0-4181-8373-2a0b3ea01061','aubrey','KPO',0,NULL,NULL,'electronics','2026-04-30 20:00:09','2026-04-30 20:00:09',2.0000,224.0000,112.0000,112.0000,20.0000,37.3333,186.6667,0.0000,9.3333,5.0000,0.0000,0.0000,NULL),
('c78abe89-87e5-4a87-92fc-5bfa2ad44dd6','','','','Kyle Broflovski Peluş','e8a977da-ec64-454e-bcc6-aa14aab609b5','739263f4-a5e9-4f70-a368-8ea4891fec10','jew-elf-king','GFI',0,NULL,NULL,'electronics','2026-04-30 19:57:20','2026-04-30 19:57:20',1.0000,1212.0000,1212.0000,1212.0000,20.0000,202.0000,1010.0000,0.0000,0.0000,0.0000,0.0000,0.0000,NULL),
('d9e1d8a9-8ad1-4a09-aecd-67dc5d4f3d18','','','','Esenler Note Calculation','e8a977da-ec64-454e-bcc6-aa14aab609b5','e2e402c4-ef53-40df-8591-98adfd4a1afc','1years','C62',0,NULL,NULL,'','2026-04-30 19:57:20','2026-04-30 19:57:20',1.0000,22.0000,22.0000,22.0000,20.0000,3.6667,18.3333,0.0000,0.9167,5.0000,0.0000,0.0000,NULL),
('080cde38-a278-481b-9c09-6c89c75edca3','','','','Esenler Note Calculation','5c94c159-611c-4a6d-8498-b0daaea9b234','e2e402c4-ef53-40df-8591-98adfd4a1afc','2years-dagestan','C62',0,NULL,NULL,'','2026-04-30 19:16:28','2026-04-30 19:16:28',2.0000,66.0000,33.0000,33.0000,20.0000,11.0000,55.0000,0.0000,2.7500,5.0000,0.0000,0.0000,NULL),
('78c51d77-d1f4-44db-bb99-751dc0e2b426','','','','Tost','be446f77-c6cf-4394-8f84-f852b0ac1e8d','dbf8a42f-69f0-4181-8373-2a0b3ea01061','basil','KPO',0,NULL,NULL,'electronics','2026-05-01 18:19:07','2026-05-01 18:19:07',1.0000,12.0000,12.0000,12.0000,20.0000,2.0000,10.0000,0.0000,0.5000,5.0000,0.0000,0.0000,'c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('6779c833-822d-4750-b604-7a7df58c31a7','','','','Kyle Broflovski Peluş','31eaa473-24b9-415d-b78c-78d46c67e5cd','739263f4-a5e9-4f70-a368-8ea4891fec10','humankite','GFI',0,NULL,NULL,'electronics','2026-04-30 20:00:09','2026-04-30 20:00:09',1.0000,1212.0000,1212.0000,1212.0000,20.0000,202.0000,1010.0000,0.0000,0.0000,0.0000,0.0000,0.0000,NULL),
('5abce07c-12cf-4597-8184-b31172fb40c7','','','','Something','31eaa473-24b9-415d-b78c-78d46c67e5cd','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','C62',0,NULL,NULL,'automotive','2026-04-30 20:00:09','2026-04-30 20:00:09',1.0000,15.0000,15.0000,15.0000,20.0000,2.5000,12.5000,0.0000,0.6250,5.0000,0.0000,0.0000,NULL),
('e8f27ac4-520e-443a-ae62-b374ddb9db7c','','','','Esenler Note Calculation','e8a977da-ec64-454e-bcc6-aa14aab609b5','e2e402c4-ef53-40df-8591-98adfd4a1afc','2years-dagestan','C62',0,NULL,NULL,'','2026-04-30 19:57:20','2026-04-30 19:57:20',1.0000,33.0000,33.0000,33.0000,20.0000,5.5000,27.5000,0.0000,1.3750,5.0000,0.0000,0.0000,NULL),
('40e03243-822b-419d-b902-b7b2582ad1cd','','','','Kyle Broflovski Peluş','31eaa473-24b9-415d-b78c-78d46c67e5cd','739263f4-a5e9-4f70-a368-8ea4891fec10','default','GFI',0,NULL,NULL,'electronics','2026-04-30 20:00:09','2026-04-30 20:00:09',4.0000,928.0000,232.0000,232.0000,20.0000,154.6667,773.3333,0.0000,0.0000,0.0000,0.0000,0.0000,NULL),
('f7a2be79-43f9-468e-83de-b979dc769fd4','','','','Esenler Note Calculation','31eaa473-24b9-415d-b78c-78d46c67e5cd','e2e402c4-ef53-40df-8591-98adfd4a1afc','1years','C62',0,NULL,NULL,'','2026-04-30 20:00:09','2026-04-30 20:00:09',1.0000,22.0000,22.0000,22.0000,20.0000,3.6667,18.3333,0.0000,0.9167,5.0000,0.0000,0.0000,NULL),
('d562ed10-f49e-4376-b7e3-bfcf2d069d57','','','','Something','be446f77-c6cf-4394-8f84-f852b0ac1e8d','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','C62',0,NULL,NULL,'automotive','2026-05-01 18:19:07','2026-05-01 18:19:07',1.0000,15.0000,15.0000,15.0000,20.0000,2.5000,12.5000,0.0000,0.6250,5.0000,0.0000,0.0000,'c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('99ca26fd-73a8-4168-bcdd-c056dea0e991','','','','Drillinator','5c94c159-611c-4a6d-8498-b0daaea9b234','3954ca25-330d-4e83-aef9-96f0da591b53','default','C62',0,NULL,NULL,'','2026-04-30 19:16:28','2026-04-30 19:16:28',1.0000,14.0000,14.0000,14.0000,20.0000,2.3333,11.6667,0.0000,0.5833,5.0000,0.0000,0.0000,NULL),
('75060114-6c6b-49fe-8f78-c6c28747de3b','','','','Something','be446f77-c6cf-4394-8f84-f852b0ac1e8d','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','basils','C62',0,NULL,NULL,'automotive','2026-05-01 18:19:07','2026-05-01 18:19:07',3.0000,39.0000,13.0000,13.0000,20.0000,6.5000,32.5000,0.0000,1.6250,5.0000,0.0000,0.0000,'c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('82504bba-19bc-4ae5-8652-d2cddeae50d6','','','','Tost','c067f04c-a728-41bc-bb22-c940f487b445','dbf8a42f-69f0-4181-8373-2a0b3ea01061','aubrey','KPO',0,NULL,NULL,'electronics','2026-04-30 20:23:30','2026-04-30 20:23:30',4.0000,448.0000,112.0000,112.0000,20.0000,74.6667,373.3333,0.0000,18.6667,5.0000,0.0000,0.0000,NULL),
('6964b6f5-2bcf-40ad-9e0b-d2efe8cff273','','','','Kyle Broflovski Peluş','5c94c159-611c-4a6d-8498-b0daaea9b234','739263f4-a5e9-4f70-a368-8ea4891fec10','humankite','GFI',0,NULL,NULL,'electronics','2026-04-30 19:16:28','2026-04-30 19:16:28',1.0000,1212.0000,1212.0000,1212.0000,20.0000,202.0000,1010.0000,0.0000,0.0000,0.0000,0.0000,0.0000,NULL),
('dfe41935-6f26-45fa-ba40-d8422787d5b0','','','','Esenler Note Calculation','97ce01db-fe13-428e-8b3f-ad9e49c2953b','e2e402c4-ef53-40df-8591-98adfd4a1afc','1years','C62',0,NULL,NULL,'','2026-04-30 20:19:28','2026-04-30 20:19:28',4.0000,88.0000,22.0000,22.0000,20.0000,14.6667,73.3333,0.0000,3.6667,5.0000,0.0000,0.0000,NULL),
('8b2fd6a9-62c2-4874-b3c9-e68f9e08295e','','','','Hayat Reçeli','5c94c159-611c-4a6d-8498-b0daaea9b234','a7d0eb1b-0c3f-4b45-8b6e-44ed9d7205a9','default','TON',0,NULL,NULL,'books_media','2026-04-30 19:16:28','2026-04-30 19:16:28',2.0000,684.0000,342.0000,342.0000,10.0000,62.1818,621.8182,0.0000,31.0909,5.0000,0.0000,0.0000,NULL),
('573c6b23-0445-4f81-9924-eb1435f9d999','','','','Tost','be446f77-c6cf-4394-8f84-f852b0ac1e8d','dbf8a42f-69f0-4181-8373-2a0b3ea01061','aubrey','KPO',0,NULL,NULL,'electronics','2026-05-01 18:19:07','2026-05-01 18:19:07',2.0000,224.0000,112.0000,112.0000,20.0000,37.3333,186.6667,0.0000,9.3333,5.0000,0.0000,0.0000,'c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('c35fd7d8-6d9f-43a9-86e1-f007899c93dd','','','','Kyle Broflovski Peluş','97ce01db-fe13-428e-8b3f-ad9e49c2953b','739263f4-a5e9-4f70-a368-8ea4891fec10','default','GFI',0,NULL,NULL,'electronics','2026-04-30 20:19:28','2026-04-30 20:19:28',3.0000,696.0000,232.0000,232.0000,20.0000,116.0000,580.0000,0.0000,0.0000,0.0000,0.0000,0.0000,NULL),
('ffdda6f1-e8ef-4cbd-846f-f4b8371e1b7b','','','','Hayat Reçeli','e8a977da-ec64-454e-bcc6-aa14aab609b5','a7d0eb1b-0c3f-4b45-8b6e-44ed9d7205a9','default','TON',0,NULL,NULL,'books_media','2026-04-30 19:57:20','2026-04-30 19:57:20',1.0000,342.0000,342.0000,342.0000,10.0000,31.0909,310.9091,0.0000,15.5455,5.0000,0.0000,0.0000,NULL);
/*!40000 ALTER TABLE `postral_payment_item` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `postral_payment_tax`
--

DROP TABLE IF EXISTS `postral_payment_tax`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `postral_payment_tax` (
  `id` uuid NOT NULL,
  `paymentId` uuid DEFAULT NULL,
  `taxAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `untaxAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `fullAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `percent` decimal(19,4) NOT NULL DEFAULT 0.0000,
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
set autocommit=0;
INSERT INTO `postral_payment_tax` VALUES
('54a5b2b8-eb55-4f5e-8aa8-053d081cdc05','e8a977da-ec64-454e-bcc6-aa14aab609b5',31.0909,310.9091,342.0000,10.0000),
('66090f1a-72dc-4f5a-ba68-23af919e5b0a','31eaa473-24b9-415d-b78c-78d46c67e5cd',400.1667,2000.8333,2401.0000,20.0000),
('20ccb75a-9d96-4685-90f0-3dc30e133af4','5c94c159-611c-4a6d-8498-b0daaea9b234',62.1818,621.8182,684.0000,10.0000),
('399621fd-c0e7-4059-9fde-47792854033d','be446f77-c6cf-4394-8f84-f852b0ac1e8d',48.3333,241.6667,290.0000,20.0000),
('bdcb664b-aba0-4804-a864-5993253da49e','c067f04c-a728-41bc-bb22-c940f487b445',228.6667,1143.3333,1372.0000,20.0000),
('84720b6e-8f40-44bd-a139-88e4d5ccf89b','01950684-f005-499c-8e8c-c07d62d3b85d',93.3333,466.6667,560.0000,20.0000),
('9caf1baf-592d-4497-ac10-e7f775064a6a','e8a977da-ec64-454e-bcc6-aa14aab609b5',417.5000,2087.5000,2505.0000,20.0000),
('32c5ae21-5f09-4f8e-ba70-ecc0dd86b484','5c94c159-611c-4a6d-8498-b0daaea9b234',215.3333,1076.6667,1292.0000,20.0000),
('58f9be14-ded7-492e-b994-f0c5c6499312','97ce01db-fe13-428e-8b3f-ad9e49c2953b',1140.6667,5703.3333,6844.0000,20.0000);
/*!40000 ALTER TABLE `postral_payment_tax` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `refund_request`
--

DROP TABLE IF EXISTS `refund_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `refund_request` (
  `id` uuid NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'PENDING',
  `requestedByAccountId` varchar(255) NOT NULL,
  `resolvedByAccountId` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `requestedByPaymentAccountId` varchar(255) DEFAULT NULL,
  `requestedToPaymentAccountId` varchar(255) DEFAULT NULL,
  `paymentId` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refund_request`
--

LOCK TABLES `refund_request` WRITE;
/*!40000 ALTER TABLE `refund_request` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `refund_request` VALUES
('72c735c3-3aec-4bf9-9cfd-a2baa2dae9d6','APPROVED','68fe859434da9a8bb89ce130','69b297584a58c54d129dbe60','2026-04-29 14:21:22','2026-04-29 11:22:32','bb251590-67d6-4165-8321-7a04fa357242','c783e9dc-07aa-4fe4-95e9-be16246156bb','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4'),
('9715ba6b-2d0c-4247-91a6-d747f7cc737c','APPROVED','68fe859434da9a8bb89ce130','69b297584a58c54d129dbe60','2026-04-29 13:58:35','2026-04-29 10:58:43','bb251590-67d6-4165-8321-7a04fa357242','c783e9dc-07aa-4fe4-95e9-be16246156bb','fadd1328-7198-408e-8405-9eda402b9dda');
/*!40000 ALTER TABLE `refund_request` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `refund_request_item`
--

DROP TABLE IF EXISTS `refund_request_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `refund_request_item` (
  `id` uuid NOT NULL,
  `paymentItemId` varchar(255) NOT NULL,
  `refundRequestId` uuid DEFAULT NULL,
  `itemName` varchar(255) DEFAULT NULL,
  `variation` varchar(255) NOT NULL,
  `realItemId` varchar(255) NOT NULL,
  `refundCount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `unitAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `unitAmountWithoutTax` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `refundAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `refundAmountWithoutTax` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `refundTaxAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `itemClass` varchar(255) NOT NULL,
  `appComissionAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `appComissionPercent` decimal(19,4) NOT NULL DEFAULT 0.0000,
  PRIMARY KEY (`id`),
  KEY `FK_4336e46fa30f189b6c9dcfcde43` (`refundRequestId`),
  CONSTRAINT `FK_4336e46fa30f189b6c9dcfcde43` FOREIGN KEY (`refundRequestId`) REFERENCES `refund_request` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refund_request_item`
--

LOCK TABLES `refund_request_item` WRITE;
/*!40000 ALTER TABLE `refund_request_item` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `refund_request_item` VALUES
('c9cc556d-7c76-4d9f-8cb8-343f9661cfdb','27e59a07-98d3-495a-8b33-db7b515d962e','72c735c3-3aec-4bf9-9cfd-a2baa2dae9d6','Tost','basil','dbf8a42f-69f0-4181-8373-2a0b3ea01061',1.0000,12.0000,10.0000,12.0000,10.0000,2.0000,'electronics',2.0000,5.0000),
('472172d7-4547-4029-9309-7319884ab1e5','bd5e191f-6aa0-42b8-b784-a7e1367581a2','9715ba6b-2d0c-4247-91a6-d747f7cc737c','Hayat Reçeli','default','a7d0eb1b-0c3f-4b45-8b6e-44ed9d7205a9',1.0000,342.0000,310.9091,342.0000,310.9091,31.0909,'',0.0000,0.0000),
('e31442d4-a831-4545-8cb8-abd7a552ebe6','a492f455-2ee5-456d-99b3-74f1051520d1','72c735c3-3aec-4bf9-9cfd-a2baa2dae9d6','Hayat Reçeli','default','a7d0eb1b-0c3f-4b45-8b6e-44ed9d7205a9',1.0000,342.0000,310.9091,342.0000,310.9091,31.0909,'books_media',46.6364,5.0000),
('e8bb5ff2-8f2b-4a33-82f3-adfc6dea0afc','291b60a1-6dcf-4aa0-a869-df808a3f3f83','72c735c3-3aec-4bf9-9cfd-a2baa2dae9d6','Something','default','9dd18852-2002-46a6-87cb-0de0d0ef4ccf',1.0000,15.0000,12.5000,15.0000,12.5000,2.5000,'automotive',2.5000,5.0000),
('a2f689cd-b55d-4263-a632-be6ff1ef4829','7583bedb-7eff-4a18-a330-b7fd8ec3aaff','9715ba6b-2d0c-4247-91a6-d747f7cc737c','Something','default','9dd18852-2002-46a6-87cb-0de0d0ef4ccf',1.0000,15.0000,12.5000,15.0000,12.5000,2.5000,'',0.0000,0.0000);
/*!40000 ALTER TABLE `refund_request_item` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `report`
--

DROP TABLE IF EXISTS `report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report` (
  `id` uuid NOT NULL,
  `queryId` uuid NOT NULL,
  `accountId` varchar(255) DEFAULT NULL,
  `periodLabel` varchar(60) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `lastDigestedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `paymentCount` int(11) NOT NULL DEFAULT 0,
  `totalSaleAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `totalRefundAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `totalSaleTaxAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `totalRefundTaxAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `netTaxAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `netSaleAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `netRevenue` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `lastDigestedPaymentId` varchar(255) DEFAULT NULL,
  `archived` tinyint(4) NOT NULL DEFAULT 0,
  `totalSaleAmountWithoutExpense` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `totalExpenseAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `reportType` varchar(20) NOT NULL DEFAULT 'SELLER',
  `totalExpense` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `netRevenueWithoutExpense` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `billedAt` datetime DEFAULT NULL,
  `netRevenueWithoutExpenseTaxed` decimal(19,4) NOT NULL DEFAULT 0.0000,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f0f5f49dcdd1b3ca89348b8510` (`queryId`,`reportType`,`periodLabel`,`currency`),
  CONSTRAINT `FK_5c41976ef4369687fa8516891cc` FOREIGN KEY (`queryId`) REFERENCES `report_query` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report`
--

LOCK TABLES `report` WRITE;
/*!40000 ALTER TABLE `report` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `report` VALUES
('eea86d8c-5789-4a66-8b6c-09699a998e14','b173d78d-111d-4a15-8f62-bd29d0f75eee','cbf3e25f-5586-4e5c-b0d8-7463a83da274','2026-04-30','TRY','2026-04-30 22:58:00','2026-04-30 22:16:40',2,28.0000,0.0000,4.6666,0.0000,4.6666,28.0000,23.3334,'e8a977da-ec64-454e-bcc6-aa14aab609b5',0,0.0000,0.0000,'SELLER',3.9678,19.3656,NULL,24.0322),
('be10de1d-f66c-46a0-83da-15a9933e2dfc','882e1a6e-743e-4592-9266-8ff803261e2c','cbf3e25f-5586-4e5c-b0d8-7463a83da274','2026-05-01','TRY',NULL,'2026-05-01 21:19:11',0,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,NULL,0,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL,0.0000),
('12bf23a4-a296-4f1e-baea-27f9d8732466','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-05-01','TRY',NULL,'2026-05-01 21:19:11',0,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,NULL,0,0.0000,0.0000,'SELLER',0.0000,0.0000,NULL,0.0000),
('cdd5f199-1815-479b-a5d4-2989f8a33922','123057a4-5e08-4483-9cc4-26537267918b','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','2026-04-30','TRY','2026-04-30 23:20:00','2026-04-30 22:16:40',4,231.0000,0.0000,38.5001,0.0000,38.5001,231.0000,192.4999,'97ce01db-fe13-428e-8b3f-ad9e49c2953b',0,0.0000,0.0000,'SELLER',32.7325,159.7674,NULL,198.2675),
('748c9945-eae9-43e4-9b5c-2ae6201f63e6','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-30','TRY','2026-04-30 23:24:00','2026-04-30 22:16:40',6,137.5947,0.0000,22.9325,0.0000,22.9325,137.5947,114.6622,'c067f04c-a728-41bc-bb22-c940f487b445',0,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL,0.0000),
('18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','b9243d78-24fd-4f05-964f-dcb12547ba7f','c783e9dc-07aa-4fe4-95e9-be16246156bb','ALL','TRY','2026-04-30 23:24:00','2026-04-30 22:16:40',5,3209.0000,0.0000,457.1060,0.0000,457.1060,3209.0000,2751.8940,'c067f04c-a728-41bc-bb22-c940f487b445',0,0.0000,0.0000,'SELLER',458.7517,2293.1423,NULL,2750.2483),
('2a3fe158-4002-46db-9b43-32c4b969829f','153d7879-0137-4bd3-b449-cbbf99b3e914','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','2026-04-30','TRY','2026-04-30 23:24:00','2026-04-30 22:16:40',6,9.6251,0.0000,1.6041,0.0000,1.6041,9.6251,8.0210,'c067f04c-a728-41bc-bb22-c940f487b445',0,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL,0.0000),
('c623a7f7-350a-4805-8ff4-4d8906c5a814','00603de7-3573-4be2-b952-1d2a093e5d24','5e72f829-e4ed-4ccd-8971-509708f42212','2026-05-01','TRY',NULL,'2026-05-01 21:19:11',0,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,NULL,0,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL,0.0000),
('e9dd12bd-ceae-412f-bab0-514abd2c95f2','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-05-01','TRY',NULL,'2026-05-01 21:19:11',0,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,NULL,0,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL,0.0000),
('6ce08931-0d16-468c-91ec-94b30936baa8','72cf238e-a96a-44a2-b7b6-1c185a1df3a7','5e72f829-e4ed-4ccd-8971-509708f42212','2026-04-30','TRY','2026-04-30 23:20:00','2026-04-30 22:16:40',4,12532.0000,0.0000,2088.6667,0.0000,2088.6667,12532.0000,10443.3333,'97ce01db-fe13-428e-8b3f-ad9e49c2953b',0,0.0000,0.0000,'SELLER',1253.5342,9189.7991,NULL,11278.4658),
('1690ece6-d060-4266-9d22-ac12b08a9373','882e1a6e-743e-4592-9266-8ff803261e2c','cbf3e25f-5586-4e5c-b0d8-7463a83da274','2026-04-30','TRY','2026-04-30 23:24:00','2026-04-30 22:16:40',6,1.1666,0.0000,0.1944,0.0000,0.1944,1.1666,0.9722,'c067f04c-a728-41bc-bb22-c940f487b445',0,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL,0.0000),
('69a482d3-e386-401c-a884-b6253aa9fb90','153d7879-0137-4bd3-b449-cbbf99b3e914','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','2026-05-01','TRY',NULL,'2026-05-01 21:19:11',0,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,NULL,0,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL,0.0000),
('f8a581e8-065e-429d-bd11-b77215eaf842','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-30','TRY','2026-04-30 23:24:00','2026-04-30 22:16:40',5,3209.0000,0.0000,457.1060,0.0000,457.1060,3209.0000,2751.8940,'c067f04c-a728-41bc-bb22-c940f487b445',0,0.0000,0.0000,'SELLER',458.7517,2293.1423,NULL,2750.2483),
('5985c493-cd51-4b9e-8020-c18d0f05e870','00603de7-3573-4be2-b952-1d2a093e5d24','5e72f829-e4ed-4ccd-8971-509708f42212','2026-04-30','TRY','2026-04-30 23:24:00','2026-04-30 22:16:40',6,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,'c067f04c-a728-41bc-bb22-c940f487b445',0,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL,0.0000),
('b79f2a28-c46c-426c-a26f-c8fc4c7ed626','c32beff3-1fcc-410a-9562-debe2d5e40bc','5e72f829-e4ed-4ccd-8971-509708f42212','2026-04','TRY','2026-04-30 23:20:00','2026-04-30 22:16:40',4,12532.0000,0.0000,2088.6667,0.0000,2088.6667,12532.0000,10443.3333,'97ce01db-fe13-428e-8b3f-ad9e49c2953b',0,0.0000,0.0000,'SELLER',1253.5342,9189.7991,NULL,11278.4658);
/*!40000 ALTER TABLE `report` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `report_comission`
--

DROP TABLE IF EXISTS `report_comission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_comission` (
  `id` uuid NOT NULL,
  `reportId` varchar(255) NOT NULL,
  `accountId` varchar(255) NOT NULL,
  `itemClass` varchar(255) DEFAULT NULL,
  `currency` varchar(255) DEFAULT NULL,
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `expenseKey` varchar(600) DEFAULT NULL,
  `expenseAmount` float NOT NULL DEFAULT 0,
  `totalExpense` tinyint(4) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_comission`
--

LOCK TABLES `report_comission` WRITE;
/*!40000 ALTER TABLE `report_comission` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `report_comission` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `report_expense`
--

DROP TABLE IF EXISTS `report_expense`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_expense` (
  `id` uuid NOT NULL,
  `reportId` varchar(255) NOT NULL,
  `accountId` varchar(255) NOT NULL,
  `expenseKey` varchar(600) DEFAULT NULL,
  `itemClass` varchar(255) DEFAULT NULL,
  `totalExpense` tinyint(4) NOT NULL DEFAULT 1,
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `displayWeight` int(11) NOT NULL DEFAULT 2,
  `expenseAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_aed3309b740cf284f874b21f62` (`reportId`,`accountId`,`expenseKey`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_expense`
--

LOCK TABLES `report_expense` WRITE;
/*!40000 ALTER TABLE `report_expense` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `report_expense` VALUES
('6ac10e75-24c9-4642-bdcb-113b9f7c74ae','eea86d8c-5789-4a66-8b6c-09699a998e14','cbf3e25f-5586-4e5c-b0d8-7463a83da274','REPORT_TOTAL',NULL,1,'2026-04-30 19:58:00','2026-04-30 19:17:00',1,3.9678),
('1d78ba51-ade0-4cef-85b0-16c26c61ce37','748c9945-eae9-43e4-9b5c-2ae6201f63e6','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',2,0.0000),
('1e4361d5-7a13-4f02-8bcc-207f1c0b309a','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-30 20:24:00','2026-04-30 19:55:00',3,90.3333),
('88a024ba-0174-4dce-95e0-295623d88b27','1690ece6-d060-4266-9d22-ac12b08a9373','cbf3e25f-5586-4e5c-b0d8-7463a83da274','REPORT_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',1,0.0000),
('65758dcb-f15b-4f6f-a57e-3f1b430291e3','b79f2a28-c46c-426c-a26f-c8fc4c7ed626','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-30 19:17:00','2026-04-30 19:17:00',3,0.0000),
('e9a31e43-99d9-46bc-83e9-4479bf7f324b','b79f2a28-c46c-426c-a26f-c8fc4c7ed626','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',2,0.0000),
('6a43e06a-e953-4746-817d-464be29d1ba0','f8a581e8-065e-429d-bd11-b77215eaf842','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-04-30 19:58:00','2026-04-30 19:17:00',3,46.6364),
('9ccc0665-2ba4-4f2e-a270-4caf29075f31','eea86d8c-5789-4a66-8b6c-09699a998e14','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-30 19:58:00','2026-04-30 19:17:00',2,2.8012),
('f4240cf2-cb5b-4f3d-b8a9-4ec31941cf98','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-30 20:24:00','2026-04-30 19:17:00',2,321.1570),
('f40da91b-8115-4d84-bfb0-58f8fd7e1830','f8a581e8-065e-429d-bd11-b77215eaf842','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-04-30 20:01:00','2026-04-30 20:01:00',3,0.6250),
('6b610bdc-de57-4be3-a213-5d2175767009','2a3fe158-4002-46db-9b43-32c4b969829f','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',1,0.0000),
('c6df7a2a-2d0b-40c7-9fb3-5dfc82ee6593','1690ece6-d060-4266-9d22-ac12b08a9373','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',2,0.0000),
('3afcf1c5-044a-41cb-ab1e-5eec559bc3fc','cdd5f199-1815-479b-a5d4-2989f8a33922','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-30 20:20:00','2026-04-30 19:17:00',2,23.1074),
('45b17976-16b4-4f50-99db-7d141ed79b16','5985c493-cd51-4b9e-8020-c18d0f05e870','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',2,0.0000),
('81b09f6b-8dba-4477-96e1-80a846d44f3b','f8a581e8-065e-429d-bd11-b77215eaf842','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 20:24:00','2026-04-30 19:17:00',2,137.5947),
('d1042acd-baa7-4acf-8336-81e9d37d5e8f','6ce08931-0d16-468c-91ec-94b30936baa8','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',2,0.0000),
('7560d4e7-5bb5-4d26-bf61-8b09701ab00f','b79f2a28-c46c-426c-a26f-c8fc4c7ed626','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-30 20:20:00','2026-04-30 19:17:00',1,1253.5342),
('39a8a302-1031-42bc-a048-8b3dd5277799','6ce08931-0d16-468c-91ec-94b30936baa8','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-30 20:20:00','2026-04-30 19:17:00',1,1253.5342),
('47c13eff-392a-497a-b691-91b40577b63a','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 20:24:00','2026-04-30 19:17:00',2,137.5947),
('158cc3f3-4d66-419d-bb46-9687bd68137a','eea86d8c-5789-4a66-8b6c-09699a998e14','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 19:58:00','2026-04-30 19:17:00',2,1.1666),
('ed784f61-40ee-41af-aafb-a912a3969e10','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-04-30 20:01:00','2026-04-30 20:01:00',3,0.6250),
('81407968-303c-42b0-93da-aab595b374fc','2a3fe158-4002-46db-9b43-32c4b969829f','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',2,0.0000),
('2561f72c-31cf-405d-9a2a-b298d265c521','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-30 20:24:00','2026-04-30 19:17:00',1,458.7517),
('0f5583c9-9d25-4caa-b0f4-b39ae1a5a663','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-04-30 19:58:00','2026-04-30 19:17:00',3,46.6364),
('5e72ff0e-8ffe-4c6a-9377-bad5a8dd4f36','cdd5f199-1815-479b-a5d4-2989f8a33922','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-04-30 20:20:00','2026-04-30 19:17:00',1,32.7325),
('0fb52f38-c18f-4280-98fd-c08021dfb765','6ce08931-0d16-468c-91ec-94b30936baa8','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-30 19:17:00','2026-04-30 19:17:00',3,0.0000),
('c946098c-9d9d-4037-8eee-c0ed6bb7e4c9','6ce08931-0d16-468c-91ec-94b30936baa8','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-30 20:20:00','2026-04-30 19:17:00',2,1253.5342),
('91fbdbdf-2908-45c5-8d94-c3affc8d9719','cdd5f199-1815-479b-a5d4-2989f8a33922','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 20:20:00','2026-04-30 19:17:00',2,9.6251),
('6a4baa1f-3823-4f5c-ac9a-c650b4a1abf1','f8a581e8-065e-429d-bd11-b77215eaf842','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-30 20:24:00','2026-04-30 19:17:00',1,458.7517),
('c086a519-df30-41ba-af98-df2a638a1024','f8a581e8-065e-429d-bd11-b77215eaf842','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-30 20:24:00','2026-04-30 19:17:00',2,321.1570),
('99c84ed6-a5f1-4db6-bf0d-e268e4a07a9a','b79f2a28-c46c-426c-a26f-c8fc4c7ed626','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-30 20:20:00','2026-04-30 19:17:00',2,1253.5342),
('12db2743-193d-4d26-ae0e-e5503cfd3599','f8a581e8-065e-429d-bd11-b77215eaf842','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-30 20:24:00','2026-04-30 19:55:00',3,90.3333),
('acf3c8bd-a1d1-41a4-b904-f6a7747f5992','748c9945-eae9-43e4-9b5c-2ae6201f63e6','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',1,0.0000),
('f1025581-302a-423e-8eac-fe687190b618','5985c493-cd51-4b9e-8020-c18d0f05e870','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',1,0.0000);
/*!40000 ALTER TABLE `report_expense` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `report_operation_status`
--

DROP TABLE IF EXISTS `report_operation_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_operation_status` (
  `id` uuid NOT NULL,
  `reportId` varchar(36) NOT NULL,
  `status` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_51f5c9f82800eeae8b775691ff` (`reportId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_operation_status`
--

LOCK TABLES `report_operation_status` WRITE;
/*!40000 ALTER TABLE `report_operation_status` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `report_operation_status` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `report_payment_relation`
--

DROP TABLE IF EXISTS `report_payment_relation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_payment_relation` (
  `id` uuid NOT NULL,
  `paymentId` uuid NOT NULL,
  `reportId` uuid NOT NULL,
  `digestionId` varchar(255) DEFAULT NULL,
  `digestionStartedAt` datetime DEFAULT NULL,
  `digestionStatus` varchar(255) NOT NULL,
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `digestionCompletedAt` datetime DEFAULT NULL,
  `accountId` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_5f784c4889dbef895836b54f46` (`reportId`,`paymentId`),
  KEY `FK_902240445d1edcc3b80b239f595` (`paymentId`),
  CONSTRAINT `FK_0f675a4b3f168c49c8db062b49c` FOREIGN KEY (`reportId`) REFERENCES `report` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_902240445d1edcc3b80b239f595` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_payment_relation`
--

LOCK TABLES `report_payment_relation` WRITE;
/*!40000 ALTER TABLE `report_payment_relation` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `report_payment_relation` VALUES
('5747e84c-36be-463e-b27e-0c98746d2e0a','97ce01db-fe13-428e-8b3f-ad9e49c2953b','6ce08931-0d16-468c-91ec-94b30936baa8','','2026-04-30 23:20:00','COMPLETED','2026-04-30 20:20:00','2026-04-30 20:19:31','2026-04-30 23:20:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('26dcf235-13e3-42a5-9bcf-0d9b1143a85a','be446f77-c6cf-4394-8f84-f852b0ac1e8d','c623a7f7-350a-4805-8ff4-4d8906c5a814',NULL,NULL,'WAITING','2026-05-01 18:19:11','2026-05-01 18:19:11',NULL,'5e72f829-e4ed-4ccd-8971-509708f42212'),
('e6994953-afdc-49b9-be4a-0e1884254cbd','01950684-f005-499c-8e8c-c07d62d3b85d','748c9945-eae9-43e4-9b5c-2ae6201f63e6','','2026-04-30 22:55:00','COMPLETED','2026-04-30 19:55:00','2026-04-30 19:54:54','2026-04-30 22:55:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('f89edd8c-90ec-4e78-a5c0-0fa7696f0584','c067f04c-a728-41bc-bb22-c940f487b445','748c9945-eae9-43e4-9b5c-2ae6201f63e6','','2026-04-30 23:24:00','COMPLETED','2026-04-30 20:24:00','2026-04-30 20:23:33','2026-04-30 23:24:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('a560f171-72d9-4263-8b67-10a2c6df6124','5c94c159-611c-4a6d-8498-b0daaea9b234','2a3fe158-4002-46db-9b43-32c4b969829f','','2026-04-30 22:17:00','COMPLETED','2026-04-30 19:17:00','2026-04-30 19:16:40','2026-04-30 22:17:00','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('c5e4b293-b5bb-4e25-a733-11cd96815ac4','5c94c159-611c-4a6d-8498-b0daaea9b234','6ce08931-0d16-468c-91ec-94b30936baa8','','2026-04-30 22:17:00','COMPLETED','2026-04-30 19:17:00','2026-04-30 19:16:40','2026-04-30 22:17:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('6aea3579-7a02-4de2-9b49-20d9381d55ff','01950684-f005-499c-8e8c-c07d62d3b85d','2a3fe158-4002-46db-9b43-32c4b969829f','','2026-04-30 22:55:00','COMPLETED','2026-04-30 19:55:00','2026-04-30 19:54:54','2026-04-30 22:55:00','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('9097ac5f-14f4-4865-84e3-29dd61cd6e47','c067f04c-a728-41bc-bb22-c940f487b445','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','','2026-04-30 23:24:00','COMPLETED','2026-04-30 20:24:00','2026-04-30 20:23:33','2026-04-30 23:24:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('70d96af9-db61-4163-981f-2c9c5a4f0aac','e8a977da-ec64-454e-bcc6-aa14aab609b5','5985c493-cd51-4b9e-8020-c18d0f05e870','','2026-04-30 22:58:00','COMPLETED','2026-04-30 19:58:00','2026-04-30 19:57:40','2026-04-30 22:58:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('61e25e64-6285-4d79-909b-32a99ab8e3e3','e8a977da-ec64-454e-bcc6-aa14aab609b5','f8a581e8-065e-429d-bd11-b77215eaf842','','2026-04-30 22:58:00','COMPLETED','2026-04-30 19:58:00','2026-04-30 19:57:40','2026-04-30 22:58:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('5b496a5c-fa2a-4ec7-bda5-32ffc3ab6e79','31eaa473-24b9-415d-b78c-78d46c67e5cd','2a3fe158-4002-46db-9b43-32c4b969829f','','2026-04-30 23:01:00','COMPLETED','2026-04-30 20:01:00','2026-04-30 20:00:12','2026-04-30 23:01:00','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('1345ca99-eb04-4cff-ba61-3ce2bdc7a094','97ce01db-fe13-428e-8b3f-ad9e49c2953b','1690ece6-d060-4266-9d22-ac12b08a9373','','2026-04-30 23:20:00','COMPLETED','2026-04-30 20:20:00','2026-04-30 20:19:31','2026-04-30 23:20:00','cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('73cda150-4d4f-498e-acf5-3d5bca5a0b7c','be446f77-c6cf-4394-8f84-f852b0ac1e8d','e9dd12bd-ceae-412f-bab0-514abd2c95f2',NULL,NULL,'WAITING','2026-05-01 18:19:11','2026-05-01 18:19:11',NULL,'c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('48b04949-9f7f-4451-8b93-3eab0a9f2b4f','31eaa473-24b9-415d-b78c-78d46c67e5cd','1690ece6-d060-4266-9d22-ac12b08a9373','','2026-04-30 23:01:00','COMPLETED','2026-04-30 20:01:00','2026-04-30 20:00:12','2026-04-30 23:01:00','cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('75fc74c9-974d-4319-bdd3-3f1c6b9372c2','31eaa473-24b9-415d-b78c-78d46c67e5cd','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','','2026-04-30 23:01:00','COMPLETED','2026-04-30 20:01:00','2026-04-30 20:00:12','2026-04-30 23:01:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('0e0f80fb-9997-4661-b4e1-46dc6fb76b8d','c067f04c-a728-41bc-bb22-c940f487b445','5985c493-cd51-4b9e-8020-c18d0f05e870','','2026-04-30 23:24:00','COMPLETED','2026-04-30 20:24:00','2026-04-30 20:23:33','2026-04-30 23:24:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('ce5e8c93-9779-47a7-a8f3-50ec4a2ef2ad','5c94c159-611c-4a6d-8498-b0daaea9b234','cdd5f199-1815-479b-a5d4-2989f8a33922','','2026-04-30 22:17:00','COMPLETED','2026-04-30 19:17:00','2026-04-30 19:16:40','2026-04-30 22:17:00','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('951d70d3-4971-4378-a621-5a3ce48c825c','c067f04c-a728-41bc-bb22-c940f487b445','f8a581e8-065e-429d-bd11-b77215eaf842','','2026-04-30 23:24:00','COMPLETED','2026-04-30 20:24:00','2026-04-30 20:23:33','2026-04-30 23:24:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('e3198dad-5bc6-433c-8933-63dc4941efbb','e8a977da-ec64-454e-bcc6-aa14aab609b5','cdd5f199-1815-479b-a5d4-2989f8a33922','','2026-04-30 22:58:00','COMPLETED','2026-04-30 19:58:00','2026-04-30 19:57:40','2026-04-30 22:58:00','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('a63ebb02-4f02-4ce2-b115-6fab0835ef77','5c94c159-611c-4a6d-8498-b0daaea9b234','f8a581e8-065e-429d-bd11-b77215eaf842','','2026-04-30 22:17:00','COMPLETED','2026-04-30 19:17:00','2026-04-30 19:16:40','2026-04-30 22:17:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('d69ce120-bb1a-4ce2-8d5a-71e4c45fdef7','e8a977da-ec64-454e-bcc6-aa14aab609b5','748c9945-eae9-43e4-9b5c-2ae6201f63e6','','2026-04-30 22:58:00','COMPLETED','2026-04-30 19:58:00','2026-04-30 19:57:40','2026-04-30 22:58:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('ce0a7573-824f-4007-9c89-78628f0d81b5','be446f77-c6cf-4394-8f84-f852b0ac1e8d','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d',NULL,NULL,'WAITING','2026-05-01 18:19:11','2026-05-01 18:19:11',NULL,'c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('4c82c20b-c337-4239-a71b-7fa1b366eb71','be446f77-c6cf-4394-8f84-f852b0ac1e8d','69a482d3-e386-401c-a884-b6253aa9fb90',NULL,NULL,'WAITING','2026-05-01 18:19:11','2026-05-01 18:19:11',NULL,'a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('9291f847-b194-4dfb-9e9d-8334c9a1998f','31eaa473-24b9-415d-b78c-78d46c67e5cd','6ce08931-0d16-468c-91ec-94b30936baa8','','2026-04-30 23:01:00','COMPLETED','2026-04-30 20:01:00','2026-04-30 20:00:12','2026-04-30 23:01:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('e1728bf7-a52b-4ae3-b125-84bc62cc3a3c','e8a977da-ec64-454e-bcc6-aa14aab609b5','1690ece6-d060-4266-9d22-ac12b08a9373','','2026-04-30 22:58:00','COMPLETED','2026-04-30 19:58:00','2026-04-30 19:57:40','2026-04-30 22:58:00','cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('9a462893-507c-43fe-9218-8a7d299edf1f','31eaa473-24b9-415d-b78c-78d46c67e5cd','748c9945-eae9-43e4-9b5c-2ae6201f63e6','','2026-04-30 23:01:00','COMPLETED','2026-04-30 20:01:00','2026-04-30 20:00:12','2026-04-30 23:01:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('d66a39e8-5ede-4094-b8a4-8d775ada5dc4','97ce01db-fe13-428e-8b3f-ad9e49c2953b','cdd5f199-1815-479b-a5d4-2989f8a33922','','2026-04-30 23:20:00','COMPLETED','2026-04-30 20:20:00','2026-04-30 20:19:31','2026-04-30 23:20:00','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('3bd84e96-b050-407e-b278-903584c6681a','5c94c159-611c-4a6d-8498-b0daaea9b234','1690ece6-d060-4266-9d22-ac12b08a9373','','2026-04-30 22:17:00','COMPLETED','2026-04-30 19:17:00','2026-04-30 19:16:40','2026-04-30 22:17:00','cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('f4d26b57-0a40-4230-86fb-94b0e6c42de2','be446f77-c6cf-4394-8f84-f852b0ac1e8d','12bf23a4-a296-4f1e-baea-27f9d8732466',NULL,NULL,'WAITING','2026-05-01 18:19:11','2026-05-01 18:19:11',NULL,'c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('ba25f366-179a-4df2-8dcc-97a22677bd70','97ce01db-fe13-428e-8b3f-ad9e49c2953b','2a3fe158-4002-46db-9b43-32c4b969829f','','2026-04-30 23:20:00','COMPLETED','2026-04-30 20:20:00','2026-04-30 20:19:31','2026-04-30 23:20:00','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('fda06452-3d6f-496d-b4da-989641cec286','01950684-f005-499c-8e8c-c07d62d3b85d','1690ece6-d060-4266-9d22-ac12b08a9373','','2026-04-30 22:55:00','COMPLETED','2026-04-30 19:55:00','2026-04-30 19:54:54','2026-04-30 22:55:00','cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('9bc890b9-3c3b-45ac-8eac-993163dcb3c9','01950684-f005-499c-8e8c-c07d62d3b85d','f8a581e8-065e-429d-bd11-b77215eaf842','','2026-04-30 22:55:00','COMPLETED','2026-04-30 19:55:00','2026-04-30 19:54:54','2026-04-30 22:55:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('5dbf86e4-9d2f-4844-9308-99a43303c1ce','be446f77-c6cf-4394-8f84-f852b0ac1e8d','be10de1d-f66c-46a0-83da-15a9933e2dfc',NULL,NULL,'WAITING','2026-05-01 18:19:11','2026-05-01 18:19:11',NULL,'cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('5fcce80b-84e8-4978-b7ab-a1342fc8abbf','97ce01db-fe13-428e-8b3f-ad9e49c2953b','748c9945-eae9-43e4-9b5c-2ae6201f63e6','','2026-04-30 23:20:00','COMPLETED','2026-04-30 20:20:00','2026-04-30 20:19:31','2026-04-30 23:20:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('6ed51b8c-9c3f-40e4-9ed8-a8760eb858f9','97ce01db-fe13-428e-8b3f-ad9e49c2953b','5985c493-cd51-4b9e-8020-c18d0f05e870','','2026-04-30 23:20:00','COMPLETED','2026-04-30 20:20:00','2026-04-30 20:19:31','2026-04-30 23:20:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('e7b14018-5d40-4d71-9119-a8c4928d54d2','5c94c159-611c-4a6d-8498-b0daaea9b234','eea86d8c-5789-4a66-8b6c-09699a998e14','','2026-04-30 22:17:00','COMPLETED','2026-04-30 19:17:00','2026-04-30 19:16:40','2026-04-30 22:17:00','cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('49ef0dab-85c7-4860-94fb-b520f37e1ef3','31eaa473-24b9-415d-b78c-78d46c67e5cd','b79f2a28-c46c-426c-a26f-c8fc4c7ed626','','2026-04-30 23:01:00','COMPLETED','2026-04-30 20:01:00','2026-04-30 20:00:12','2026-04-30 23:01:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('25f00a4e-1ce2-4d59-818e-b6d8b6fa88a8','01950684-f005-499c-8e8c-c07d62d3b85d','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','','2026-04-30 22:55:00','COMPLETED','2026-04-30 19:55:00','2026-04-30 19:54:54','2026-04-30 22:55:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('637bb604-8a58-485d-ab9d-b74371906c96','31eaa473-24b9-415d-b78c-78d46c67e5cd','5985c493-cd51-4b9e-8020-c18d0f05e870','','2026-04-30 23:01:00','COMPLETED','2026-04-30 20:01:00','2026-04-30 20:00:12','2026-04-30 23:01:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('3c4cae97-52e7-4c27-a6d6-be8a01b2200b','e8a977da-ec64-454e-bcc6-aa14aab609b5','6ce08931-0d16-468c-91ec-94b30936baa8','','2026-04-30 22:58:00','COMPLETED','2026-04-30 19:58:00','2026-04-30 19:57:40','2026-04-30 22:58:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('f81c4daf-2604-4f6c-94ff-c216d2d6ba59','c067f04c-a728-41bc-bb22-c940f487b445','2a3fe158-4002-46db-9b43-32c4b969829f','','2026-04-30 23:24:00','COMPLETED','2026-04-30 20:24:00','2026-04-30 20:23:33','2026-04-30 23:24:00','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('b4c2b059-c317-4e1b-9a05-c3bed3bee3f8','e8a977da-ec64-454e-bcc6-aa14aab609b5','2a3fe158-4002-46db-9b43-32c4b969829f','','2026-04-30 22:58:00','COMPLETED','2026-04-30 19:58:00','2026-04-30 19:57:40','2026-04-30 22:58:00','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('72ea5689-46d9-4107-b6a5-c8ce00221d58','e8a977da-ec64-454e-bcc6-aa14aab609b5','b79f2a28-c46c-426c-a26f-c8fc4c7ed626','','2026-04-30 22:58:00','COMPLETED','2026-04-30 19:58:00','2026-04-30 19:57:40','2026-04-30 22:58:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('363ae4d4-2023-44d6-a306-d0517bae44df','5c94c159-611c-4a6d-8498-b0daaea9b234','b79f2a28-c46c-426c-a26f-c8fc4c7ed626','','2026-04-30 22:17:00','COMPLETED','2026-04-30 19:17:00','2026-04-30 19:16:40','2026-04-30 22:17:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('d0644d41-cb41-4b5d-8f2d-d22d977ead97','5c94c159-611c-4a6d-8498-b0daaea9b234','5985c493-cd51-4b9e-8020-c18d0f05e870','','2026-04-30 22:17:00','COMPLETED','2026-04-30 19:17:00','2026-04-30 19:16:40','2026-04-30 22:17:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('dbe7ef50-bab1-4019-b43e-d2490ff04b6c','e8a977da-ec64-454e-bcc6-aa14aab609b5','eea86d8c-5789-4a66-8b6c-09699a998e14','','2026-04-30 22:58:00','COMPLETED','2026-04-30 19:58:00','2026-04-30 19:57:40','2026-04-30 22:58:00','cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('58f91063-e019-4c94-9341-d63f95aa6ad1','31eaa473-24b9-415d-b78c-78d46c67e5cd','cdd5f199-1815-479b-a5d4-2989f8a33922','','2026-04-30 23:01:00','COMPLETED','2026-04-30 20:01:00','2026-04-30 20:00:12','2026-04-30 23:01:00','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('86043520-0cc0-4bc8-81e6-df92238e7293','c067f04c-a728-41bc-bb22-c940f487b445','1690ece6-d060-4266-9d22-ac12b08a9373','','2026-04-30 23:24:00','COMPLETED','2026-04-30 20:24:00','2026-04-30 20:23:33','2026-04-30 23:24:00','cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('aa279019-4992-492e-8323-dfd8fca91552','97ce01db-fe13-428e-8b3f-ad9e49c2953b','b79f2a28-c46c-426c-a26f-c8fc4c7ed626','','2026-04-30 23:20:00','COMPLETED','2026-04-30 20:20:00','2026-04-30 20:19:31','2026-04-30 23:20:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('e340f635-2a65-4354-a5b1-e12a27de3ee5','31eaa473-24b9-415d-b78c-78d46c67e5cd','f8a581e8-065e-429d-bd11-b77215eaf842','','2026-04-30 23:01:00','COMPLETED','2026-04-30 20:01:00','2026-04-30 20:00:12','2026-04-30 23:01:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('63cb9a5d-face-4778-9547-e3f91ae18e96','5c94c159-611c-4a6d-8498-b0daaea9b234','748c9945-eae9-43e4-9b5c-2ae6201f63e6','','2026-04-30 22:17:00','COMPLETED','2026-04-30 19:17:00','2026-04-30 19:16:40','2026-04-30 22:17:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('ac5f8a1c-54eb-4c0d-970e-eb30c108313c','e8a977da-ec64-454e-bcc6-aa14aab609b5','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','','2026-04-30 22:58:00','COMPLETED','2026-04-30 19:58:00','2026-04-30 19:57:40','2026-04-30 22:58:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('9c7f8587-7144-49a2-bdd8-ec44b218f8e9','01950684-f005-499c-8e8c-c07d62d3b85d','5985c493-cd51-4b9e-8020-c18d0f05e870','','2026-04-30 22:55:00','COMPLETED','2026-04-30 19:55:00','2026-04-30 19:54:54','2026-04-30 22:55:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('4d516019-78cb-4d10-a25f-ff0752d556a1','5c94c159-611c-4a6d-8498-b0daaea9b234','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','','2026-04-30 22:17:00','COMPLETED','2026-04-30 19:17:00','2026-04-30 19:16:40','2026-04-30 22:17:00','c783e9dc-07aa-4fe4-95e9-be16246156bb');
/*!40000 ALTER TABLE `report_payment_relation` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `report_query`
--

DROP TABLE IF EXISTS `report_query`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_query` (
  `id` uuid NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` mediumtext DEFAULT '',
  `ownerAccountId` varchar(255) DEFAULT NULL,
  `currency` varchar(255) DEFAULT NULL,
  `dateGrouping` varchar(10) NOT NULL DEFAULT 'MONTHLY',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reportType` varchar(20) NOT NULL DEFAULT 'SELLER',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_query`
--

LOCK TABLES `report_query` WRITE;
/*!40000 ALTER TABLE `report_query` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `report_query` VALUES
('72cf238e-a96a-44a2-b7b6-1c185a1df3a7','Tetakent Platform Günlük','Tetakent Platform','5e72f829-e4ed-4ccd-8971-509708f42212','TRY','DAILY','2026-04-24 17:14:12','2026-04-24 20:17:23','SELLER'),
('00603de7-3573-4be2-b952-1d2a093e5d24','Platform Seller Report / Tetakent (H.C.G) / TRY / DAILY','Bu rapor, satıcıların platformdan elde ettiği komisyon gelirlerini ve ödeme hizmeti sağlayıcı ücretlerini günlük olarak gösterir. Her gün için ayrı bir rapor oluşturulur ve sadece ilgili satıcının verilerini içerir.','5e72f829-e4ed-4ccd-8971-509708f42212','TRY','DAILY','2026-04-27 12:22:49','2026-04-27 12:22:49','PLATFORM_SELLER'),
('123057a4-5e08-4483-9cc4-26537267918b','Seller Report / Esenler Motionstar Incorporated / TRY / DAILY','Bu rapor, satıcıların satış performansını günlük olarak gösterir. Her gün için ayrı bir rapor oluşturulur ve sadece ilgili satıcının verilerini içerir. Satıcının Platforma hakedişi için yapılacak faturalandırma için kullanılacaktır.','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','TRY','DAILY','2026-04-30 19:16:40','2026-04-30 19:16:40','SELLER'),
('4e64b4f2-aae1-40d1-b6d4-31d1a2791780','Omodog Günlük','','c783e9dc-07aa-4fe4-95e9-be16246156bb','TRY','DAILY','2026-03-28 10:52:22','2026-03-29 13:09:35','SELLER'),
('9e72b629-d785-47b7-b945-32cdd253023c','Platform Seller Report / Omodog / TRY / DAILY','Bu rapor, satıcıların platformdan elde ettiği komisyon gelirlerini ve ödeme hizmeti sağlayıcı ücretlerini günlük olarak gösterir. Her gün için ayrı bir rapor oluşturulur ve sadece ilgili satıcının verilerini içerir.','c783e9dc-07aa-4fe4-95e9-be16246156bb','TRY','DAILY','2026-04-27 12:22:49','2026-04-27 12:22:49','PLATFORM_SELLER'),
('882e1a6e-743e-4592-9266-8ff803261e2c','Platform Seller Report / Doofenshmirtz Evil Inc / TRY / DAILY','Bu rapor, satıcıların platformdan elde ettiği komisyon gelirlerini ve ödeme hizmeti sağlayıcı ücretlerini günlük olarak gösterir. Her gün için ayrı bir rapor oluşturulur ve sadece ilgili satıcının verilerini içerir.','cbf3e25f-5586-4e5c-b0d8-7463a83da274','TRY','DAILY','2026-04-29 10:25:29','2026-04-29 10:25:29','PLATFORM_SELLER'),
('b173d78d-111d-4a15-8f62-bd29d0f75eee','Seller Report / Doofenshmirtz Evil Inc / TRY / DAILY','Bu rapor, satıcıların satış performansını günlük olarak gösterir. Her gün için ayrı bir rapor oluşturulur ve sadece ilgili satıcının verilerini içerir. Satıcının Platforma hakedişi için yapılacak faturalandırma için kullanılacaktır.','cbf3e25f-5586-4e5c-b0d8-7463a83da274','TRY','DAILY','2026-04-29 10:25:29','2026-04-29 10:25:29','SELLER'),
('153d7879-0137-4bd3-b449-cbbf99b3e914','Platform Seller Report / Esenler Motionstar Incorporated / TRY / DAILY','Bu rapor, satıcıların platformdan elde ettiği komisyon gelirlerini ve ödeme hizmeti sağlayıcı ücretlerini günlük olarak gösterir. Her gün için ayrı bir rapor oluşturulur ve sadece ilgili satıcının verilerini içerir.','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','TRY','DAILY','2026-04-27 12:22:49','2026-04-27 12:22:49','PLATFORM_SELLER'),
('b9243d78-24fd-4f05-964f-dcb12547ba7f','Omodog','','c783e9dc-07aa-4fe4-95e9-be16246156bb','TRY','ALL','2026-03-28 10:50:33','2026-03-29 13:05:15','SELLER'),
('c32beff3-1fcc-410a-9562-debe2d5e40bc','Tetakent','İnşallah zengin olurum amin','5e72f829-e4ed-4ccd-8971-509708f42212','TRY','MONTHLY','2026-04-05 11:11:29','2026-04-05 11:12:09','SELLER');
/*!40000 ALTER TABLE `report_query` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `report_tax_group`
--

DROP TABLE IF EXISTS `report_tax_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_tax_group` (
  `id` uuid NOT NULL,
  `reportId` varchar(255) NOT NULL,
  `taxGroupName` varchar(50) NOT NULL,
  `taxPercent` varchar(50) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `totalSaleAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `totalRefundAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `totalSaleTaxAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `totalRefundTaxAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `netTaxAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `netSaleAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `netRevenue` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `totalSaleAmountWithoutExpense` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `totalExpenseAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `paymentCount` bigint(20) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_3fb0f882e214559b0298a27839` (`reportId`,`taxPercent`,`currency`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_tax_group`
--

LOCK TABLES `report_tax_group` WRITE;
/*!40000 ALTER TABLE `report_tax_group` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `report_tax_group` VALUES
('c0a0a367-1c29-4547-ba6f-27d4cb3dff81','2a3fe158-4002-46db-9b43-32c4b969829f','%20 (Commission Tax)','20','TRY',9.6251,0.0000,1.6042,0.0000,1.6042,9.6251,8.0209,0.0000,0.0000,6),
('19101681-482d-4798-b8a7-329c25dc45ea','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','Tax 10%','10','TRY',1026.0000,0.0000,93.2727,0.0000,93.2727,1026.0000,932.7273,0.0000,0.0000,2),
('3e356e99-b41c-4071-a85d-33b01f843c10','f8a581e8-065e-429d-bd11-b77215eaf842','Tax 10%','10','TRY',1026.0000,0.0000,93.2727,0.0000,93.2727,1026.0000,932.7273,0.0000,0.0000,2),
('86ca3269-f638-45d4-9820-4f56a6d535fc','1690ece6-d060-4266-9d22-ac12b08a9373','%20 (Commission Tax)','20','TRY',1.1666,0.0000,0.1944,0.0000,0.1944,1.1666,0.9722,0.0000,0.0000,6),
('370f2707-af00-42d6-a31c-5b8ee4c9d91f','f8a581e8-065e-429d-bd11-b77215eaf842','Tax 20%','20','TRY',2183.0000,0.0000,363.8333,0.0000,363.8333,2183.0000,1819.1667,0.0000,0.0000,4),
('22d11d3c-58cc-4b36-ae06-6d5545a8a78e','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','Tax 20%','20','TRY',2183.0000,0.0000,363.8333,0.0000,363.8333,2183.0000,1819.1667,0.0000,0.0000,4),
('138587af-4c2f-40f9-90fe-8b6a560c737e','cdd5f199-1815-479b-a5d4-2989f8a33922','Tax 20%','20','TRY',231.0000,0.0000,38.5001,0.0000,38.5001,231.0000,192.4999,0.0000,0.0000,4),
('51fb7165-a072-4e6a-bc18-a865203f9b38','748c9945-eae9-43e4-9b5c-2ae6201f63e6','%20 (Commission Tax)','20','TRY',137.5947,0.0000,22.9325,0.0000,22.9325,137.5947,114.6622,0.0000,0.0000,6),
('462d3672-5ba9-456e-8048-f26f139081b7','b79f2a28-c46c-426c-a26f-c8fc4c7ed626','Tax 20%','20','TRY',12532.0000,0.0000,2088.6667,0.0000,2088.6667,12532.0000,10443.3333,0.0000,0.0000,4),
('483fcc54-2d73-41a2-8957-f7f50031ccab','eea86d8c-5789-4a66-8b6c-09699a998e14','Tax 20%','20','TRY',28.0000,0.0000,4.6666,0.0000,4.6666,28.0000,23.3334,0.0000,0.0000,2),
('15eb9ace-8212-4dba-b151-fc232a1d74bd','6ce08931-0d16-468c-91ec-94b30936baa8','Tax 20%','20','TRY',12532.0000,0.0000,2088.6667,0.0000,2088.6667,12532.0000,10443.3333,0.0000,0.0000,4),
('b517023a-cd81-4f72-9e7f-ffa026a29544','5985c493-cd51-4b9e-8020-c18d0f05e870','%20 (Commission Tax)','20','TRY',0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,6);
/*!40000 ALTER TABLE `report_tax_group` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `seller_payment_order`
--

DROP TABLE IF EXISTS `seller_payment_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_payment_order` (
  `id` uuid NOT NULL,
  `currency` varchar(255) NOT NULL,
  `paymentId` varchar(255) NOT NULL,
  `targetAccountId` uuid NOT NULL,
  `sourceAccountId` uuid NOT NULL,
  `paymentStatus` varchar(255) NOT NULL,
  `errorStatus` varchar(255) DEFAULT NULL,
  `invoiceCount` int(11) NOT NULL DEFAULT 0,
  `hasFinalizedInvoice` tinyint(4) NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `lastOperationDate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `operationNote` mediumtext DEFAULT '',
  `description` mediumtext DEFAULT '',
  `sellerOrderType` varchar(255) NOT NULL,
  `amount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `taxAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  `untaxedAmount` decimal(19,4) NOT NULL DEFAULT 0.0000,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_882b7d9d1a68d9f5989604d656` (`paymentId`,`targetAccountId`),
  KEY `FK_778c89bd583eb10be9cd0d28dd9` (`targetAccountId`),
  KEY `FK_6960749b74e51be514542211a35` (`sourceAccountId`),
  CONSTRAINT `FK_6960749b74e51be514542211a35` FOREIGN KEY (`sourceAccountId`) REFERENCES `account` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_778c89bd583eb10be9cd0d28dd9` FOREIGN KEY (`targetAccountId`) REFERENCES `account` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_payment_order`
--

LOCK TABLES `seller_payment_order` WRITE;
/*!40000 ALTER TABLE `seller_payment_order` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `seller_payment_order` VALUES
('497555ec-8a6e-4d1c-93c1-2011d521d362','TRY','e8a977da-ec64-454e-bcc6-aa14aab609b5','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-30 22:57:40','2026-04-30 22:57:40','2026-04-30 22:57:40','','','CREDIT_TO_SELLER',55.0000,9.1667,45.8333),
('fc2737f2-4aa9-4781-abc5-2da0a8a54570','TRY','5c94c159-611c-4a6d-8498-b0daaea9b234','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-30 22:16:40','2026-04-30 22:16:40','2026-04-30 22:16:40','','','CREDIT_TO_SELLER',66.0000,11.0000,55.0000),
('0f1c8329-77d8-4f0b-877d-2ed06e62a6f0','TRY','5c94c159-611c-4a6d-8498-b0daaea9b234','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-30 22:16:40','2026-04-30 22:16:40','2026-04-30 22:16:40','','','CREDIT_TO_SELLER',684.0000,62.1818,621.8182),
('7a25d8af-9275-4b36-9a29-452c8b668a64','TRY','e8a977da-ec64-454e-bcc6-aa14aab609b5','5e72f829-e4ed-4ccd-8971-509708f42212','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-30 22:57:40','2026-04-30 22:57:40','2026-04-30 22:57:40','','','CREDIT_TO_SELLER',2424.0000,404.0000,2020.0000),
('e9a50c58-5f5c-46d2-a5e9-570f0098476a','TRY','be446f77-c6cf-4394-8f84-f852b0ac1e8d','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-05-01 21:19:11','2026-05-01 21:19:11','2026-05-01 21:19:11','','','CREDIT_TO_SELLER',290.0000,48.3333,241.6667),
('db4dd9ad-b555-4e26-97d0-65cfa6f88076','TRY','31eaa473-24b9-415d-b78c-78d46c67e5cd','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,1,1,'2026-04-30 23:00:12','2026-04-30 20:01:19','2026-04-30 20:01:19','','','CREDIT_TO_SELLER',239.0000,39.8333,199.1667),
('b837562b-8acc-49a2-a673-66a07a5d75b2','TRY','31eaa473-24b9-415d-b78c-78d46c67e5cd','5e72f829-e4ed-4ccd-8971-509708f42212','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-30 23:00:12','2026-04-30 23:00:12','2026-04-30 23:00:12','','','CREDIT_TO_SELLER',2140.0000,356.6667,1783.3333),
('12c3415b-9fd8-4f83-8c0d-739677e96362','TRY','c067f04c-a728-41bc-bb22-c940f487b445','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-30 23:23:33','2026-04-30 23:23:33','2026-04-30 23:23:33','','','CREDIT_TO_SELLER',1372.0000,228.6667,1143.3333),
('d32971b6-5a6a-46eb-bf3b-7e6482a171da','TRY','31eaa473-24b9-415d-b78c-78d46c67e5cd','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-30 23:00:12','2026-04-30 23:00:12','2026-04-30 23:00:12','','','CREDIT_TO_SELLER',22.0000,3.6667,18.3333),
('acbb080f-b16a-4250-8b80-7e7fd839c89c','TRY','5c94c159-611c-4a6d-8498-b0daaea9b234','5e72f829-e4ed-4ccd-8971-509708f42212','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-30 22:16:40','2026-04-30 22:16:40','2026-04-30 22:16:40','','','CREDIT_TO_SELLER',1212.0000,202.0000,1010.0000),
('56d40743-cc24-4b56-9d3b-86595bf0a1f7','TRY','01950684-f005-499c-8e8c-c07d62d3b85d','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-30 22:54:54','2026-04-30 22:54:54','2026-04-30 22:54:54','','','CREDIT_TO_SELLER',560.0000,93.3333,466.6667),
('38942829-11ca-4aa3-8d74-900e2539e074','TRY','97ce01db-fe13-428e-8b3f-ad9e49c2953b','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-30 23:19:31','2026-04-30 23:19:31','2026-04-30 23:19:31','','','CREDIT_TO_SELLER',88.0000,14.6667,73.3333),
('b43add4c-d92a-4092-a2ac-a3f2f9c2e5af','TRY','5c94c159-611c-4a6d-8498-b0daaea9b234','cbf3e25f-5586-4e5c-b0d8-7463a83da274','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-30 22:16:40','2026-04-30 22:16:40','2026-04-30 22:16:40','','','CREDIT_TO_SELLER',14.0000,2.3333,11.6667),
('8d9af870-b837-4e0b-96e2-c37af7d27dd2','TRY','e8a977da-ec64-454e-bcc6-aa14aab609b5','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,1,1,'2026-04-30 22:57:40','2026-04-30 20:01:53','2026-04-30 20:01:53','','','CREDIT_TO_SELLER',354.0000,33.0909,320.9091),
('5cb6c613-aa07-41ee-84e8-ea95d88a545e','TRY','e8a977da-ec64-454e-bcc6-aa14aab609b5','cbf3e25f-5586-4e5c-b0d8-7463a83da274','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-30 22:57:40','2026-04-30 22:57:40','2026-04-30 22:57:40','','','CREDIT_TO_SELLER',14.0000,2.3333,11.6667),
('287e5251-c885-41a1-b18c-ead535b8b7da','TRY','97ce01db-fe13-428e-8b3f-ad9e49c2953b','5e72f829-e4ed-4ccd-8971-509708f42212','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-30 23:19:31','2026-04-30 23:19:31','2026-04-30 23:19:31','','','CREDIT_TO_SELLER',6756.0000,1126.0000,5630.0000);
/*!40000 ALTER TABLE `seller_payment_order` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `webhook_config`
--

DROP TABLE IF EXISTS `webhook_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `webhook_config` (
  `id` uuid NOT NULL,
  `accountId` varchar(255) NOT NULL,
  `url` varchar(500) NOT NULL,
  `method` varchar(10) NOT NULL DEFAULT 'POST',
  `eventKey` varchar(500) NOT NULL,
  `isEnabled` tinyint(4) NOT NULL DEFAULT 1,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webhook_config`
--

LOCK TABLES `webhook_config` WRITE;
/*!40000 ALTER TABLE `webhook_config` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `webhook_config` VALUES
('af6985c0-0aaf-40e7-b639-1a359191b5c2','c783e9dc-07aa-4fe4-95e9-be16246156bb','http://localhost:4204/service/payment/api/dummy-ecommerce-payment-channel/kdialog','POST','',1,'2026-04-30 19:54:28.230687','2026-05-01 08:54:02.000000');
/*!40000 ALTER TABLE `webhook_config` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `webhook_event_log`
--

DROP TABLE IF EXISTS `webhook_event_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `webhook_event_log` (
  `id` uuid NOT NULL,
  `webhookConfigId` uuid NOT NULL,
  `eventType` varchar(100) NOT NULL,
  `payload` longtext NOT NULL,
  `statusCode` int(11) DEFAULT NULL,
  `responseBody` longtext DEFAULT NULL,
  `retryCount` int(11) NOT NULL DEFAULT 0,
  `retryAfter` timestamp NULL DEFAULT NULL,
  `occurredAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `deliveredAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_a4f8bf500afc070d4abd96ff31a` (`webhookConfigId`),
  CONSTRAINT `FK_a4f8bf500afc070d4abd96ff31a` FOREIGN KEY (`webhookConfigId`) REFERENCES `webhook_config` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webhook_event_log`
--

LOCK TABLES `webhook_event_log` WRITE;
/*!40000 ALTER TABLE `webhook_event_log` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `webhook_event_log` VALUES
('a6dda015-ed38-46ea-bbba-b76308ba5f6d','af6985c0-0aaf-40e7-b639-1a359191b5c2','PAYMENT_COMPLETED','{\"paymentId\":\"be446f77-c6cf-4394-8f84-f852b0ac1e8d\",\"accountId\":\"c783e9dc-07aa-4fe4-95e9-be16246156bb\",\"eventType\":\"PAYMENT_COMPLETED\",\"occurredAt\":\"2026-05-01T18:19:11.311Z\"}',201,'{\"message\":\"KDialog test successful\",\"receivedBody\":{\"body\":{\"paymentId\":\"be446f77-c6cf-4394-8f84-f852b0ac1e8d\",\"accountId\":\"c783e9dc-07aa-4fe4-95e9-be16246156bb\",\"eventType\":\"PAYMENT_COMPLETED\",\"occurredAt\":\"2026-05-01T18:19:11.311Z\"}}}',0,NULL,'2026-05-01 18:19:11','2026-05-01 21:19:11'),
('2c480d2f-dfee-40ac-80fa-bf321434a09d','af6985c0-0aaf-40e7-b639-1a359191b5c2','INVOICE_FINALIZED','{\"invoiceId\":\"88015a8e-8f28-47f1-ad8a-14525211b986\",\"accountId\":\"c783e9dc-07aa-4fe4-95e9-be16246156bb\",\"eventType\":\"INVOICE_FINALIZED\",\"occurredAt\":\"2026-04-30T20:01:53.758Z\"}',201,'{\"message\":\"KDialog test successful\",\"receivedBody\":{\"body\":{\"invoiceId\":\"88015a8e-8f28-47f1-ad8a-14525211b986\",\"accountId\":\"c783e9dc-07aa-4fe4-95e9-be16246156bb\",\"eventType\":\"INVOICE_FINALIZED\",\"occurredAt\":\"2026-04-30T20:01:53.758Z\"}}}',0,NULL,'2026-04-30 20:01:53','2026-04-30 23:01:53'),
('67eaa5d0-12f7-4050-b22a-c10a9f26b8ca','af6985c0-0aaf-40e7-b639-1a359191b5c2','PAYMENT_COMPLETED','{\"paymentId\":\"c067f04c-a728-41bc-bb22-c940f487b445\",\"accountId\":\"c783e9dc-07aa-4fe4-95e9-be16246156bb\",\"eventType\":\"PAYMENT_COMPLETED\",\"occurredAt\":\"2026-04-30T20:23:33.608Z\"}',201,'{\"message\":\"KDialog test successful\",\"receivedBody\":{\"body\":{\"paymentId\":\"c067f04c-a728-41bc-bb22-c940f487b445\",\"accountId\":\"c783e9dc-07aa-4fe4-95e9-be16246156bb\",\"eventType\":\"PAYMENT_COMPLETED\",\"occurredAt\":\"2026-04-30T20:23:33.608Z\"}}}',0,NULL,'2026-04-30 20:23:33','2026-04-30 23:23:33'),
('4af2a532-3cba-47e8-b87d-fe72634930e9','af6985c0-0aaf-40e7-b639-1a359191b5c2','INVOICE_FINALIZED','{\"invoiceId\":\"b1a04e13-f636-41ee-b794-d6ee46b301b3\",\"accountId\":\"c783e9dc-07aa-4fe4-95e9-be16246156bb\",\"eventType\":\"INVOICE_FINALIZED\",\"occurredAt\":\"2026-04-30T20:01:19.554Z\"}',201,'{\"message\":\"KDialog test successful\",\"receivedBody\":{\"body\":{\"invoiceId\":\"b1a04e13-f636-41ee-b794-d6ee46b301b3\",\"accountId\":\"c783e9dc-07aa-4fe4-95e9-be16246156bb\",\"eventType\":\"INVOICE_FINALIZED\",\"occurredAt\":\"2026-04-30T20:01:19.554Z\"}}}',0,NULL,'2026-04-30 20:01:19','2026-04-30 23:01:19');
/*!40000 ALTER TABLE `webhook_event_log` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-05-01 18:19:33
