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
('2ba316ff-ff53-4858-b0c5-006aa2511613','92f41d0a-e91e-4fd5-8329-08ba2ba86ce8','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','a515959c-24ee-470b-86cd-698646ee3ae9',NULL,'DEBIT','COMPLETED','2026-04-11 12:05:42','2026-04-11 12:05:42','','Payment purchase for payment id a515959c-24ee-470b-86cd-698646ee3ae9. Sellers: Omodog',0.0000,0.0000),
('6325b276-e49a-4d78-a2bf-04bdd49b9808','005c15be-55c5-46c8-8fca-b9cba0d9ed23','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','28100ad5-150e-4139-a68d-ff874dbb7104',NULL,'DEBIT','COMPLETED','2026-04-13 12:07:05','2026-04-13 12:07:05','','Payment purchase for payment id 28100ad5-150e-4139-a68d-ff874dbb7104. Sellers: Tetakent (H.C.G), Omodog',0.0000,0.0000),
('a1d7441b-9143-401c-b960-08e250bda114','d4c6f778-46c9-4daa-bd7a-b5ec09ce7d81','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','69e44495-cab2-4dde-ae7e-70c89451c286',NULL,'DEBIT','COMPLETED','2026-03-29 21:04:58','2026-03-29 21:04:58','','Payment purchase for payment id 69e44495-cab2-4dde-ae7e-70c89451c286. Sellers: Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('431d0208-e0b8-4821-aa2b-0a4ae26b1212','d4cc7675-c6ad-43ee-a493-aa5d8768ee0c','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','46447df0-7deb-4677-9caa-45b4ff585820',NULL,'CREDIT','COMPLETED','2026-04-27 15:22:49','2026-04-27 15:22:49','','Payment purchase for payment id 46447df0-7deb-4677-9caa-45b4ff585820. Customer: Frisk Dreemurr',66.0000,11.0000),
('37dbd81b-0972-4746-8316-0a5d3fea05f2','c054ce4e-6521-4b2b-9b68-1aaf1b326379','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','d52dbec7-70cc-4033-8efc-9cda518bc009',NULL,'DEBIT','WAITING','2026-04-29 14:22:32','2026-04-29 14:22:32','','Payment refund for payment id d52dbec7-70cc-4033-8efc-9cda518bc009. Customer: Frisk Dreemurr',369.0000,35.5909),
('5cf39e34-dac8-4683-be80-0aba57742b04','a78e3d9d-0c35-445c-b341-97bd0bcd2990','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','6bfdea2e-5e43-495c-9d89-d1d27540304e',NULL,'CREDIT','COMPLETED','2026-04-13 12:41:47','2026-04-13 12:41:47','','Payment purchase for payment id 6bfdea2e-5e43-495c-9d89-d1d27540304e. Customer: Frisk Dreemurr',0.0000,0.0000),
('4439fd15-ae00-47b8-ac96-0e0d8d9bc98f','57d30692-60bc-49f9-9147-e41d8c29d59f','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','30e09c8d-d8b2-405b-ac5c-b5c498d4bddc',NULL,'DEBIT','COMPLETED','2026-04-14 12:48:16','2026-04-14 12:48:16','','Payment purchase for payment id 30e09c8d-d8b2-405b-ac5c-b5c498d4bddc. Sellers: Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('52f8a3e1-d08d-4fc9-ab5c-1052d7dbbce5','8d44d12a-5d62-40f9-b3d5-26278096d5e9','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','acebf506-e0ca-42d2-b9e1-6e192b86e53f',NULL,'DEBIT','COMPLETED','2026-04-13 09:26:45','2026-04-13 09:26:45','','Payment purchase for payment id acebf506-e0ca-42d2-b9e1-6e192b86e53f. Sellers: Omodog',0.0000,0.0000),
('a7edc317-3efc-431c-a7a8-1340752d0f98','d5dfebc0-4c35-429b-8253-de801939673f','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','cbb58ca9-25c4-4f15-a903-f67d59d1ede1',NULL,'CREDIT','COMPLETED','2026-03-28 14:21:07','2026-03-28 14:21:07','','Payment purchase for payment id cbb58ca9-25c4-4f15-a903-f67d59d1ede1. Customer: Frisk Dreemurr',0.0000,0.0000),
('a3f6920d-bf1e-480b-89d7-13d159ab56e7','febbfa56-580c-4219-8c73-719b50531c32','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','ed2b84ab-8476-42f8-b8ef-64e38b0b4872',NULL,'DEBIT','COMPLETED','2026-04-11 12:27:26','2026-04-11 12:27:26','','Payment purchase for payment id ed2b84ab-8476-42f8-b8ef-64e38b0b4872. Sellers: Omodog',0.0000,0.0000),
('43801b98-29f0-40f5-a25c-1879eae775d3','26dc1521-9c78-4732-9f4c-5e403c01d1c1','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a',NULL,'DEBIT','COMPLETED','2026-03-31 10:58:52','2026-03-31 10:58:52','','Payment purchase for payment id cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a. Sellers: Omodog',0.0000,0.0000),
('8bade2c0-e2ba-43bb-86ac-1997ecdf2583','26dc1521-9c78-4732-9f4c-5e403c01d1c1','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a',NULL,'CREDIT','COMPLETED','2026-03-31 10:58:52','2026-03-31 10:58:52','','Payment purchase for payment id cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a. Customer: Frisk Dreemurr',0.0000,0.0000),
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
('05fe6289-aead-48d5-adc2-310a6479ade4','6f271261-8978-4134-a0c4-64ca63dbbf1f','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','bdc318a1-2832-42fc-8cba-7a75a8d112d8',NULL,'CREDIT','COMPLETED','2026-04-01 12:18:00','2026-04-01 12:18:00','','Payment purchase for payment id bdc318a1-2832-42fc-8cba-7a75a8d112d8. Customer: Frisk Dreemurr',0.0000,0.0000),
('a4611bee-3d73-4bee-b357-345cc146b44b','73ab76ab-e9c2-4a81-9fa8-5b6dd0ecc24f','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c2a6c7f0-d11d-4aef-ba23-556aad150050',NULL,'DEBIT','COMPLETED','2026-03-31 12:07:20','2026-03-31 12:07:20','','Payment purchase for payment id c2a6c7f0-d11d-4aef-ba23-556aad150050. Sellers: Omodog',0.0000,0.0000),
('62133446-e84e-492e-bbcf-3669cc4597ff','4d6c363a-51f1-4d62-a62e-3c9e91f996f2','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c676457a-b61a-4fa2-a67e-f963453ebb03',NULL,'DEBIT','COMPLETED','2026-03-28 10:53:06','2026-03-28 10:53:06','','Payment purchase for payment id c676457a-b61a-4fa2-a67e-f963453ebb03. Sellers: Omodog',0.0000,0.0000),
('a97f1069-c7f3-4562-b3cd-3984ec56dd4f','5367f248-d8b8-483b-9463-5492edcd5923','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','ddca578b-583d-4008-8497-39bd8e360304',NULL,'DEBIT','COMPLETED','2026-04-01 12:31:41','2026-04-01 12:31:41','','Payment purchase for payment id ddca578b-583d-4008-8497-39bd8e360304. Sellers: Omodog',0.0000,0.0000),
('8d90e84c-5427-42ac-ba38-3c5dbb3b7234','fba90408-9952-4ae0-85b2-40851cbc59e3','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','d85e328f-fea2-4558-9cb7-f163a8c2e655',NULL,'DEBIT','COMPLETED','2026-03-30 19:49:33','2026-03-30 19:49:33','','Payment purchase for payment id d85e328f-fea2-4558-9cb7-f163a8c2e655. Sellers: Omodog',0.0000,0.0000),
('4469104a-735f-4c1c-ac60-3e1b8dcfd9c4','73ab76ab-e9c2-4a81-9fa8-5b6dd0ecc24f','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c2a6c7f0-d11d-4aef-ba23-556aad150050',NULL,'CREDIT','COMPLETED','2026-03-31 12:07:20','2026-03-31 12:07:20','','Payment purchase for payment id c2a6c7f0-d11d-4aef-ba23-556aad150050. Customer: Frisk Dreemurr',0.0000,0.0000),
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
('65638a97-e984-48ff-94fb-8732426bfca5','053f0a4a-bcac-4cf7-a979-665bf6693d78','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','2684e28d-ff4b-49c1-9da0-d445df284489',NULL,'CREDIT','COMPLETED','2026-04-29 13:25:29','2026-04-29 13:25:29','','Payment purchase for payment id 2684e28d-ff4b-49c1-9da0-d445df284489. Customer: Frisk Dreemurr',14.0000,2.3333),
('22206e63-c2d6-4154-ab55-885b7ea129ea','053f0a4a-bcac-4cf7-a979-665bf6693d78','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','2684e28d-ff4b-49c1-9da0-d445df284489',NULL,'CREDIT','COMPLETED','2026-04-29 13:25:29','2026-04-29 13:25:29','','Payment purchase for payment id 2684e28d-ff4b-49c1-9da0-d445df284489. Customer: Frisk Dreemurr',1212.0000,202.0000),
('b71dc076-aeb0-4145-9f09-88c14bc989c5','334cdb54-d55c-4e99-a265-1c64f628e082','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','3fbb1567-580e-4254-adac-427adb667854',NULL,'CREDIT','COMPLETED','2026-04-14 12:51:20','2026-04-14 12:51:20','','Payment purchase for payment id 3fbb1567-580e-4254-adac-427adb667854. Customer: Frisk Dreemurr',0.0000,0.0000),
('25a1d2f3-f266-4541-953b-89a6053e949a','946e4903-c899-4bb6-a320-26d37f3cdf57','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','b4912aeb-5c11-403c-81bb-588da87592ed',NULL,'CREDIT','COMPLETED','2026-03-28 14:38:32','2026-03-28 14:38:32','','Payment purchase for payment id b4912aeb-5c11-403c-81bb-588da87592ed. Customer: Frisk Dreemurr',0.0000,0.0000),
('59dd7ba5-a552-4636-b0c5-8b98b10b5bc2','f3275dc6-188a-4879-9240-eba4ea0ba438','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','55242586-5b62-4fbc-957d-42739f898b2f',NULL,'DEBIT','COMPLETED','2026-04-14 12:49:38','2026-04-14 12:49:38','','Payment purchase for payment id 55242586-5b62-4fbc-957d-42739f898b2f. Sellers: Omodog',0.0000,0.0000),
('4c9e6c92-d11b-4d75-9585-8bee01c9e2f9','60eeebcf-c46c-458b-b45e-3a7a2abcc2e9','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c26de1c7-9b65-4305-b0e8-ccc8d8fbb219',NULL,'CREDIT','COMPLETED','2026-04-18 12:22:47','2026-04-18 12:22:47','','Payment purchase for payment id c26de1c7-9b65-4305-b0e8-ccc8d8fbb219. Customer: Frisk Dreemurr',0.0000,0.0000),
('59bf14d9-700b-4be5-bd3b-8cf77305e85f','8cd99303-310e-46bd-b468-28b701affb8c','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','b63fd97f-f09e-4ef8-875c-fcc40009bf46',NULL,'CREDIT','COMPLETED','2026-03-28 10:51:31','2026-03-28 10:51:31','','Payment purchase for payment id b63fd97f-f09e-4ef8-875c-fcc40009bf46. Customer: Frisk Dreemurr',0.0000,0.0000),
('9f7d8507-48cd-49b9-8040-913341230a27','3fdf6b3a-3e68-4dd2-a63f-3037e69aa8f9','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','f6e28e3d-fd4e-49f6-b740-cfcf04571146',NULL,'CREDIT','COMPLETED','2026-04-01 12:02:21','2026-04-01 12:02:21','','Payment purchase for payment id f6e28e3d-fd4e-49f6-b740-cfcf04571146. Customer: Frisk Dreemurr',0.0000,0.0000),
('66dc876f-f36e-4a66-8f7d-92a66ef207fd','aefa3606-55ea-4b32-9b98-94a6cf7657cc','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','20f53c55-86ec-43fd-82a6-41225df5fd58',NULL,'DEBIT','COMPLETED','2026-04-13 09:34:44','2026-04-13 09:34:44','','Payment purchase for payment id 20f53c55-86ec-43fd-82a6-41225df5fd58. Sellers: Tetakent (H.C.G)',0.0000,0.0000),
('6094d828-8ae2-4836-a04c-9596551f6611','36a81cdb-532d-4746-bad3-8fc25b454989','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','5250a81a-6d49-4d3c-ad7e-56013dba864d',NULL,'CREDIT','COMPLETED','2026-03-28 14:33:27','2026-03-28 14:33:27','','Payment purchase for payment id 5250a81a-6d49-4d3c-ad7e-56013dba864d. Customer: Frisk Dreemurr',0.0000,0.0000),
('42bfccc9-fddc-4f64-b3f8-95b5c6be9c77','36e258d5-58fa-4019-b627-64cc1481436a','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','65fb3419-cb50-4c5b-b31e-98dbfe1bb430',NULL,'DEBIT','COMPLETED','2026-04-05 11:41:27','2026-04-05 11:41:27','','Payment purchase for payment id 65fb3419-cb50-4c5b-b31e-98dbfe1bb430. Sellers: Omodog',0.0000,0.0000),
('f9fae7f0-2bec-4d22-9906-96c7b438e499','67f40595-19b0-4b78-adfd-ca82894dded1','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','3377a6d8-0ae0-4e1e-a2d7-c8885587eb0f',NULL,'CREDIT','COMPLETED','2026-03-28 14:20:07','2026-03-28 14:20:07','','Payment purchase for payment id 3377a6d8-0ae0-4e1e-a2d7-c8885587eb0f. Customer: Frisk Dreemurr',0.0000,0.0000),
('88eb2456-254f-4b73-b9be-996c53f6193a','c75e19e1-8a7c-432f-b0e3-173eb2f4b4a6','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','bd8e8e57-269a-4d27-b1ad-698289104c89',NULL,'CREDIT','COMPLETED','2026-04-29 14:36:06','2026-04-29 14:36:06','','Payment purchase for payment id bd8e8e57-269a-4d27-b1ad-698289104c89. Customer: Frisk Dreemurr',566.0000,68.4242),
('33990d6c-a218-4e88-8680-9c52d6bbaeaa','d025e637-0b54-4748-93a3-18b00fc50674','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','d4668779-7454-4f6a-b81c-ba9aa510e070',NULL,'DEBIT','COMPLETED','2026-03-31 12:08:07','2026-03-31 12:08:07','','Payment purchase for payment id d4668779-7454-4f6a-b81c-ba9aa510e070. Sellers: Omodog',0.0000,0.0000),
('4c3ff9d8-0534-40ed-bcba-9df4390ffb89','8d44d12a-5d62-40f9-b3d5-26278096d5e9','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','acebf506-e0ca-42d2-b9e1-6e192b86e53f',NULL,'CREDIT','COMPLETED','2026-04-13 09:26:45','2026-04-13 09:26:45','','Payment purchase for payment id acebf506-e0ca-42d2-b9e1-6e192b86e53f. Customer: Frisk Dreemurr',0.0000,0.0000),
('2b2ed591-60df-47c6-9326-9fcad7b31c7e','c75e19e1-8a7c-432f-b0e3-173eb2f4b4a6','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','bd8e8e57-269a-4d27-b1ad-698289104c89',NULL,'CREDIT','COMPLETED','2026-04-29 14:36:06','2026-04-29 14:36:06','','Payment purchase for payment id bd8e8e57-269a-4d27-b1ad-698289104c89. Customer: Frisk Dreemurr',1212.0000,202.0000),
('03330afa-72c2-45d9-84bb-a0cd06d1f09b','4508d7c2-fa05-4eb0-9c97-50266e31dc94','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','d535fbc3-69f4-4b8a-ac31-ab4073dbb889',NULL,'DEBIT','COMPLETED','2026-04-13 12:19:24','2026-04-13 12:19:24','','Payment purchase for payment id d535fbc3-69f4-4b8a-ac31-ab4073dbb889. Sellers: Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('370707cb-372b-4ccd-b467-a2213e852096','068edcd6-40a1-4f47-b25c-35b40b3dc1b6','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','9dfd48f2-f25b-4903-bed0-47e340260c33',NULL,'DEBIT','COMPLETED','2026-03-31 11:35:26','2026-03-31 11:35:26','','Payment purchase for payment id 9dfd48f2-f25b-4903-bed0-47e340260c33. Sellers: Omodog',0.0000,0.0000),
('e166229b-b19c-42cd-a929-a47c21129e53','309b68be-f65e-4a34-b7cf-8568ab4f244a','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','2f6dc481-f941-4b12-90d3-acc9554773f4',NULL,'CREDIT','COMPLETED','2026-04-13 12:34:50','2026-04-13 12:34:50','','Payment purchase for payment id 2f6dc481-f941-4b12-90d3-acc9554773f4. Customer: Frisk Dreemurr',0.0000,0.0000),
('f6231f57-da9d-48d1-9e18-a635ae875b6b','098d595b-af3f-4511-ba22-431c9a963a76','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','fadd1328-7198-408e-8405-9eda402b9dda',NULL,'DEBIT','COMPLETED','2026-04-29 13:57:45','2026-04-29 13:57:45','','Payment purchase for payment id fadd1328-7198-408e-8405-9eda402b9dda. Sellers: Omodog',1080.0000,102.2727),
('15c8c8f4-3f4f-4b8b-9da5-a642f428b5c1','a082003e-a2c9-4458-94f9-e0832d877504','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','9d7a02a8-6a03-4abe-98e4-15ad3416852a',NULL,'DEBIT','COMPLETED','2026-04-27 14:31:39','2026-04-27 14:31:39','','Payment purchase for payment id 9d7a02a8-6a03-4abe-98e4-15ad3416852a. Sellers: Tetakent (H.C.G), Omodog',9208.0000,1534.6667),
('357668e4-bc30-4e07-9e90-a752688a86b3','36a81cdb-532d-4746-bad3-8fc25b454989','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','5250a81a-6d49-4d3c-ad7e-56013dba864d',NULL,'CREDIT','COMPLETED','2026-03-28 14:33:27','2026-03-28 14:33:27','','Payment purchase for payment id 5250a81a-6d49-4d3c-ad7e-56013dba864d. Customer: Frisk Dreemurr',0.0000,0.0000),
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
('4eda3f04-70a4-4227-98e3-c107d34fa7ef','6b8ad375-e6ea-40fa-be3f-c74c2fbe9658','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','90b7bd2a-6723-4265-b782-242720019812',NULL,'CREDIT','COMPLETED','2026-04-11 12:48:28','2026-04-11 12:48:28','','Payment purchase for payment id 90b7bd2a-6723-4265-b782-242720019812. Customer: Frisk Dreemurr',0.0000,0.0000),
('69f2e889-786a-42bd-9ec3-c1e5447e36a6','744f7ffe-e6ae-4ece-ac7f-7063017a0091','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c5cef75d-bb65-46b3-9375-3a5cc39920b6',NULL,'CREDIT','COMPLETED','2026-04-27 15:07:26','2026-04-27 15:07:26','','Payment purchase for payment id c5cef75d-bb65-46b3-9375-3a5cc39920b6. Customer: Frisk Dreemurr',467.0000,51.9243),
('d8607eaf-af91-4bd1-948d-c87477880a94','068edcd6-40a1-4f47-b25c-35b40b3dc1b6','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','9dfd48f2-f25b-4903-bed0-47e340260c33',NULL,'CREDIT','COMPLETED','2026-03-31 11:35:26','2026-03-31 11:35:26','','Payment purchase for payment id 9dfd48f2-f25b-4903-bed0-47e340260c33. Customer: Frisk Dreemurr',0.0000,0.0000),
('69b7a283-9795-4974-b301-c9252cff4adf','2a333f87-b924-46a4-ba69-d699b1b374aa','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4',NULL,'DEBIT','COMPLETED','2026-04-29 14:20:56','2026-04-29 14:20:56','','Payment purchase for payment id 2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4. Sellers: Omodog',1134.0000,111.2727),
('c3550e37-a503-4be0-8f1d-cd26e006781e','946e4903-c899-4bb6-a320-26d37f3cdf57','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','b4912aeb-5c11-403c-81bb-588da87592ed',NULL,'DEBIT','COMPLETED','2026-03-28 14:38:32','2026-03-28 14:38:32','','Payment purchase for payment id b4912aeb-5c11-403c-81bb-588da87592ed. Sellers: Esenler Motionstar Incorporated, Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('f18a6a58-da66-4942-9017-cefadbc8312d','d4c6f778-46c9-4daa-bd7a-b5ec09ce7d81','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','69e44495-cab2-4dde-ae7e-70c89451c286',NULL,'CREDIT','COMPLETED','2026-03-29 21:04:58','2026-03-29 21:04:58','','Payment purchase for payment id 69e44495-cab2-4dde-ae7e-70c89451c286. Customer: Frisk Dreemurr',0.0000,0.0000),
('ae2328d1-0a28-41d1-b958-d0893e54ab6b','c4296c87-1418-4465-8d3d-efefe07c5eed','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','5564f851-c835-4667-b894-c654b69a93f6',NULL,'DEBIT','COMPLETED','2026-03-28 14:23:53','2026-03-28 14:23:53','','Payment purchase for payment id 5564f851-c835-4667-b894-c654b69a93f6. Sellers: Tetakent (H.C.G), Omodog',0.0000,0.0000),
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
  KEY `FK_1e3033e4d8a159183d504a4c297` (`billingAccountId`)
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
('bd8e8e57-269a-4d27-b1ad-698289104c89','COMPLETED','2026-04-29 11:36:05','2026-04-29 11:36:05'),
('d52dbec7-70cc-4033-8efc-9cda518bc009','COMPLETED','2026-04-29 11:38:18','2026-04-29 11:38:18');
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
  `customerAccountId` varchar(255) NOT NULL,
  `customerAccountName` varchar(255) DEFAULT NULL,
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f8b7c24ce00e8cf0f643445559` (`billingCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `payment` VALUES
('86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-04-27 12:26:05','2026-04-27 12:26:08',NULL,3348.0000,558.0000,1),
('46447df0-7deb-4677-9caa-45b4ff585820','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-04-27 12:22:46','2026-04-27 12:22:49',NULL,5414.0000,902.3333,1),
('bd8e8e57-269a-4d27-b1ad-698289104c89','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-04-29 11:36:01','2026-04-29 11:36:06',NULL,1778.0000,270.4242,1),
('2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-04-29 11:20:45','2026-04-29 11:20:55',NULL,1134.0000,111.2727,1),
('d52dbec7-70cc-4033-8efc-9cda518bc009','REFUND','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-04-29 11:22:32','2026-04-29 12:01:54','72c735c3-3aec-4bf9-9cfd-a2baa2dae9d6',369.0000,35.5909,1),
('fadd1328-7198-408e-8405-9eda402b9dda','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-04-29 10:57:36','2026-04-29 10:57:45',NULL,1080.0000,102.2727,1),
('2684e28d-ff4b-49c1-9da0-d445df284489','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-04-29 10:25:19','2026-04-29 10:25:29',NULL,1799.0000,273.9242,1),
('1b2f201a-15d0-47eb-8084-d9019c1e4970','REFUND','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-04-29 10:58:43','2026-04-29 10:59:15','9715ba6b-2d0c-4247-91a6-d747f7cc737c',357.0000,33.5909,1);
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
('57aebef3-ed5c-48c3-b4f5-04462326c4c0','dummy-ecommerce','d52dbec7-70cc-4033-8efc-9cda518bc009','','TRY','COMPLETED','d52dbec7-70cc-4033-8efc-9cda518bc009','2026-04-29 14:22:32','2026-04-29 12:02:01','SELLER',0,369.0000,0.0000),
('6e91653b-ab50-487f-a223-1537383b22cb','dummy-ecommerce','fadd1328-7198-408e-8405-9eda402b9dda','','TRY','COMPLETED','fadd1328-7198-408e-8405-9eda402b9dda','2026-04-29 13:57:39','2026-04-29 10:57:41','SELLER',1,1080.0000,108.1000),
('f94410fb-3971-4feb-b893-16243b2e49c1','dummy-ecommerce','bd8e8e57-269a-4d27-b1ad-698289104c89','','TRY','COMPLETED','bd8e8e57-269a-4d27-b1ad-698289104c89','2026-04-29 14:36:03','2026-04-29 11:36:05','SELLER',1,1778.0000,177.9000),
('cc651620-e10d-4355-a1b0-1c71a6a529ad','dummy-ecommerce','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4','','TRY','COMPLETED','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4','2026-04-29 14:20:49','2026-04-29 11:20:51','SELLER',1,1134.0000,113.5000),
('62d40ca4-a6c5-4c99-b448-33c362b69025','dummy-ecommerce','9d7a02a8-6a03-4abe-98e4-15ad3416852a','','TRY','COMPLETED','9d7a02a8-6a03-4abe-98e4-15ad3416852a','2026-04-27 14:31:37','2026-04-27 11:31:38','SELLER',1,9208.0000,920.9000),
('5ef59f2d-deb0-416f-ac22-3599a5afb7ea','dummy-ecommerce','2684e28d-ff4b-49c1-9da0-d445df284489','','TRY','COMPLETED','2684e28d-ff4b-49c1-9da0-d445df284489','2026-04-29 13:25:22','2026-04-29 10:25:24','SELLER',1,1799.0000,180.0000),
('d8ee0d2c-f62a-4932-9505-3c03e6c9e5ce','dummy-ecommerce','1b2f201a-15d0-47eb-8084-d9019c1e4970','','TRY','COMPLETED','1b2f201a-15d0-47eb-8084-d9019c1e4970','2026-04-29 13:58:43','2026-04-29 10:59:13','SELLER',0,357.0000,0.0000),
('8aed560f-e892-4b62-9388-3f94b6784434','dummy-ecommerce','c5cef75d-bb65-46b3-9375-3a5cc39920b6','','TRY','COMPLETED','c5cef75d-bb65-46b3-9375-3a5cc39920b6','2026-04-27 15:07:24','2026-04-27 12:07:25','SELLER',1,1726.0000,172.7000),
('8425ca24-321f-4c8e-8d3c-69e3f8ef510b','dummy-ecommerce','46447df0-7deb-4677-9caa-45b4ff585820','','TRY','COMPLETED','46447df0-7deb-4677-9caa-45b4ff585820','2026-04-27 15:22:47','2026-04-27 12:22:48','SELLER',1,5414.0000,541.5000),
('65fe59bb-ab15-4e22-ba20-7d93cbcf4a8d','dummy-ecommerce','a815c450-c725-4563-8ab1-8446c0397ef5','','TRY','COMPLETED','a815c450-c725-4563-8ab1-8446c0397ef5','2026-04-27 15:10:25','2026-04-27 12:10:26','SELLER',1,6783.0000,678.4000),
('0020fc7d-2c02-4a76-97fa-92a915a3234c','dummy-ecommerce','e15efeb5-20d4-4f81-9ba7-275034539e14','','TRY','COMPLETED','e15efeb5-20d4-4f81-9ba7-275034539e14','2026-04-27 15:14:46','2026-04-27 12:14:47','SELLER',1,765.0000,76.6000),
('38efd653-bcdf-4587-af28-92ce6cdd5338','dummy-ecommerce','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','','TRY','COMPLETED','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','2026-04-27 15:26:06','2026-04-27 12:26:07','SELLER',1,3348.0000,334.9000),
('17d25d82-2acc-4235-aaee-ae0dd0cef4b0','dummy-ecommerce','c4eed229-155b-48fe-8d93-a6adf4d96140','','TRY','COMPLETED','c4eed229-155b-48fe-8d93-a6adf4d96140','2026-04-21 02:32:13','2026-04-20 23:32:14','SELLER',1,1679.0000,168.0000);
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
  `sellerAccountId` varchar(255) NOT NULL,
  `sellerAccountName` varchar(255) NOT NULL,
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
  PRIMARY KEY (`id`),
  KEY `FK_2fa2000f290cdf7e61389d40a09` (`paymentId`),
  KEY `FK_8cf52215637c9a41aefa3f50202` (`refundPaymentId`),
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
('6ece3b42-341f-4ffe-a0e8-095a4607c15e','','','','Esenler Note Calculation','46447df0-7deb-4677-9caa-45b4ff585820','e2e402c4-ef53-40df-8591-98adfd4a1afc','1years','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','C62',0,NULL,NULL,'','2026-04-27 12:22:46','2026-04-27 12:22:46',3.0000,66.0000,22.0000,22.0000,20.0000,11.0000,55.0000,0.0000,2.7500,5.0000,0.0000,0.0000),
('41a57bda-757b-4ce7-ad75-1b4c9d9dc115','','','','Tost','bd8e8e57-269a-4d27-b1ad-698289104c89','dbf8a42f-69f0-4181-8373-2a0b3ea01061','aubrey','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','KPO',0,NULL,NULL,'electronics','2026-04-29 11:36:01','2026-04-29 11:36:01',2.0000,224.0000,112.0000,112.0000,20.0000,37.3333,186.6667,0.0000,9.3333,5.0000,0.0000,0.0000),
('6cffae2d-74ec-4e3e-b025-22ee2e990800','','','','Something','d52dbec7-70cc-4033-8efc-9cda518bc009','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','C62',0,NULL,NULL,'automotive','2026-04-29 11:22:32','2026-04-29 11:22:32',1.0000,15.0000,15.0000,15.0000,20.0000,2.5000,12.5000,0.0000,0.6250,5.0000,0.0000,0.0000),
('ecc0bf24-7593-46d5-ad2c-2ea763c7fb6f','','','','Drillinator','2684e28d-ff4b-49c1-9da0-d445df284489','3954ca25-330d-4e83-aef9-96f0da591b53','default','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','C62',0,NULL,NULL,'','2026-04-29 10:25:19','2026-04-29 10:25:19',1.0000,14.0000,14.0000,14.0000,20.0000,2.3333,11.6667,0.0000,0.5833,5.0000,0.0000,0.0000),
('481a4c15-9bd1-49e3-9a4c-319f373615bd','','','','Tost','46447df0-7deb-4677-9caa-45b4ff585820','dbf8a42f-69f0-4181-8373-2a0b3ea01061','aubrey','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','KPO',0,NULL,NULL,'electronics','2026-04-27 12:22:46','2026-04-27 12:22:46',4.0000,448.0000,112.0000,112.0000,20.0000,74.6667,373.3333,0.0000,18.6667,5.0000,0.0000,0.0000),
('687ed781-968a-4238-9605-3a10568b1ef3','','','','Something','46447df0-7deb-4677-9caa-45b4ff585820','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','basils','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','C62',0,NULL,NULL,'automotive','2026-04-27 12:22:46','2026-04-27 12:22:46',4.0000,52.0000,13.0000,13.0000,20.0000,8.6667,43.3333,0.0000,2.1667,5.0000,0.0000,0.0000),
('0006829a-23af-4aba-a77f-3b80337ce624','','','','Tost','2684e28d-ff4b-49c1-9da0-d445df284489','dbf8a42f-69f0-4181-8373-2a0b3ea01061','mari','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','KPO',0,NULL,NULL,'electronics','2026-04-29 10:25:19','2026-04-29 10:25:19',1.0000,231.0000,231.0000,231.0000,20.0000,38.5000,192.5000,0.0000,9.6250,5.0000,0.0000,0.0000),
('ec62accd-dd91-45d6-8c54-4c00a6537f95','','','','Kyle Broflovski Peluş','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','739263f4-a5e9-4f70-a368-8ea4891fec10','jew-elf-king','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','GFI',0,NULL,NULL,'electronics','2026-04-27 12:26:05','2026-04-27 12:26:05',2.0000,2424.0000,1212.0000,1212.0000,20.0000,404.0000,2020.0000,0.0000,0.0000,0.0000,0.0000,0.0000),
('a492f455-2ee5-456d-99b3-74f1051520d1','','','','Hayat Reçeli','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4','a7d0eb1b-0c3f-4b45-8b6e-44ed9d7205a9','default','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','TON',0,NULL,NULL,'books_media','2026-04-29 11:22:32','2026-04-29 11:20:45',3.0000,1026.0000,342.0000,342.0000,10.0000,93.2727,932.7273,1.0000,46.6364,5.0000,0.0000,0.0000),
('6c2acaca-48a2-4bb3-974a-776ccd3da33c','','','','Kyle Broflovski Peluş','bd8e8e57-269a-4d27-b1ad-698289104c89','739263f4-a5e9-4f70-a368-8ea4891fec10','jew-elf-king','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','GFI',0,NULL,NULL,'electronics','2026-04-29 11:36:01','2026-04-29 11:36:01',1.0000,1212.0000,1212.0000,1212.0000,20.0000,202.0000,1010.0000,0.0000,0.0000,0.0000,0.0000,0.0000),
('979cc8ea-7264-474c-bd91-7c506899219c','','','','Hayat Reçeli','d52dbec7-70cc-4033-8efc-9cda518bc009','a7d0eb1b-0c3f-4b45-8b6e-44ed9d7205a9','default','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','TON',0,NULL,NULL,'books_media','2026-04-29 11:22:32','2026-04-29 11:22:32',1.0000,342.0000,342.0000,342.0000,10.0000,31.0909,310.9091,0.0000,15.5455,5.0000,0.0000,0.0000),
('c9920fc3-bc9b-4303-9cf0-96b7f05786d3','','','','Kyle Broflovski Peluş','46447df0-7deb-4677-9caa-45b4ff585820','739263f4-a5e9-4f70-a368-8ea4891fec10','humankite','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','GFI',0,NULL,NULL,'electronics','2026-04-27 12:22:46','2026-04-27 12:22:46',4.0000,4848.0000,1212.0000,1212.0000,20.0000,808.0000,4040.0000,0.0000,0.0000,0.0000,0.0000,0.0000),
('423ccafb-5f82-4890-af3a-99da07fd727f','','','','Kyle Broflovski Peluş','2684e28d-ff4b-49c1-9da0-d445df284489','739263f4-a5e9-4f70-a368-8ea4891fec10','jew-elf-king','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','GFI',0,NULL,NULL,'electronics','2026-04-29 10:25:19','2026-04-29 10:25:19',1.0000,1212.0000,1212.0000,1212.0000,20.0000,202.0000,1010.0000,0.0000,0.0000,0.0000,0.0000,0.0000),
('08333a7f-9f72-40e8-82a8-a509f9ef62d0','','','','Hayat Reçeli','bd8e8e57-269a-4d27-b1ad-698289104c89','a7d0eb1b-0c3f-4b45-8b6e-44ed9d7205a9','default','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','TON',0,NULL,NULL,'books_media','2026-04-29 11:36:01','2026-04-29 11:36:01',1.0000,342.0000,342.0000,342.0000,10.0000,31.0909,310.9091,0.0000,15.5455,5.0000,0.0000,0.0000),
('b2efafb2-7b65-4669-b76e-a601f1d7281b','','','','Tost','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','dbf8a42f-69f0-4181-8373-2a0b3ea01061','mari','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','KPO',0,NULL,NULL,'electronics','2026-04-27 12:26:05','2026-04-27 12:26:05',4.0000,924.0000,231.0000,231.0000,20.0000,154.0000,770.0000,0.0000,38.5000,5.0000,0.0000,0.0000),
('bd5e191f-6aa0-42b8-b784-a7e1367581a2','','','','Hayat Reçeli','fadd1328-7198-408e-8405-9eda402b9dda','a7d0eb1b-0c3f-4b45-8b6e-44ed9d7205a9','default','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','TON',0,NULL,NULL,'books_media','2026-04-29 10:58:43','2026-04-29 10:57:36',3.0000,1026.0000,342.0000,342.0000,10.0000,93.2727,932.7273,1.0000,46.6364,5.0000,0.0000,0.0000),
('cc0232e8-8b66-40f5-8b21-b005b84acad0','','','','Hayat Reçeli','1b2f201a-15d0-47eb-8084-d9019c1e4970','a7d0eb1b-0c3f-4b45-8b6e-44ed9d7205a9','default','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','TON',0,NULL,NULL,'books_media','2026-04-29 10:58:43','2026-04-29 10:58:43',1.0000,342.0000,342.0000,342.0000,10.0000,31.0909,310.9091,0.0000,15.5455,5.0000,0.0000,0.0000),
('1bebc04b-9d03-4946-9738-b78fd2ff4fa3','','','','Hayat Reçeli','2684e28d-ff4b-49c1-9da0-d445df284489','a7d0eb1b-0c3f-4b45-8b6e-44ed9d7205a9','default','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','TON',0,NULL,NULL,'books_media','2026-04-29 10:25:19','2026-04-29 10:25:19',1.0000,342.0000,342.0000,342.0000,10.0000,31.0909,310.9091,0.0000,15.5455,5.0000,0.0000,0.0000),
('7583bedb-7eff-4a18-a330-b7fd8ec3aaff','','','','Something','fadd1328-7198-408e-8405-9eda402b9dda','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','C62',0,NULL,NULL,'automotive','2026-04-29 10:58:43','2026-04-29 10:57:36',2.0000,30.0000,15.0000,15.0000,20.0000,5.0000,25.0000,1.0000,1.2500,5.0000,0.0000,0.0000),
('2b9ffbc0-1734-421f-9bb6-c90da3c17860','','','','Tost','d52dbec7-70cc-4033-8efc-9cda518bc009','dbf8a42f-69f0-4181-8373-2a0b3ea01061','basil','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','KPO',0,NULL,NULL,'electronics','2026-04-29 11:22:32','2026-04-29 11:22:32',1.0000,12.0000,12.0000,12.0000,20.0000,2.0000,10.0000,0.0000,0.5000,5.0000,0.0000,0.0000),
('c501d4be-5707-40b1-9fb4-d2f6cdd54f07','','','','Tost','fadd1328-7198-408e-8405-9eda402b9dda','dbf8a42f-69f0-4181-8373-2a0b3ea01061','basil','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','KPO',0,NULL,NULL,'electronics','2026-04-29 10:57:36','2026-04-29 10:57:36',2.0000,24.0000,12.0000,12.0000,20.0000,4.0000,20.0000,0.0000,1.0000,5.0000,0.0000,0.0000),
('27e59a07-98d3-495a-8b33-db7b515d962e','','','','Tost','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4','dbf8a42f-69f0-4181-8373-2a0b3ea01061','basil','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','KPO',0,NULL,NULL,'electronics','2026-04-29 11:22:32','2026-04-29 11:20:45',4.0000,48.0000,12.0000,12.0000,20.0000,8.0000,40.0000,1.0000,2.0000,5.0000,0.0000,0.0000),
('291b60a1-6dcf-4aa0-a869-df808a3f3f83','','','','Something','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','C62',0,NULL,NULL,'automotive','2026-04-29 11:22:32','2026-04-29 11:20:45',4.0000,60.0000,15.0000,15.0000,20.0000,10.0000,50.0000,1.0000,2.5000,5.0000,0.0000,0.0000),
('6a1d7c72-5b2c-4079-a155-e9744673f3d7','','','','Something','1b2f201a-15d0-47eb-8084-d9019c1e4970','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','C62',0,NULL,NULL,'automotive','2026-04-29 10:58:43','2026-04-29 10:58:43',1.0000,15.0000,15.0000,15.0000,20.0000,2.5000,12.5000,0.0000,0.6250,5.0000,0.0000,0.0000);
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
('ecbb305e-4384-43ba-89d2-1c93551ac80a','d52dbec7-70cc-4033-8efc-9cda518bc009',4.5000,22.5000,27.0000,20.0000),
('ba013f70-89a7-483e-bf71-2ad6b695e4e1','2684e28d-ff4b-49c1-9da0-d445df284489',242.8333,1214.1667,1457.0000,20.0000),
('5dfe4f9d-7510-4251-92ef-2c3f05fd959d','bd8e8e57-269a-4d27-b1ad-698289104c89',31.0909,310.9091,342.0000,10.0000),
('8cb86c58-7015-4487-b26c-49e8a216cb42','1b2f201a-15d0-47eb-8084-d9019c1e4970',2.5000,12.5000,15.0000,20.0000),
('4e511b89-fe58-4c71-b87d-641c8a180187','fadd1328-7198-408e-8405-9eda402b9dda',9.0000,45.0000,54.0000,20.0000),
('58578c96-8d22-4acc-82f6-7d4f066c3f80','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4',93.2727,932.7273,1026.0000,10.0000),
('d70ade8a-8b24-4b27-94da-84515f0abd1b','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',558.0000,2790.0000,3348.0000,20.0000),
('fd4b5204-1135-4df0-bc88-9cbef944a8bd','d52dbec7-70cc-4033-8efc-9cda518bc009',31.0909,310.9091,342.0000,10.0000),
('5e2a4f46-c2a4-41f5-80cf-a6c0d939610a','fadd1328-7198-408e-8405-9eda402b9dda',93.2727,932.7273,1026.0000,10.0000),
('2022bb0c-c86f-42cd-8915-c18eb2fb8370','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4',18.0000,90.0000,108.0000,20.0000),
('423dc499-8e05-4528-902d-cbe33cfe5224','1b2f201a-15d0-47eb-8084-d9019c1e4970',31.0909,310.9091,342.0000,10.0000),
('e627643a-6cd2-4e1f-bbfe-cd8dddc12121','bd8e8e57-269a-4d27-b1ad-698289104c89',239.3333,1196.6667,1436.0000,20.0000),
('0d199de3-0514-4ec1-b8e3-f32d5b3bbd55','2684e28d-ff4b-49c1-9da0-d445df284489',31.0909,310.9091,342.0000,10.0000),
('058f3924-1401-43d4-9c53-f47321ec369d','46447df0-7deb-4677-9caa-45b4ff585820',902.3333,4511.6667,5414.0000,20.0000);
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
  `requestedByPaymentAccountId` varchar(255) NOT NULL,
  `requestedToPaymentAccountId` varchar(255) NOT NULL,
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
('f78ba73c-5618-4679-8fa4-055750addf9c','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777464146496','TRY','2026-04-29 14:30:00','2026-04-29 14:29:05',1,38.5000,0.0000,6.4167,0.0000,6.4167,38.5000,32.0833,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('09c6dad1-b374-4a37-bf9e-0921905af675','153d7879-0137-4bd3-b449-cbbf99b3e914','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','2026-04-27','TRY',NULL,'2026-04-27 15:26:08',1,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,NULL,0,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('838e6f8f-7ca1-4900-a8c7-0a6e5541c341','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27','TRY','2026-04-29 15:36:00','2026-04-29 15:35:28',1,924.0000,0.0000,154.0000,0.0000,154.0000,924.0000,770.0000,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',0,0.0000,0.0000,'SELLER',130.9276,639.0724,NULL),
('06b2bf38-06ed-4642-8f51-1143183ffb00','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777405956329','TRY','2026-04-27 15:27:00','2026-04-27 15:26:08',1,924.0000,0.0000,154.0000,0.0000,154.0000,924.0000,770.0000,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',1,0.0000,0.0000,'SELLER',0.0000,0.0000,NULL),
('85affd6d-ac73-4e03-a35c-1d1eedf58a61','c32beff3-1fcc-410a-9562-debe2d5e40bc','5e72f829-e4ed-4ccd-8971-509708f42212','2026-04','TRY','2026-04-29 14:37:00','2026-04-27 15:24:29',4,9696.0000,0.0000,1616.0000,0.0000,1616.0000,9696.0000,8080.0000,'bd8e8e57-269a-4d27-b1ad-698289104c89',0,0.0000,0.0000,'SELLER',969.8975,7110.1025,NULL),
('8327a2fe-61ad-4b63-b835-271951008ffa','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-29_OLD_1777464148535','TRY','2026-04-29 14:37:00','2026-04-29 14:29:06',5,150.0721,16.1705,25.0120,2.6951,22.3169,133.9016,111.5847,'bd8e8e57-269a-4d27-b1ad-698289104c89',1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('f91e297d-b747-487a-87d6-27e9826e5d09','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777464153023','TRY','2026-04-28 23:03:02','2026-04-28 23:02:22',1,924.0000,0.0000,154.0000,0.0000,154.0000,924.0000,770.0000,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',1,0.0000,0.0000,'SELLER',130.9276,639.0724,NULL),
('d0ea787a-10b7-411e-9b86-2db1c7c07f69','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-29_OLD_1777459000668','TRY','2026-04-29 13:26:00','2026-04-29 13:25:30',1,25.1705,0.0000,4.1951,0.0000,4.1951,25.1705,20.9754,'2684e28d-ff4b-49c1-9da0-d445df284489',1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('a226bfb4-87f5-4f67-afc6-32d39cbbd009','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-29_OLD_1777460204167','TRY','2026-04-29 13:48:00','2026-04-29 13:47:31',1,25.1705,0.0000,4.1951,0.0000,4.1951,25.1705,20.9754,'2684e28d-ff4b-49c1-9da0-d445df284489',1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('5019d0a5-0a72-4cc3-960d-35ffdbf53cbb','b9243d78-24fd-4f05-964f-dcb12547ba7f','c783e9dc-07aa-4fe4-95e9-be16246156bb','ALL','TRY','2026-04-29 14:37:00','2026-04-28 23:04:01',6,4277.0000,357.0000,505.5605,33.5909,471.9696,3920.0000,3448.0304,'bd8e8e57-269a-4d27-b1ad-698289104c89',0,0.0000,0.0000,'SELLER',632.7339,2815.2965,NULL),
('93fe580c-0572-46cf-9297-3e293eabb706','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-29_OLD_1777462146442','TRY','2026-04-29 14:21:00','2026-04-29 13:56:44',4,125.1933,16.1705,20.8655,2.6951,18.1704,109.0228,90.8524,'2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4',1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('4487e820-9cb7-4619-b4a7-417412fee204','00603de7-3573-4be2-b952-1d2a093e5d24','5e72f829-e4ed-4ccd-8971-509708f42212','2026-04-29','TRY','2026-04-29 14:37:00','2026-04-29 13:25:30',5,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,'bd8e8e57-269a-4d27-b1ad-698289104c89',0,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('63589806-c680-43fe-b90e-49414c4d8838','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777466128422','TRY','2026-04-29 15:03:00','2026-04-29 15:02:33',1,924.0000,0.0000,154.0000,0.0000,154.0000,924.0000,770.0000,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',1,0.0000,0.0000,'SELLER',130.9276,639.0724,NULL),
('ee717261-a13e-48b9-952f-498924c522b8','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777402498761','TRY','2026-04-28 18:23:00','2026-04-28 18:22:50',1,38.5000,0.0000,6.4200,0.0000,6.4200,38.5000,-6.4200,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('f495dd9c-2ff1-4217-ba14-4c65e3ae348d','72cf238e-a96a-44a2-b7b6-1c185a1df3a7','5e72f829-e4ed-4ccd-8971-509708f42212','2026-04-29','TRY','2026-04-29 14:37:00','2026-04-29 13:25:29',2,2424.0000,0.0000,404.0000,0.0000,404.0000,2424.0000,2020.0000,'bd8e8e57-269a-4d27-b1ad-698289104c89',0,0.0000,0.0000,'SELLER',242.5356,1777.4644,NULL),
('aea7fb2a-90c2-49b7-8a98-57b60b17e52a','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777462145072','TRY','2026-04-28 23:03:02','2026-04-28 23:02:05',1,38.5000,0.0000,6.4167,0.0000,6.4167,38.5000,32.0833,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('63787963-e918-4a90-9f9d-57bebb5097ee','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-29','TRY','2026-04-29 15:03:00','2026-04-29 15:02:28',5,150.0721,16.1705,25.0120,2.6951,22.3169,133.9016,111.5847,'2684e28d-ff4b-49c1-9da0-d445df284489',0,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('8aecce76-79f6-443d-aeaf-65282aa727a4','00603de7-3573-4be2-b952-1d2a093e5d24','5e72f829-e4ed-4ccd-8971-509708f42212','2026-04-27','TRY',NULL,'2026-04-27 15:26:08',1,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,NULL,0,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('471bec87-227f-4069-8223-7546a8fec1a3','b9243d78-24fd-4f05-964f-dcb12547ba7f','c783e9dc-07aa-4fe4-95e9-be16246156bb','ALL_OLD_1777406641298','TRY','2026-04-27 15:27:05','2026-04-27 15:26:08',1,924.0000,0.0000,154.0000,0.0000,154.0000,924.0000,770.0000,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',1,0.0000,0.0000,'SELLER',0.0000,0.0000,NULL),
('33fc12b2-171a-401c-b9db-7f71b4880724','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777387517885','TRY','2026-04-28 11:49:00','2026-04-28 11:48:18',1,38.5000,0.0000,6.4200,0.0000,6.4200,38.5000,32.0800,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('9c7422e4-3962-4861-8ac1-81a0dff65b04','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-29_OLD_1777464152439','TRY','2026-04-29 14:37:00','2026-04-29 13:47:50',5,3353.0000,357.0000,351.5605,33.5909,317.9696,2996.0000,2678.0304,'bd8e8e57-269a-4d27-b1ad-698289104c89',1,0.0000,0.0000,'SELLER',501.8063,2176.2241,NULL),
('810407ad-10a2-42e1-b00c-8407d5f48cf6','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777299098758','TRY','2026-04-27 17:00:05','2026-04-27 16:58:39',1,38.5000,0.0000,7.7000,0.0000,7.7000,38.5000,-7.7000,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('e091567a-2659-4103-b914-8841d05d70c7','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777297048988','TRY',NULL,'2026-04-27 15:28:27',1,38.5000,0.0000,0.0000,0.0000,0.0000,38.5000,0.0000,NULL,1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('595c6d02-8688-4c42-9ff3-8af21355e168','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777366098812','TRY','2026-04-27 17:12:00','2026-04-27 17:11:38',1,38.5000,0.0000,6.4200,0.0000,6.4200,38.5000,-6.4200,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('a1df7c7a-59b1-4b8c-b6ab-97bf3ff91854','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-29','TRY','2026-04-29 15:36:00','2026-04-29 15:35:27',5,3353.0000,357.0000,351.5605,33.5909,317.9696,2996.0000,2678.0304,'2684e28d-ff4b-49c1-9da0-d445df284489',0,0.0000,0.0000,'SELLER',469.4653,2208.5651,NULL),
('71681f78-40d6-4835-b914-990d1737a307','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777406542587','TRY','2026-04-28 22:53:00','2026-04-28 22:52:36',1,924.0000,0.0000,154.0000,0.0000,154.0000,924.0000,770.0000,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',1,0.0000,0.0000,'SELLER',130.9276,639.0724,NULL),
('9f84f59b-84e6-4922-b0d5-b319097ab737','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777292907760','TRY',NULL,'2026-04-27 15:26:08',1,38.5000,0.0000,0.0000,0.0000,0.0000,38.5000,0.0000,NULL,1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('50b4c024-5bfa-47f0-b0c6-b6d0631698da','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27','TRY','2026-04-29 15:03:00','2026-04-29 15:02:26',1,38.5000,0.0000,6.4167,0.0000,6.4167,38.5000,32.0833,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',0,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('9e17a395-48b9-4c96-ae84-b831b5618d01','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777297758870','TRY',NULL,'2026-04-27 16:37:29',1,38.5000,0.0000,0.0000,0.0000,0.0000,38.5000,0.0000,NULL,1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('8dff9e4b-8379-4ca6-a716-babfcf156f0e','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777298319287','TRY','2026-04-27 16:55:00','2026-04-27 16:54:58',1,38.5000,0.0000,7.7000,0.0000,7.7000,38.5000,-7.7000,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('6e2ccf40-e32c-4ee8-a776-bf67e502f7b2','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777298098542','TRY','2026-04-27 16:50:00','2026-04-27 16:49:18',1,38.5000,0.0000,0.0000,0.0000,0.0000,38.5000,0.0000,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('ce4cae68-03ea-403e-b66f-c1f3b753df72','72cf238e-a96a-44a2-b7b6-1c185a1df3a7','5e72f829-e4ed-4ccd-8971-509708f42212','2026-04-27','TRY','2026-04-27 15:27:00','2026-04-27 15:24:28',2,7272.0000,0.0000,1212.0000,0.0000,1212.0000,7272.0000,6060.0000,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',0,0.0000,0.0000,'SELLER',0.0000,0.0000,NULL),
('e53c552b-b338-4d04-bf6c-c4925eca9b21','882e1a6e-743e-4592-9266-8ff803261e2c','cbf3e25f-5586-4e5c-b0d8-7463a83da274','2026-04-29','TRY','2026-04-29 14:37:00','2026-04-29 13:25:30',5,0.5833,0.0000,0.0972,0.0000,0.0972,0.5833,0.4861,'bd8e8e57-269a-4d27-b1ad-698289104c89',0,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('879692ef-41e2-45b9-948b-caf9e3735e95','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777389770453','TRY','2026-04-28 17:46:00','2026-04-28 17:45:17',1,38.5000,0.0000,6.4200,0.0000,6.4200,38.5000,-6.4200,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('8f4c6a7a-fce7-4813-a44a-cc650a169a16','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777406525769','TRY','2026-04-28 22:53:00','2026-04-28 22:52:32',1,38.5000,0.0000,6.4167,0.0000,6.4167,38.5000,32.0833,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('643e8f92-73cd-407b-a550-d255786194c4','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-29_OLD_1777459670587','TRY','2026-04-29 13:26:00','2026-04-29 13:25:30',1,573.0000,0.0000,69.5909,0.0000,69.5909,573.0000,503.4091,'2684e28d-ff4b-49c1-9da0-d445df284489',1,0.0000,0.0000,'SELLER',82.5024,420.9067,NULL),
('512b2287-4459-4385-819c-d86d151b8e28','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-27_OLD_1777405952193','TRY','2026-04-28 21:55:00','2026-04-28 21:54:58',1,38.5000,0.0000,6.4200,0.0000,6.4200,38.5000,32.0800,'86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('90e6d8a3-ac2c-4b05-9edb-da74390bbf55','9e72b629-d785-47b7-b945-32cdd253023c','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-29_OLD_1777459651263','TRY','2026-04-29 13:37:00','2026-04-29 13:36:40',1,25.1705,0.0000,4.1951,0.0000,4.1951,25.1705,20.9754,'2684e28d-ff4b-49c1-9da0-d445df284489',1,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('6d10e110-fb7d-4b7c-b73b-df88a29f9055','153d7879-0137-4bd3-b449-cbbf99b3e914','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','2026-04-29','TRY','2026-04-29 14:37:00','2026-04-29 13:25:30',5,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,'bd8e8e57-269a-4d27-b1ad-698289104c89',0,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL),
('78273a0f-8c87-4bfa-98ef-e778dcfc3d71','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-29_OLD_1777466127786','TRY','2026-04-29 15:03:00','2026-04-29 15:02:32',5,3353.0000,357.0000,351.5605,33.5909,317.9696,2996.0000,2678.0304,'fadd1328-7198-408e-8405-9eda402b9dda',1,0.0000,0.0000,'SELLER',501.8063,2176.2241,NULL),
('26fca8ea-1019-4114-935e-fa5ea0813209','b173d78d-111d-4a15-8f62-bd29d0f75eee','cbf3e25f-5586-4e5c-b0d8-7463a83da274','2026-04-29','TRY','2026-04-29 13:26:00','2026-04-29 13:25:30',1,14.0000,0.0000,2.3333,0.0000,2.3333,14.0000,11.6667,'2684e28d-ff4b-49c1-9da0-d445df284489',0,0.0000,0.0000,'SELLER',1.9841,9.6826,NULL);
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
('bd504054-737e-4a51-b93c-00a722f4b66b','5019d0a5-0a72-4cc3-960d-35ffdbf53cbb','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-29 11:37:00','2026-04-28 20:05:00',3,60.4583),
('846498f7-95fc-44f2-9d78-00ecff07ff17','78273a0f-8c87-4bfa-98ef-e778dcfc3d71','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 12:03:00','2026-04-29 12:03:00',2,166.2426),
('27715b01-152c-4837-a971-0579b1d1d9d2','5019d0a5-0a72-4cc3-960d-35ffdbf53cbb','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-29 11:37:00','2026-04-28 20:05:00',2,427.9913),
('0445e86c-b3f4-4ccd-b063-05df1137b03b','336752db-6218-47e2-afc7-78d18cd53395','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive',NULL,1,'2026-04-20 23:32:20','2026-04-20 23:32:20',3,0.5417),
('5bd83517-85cc-4c08-a5bd-0652fbc36034','6e2ccf40-e32c-4ee8-a776-bf67e502f7b2','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 13:50:00','2026-04-27 13:50:00',2,0.0000),
('c5518976-de32-4836-9de4-0aaf7f1c2773','e8de1e2f-5d3a-43c1-8473-ca7884f99fc6','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',2,848.4921),
('25f5eb4e-8faa-4f23-88b4-0da5f2b0a42d','f91e297d-b747-487a-87d6-27e9826e5d09','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-28 20:03:00','2026-04-28 20:03:00',2,92.4276),
('585c5505-0aff-48e9-a6ac-1117967b4ffa','810407ad-10a2-42e1-b00c-8407d5f48cf6','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-27 14:00:05','2026-04-27 14:00:05',1,0.0000),
('3cdc2df5-58e7-455e-97f4-1172b727c84b','5808b074-d7bd-4d17-b35f-552f36e5a008','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',2,848.4921),
('fa0c309b-6d8c-4e33-9875-11c0adb934d6','78273a0f-8c87-4bfa-98ef-e778dcfc3d71','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-29 12:03:00','2026-04-29 12:03:00',1,501.8063),
('427a8f2e-73e2-4716-acb7-121e0da005ad','fafdf9a0-f5c0-4678-954f-3c1831d5403c','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 11:56:08','2026-04-27 11:56:08',2,0.0000),
('69912405-10d2-4928-ad32-140f3dac4859','5019d0a5-0a72-4cc3-960d-35ffdbf53cbb','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 11:37:00','2026-04-28 20:05:00',2,204.7426),
('d34ac3df-5f7b-4bb3-9bce-15a4f18b248f','879692ef-41e2-45b9-948b-caf9e3735e95','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-28 14:46:00','2026-04-28 14:46:00',2,92.4276),
('48eec6dd-0951-4e0c-8d24-1649c389141c','28a71334-3df6-44ce-836c-6b55f41cdd86','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',2,0.0000),
('e48d5fc5-5705-4c6a-9410-1825a3cc1afe','26fca8ea-1019-4114-935e-fa5ea0813209','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-29 10:26:00','2026-04-29 10:26:00',2,1.4008),
('ad3d389f-7f89-4c05-9921-187796f26eb9','8aecce76-79f6-443d-aeaf-65282aa727a4','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 12:27:00','2026-04-27 12:27:00',2,0.0000),
('e23140d5-4c4e-4551-b5bb-1b232ca8f3aa','33fc12b2-171a-401c-b9db-7f71b4880724','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-28 08:49:00','2026-04-28 08:49:00',1,0.0000),
('fc406fa9-1a1e-4386-b757-1da4134bae8e','78273a0f-8c87-4bfa-98ef-e778dcfc3d71','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-29 12:03:00','2026-04-29 12:03:00',2,335.5637),
('fc3ebd38-e4a0-4290-9c9c-1e31a94ebb05','512b2287-4459-4385-819c-d86d151b8e28','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-28 18:55:00','2026-04-28 18:55:00',2,0.0000),
('a12cf1e1-e298-4ab5-894d-1e7678a68324','9c7422e4-3962-4861-8ac1-81a0dff65b04','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-04-29 11:21:00','2026-04-29 10:58:00',3,4.3750),
('86add25d-85b5-4599-b4b0-234d935ac62d','63589806-c680-43fe-b90e-49414c4d8838','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-29 12:03:00','2026-04-29 12:03:00',3,38.5000),
('a7f0306c-d149-4f17-a41c-23789169ad21','f78ba73c-5618-4679-8fa4-055750addf9c','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 11:30:00','2026-04-29 11:30:00',2,0.0000),
('04034b7e-bab4-42c0-8b7c-24a24ac3388d','06b2bf38-06ed-4642-8f51-1143183ffb00','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 12:27:00','2026-04-27 12:27:00',2,38.5000),
('ead3eb17-1386-433d-afaf-24d24a4018c8','643e8f92-73cd-407b-a550-d255786194c4','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-04-29 10:26:00','2026-04-29 10:26:00',3,15.5455),
('9e6b51cd-f866-4368-a7be-26a0309d925e','63589806-c680-43fe-b90e-49414c4d8838','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-29 12:03:00','2026-04-29 12:03:00',1,130.9276),
('05a3e35d-1c29-45e4-b672-26d370cd105c','f91e297d-b747-487a-87d6-27e9826e5d09','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-28 20:03:00','2026-04-28 20:03:00',3,38.5000),
('80d8d5fb-8eb6-4b5b-93f6-288a98824fb9','93fe580c-0572-46cf-9297-3e293eabb706','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-29 10:57:00','2026-04-29 10:57:00',1,0.0000),
('5f7a516b-4701-4ebf-839c-296df2e0c00f','85affd6d-ac73-4e03-a35c-1d1eedf58a61','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 12:25:00','2026-04-27 12:25:00',2,0.0000),
('279d83a9-8bd2-45a2-904d-2bafbdfdac0d','ce4cae68-03ea-403e-b66f-c1f3b753df72','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-27 12:27:00','2026-04-27 12:25:00',1,727.3619),
('735741bd-05ef-4a59-81f8-2e5a19f36565','81d8a0a1-19f2-4388-8fb5-893c3214080a','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-27 11:46:00','2026-04-27 11:46:00',2,72.4079),
('9fefeaee-0724-4a0d-9198-2e7fd7c5c591','8aecce76-79f6-443d-aeaf-65282aa727a4','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-27 12:27:00','2026-04-27 12:27:00',1,0.0000),
('4876e5be-4357-4127-a459-30629cbb701e','7f2f5e33-996c-48a2-8dde-8a6e620b14fb','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics',NULL,1,'2026-04-20 23:32:20','2026-04-20 23:32:20',3,0.0000),
('66b36f7d-c955-4014-af95-31f2d682078c','71ff13da-f920-431c-8da5-6dc72f8e3685','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',1,848.4921),
('0cc13407-2e9f-4112-9715-34c11c8fd0b8','879692ef-41e2-45b9-948b-caf9e3735e95','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-28 14:46:00','2026-04-28 14:46:00',2,0.0000),
('224f5194-e844-4905-aa06-35c681885136','71ff13da-f920-431c-8da5-6dc72f8e3685','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',2,0.0000),
('80885c4a-b917-4fc8-a000-369455fd5521','5808b074-d7bd-4d17-b35f-552f36e5a008','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',1,848.4921),
('b169230e-7ad0-425c-86ec-36a14968d853','8e7596af-f19c-46b2-ba03-29fb4b39a649','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-22 19:42:00','2026-04-22 19:42:00',2,46.7278),
('e72863df-26a0-4e07-a590-36e333ad6788','93fe580c-0572-46cf-9297-3e293eabb706','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 10:57:00','2026-04-29 10:57:00',2,0.0000),
('4a9e1e84-1ba3-41ff-878c-3d9a34e6852c','d210c836-3c7d-451a-97bd-c5d6ee970b79','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-27 12:15:00','2026-04-27 11:46:00',1,284.9469),
('bc1ebef8-9b11-493d-9e37-3da60427a5a8','81d8a0a1-19f2-4388-8fb5-893c3214080a','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-27 11:46:00','2026-04-27 11:46:00',3,28.0000),
('ccb2562b-ce51-4cbd-a95d-3dd5bdbbf27c','aea7fb2a-90c2-49b7-8a98-57b60b17e52a','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-28 20:03:02','2026-04-28 20:03:02',1,0.0000),
('b1916db4-4c0e-4f33-92c5-3fd57c1835f8','953a9824-d657-486f-af33-0329b1872e74','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',2,0.0000),
('8c71f71f-0a55-4073-b7da-4052acfc9340','8f4c6a7a-fce7-4813-a44a-cc650a169a16','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-28 19:53:00','2026-04-28 19:53:00',2,0.0000),
('851e3c3e-bf08-4bf1-8e52-47ff9b4aab08','f91e297d-b747-487a-87d6-27e9826e5d09','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-28 20:03:00','2026-04-28 20:03:00',2,38.5000),
('e7ba30a5-2af0-4a82-ac9d-48c71d53e622','a1df7c7a-59b1-4b8c-b6ab-97bf3ff91854','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 12:36:00','2026-04-29 12:36:00',2,133.9016),
('cf9b186a-b291-4920-b3cf-49bcec412ca3','e53c552b-b338-4d04-bf6c-c4925eca9b21','cbf3e25f-5586-4e5c-b0d8-7463a83da274','REPORT_TOTAL',NULL,1,'2026-04-29 10:26:00','2026-04-29 10:26:00',1,0.0000),
('ee6efe37-56de-4391-af85-4ad234de09aa','838e6f8f-7ca1-4900-a8c7-0a6e5541c341','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-29 12:36:00','2026-04-29 12:36:00',2,92.4276),
('82b24953-3484-41ff-a2fa-4c83ffb62085','643e8f92-73cd-407b-a550-d255786194c4','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-29 10:26:00','2026-04-29 10:26:00',2,57.3319),
('cb9e5876-7eb2-4ee8-a476-4d339bce02ad','a1df7c7a-59b1-4b8c-b6ab-97bf3ff91854','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-04-29 12:36:00','2026-04-29 12:36:00',3,108.8183),
('690b9d28-212d-4c05-93ed-4ea1938673bd','81d8a0a1-19f2-4388-8fb5-893c3214080a','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-04-27 11:46:00','2026-04-27 11:46:00',3,2.1667),
('66dbc04c-9a23-46bc-9003-510a910c2f62','382c41c5-09e4-4e0d-851a-889fb89003d8','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',2,0.0000),
('fcb1d43d-7c83-4a0e-8817-538faf7f5a38','f495dd9c-2ff1-4217-ba14-4c65e3ae348d','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-29 11:37:00','2026-04-29 10:26:00',1,242.5356),
('4cc0e36e-be4d-44c2-81fd-55225f11eba3','838e6f8f-7ca1-4900-a8c7-0a6e5541c341','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-29 12:36:00','2026-04-29 12:36:00',1,130.9276),
('b5be08bc-9c5f-433d-8980-557c1814d9c8','e8de1e2f-5d3a-43c1-8473-ca7884f99fc6','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',1,848.4921),
('1105dbc8-441f-4c84-9e84-5591712e9c4f','5808b074-d7bd-4d17-b35f-552f36e5a008','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-27 11:55:00','2026-04-27 11:55:00',3,0.0000),
('4ea359f5-9f85-4455-98e8-559e5baf396a','9e17a395-48b9-4c96-ae84-b831b5618d01','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-27 13:38:00','2026-04-27 13:38:00',1,0.0000),
('c30279a3-646d-4bee-a3ce-560243521ade','336752db-6218-47e2-afc7-78d18cd53395','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-20 23:32:20','2026-04-20 23:32:20',1,67.4817),
('ea122698-e4e8-428c-a65a-56a5007eeb86','643e8f92-73cd-407b-a550-d255786194c4','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-29 10:26:00','2026-04-29 10:26:00',1,82.5024),
('ebadcd54-e9b5-4441-aee3-56aa6ea19bff','e091567a-2659-4103-b914-8841d05d70c7','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 12:29:00','2026-04-27 12:29:00',2,0.0000),
('1c2ab55f-b6e3-4746-a8c6-56f47e816d36','73894ef8-cd1d-4141-a5a2-d86d487bccf2','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 11:56:08','2026-04-27 11:56:08',2,0.0000),
('9feb6f35-c4b8-41ac-a920-56fc46e32234','63787963-e918-4a90-9f9d-57bebb5097ee','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 12:03:00','2026-04-29 12:03:00',2,0.0000),
('6211d763-77c4-4afd-9a52-5de5005d892d','879692ef-41e2-45b9-948b-caf9e3735e95','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-28 14:46:00','2026-04-28 14:46:00',1,92.4276),
('2e5e1bca-ab39-485f-864a-5f44610f1990','ce4cae68-03ea-403e-b66f-c1f3b753df72','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-27 12:27:00','2026-04-27 12:25:00',2,727.3619),
('232c2e86-8d2b-46c1-b90a-5f9c60804158','336752db-6218-47e2-afc7-78d18cd53395','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:books_media',NULL,1,'2026-04-20 23:32:20','2026-04-20 23:32:20',3,15.5455),
('3d877a18-a061-4e8a-9b5a-61549b06efac','fafdf9a0-f5c0-4678-954f-3c1831d5403c','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-27 11:56:08','2026-04-27 11:56:08',2,848.4921),
('7c7395dc-8a54-4393-b24b-657dfd66029b','85affd6d-ac73-4e03-a35c-1d1eedf58a61','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-29 11:37:00','2026-04-27 12:25:00',1,969.8975),
('45aa67fe-d814-41f9-8c4c-665bd993b216','9f84f59b-84e6-4922-b0d5-b319097ab737','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 12:27:04','2026-04-27 12:27:04',2,0.0000),
('9ba52013-cbc4-4071-a6a2-67b549525891','9e17a395-48b9-4c96-ae84-b831b5618d01','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 13:38:00','2026-04-27 13:38:00',2,0.0000),
('1f1242af-e346-4f26-aa36-686c917f8ae0','8e7596af-f19c-46b2-ba03-29fb4b39a649','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-22 19:42:00','2026-04-22 19:42:00',2,20.7539),
('6a2a04f4-7492-454e-92b2-68a93b453377','71681f78-40d6-4835-b914-990d1737a307','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-28 19:53:00','2026-04-28 19:53:00',3,38.5000),
('5c733918-cf05-4e70-b7dd-6a8e4b66457e','4625f49a-e5e2-4000-9dc8-a02a47360fc3','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-22 11:40:00','2026-04-22 11:40:00',3,4.6667),
('9548d2a2-74ed-469f-a087-6b038c4c2a63','78273a0f-8c87-4bfa-98ef-e778dcfc3d71','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-04-29 12:03:00','2026-04-29 12:03:00',3,4.3750),
('97e2e584-31cd-40ae-9662-6b2d429a305d','8e7596af-f19c-46b2-ba03-29fb4b39a649','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-22 19:42:00','2026-04-22 19:42:00',3,4.6667),
('e6945e7c-312f-46e2-9fb0-6ec6855ef9a7','9c7422e4-3962-4861-8ac1-81a0dff65b04','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-29 11:37:00','2026-04-29 10:48:00',2,335.5637),
('7139b30b-67da-4faf-b188-70eb0e2ac829','71681f78-40d6-4835-b914-990d1737a307','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-28 19:53:00','2026-04-28 19:53:00',1,130.9276),
('5188be76-fb7f-40ea-87bc-7150e7be8a35','06b2bf38-06ed-4642-8f51-1143183ffb00','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-27 12:27:00','2026-04-27 12:27:00',1,130.9276),
('e8ed8176-bcec-4bff-81da-7171eee1fbb5','26fca8ea-1019-4114-935e-fa5ea0813209','cbf3e25f-5586-4e5c-b0d8-7463a83da274','REPORT_TOTAL',NULL,1,'2026-04-29 10:26:00','2026-04-29 10:26:00',1,1.9841),
('76ccee57-4fde-46c3-bc15-72ee5942557f','a1df7c7a-59b1-4b8c-b6ab-97bf3ff91854','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-29 12:36:00','2026-04-29 12:36:00',3,21.9583),
('d00fa7bd-121f-446f-a736-7b4b26c844e0','8f1ac32b-0e44-4979-97b1-9bff7d2bb93d','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics',NULL,1,'2026-04-20 23:32:20','2026-04-20 23:32:20',3,4.6667),
('69b4bb76-5ad9-4308-b895-7bb7dd1786a6','f495dd9c-2ff1-4217-ba14-4c65e3ae348d','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-29 11:37:00','2026-04-29 10:26:00',2,242.5356),
('d13f9e16-9368-4c62-9b4b-7dee8a03f09d','d210c836-3c7d-451a-97bd-c5d6ee970b79','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-27 12:15:00','2026-04-27 11:46:00',3,34.6667),
('9fbd2648-5584-46f7-85ac-7f71ee1dd66e','5019d0a5-0a72-4cc3-960d-35ffdbf53cbb','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-04-29 11:21:00','2026-04-29 10:58:00',3,4.3750),
('c9bc25c7-5793-4f2e-8e82-80efd25465cf','9c7422e4-3962-4861-8ac1-81a0dff65b04','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-29 11:37:00','2026-04-29 10:48:00',1,501.8063),
('6dc12fe7-52a0-4026-9b3e-81085db8d6b9','512b2287-4459-4385-819c-d86d151b8e28','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-28 18:55:00','2026-04-28 18:55:00',1,0.0000),
('fe93cc19-bf86-46d7-93b6-82b52826fdfa','e091567a-2659-4103-b914-8841d05d70c7','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-27 12:29:00','2026-04-27 12:29:00',1,0.0000),
('91fcb7cb-6c3e-44b2-a77a-8656504e2cef','8f1ac32b-0e44-4979-97b1-9bff7d2bb93d','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-20 23:32:20','2026-04-20 23:32:20',2,46.7278),
('dd644ce2-f53a-4a38-a56a-882edd401cbe','63589806-c680-43fe-b90e-49414c4d8838','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-29 12:03:00','2026-04-29 12:03:00',2,92.4276),
('f4a757ca-d5fc-4d42-aa46-885989601280','06b2bf38-06ed-4642-8f51-1143183ffb00','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-27 12:27:00','2026-04-27 12:27:00',3,38.5000),
('b5cb5ddb-2ccb-42fa-b836-8a1b420ad200','471bec87-227f-4069-8223-7546a8fec1a3','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-27 12:27:05','2026-04-27 12:27:05',1,130.9276),
('4cb22001-dc74-486f-b1ba-8abb6fc83b11','f78ba73c-5618-4679-8fa4-055750addf9c','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-29 11:30:00','2026-04-29 11:30:00',1,0.0000),
('ad06e116-b955-42de-9344-8b4aeafe46c5','85affd6d-ac73-4e03-a35c-1d1eedf58a61','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-27 12:25:00','2026-04-27 12:25:00',3,0.0000),
('4d32024c-5931-49ca-9373-8c0ecac01828','4625f49a-e5e2-4000-9dc8-a02a47360fc3','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-22 11:40:00','2026-04-22 11:40:00',1,67.4817),
('d6191165-9e30-4562-a865-8c3fde090615','9c7422e4-3962-4861-8ac1-81a0dff65b04','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-29 11:37:00','2026-04-29 10:48:00',3,21.9583),
('85829c2e-839d-4abb-88de-8f1cd247f934','e8de1e2f-5d3a-43c1-8473-ca7884f99fc6','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',2,0.0000),
('d6455917-d9d7-4cf6-8286-8f71d229a034','33fc12b2-171a-401c-b9db-7f71b4880724','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-28 08:49:00','2026-04-28 08:49:00',2,0.0000),
('ede1fccf-8536-4de9-8599-9063eda3d299','a226bfb4-87f5-4f67-afc6-32d39cbbd009','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 10:48:00','2026-04-29 10:48:00',2,0.0000),
('b9d6e014-fc3e-4fc7-8dd1-940a3733156d','e8de1e2f-5d3a-43c1-8473-ca7884f99fc6','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-27 11:55:00','2026-04-27 11:55:00',3,0.0000),
('a72ac8ab-de3f-4e07-8312-94ec97a27239','71ff13da-f920-431c-8da5-6dc72f8e3685','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-27 11:55:00','2026-04-27 11:55:00',3,0.0000),
('dc0fbd4b-ebdc-424b-863f-966310ca38c2','d0ea787a-10b7-411e-9b86-2db1c7c07f69','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-29 10:26:00','2026-04-29 10:26:00',1,0.0000),
('ac6bc0a2-7565-4dee-8996-977ed7cbc3fc','73894ef8-cd1d-4141-a5a2-d86d487bccf2','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-27 11:56:08','2026-04-27 11:56:08',2,848.4921),
('76cafc18-b707-49d4-8c62-98238a4755bf','4625f49a-e5e2-4000-9dc8-a02a47360fc3','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-22 11:40:00','2026-04-22 11:40:00',2,20.7539),
('f9f944e8-7b3a-4c20-a090-9a2e369f853d','81d8a0a1-19f2-4388-8fb5-893c3214080a','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 11:46:00','2026-04-27 11:46:00',2,30.1667),
('ad10a99e-cc81-49d3-9e77-9ae9fe365af9','8f1ac32b-0e44-4979-97b1-9bff7d2bb93d','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:books_media',NULL,1,'2026-04-20 23:32:20','2026-04-20 23:32:20',3,15.5455),
('830c0c8b-0876-47ca-901b-9b3c1ced1b3f','6e2ccf40-e32c-4ee8-a776-bf67e502f7b2','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-27 13:50:00','2026-04-27 13:50:00',1,0.0000),
('ff299308-1e0a-4a89-9e92-9d5987c78765','8dff9e4b-8379-4ca6-a716-babfcf156f0e','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 13:55:00','2026-04-27 13:55:00',2,0.0000),
('9970b2b8-13e4-4510-abb7-9e00374d4c76','7f2f5e33-996c-48a2-8dde-8a6e620b14fb','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-20 23:32:20','2026-04-20 23:32:20',1,121.2722),
('b9132d14-7664-47a3-9a37-9e151e590133','09c6dad1-b374-4a37-bf9e-0921905af675','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 12:27:05','2026-04-27 12:27:05',2,0.0000),
('46d9a671-1294-47b2-908e-9e53e442eac2','4625f49a-e5e2-4000-9dc8-a02a47360fc3','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-04-22 11:40:00','2026-04-22 11:40:00',3,15.5455),
('8435ea56-3d86-44c4-94ae-9ebfdb7d7034','6d10e110-fb7d-4b7c-b73b-df88a29f9055','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 10:26:00','2026-04-29 10:26:00',2,0.0000),
('f7b6e90b-8427-490f-8e25-a0eb4e29d5ff','71681f78-40d6-4835-b914-990d1737a307','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-28 19:53:00','2026-04-28 19:53:00',2,92.4276),
('9dfc1136-7a03-4649-b702-a1c59911bebc','ce4cae68-03ea-403e-b66f-c1f3b753df72','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-27 12:25:00','2026-04-27 12:25:00',3,0.0000),
('1f81f0f7-5a89-4990-8d81-a48181302b4d','8e7596af-f19c-46b2-ba03-29fb4b39a649','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-04-22 19:42:00','2026-04-22 19:42:00',3,15.5455),
('4ccee808-0ac1-42e7-a3d1-a524dba7f1d6','336752db-6218-47e2-afc7-78d18cd53395','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics',NULL,1,'2026-04-20 23:32:20','2026-04-20 23:32:20',3,4.6667),
('a3a1aaed-546d-4a8c-99cb-a6841002a169','ce4cae68-03ea-403e-b66f-c1f3b753df72','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 12:25:00','2026-04-27 12:25:00',2,0.0000),
('9201db9a-da5b-4912-8f89-a78263d76005','a1df7c7a-59b1-4b8c-b6ab-97bf3ff91854','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-04-29 12:36:00','2026-04-29 12:36:00',3,3.1250),
('6ce201b0-b281-4278-9fe5-a8367bb980c3','78273a0f-8c87-4bfa-98ef-e778dcfc3d71','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-29 12:03:00','2026-04-29 12:03:00',3,21.9583),
('1e029b35-925d-466f-8969-a940fe561208','28a71334-3df6-44ce-836c-6b55f41cdd86','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',2,848.4921),
('8dee52ab-a825-47fe-bb29-aa54abfe197f','8e7596af-f19c-46b2-ba03-29fb4b39a649','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-04-22 19:42:00','2026-04-22 19:42:00',3,0.5417),
('4de0aead-31e6-4e77-a8fa-ab005804706b','8e7596af-f19c-46b2-ba03-29fb4b39a649','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-22 19:42:00','2026-04-22 19:42:00',1,67.4817),
('9e76f0e9-084c-49ec-8a07-ac53a801f64f','a226bfb4-87f5-4f67-afc6-32d39cbbd009','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-29 10:48:00','2026-04-29 10:48:00',1,0.0000),
('d8ac156a-dc39-4959-91f7-ad3998909128','382c41c5-09e4-4e0d-851a-889fb89003d8','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',2,848.4921),
('00b5b0d1-a018-4cf2-be55-addbcb3b55e6','8f1ac32b-0e44-4979-97b1-9bff7d2bb93d','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-20 23:32:20','2026-04-20 23:32:20',1,67.4817),
('7f5d7ee6-d399-44c3-b572-b27cf4341ce9','5019d0a5-0a72-4cc3-960d-35ffdbf53cbb','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-29 11:37:00','2026-04-28 20:05:00',1,632.7339),
('901f5a7a-e863-4e47-8a43-b32ec722edde','595c6d02-8688-4c42-9ff3-8af21355e168','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 14:12:00','2026-04-27 14:12:00',2,0.0000),
('a34a8f24-599c-428b-8322-b464c1f8a201','d210c836-3c7d-451a-97bd-c5d6ee970b79','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-04-27 12:15:00','2026-04-27 12:08:00',3,46.6364),
('7af929cd-b865-4c82-8afa-b71bcff2d039','643e8f92-73cd-407b-a550-d255786194c4','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 10:26:00','2026-04-29 10:26:00',2,25.1705),
('1e6ee37c-936b-4234-8661-b968281297a1','4625f49a-e5e2-4000-9dc8-a02a47360fc3','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-04-22 11:40:00','2026-04-22 11:40:00',3,0.5417),
('f4ee4814-fe79-41ce-99d5-b9a30625bc5b','50b4c024-5bfa-47f0-b0c6-b6d0631698da','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-29 12:03:00','2026-04-29 12:03:00',1,0.0000),
('409aa139-f61a-4d14-8af0-ba56044d9f6f','78273a0f-8c87-4bfa-98ef-e778dcfc3d71','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-04-29 12:03:00','2026-04-29 12:03:00',3,139.9093),
('7a1992aa-54bc-4d1c-985a-baaf38f06f54','9c7422e4-3962-4861-8ac1-81a0dff65b04','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 11:37:00','2026-04-29 10:48:00',2,166.2426),
('9ac6c8bb-08ee-482e-b6d6-bb8c599f222c','8327a2fe-61ad-4b63-b835-271951008ffa','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 11:30:00','2026-04-29 11:30:00',2,0.0000),
('055fd85a-c240-4bbe-b334-bb9c7d56d36e','a1df7c7a-59b1-4b8c-b6ab-97bf3ff91854','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-29 12:36:00','2026-04-29 12:36:00',1,469.4653),
('b7bce8dd-4f5a-4fbc-a4f7-bb9ff6d69428','382c41c5-09e4-4e0d-851a-889fb89003d8','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-27 11:55:00','2026-04-27 11:55:00',3,0.0000),
('ce23f528-7941-4710-bc61-bc0afa8a58d0','8f1ac32b-0e44-4979-97b1-9bff7d2bb93d','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-20 23:32:20','2026-04-20 23:32:20',2,20.7539),
('5d54b470-938a-4400-9122-bc9162ea4153','fafdf9a0-f5c0-4678-954f-3c1831d5403c','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-27 11:56:08','2026-04-27 11:56:08',3,0.0000),
('3a9cb464-40a8-487b-9126-bd433b3c6101','8dff9e4b-8379-4ca6-a716-babfcf156f0e','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-27 13:55:00','2026-04-27 13:55:00',1,0.0000),
('b7fc949c-3f3c-4eb5-8c2c-be6d77c602b0','d210c836-3c7d-451a-97bd-c5d6ee970b79','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-27 12:15:00','2026-04-27 11:46:00',2,198.4354),
('f859f86d-9c37-4f62-bd8c-bf8565554ddc','ee717261-a13e-48b9-952f-498924c522b8','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-28 15:23:00','2026-04-28 15:23:00',2,0.0000),
('d0e4d3d8-ed7e-4c7c-859e-bf99afff9621','73894ef8-cd1d-4141-a5a2-d86d487bccf2','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-27 11:56:08','2026-04-27 11:56:08',3,0.0000),
('cd79e43a-0a6c-45dd-9c97-c287f1fc84e0','8f1ac32b-0e44-4979-97b1-9bff7d2bb93d','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive',NULL,1,'2026-04-20 23:32:20','2026-04-20 23:32:20',3,0.5417),
('645a39f6-11f7-4d1d-8d6e-c2d069dc3ac7','5019d0a5-0a72-4cc3-960d-35ffdbf53cbb','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-04-29 11:37:00','2026-04-29 10:26:00',3,139.9093),
('aaf4d389-fbf4-4a49-bb35-c2d2691273a2','73894ef8-cd1d-4141-a5a2-d86d487bccf2','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-27 11:56:08','2026-04-27 11:56:08',1,848.4921),
('1677426b-2353-4019-8297-c3da2f74b709','26fca8ea-1019-4114-935e-fa5ea0813209','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 10:26:00','2026-04-29 10:26:00',2,0.5833),
('72bb87b8-8535-4acf-8631-c51f82e41837','06b2bf38-06ed-4642-8f51-1143183ffb00','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-27 12:27:00','2026-04-27 12:27:00',2,92.4276),
('0ada4afd-a75b-47a8-b3be-c594ea5a6824','09c6dad1-b374-4a37-bf9e-0921905af675','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-04-27 12:27:05','2026-04-27 12:27:05',1,0.0000),
('38f4aa8d-cc56-4ebd-86bb-cb1dfe872fd5','6d10e110-fb7d-4b7c-b73b-df88a29f9055','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-04-29 10:26:00','2026-04-29 10:26:00',1,0.0000),
('8a9fb3fa-575b-43c3-97f7-cbb0064242e1','85affd6d-ac73-4e03-a35c-1d1eedf58a61','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-29 11:37:00','2026-04-27 12:25:00',2,969.8975),
('472d7013-07b2-4efe-8a33-cc077a216660','7f2f5e33-996c-48a2-8dde-8a6e620b14fb','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-20 23:32:20','2026-04-20 23:32:20',2,0.0000),
('d12e6e74-b700-4098-b9a1-cd25633f1326','7f2f5e33-996c-48a2-8dde-8a6e620b14fb','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-20 23:32:20','2026-04-20 23:32:20',2,121.2722),
('076110e6-179a-4bf0-8c45-cd49890df314','ee717261-a13e-48b9-952f-498924c522b8','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-28 15:23:00','2026-04-28 15:23:00',1,0.0000),
('975bd9af-fba2-4888-bded-cd6f48cc65c4','d210c836-3c7d-451a-97bd-c5d6ee970b79','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 12:15:00','2026-04-27 11:46:00',2,86.5115),
('96e55417-4173-4591-b85c-cdfec753986b','50b4c024-5bfa-47f0-b0c6-b6d0631698da','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 12:03:00','2026-04-29 12:03:00',2,0.0000),
('2e3a465d-87dd-4629-9719-cf40a8b9d084','382c41c5-09e4-4e0d-851a-889fb89003d8','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',1,848.4921),
('594959a2-738e-4552-8764-cf5da9e674a5','f495dd9c-2ff1-4217-ba14-4c65e3ae348d','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-29 10:26:00','2026-04-29 10:26:00',3,0.0000),
('8da6671e-f91e-4a48-9abc-cf66db821439','643e8f92-73cd-407b-a550-d255786194c4','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-29 10:26:00','2026-04-29 10:26:00',3,9.6250),
('23c86813-b4fe-447b-a753-d0986b791a7b','953a9824-d657-486f-af33-0329b1872e74','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-27 11:55:00','2026-04-27 11:55:00',3,0.0000),
('48aed8ce-13cf-4b12-9bc1-d2558cbb2bc6','63787963-e918-4a90-9f9d-57bebb5097ee','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-29 12:03:00','2026-04-29 12:03:00',1,0.0000),
('deed83b7-a18e-4284-ad88-d4eed09fd52c','71ff13da-f920-431c-8da5-6dc72f8e3685','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',2,848.4921),
('293b126e-8dba-4db3-bb36-d5a1b5478cad','336752db-6218-47e2-afc7-78d18cd53395','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-20 23:32:20','2026-04-20 23:32:20',2,20.7539),
('e19f1b11-0a52-41e5-a44d-d6362964904c','9c7422e4-3962-4861-8ac1-81a0dff65b04','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-04-29 11:37:00','2026-04-29 10:48:00',3,139.9093),
('1ddf2cbb-025a-4d76-8657-d8d149bbf159','9f84f59b-84e6-4922-b0d5-b319097ab737','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-27 12:27:04','2026-04-27 12:27:04',1,0.0000),
('ad52cf75-4808-4d71-a8de-d9dc91219b82','8f4c6a7a-fce7-4813-a44a-cc650a169a16','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-28 19:53:00','2026-04-28 19:53:00',1,0.0000),
('42d6e4fc-b954-45e0-ad9a-ddb6a05f1e1d','f495dd9c-2ff1-4217-ba14-4c65e3ae348d','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 10:26:00','2026-04-29 10:26:00',2,0.0000),
('fec4549f-bb80-4899-933e-dfdb82e2e1db','a1df7c7a-59b1-4b8c-b6ab-97bf3ff91854','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-29 12:36:00','2026-04-29 12:36:00',2,335.5637),
('32caacda-c136-4ab5-a4d5-e150b6436efb','81d8a0a1-19f2-4388-8fb5-893c3214080a','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-27 11:46:00','2026-04-27 11:46:00',1,102.5746),
('e779f04a-4499-4dff-aae0-e1ca3a4ef3c5','810407ad-10a2-42e1-b00c-8407d5f48cf6','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 14:00:05','2026-04-27 14:00:05',2,0.0000),
('9f24d6ce-78a2-44ad-bd6b-e2de71b0b1fd','fafdf9a0-f5c0-4678-954f-3c1831d5403c','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-27 11:56:08','2026-04-27 11:56:08',1,848.4921),
('b8d0189d-7e59-4a4f-b8c2-e34ed973427a','aea7fb2a-90c2-49b7-8a98-57b60b17e52a','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-28 20:03:02','2026-04-28 20:03:02',2,0.0000),
('aab0af48-a9c7-45d2-b44d-eac5287fa753','71681f78-40d6-4835-b914-990d1737a307','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-28 19:53:00','2026-04-28 19:53:00',2,38.5000),
('b193a75d-263c-47bb-bfb4-eb869d421219','e53c552b-b338-4d04-bf6c-c4925eca9b21','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 10:26:00','2026-04-29 10:26:00',2,0.0000),
('aa5f33c0-ecba-43f4-8b6d-ebb9994388e2','953a9824-d657-486f-af33-0329b1872e74','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',1,848.4921),
('1f799c38-4ed3-4235-bea0-ed2bb559ebfe','471bec87-227f-4069-8223-7546a8fec1a3','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 12:27:05','2026-04-27 12:27:05',2,38.5000),
('03550c1b-f95c-4f5b-aca3-eeec4bf57602','838e6f8f-7ca1-4900-a8c7-0a6e5541c341','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-29 12:36:00','2026-04-29 12:36:00',3,38.5000),
('da22de76-5d06-43c8-a5fb-ef14b9bdbb93','4487e820-9cb7-4619-b4a7-417412fee204','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-29 10:26:00','2026-04-29 10:26:00',1,0.0000),
('b1ecd086-ddd1-43e5-b65d-ef4e39ce5cd3','28a71334-3df6-44ce-836c-6b55f41cdd86','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-27 11:55:00','2026-04-27 11:55:00',3,0.0000),
('b90fea13-d65c-495a-853e-f0b0ddf01320','471bec87-227f-4069-8223-7546a8fec1a3','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-27 12:27:05','2026-04-27 12:27:05',2,92.4276),
('8ba2af9a-1efd-48cb-a3d6-f1b57e9e74d2','471bec87-227f-4069-8223-7546a8fec1a3','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-27 12:27:05','2026-04-27 12:27:05',3,38.5000),
('f794446c-511f-45e8-87d7-f27843576c55','838e6f8f-7ca1-4900-a8c7-0a6e5541c341','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 12:36:00','2026-04-29 12:36:00',2,38.5000),
('b39320fb-fd23-4632-8250-f4628e03c008','953a9824-d657-486f-af33-0329b1872e74','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',2,848.4921),
('b664cd46-19a7-4f5d-b8fa-f53ac990587c','4625f49a-e5e2-4000-9dc8-a02a47360fc3','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-22 11:40:00','2026-04-22 11:40:00',2,46.7278),
('f33af9e6-391a-4f25-bbd8-f5ccbdd7f1d5','595c6d02-8688-4c42-9ff3-8af21355e168','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-27 14:12:00','2026-04-27 14:12:00',1,0.0000),
('1a8b3d93-1447-4385-b973-f6bed734466b','d0ea787a-10b7-411e-9b86-2db1c7c07f69','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 10:26:00','2026-04-29 10:26:00',2,0.0000),
('f1540c2d-2c25-4d8e-b93c-f6f33046d728','90e6d8a3-ac2c-4b05-9edb-da74390bbf55','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-29 10:37:00','2026-04-29 10:37:00',1,0.0000),
('347703f0-678a-462b-b211-f763953c7fbe','f91e297d-b747-487a-87d6-27e9826e5d09','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-28 20:03:00','2026-04-28 20:03:00',1,130.9276),
('a3cc3576-92e3-4b52-ad09-fa8008f833e8','4487e820-9cb7-4619-b4a7-417412fee204','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 10:26:00','2026-04-29 10:26:00',2,0.0000),
('0042a428-4e69-4481-8fcf-fc7d72a82a1d','90e6d8a3-ac2c-4b05-9edb-da74390bbf55','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 10:37:00','2026-04-29 10:37:00',2,0.0000),
('bc4834a7-864b-4e2c-91c2-fcdcfa956dbc','8327a2fe-61ad-4b63-b835-271951008ffa','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-29 11:30:00','2026-04-29 11:30:00',1,0.0000),
('27ffa97d-5e4c-4fe7-a415-fe51b96fa522','28a71334-3df6-44ce-836c-6b55f41cdd86','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',1,848.4921),
('1189895e-90a9-44bd-a05d-fec242683e34','d210c836-3c7d-451a-97bd-c5d6ee970b79','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-04-27 12:15:00','2026-04-27 11:46:00',3,5.2084),
('2a927a46-08de-4869-93d1-fec324e3ad1a','5808b074-d7bd-4d17-b35f-552f36e5a008','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-27 11:55:00','2026-04-27 11:55:00',2,0.0000),
('301a0000-49d3-484c-b889-ff809f4b09b3','336752db-6218-47e2-afc7-78d18cd53395','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-20 23:32:20','2026-04-20 23:32:20',2,46.7278),
('1ff25dcf-739c-4f20-9818-ffc6535a0a1a','63589806-c680-43fe-b90e-49414c4d8838','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-29 12:03:00','2026-04-29 12:03:00',2,38.5000);
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
('7a1093e8-c2da-46e4-8f3a-02c11a2cbcfc','fadd1328-7198-408e-8405-9eda402b9dda','8327a2fe-61ad-4b63-b835-271951008ffa','','2026-04-29 14:30:00','COMPLETED','2026-04-29 11:30:00','2026-04-29 11:29:06','2026-04-29 14:30:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('16d10663-9754-413d-8693-0334f84615ad','2684e28d-ff4b-49c1-9da0-d445df284489','78273a0f-8c87-4bfa-98ef-e778dcfc3d71','','2026-04-29 15:03:00','COMPLETED','2026-04-29 12:03:00','2026-04-29 12:02:32','2026-04-29 15:03:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('2125c046-a454-4433-8224-04a2f79f81cc','1b2f201a-15d0-47eb-8084-d9019c1e4970','78273a0f-8c87-4bfa-98ef-e778dcfc3d71','','2026-04-29 15:03:00','COMPLETED','2026-04-29 12:03:00','2026-04-29 12:02:32','2026-04-29 15:03:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('b7b92100-0ba8-466a-b8e3-089ea36b5971','1b2f201a-15d0-47eb-8084-d9019c1e4970','63787963-e918-4a90-9f9d-57bebb5097ee','','2026-04-29 15:03:00','COMPLETED','2026-04-29 12:03:00','2026-04-29 12:02:28','2026-04-29 15:03:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('dbb20774-219a-4716-86eb-091342715b2f','bd8e8e57-269a-4d27-b1ad-698289104c89','a1df7c7a-59b1-4b8c-b6ab-97bf3ff91854','','2026-04-29 15:36:00','COMPLETED','2026-04-29 12:36:00','2026-04-29 12:35:27','2026-04-29 15:36:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('5e5b501d-a371-4a09-8864-0d9b4e98f721','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','e091567a-2659-4103-b914-8841d05d70c7','','2026-04-27 15:29:00','COMPLETED','2026-04-27 12:29:08','2026-04-27 12:28:27','2026-04-27 15:29:08','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('0b7ede13-f2d9-411b-95a7-0e998dd14571','2684e28d-ff4b-49c1-9da0-d445df284489','9c7422e4-3962-4861-8ac1-81a0dff65b04','','2026-04-29 13:48:00','COMPLETED','2026-04-29 10:48:00','2026-04-29 10:47:50','2026-04-29 13:48:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('f42e19bf-c962-436c-a67d-110f240e272a','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4','63787963-e918-4a90-9f9d-57bebb5097ee','','2026-04-29 15:03:00','COMPLETED','2026-04-29 12:03:00','2026-04-29 12:02:28','2026-04-29 15:03:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('b3bf425c-d0c0-4518-a800-113b1f0f5184','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','63589806-c680-43fe-b90e-49414c4d8838','','2026-04-29 15:03:00','COMPLETED','2026-04-29 12:03:00','2026-04-29 12:02:33','2026-04-29 15:03:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('0aa19547-86a8-4ffb-b053-118c83f104bb','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','5019d0a5-0a72-4cc3-960d-35ffdbf53cbb','','2026-04-28 23:05:00','COMPLETED','2026-04-28 20:05:02','2026-04-28 20:04:01','2026-04-28 23:05:02','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('bf729c59-fa31-4bf8-a283-1284851423a1','bd8e8e57-269a-4d27-b1ad-698289104c89','8327a2fe-61ad-4b63-b835-271951008ffa','','2026-04-29 14:37:00','COMPLETED','2026-04-29 11:37:00','2026-04-29 11:36:06','2026-04-29 14:37:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('b1cd8457-5e32-48cf-abee-132252386a14','2684e28d-ff4b-49c1-9da0-d445df284489','8327a2fe-61ad-4b63-b835-271951008ffa','','2026-04-29 14:30:00','COMPLETED','2026-04-29 11:30:00','2026-04-29 11:29:06','2026-04-29 14:30:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('d909ecf8-ccf2-4050-94ce-152c0cca89b5','2684e28d-ff4b-49c1-9da0-d445df284489','d0ea787a-10b7-411e-9b86-2db1c7c07f69','','2026-04-29 13:26:00','COMPLETED','2026-04-29 10:26:00','2026-04-29 10:25:30','2026-04-29 13:26:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('8c023dcd-c3d9-4481-9178-157ff9f3c5a8','2684e28d-ff4b-49c1-9da0-d445df284489','4487e820-9cb7-4619-b4a7-417412fee204','','2026-04-29 13:26:00','COMPLETED','2026-04-29 10:26:00','2026-04-29 10:25:30','2026-04-29 13:26:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('2272068e-efa3-4aa5-9b46-1d374b60ec4b','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4','78273a0f-8c87-4bfa-98ef-e778dcfc3d71','','2026-04-29 15:03:00','COMPLETED','2026-04-29 12:03:00','2026-04-29 12:02:32','2026-04-29 15:03:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('9ad5cea2-8f81-4262-8e48-1e44fa61a8d7','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','8f4c6a7a-fce7-4813-a44a-cc650a169a16','','2026-04-28 22:53:00','COMPLETED','2026-04-28 19:53:00','2026-04-28 19:52:32','2026-04-28 22:53:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('ffc75956-5c84-445d-99d3-1f46a7ac4919','fadd1328-7198-408e-8405-9eda402b9dda','63787963-e918-4a90-9f9d-57bebb5097ee','','2026-04-29 15:03:00','COMPLETED','2026-04-29 12:03:00','2026-04-29 12:02:28','2026-04-29 15:03:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('5ac559d3-5a76-44ec-a2b3-20a3412bcd71','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4','9c7422e4-3962-4861-8ac1-81a0dff65b04','','2026-04-29 14:21:00','COMPLETED','2026-04-29 11:21:00','2026-04-29 11:20:56','2026-04-29 14:21:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('c43d1182-334d-463c-a21a-2f5017a98f9b','bd8e8e57-269a-4d27-b1ad-698289104c89','e53c552b-b338-4d04-bf6c-c4925eca9b21','','2026-04-29 14:37:00','COMPLETED','2026-04-29 11:37:00','2026-04-29 11:36:06','2026-04-29 14:37:00','cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('b53bac0b-e800-46cd-9261-3340baf5fdae','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','512b2287-4459-4385-819c-d86d151b8e28','','2026-04-28 21:55:00','COMPLETED','2026-04-28 18:55:00','2026-04-28 18:54:58','2026-04-28 21:55:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('774479a9-aa28-4024-8068-34ddca68d742','2684e28d-ff4b-49c1-9da0-d445df284489','5019d0a5-0a72-4cc3-960d-35ffdbf53cbb','','2026-04-29 13:26:00','COMPLETED','2026-04-29 10:26:00','2026-04-29 10:25:30','2026-04-29 13:26:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('e37424da-5fe1-45a2-96f9-34e98a586fe6','1b2f201a-15d0-47eb-8084-d9019c1e4970','4487e820-9cb7-4619-b4a7-417412fee204','','2026-04-29 14:00:00','COMPLETED','2026-04-29 11:00:00','2026-04-29 10:59:15','2026-04-29 14:00:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('55e64895-a4a4-411d-aab6-385635931e37','bd8e8e57-269a-4d27-b1ad-698289104c89','78273a0f-8c87-4bfa-98ef-e778dcfc3d71','','2026-04-29 15:03:00','COMPLETED','2026-04-29 12:03:00','2026-04-29 12:02:32','2026-04-29 15:03:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('d89fb47d-c9d0-4564-88e9-3bdd0ceea615','fadd1328-7198-408e-8405-9eda402b9dda','9c7422e4-3962-4861-8ac1-81a0dff65b04','','2026-04-29 13:58:00','COMPLETED','2026-04-29 10:58:00','2026-04-29 10:57:45','2026-04-29 13:58:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('15dd544b-c399-4aa9-857f-3d205cf35388','2684e28d-ff4b-49c1-9da0-d445df284489','643e8f92-73cd-407b-a550-d255786194c4','','2026-04-29 13:26:00','COMPLETED','2026-04-29 10:26:00','2026-04-29 10:25:30','2026-04-29 13:26:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('a3c4e62c-2f34-4515-b5de-3ff008c9b023','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','33fc12b2-171a-401c-b9db-7f71b4880724','','2026-04-28 11:49:00','COMPLETED','2026-04-28 08:49:00','2026-04-28 08:48:18','2026-04-28 11:49:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('16dbdb8f-d117-4505-aa98-414f464e0951','2684e28d-ff4b-49c1-9da0-d445df284489','93fe580c-0572-46cf-9297-3e293eabb706','','2026-04-29 13:57:00','COMPLETED','2026-04-29 10:57:00','2026-04-29 10:56:44','2026-04-29 13:57:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('d20709e4-d7bd-45b0-8ff1-42a0b2ce358c','2684e28d-ff4b-49c1-9da0-d445df284489','6d10e110-fb7d-4b7c-b73b-df88a29f9055','','2026-04-29 13:26:00','COMPLETED','2026-04-29 10:26:00','2026-04-29 10:25:30','2026-04-29 13:26:00','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('cae7e085-4302-4da9-a3ef-43e47032a091','bd8e8e57-269a-4d27-b1ad-698289104c89','85affd6d-ac73-4e03-a35c-1d1eedf58a61','','2026-04-29 14:37:00','COMPLETED','2026-04-29 11:37:00','2026-04-29 11:36:06','2026-04-29 14:37:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('f0f39228-79a8-4a42-8b98-443ca0ca57b4','fadd1328-7198-408e-8405-9eda402b9dda','4487e820-9cb7-4619-b4a7-417412fee204','','2026-04-29 13:58:00','COMPLETED','2026-04-29 10:58:00','2026-04-29 10:57:45','2026-04-29 13:58:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('560598a2-a47f-4e82-919a-487899ccbd05','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','06b2bf38-06ed-4642-8f51-1143183ffb00','','2026-04-27 15:27:00','COMPLETED','2026-04-27 12:27:00','2026-04-27 12:26:08','2026-04-27 15:27:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('1f77c465-444d-4ab9-93f1-4d366cacbb53','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','ce4cae68-03ea-403e-b66f-c1f3b753df72','','2026-04-27 15:27:00','COMPLETED','2026-04-27 12:27:00','2026-04-27 12:26:08','2026-04-27 15:27:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('7fcc41bd-a016-4b24-b269-4eddbb1185c2','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','879692ef-41e2-45b9-948b-caf9e3735e95','','2026-04-28 17:46:00','COMPLETED','2026-04-28 14:46:00','2026-04-28 14:45:17','2026-04-28 17:46:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('82b3d055-2c78-49cb-9c29-50f964fd0c4a','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','ee717261-a13e-48b9-952f-498924c522b8','','2026-04-28 18:23:00','COMPLETED','2026-04-28 15:23:00','2026-04-28 15:22:50','2026-04-28 18:23:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('d627b48b-4dfa-4ab6-a51e-540008969141','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','f91e297d-b747-487a-87d6-27e9826e5d09','','2026-04-28 23:03:00','COMPLETED','2026-04-28 20:03:02','2026-04-28 20:02:22','2026-04-28 23:03:02','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('1e05f898-0bc2-4394-8329-57220e32a8c7','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4','4487e820-9cb7-4619-b4a7-417412fee204','','2026-04-29 14:21:00','COMPLETED','2026-04-29 11:21:00','2026-04-29 11:20:56','2026-04-29 14:21:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('a326d975-ac7a-4353-ad69-5740beed6926','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','71681f78-40d6-4835-b914-990d1737a307','','2026-04-28 22:53:00','COMPLETED','2026-04-28 19:53:00','2026-04-28 19:52:36','2026-04-28 22:53:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('9ee6a9e8-dfcc-445e-ba74-5793c9a280ed','bd8e8e57-269a-4d27-b1ad-698289104c89','5019d0a5-0a72-4cc3-960d-35ffdbf53cbb','','2026-04-29 14:37:00','COMPLETED','2026-04-29 11:37:00','2026-04-29 11:36:06','2026-04-29 14:37:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('1a6728fd-1a6d-47e1-a4f5-5a922019c1bd','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','838e6f8f-7ca1-4900-a8c7-0a6e5541c341','','2026-04-29 15:36:00','COMPLETED','2026-04-29 12:36:00','2026-04-29 12:35:28','2026-04-29 15:36:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('2e69e829-3a83-47e2-8fca-5e186dc68339','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','f78ba73c-5618-4679-8fa4-055750addf9c','','2026-04-29 14:30:00','COMPLETED','2026-04-29 11:30:00','2026-04-29 11:29:05','2026-04-29 14:30:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('ead1507d-aede-4da1-a08a-6a870c925ad4','bd8e8e57-269a-4d27-b1ad-698289104c89','f495dd9c-2ff1-4217-ba14-4c65e3ae348d','','2026-04-29 14:37:00','COMPLETED','2026-04-29 11:37:00','2026-04-29 11:36:06','2026-04-29 14:37:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('45579205-d943-4af0-a44a-74c91dd95232','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','8aecce76-79f6-443d-aeaf-65282aa727a4','','2026-04-27 15:27:00','COMPLETED','2026-04-27 12:27:04','2026-04-27 12:26:08','2026-04-27 15:27:04','5e72f829-e4ed-4ccd-8971-509708f42212'),
('607a9daa-e19c-406a-9adf-767f0809f489','fadd1328-7198-408e-8405-9eda402b9dda','e53c552b-b338-4d04-bf6c-c4925eca9b21','','2026-04-29 13:58:00','COMPLETED','2026-04-29 10:58:00','2026-04-29 10:57:45','2026-04-29 13:58:00','cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('4ec425bf-cd37-4053-85c7-7e6afc1da91b','2684e28d-ff4b-49c1-9da0-d445df284489','26fca8ea-1019-4114-935e-fa5ea0813209','','2026-04-29 13:26:00','COMPLETED','2026-04-29 10:26:00','2026-04-29 10:25:30','2026-04-29 13:26:00','cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('8bc24f6f-f4b5-49fa-9484-7e85632536cf','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4','93fe580c-0572-46cf-9297-3e293eabb706','','2026-04-29 14:21:00','COMPLETED','2026-04-29 11:21:00','2026-04-29 11:20:56','2026-04-29 14:21:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('54772c72-61bb-4111-81cb-801d666fb535','1b2f201a-15d0-47eb-8084-d9019c1e4970','a1df7c7a-59b1-4b8c-b6ab-97bf3ff91854','','2026-04-29 15:36:00','COMPLETED','2026-04-29 12:36:00','2026-04-29 12:35:27','2026-04-29 15:36:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('379f062e-d3eb-4428-888e-854b9e0b1711','2684e28d-ff4b-49c1-9da0-d445df284489','f495dd9c-2ff1-4217-ba14-4c65e3ae348d','','2026-04-29 13:26:00','COMPLETED','2026-04-29 10:26:00','2026-04-29 10:25:30','2026-04-29 13:26:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('8b032e33-1b0f-419b-9742-8d7482ce1601','1b2f201a-15d0-47eb-8084-d9019c1e4970','8327a2fe-61ad-4b63-b835-271951008ffa','','2026-04-29 14:30:00','COMPLETED','2026-04-29 11:30:00','2026-04-29 11:29:06','2026-04-29 14:30:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('169adf85-fd92-4d3b-bfa3-915e5c2648c8','bd8e8e57-269a-4d27-b1ad-698289104c89','63787963-e918-4a90-9f9d-57bebb5097ee','','2026-04-29 15:03:00','COMPLETED','2026-04-29 12:03:00','2026-04-29 12:02:28','2026-04-29 15:03:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('f037b6b3-6d0c-4a47-9152-915ec15e70c1','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','9f84f59b-84e6-4922-b0d5-b319097ab737','','2026-04-27 15:27:00','COMPLETED','2026-04-27 12:27:05','2026-04-27 12:26:08','2026-04-27 15:27:05','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('2b58a845-3cee-4740-8d47-94a20fa1c187','fadd1328-7198-408e-8405-9eda402b9dda','5019d0a5-0a72-4cc3-960d-35ffdbf53cbb','','2026-04-29 13:58:00','COMPLETED','2026-04-29 10:58:00','2026-04-29 10:57:45','2026-04-29 13:58:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('0e24c758-88de-46b3-b8e6-9a52b7033576','1b2f201a-15d0-47eb-8084-d9019c1e4970','5019d0a5-0a72-4cc3-960d-35ffdbf53cbb','','2026-04-29 14:00:00','COMPLETED','2026-04-29 11:00:00','2026-04-29 10:59:15','2026-04-29 14:00:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('06103e6d-9d9e-40ab-b6ac-9c5293882b81','2684e28d-ff4b-49c1-9da0-d445df284489','a226bfb4-87f5-4f67-afc6-32d39cbbd009','','2026-04-29 13:48:00','COMPLETED','2026-04-29 10:48:00','2026-04-29 10:47:31','2026-04-29 13:48:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('e3c76367-bef0-4ce5-9e30-9caf110d4d71','fadd1328-7198-408e-8405-9eda402b9dda','a1df7c7a-59b1-4b8c-b6ab-97bf3ff91854','','2026-04-29 15:36:00','COMPLETED','2026-04-29 12:36:00','2026-04-29 12:35:27','2026-04-29 15:36:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('93fe2f99-6707-45f6-a701-a1ac0dd833a0','1b2f201a-15d0-47eb-8084-d9019c1e4970','e53c552b-b338-4d04-bf6c-c4925eca9b21','','2026-04-29 14:00:00','COMPLETED','2026-04-29 11:00:00','2026-04-29 10:59:15','2026-04-29 14:00:00','cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('46ef5be9-0ad3-4cda-a9da-a510ac29bcf9','2684e28d-ff4b-49c1-9da0-d445df284489','63787963-e918-4a90-9f9d-57bebb5097ee','','2026-04-29 15:03:00','COMPLETED','2026-04-29 12:03:00','2026-04-29 12:02:28','2026-04-29 15:03:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('f2865145-6a5a-43e0-a02b-a5f5dfa4bda5','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4','e53c552b-b338-4d04-bf6c-c4925eca9b21','','2026-04-29 14:21:00','COMPLETED','2026-04-29 11:21:00','2026-04-29 11:20:56','2026-04-29 14:21:00','cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('5e976f40-b8fd-4203-855b-a735fd8738b9','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','6e2ccf40-e32c-4ee8-a776-bf67e502f7b2','','2026-04-27 16:50:00','COMPLETED','2026-04-27 13:50:00','2026-04-27 13:49:18','2026-04-27 16:50:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('f2184b48-6856-4b65-a40a-ac408879c3a7','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','8dff9e4b-8379-4ca6-a716-babfcf156f0e','','2026-04-27 16:55:00','COMPLETED','2026-04-27 13:55:00','2026-04-27 13:54:58','2026-04-27 16:55:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('ba1bc7d2-e077-48b7-af7c-ac4809135e5a','1b2f201a-15d0-47eb-8084-d9019c1e4970','9c7422e4-3962-4861-8ac1-81a0dff65b04','','2026-04-29 14:00:00','COMPLETED','2026-04-29 11:00:00','2026-04-29 10:59:15','2026-04-29 14:00:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('dea5d62a-bc50-4d6d-8964-adc41460743e','fadd1328-7198-408e-8405-9eda402b9dda','6d10e110-fb7d-4b7c-b73b-df88a29f9055','','2026-04-29 13:58:00','COMPLETED','2026-04-29 10:58:00','2026-04-29 10:57:45','2026-04-29 13:58:00','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('a15ec087-83cb-4aad-a8e5-ae2d3e829369','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4','8327a2fe-61ad-4b63-b835-271951008ffa','','2026-04-29 14:30:00','COMPLETED','2026-04-29 11:30:00','2026-04-29 11:29:06','2026-04-29 14:30:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('70c28a83-ba06-4bd5-befc-b651136781a8','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4','a1df7c7a-59b1-4b8c-b6ab-97bf3ff91854','','2026-04-29 15:36:00','COMPLETED','2026-04-29 12:36:00','2026-04-29 12:35:27','2026-04-29 15:36:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('f2928c26-2c94-46bd-b1ba-b90b2747b0ed','1b2f201a-15d0-47eb-8084-d9019c1e4970','6d10e110-fb7d-4b7c-b73b-df88a29f9055','','2026-04-29 14:00:00','COMPLETED','2026-04-29 11:00:00','2026-04-29 10:59:15','2026-04-29 14:00:00','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('75f4ef29-6751-425a-9acc-bf1cc01c48d1','2684e28d-ff4b-49c1-9da0-d445df284489','85affd6d-ac73-4e03-a35c-1d1eedf58a61','','2026-04-29 13:26:00','COMPLETED','2026-04-29 10:26:00','2026-04-29 10:25:30','2026-04-29 13:26:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('df91caef-4297-4e7a-b075-bf59cfd23d3e','2684e28d-ff4b-49c1-9da0-d445df284489','a1df7c7a-59b1-4b8c-b6ab-97bf3ff91854','','2026-04-29 15:36:00','COMPLETED','2026-04-29 12:36:00','2026-04-29 12:35:27','2026-04-29 15:36:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('7b5e1216-2f48-40e9-b49f-bfce118fe6f4','1b2f201a-15d0-47eb-8084-d9019c1e4970','93fe580c-0572-46cf-9297-3e293eabb706','','2026-04-29 14:00:00','COMPLETED','2026-04-29 11:00:00','2026-04-29 10:59:15','2026-04-29 14:00:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('fb17d717-3056-40d3-94e6-c0c3228e0128','46447df0-7deb-4677-9caa-45b4ff585820','85affd6d-ac73-4e03-a35c-1d1eedf58a61','','2026-04-27 15:25:00','COMPLETED','2026-04-27 12:25:00','2026-04-27 12:24:29','2026-04-27 15:25:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('a7fc38c0-f16c-4ed4-9bf7-c38a77ea489e','bd8e8e57-269a-4d27-b1ad-698289104c89','9c7422e4-3962-4861-8ac1-81a0dff65b04','','2026-04-29 14:37:00','COMPLETED','2026-04-29 11:37:00','2026-04-29 11:36:06','2026-04-29 14:37:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('5bedeff0-1f31-4d77-a79f-c4cdb037123b','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','9e17a395-48b9-4c96-ae84-b831b5618d01','','2026-04-27 16:38:00','COMPLETED','2026-04-27 13:38:00','2026-04-27 13:37:29','2026-04-27 16:38:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('5e23e75a-9217-4c83-9772-caec14b8fb0c','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','471bec87-227f-4069-8223-7546a8fec1a3','','2026-04-27 15:27:00','COMPLETED','2026-04-27 12:27:05','2026-04-27 12:26:08','2026-04-27 15:27:05','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('cbe50e1e-ca8c-4eca-9b78-d075e2bd3c05','bd8e8e57-269a-4d27-b1ad-698289104c89','6d10e110-fb7d-4b7c-b73b-df88a29f9055','','2026-04-29 14:37:00','COMPLETED','2026-04-29 11:37:00','2026-04-29 11:36:06','2026-04-29 14:37:00','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('420b301a-a90d-487c-9e69-d2a0ff62dabb','2684e28d-ff4b-49c1-9da0-d445df284489','90e6d8a3-ac2c-4b05-9edb-da74390bbf55','','2026-04-29 13:37:00','COMPLETED','2026-04-29 10:37:00','2026-04-29 10:36:40','2026-04-29 13:37:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('6049c8f4-b7ef-4a9e-b73a-d4e5465719d7','fadd1328-7198-408e-8405-9eda402b9dda','93fe580c-0572-46cf-9297-3e293eabb706','','2026-04-29 13:58:00','COMPLETED','2026-04-29 10:58:00','2026-04-29 10:57:45','2026-04-29 13:58:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('d5562285-9acc-4097-a542-d4e66b878973','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4','6d10e110-fb7d-4b7c-b73b-df88a29f9055','','2026-04-29 14:21:00','COMPLETED','2026-04-29 11:21:00','2026-04-29 11:20:56','2026-04-29 14:21:00','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('4e295521-70ef-45f1-a3f2-d7a8ab972584','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','810407ad-10a2-42e1-b00c-8407d5f48cf6','','2026-04-27 16:59:00','COMPLETED','2026-04-27 14:00:05','2026-04-27 13:58:39','2026-04-27 17:00:05','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('c5730125-56a9-4b0e-ac62-dce865ed02d0','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','50b4c024-5bfa-47f0-b0c6-b6d0631698da','','2026-04-29 15:03:00','COMPLETED','2026-04-29 12:03:00','2026-04-29 12:02:26','2026-04-29 15:03:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('6f8c3703-5d9e-4465-9eaf-dd2122747831','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','09c6dad1-b374-4a37-bf9e-0921905af675','','2026-04-27 15:27:00','COMPLETED','2026-04-27 12:27:06','2026-04-27 12:26:08','2026-04-27 15:27:06','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('21543ed2-ca52-41c3-a0e5-deda1f1c6946','bd8e8e57-269a-4d27-b1ad-698289104c89','4487e820-9cb7-4619-b4a7-417412fee204','','2026-04-29 14:37:00','COMPLETED','2026-04-29 11:37:00','2026-04-29 11:36:06','2026-04-29 14:37:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('ea3f4021-6351-46af-8433-e5e040bce9fe','2684e28d-ff4b-49c1-9da0-d445df284489','e53c552b-b338-4d04-bf6c-c4925eca9b21','','2026-04-29 13:26:00','COMPLETED','2026-04-29 10:26:00','2026-04-29 10:25:30','2026-04-29 13:26:00','cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('28591e4e-b91b-4744-a295-ee87cd7ac51a','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','595c6d02-8688-4c42-9ff3-8af21355e168','','2026-04-27 17:12:00','COMPLETED','2026-04-27 14:12:00','2026-04-27 14:11:38','2026-04-27 17:12:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('d6dec345-5220-429d-887b-eeede05a0e01','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','aea7fb2a-90c2-49b7-8a98-57b60b17e52a','','2026-04-28 23:03:00','COMPLETED','2026-04-28 20:03:02','2026-04-28 20:02:05','2026-04-28 23:03:02','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('6f1ace6a-560d-461b-b568-ef44d0063889','fadd1328-7198-408e-8405-9eda402b9dda','78273a0f-8c87-4bfa-98ef-e778dcfc3d71','','2026-04-29 15:03:00','COMPLETED','2026-04-29 12:03:00','2026-04-29 12:02:32','2026-04-29 15:03:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('6d08779a-47de-407c-90a8-f1bc93ad2829','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','85affd6d-ac73-4e03-a35c-1d1eedf58a61','','2026-04-27 15:27:00','COMPLETED','2026-04-27 12:27:06','2026-04-27 12:26:08','2026-04-27 15:27:06','5e72f829-e4ed-4ccd-8971-509708f42212'),
('05ae70b1-58e1-4e2d-96db-f1cb668bc83c','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4','5019d0a5-0a72-4cc3-960d-35ffdbf53cbb','','2026-04-29 14:21:00','COMPLETED','2026-04-29 11:21:00','2026-04-29 11:20:56','2026-04-29 14:21:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('ca68e631-d8e5-49ee-9140-fed2c298c94a','46447df0-7deb-4677-9caa-45b4ff585820','ce4cae68-03ea-403e-b66f-c1f3b753df72','','2026-04-27 15:25:00','COMPLETED','2026-04-27 12:25:00','2026-04-27 12:24:28','2026-04-27 15:25:00','5e72f829-e4ed-4ccd-8971-509708f42212');
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
('805e3d23-1932-48d8-be63-114caf4cc6cf','5019d0a5-0a72-4cc3-960d-35ffdbf53cbb','Tax 10%','10','TRY',2736.0000,342.0000,248.7272,31.0909,217.6363,2394.0000,2176.3637,0.0000,0.0000,5),
('05a4944f-18e8-492b-af28-18f7ce44d11a','a226bfb4-87f5-4f67-afc6-32d39cbbd009','%20 (Commission Tax)','20','TRY',0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1),
('f5cfeca0-2fc1-4518-8061-2ba54fa5357c','9c7422e4-3962-4861-8ac1-81a0dff65b04','Tax 20%','20','TRY',617.0000,15.0000,102.8333,2.5000,100.3333,602.0000,501.6667,0.0000,0.0000,5),
('64d8bbeb-aee1-4f5f-a6dc-45efd6754067','643e8f92-73cd-407b-a550-d255786194c4','Tax 10%','10','TRY',342.0000,0.0000,31.0909,0.0000,31.0909,342.0000,310.9091,0.0000,0.0000,1),
('62251363-fb06-4353-b36e-479bd137c8e1','f91e297d-b747-487a-87d6-27e9826e5d09','Tax 20%','20','TRY',924.0000,0.0000,154.0000,0.0000,154.0000,924.0000,770.0000,0.0000,0.0000,1),
('d14f8dbf-525e-4f58-b271-4980c6f53fcb','f495dd9c-2ff1-4217-ba14-4c65e3ae348d','Tax 20%','20','TRY',2424.0000,0.0000,404.0000,0.0000,404.0000,2424.0000,2020.0000,0.0000,0.0000,2),
('8a8bb4e4-1a15-49c9-8b75-4c2eb778f3fa','ce4cae68-03ea-403e-b66f-c1f3b753df72','Tax 20%','20','TRY',7272.0000,0.0000,1212.0000,0.0000,1212.0000,7272.0000,6060.0000,0.0000,0.0000,2),
('a17e0a71-712c-4287-b3d9-5c1f3221cc47','4487e820-9cb7-4619-b4a7-417412fee204','%20 (Commission Tax)','20','TRY',0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,4),
('e7a89373-ced9-4eb6-9545-68cea5eda452','50b4c024-5bfa-47f0-b0c6-b6d0631698da','%20 (Commission Tax)','20','TRY',38.5000,0.0000,6.4167,0.0000,6.4167,38.5000,32.0833,0.0000,0.0000,1),
('1ea8f1a8-881b-4d79-ae03-7238a1fc9351','9c7422e4-3962-4861-8ac1-81a0dff65b04','Tax 10%','10','TRY',2736.0000,342.0000,248.7272,31.0909,217.6363,2394.0000,2176.3637,0.0000,0.0000,5),
('a15d5eed-3b77-4a69-9c05-82f4b4c536e4','a1df7c7a-59b1-4b8c-b6ab-97bf3ff91854','Tax 10%','10','TRY',2736.0000,342.0000,248.7272,31.0909,217.6363,2394.0000,2176.3637,0.0000,0.0000,5),
('b33643af-12a7-4c2c-883f-87087d100ddb','838e6f8f-7ca1-4900-a8c7-0a6e5541c341','Tax 20%','20','TRY',924.0000,0.0000,154.0000,0.0000,154.0000,924.0000,770.0000,0.0000,0.0000,1),
('2b51bcf0-0240-427e-9ff6-8f7d579549ec','6d10e110-fb7d-4b7c-b73b-df88a29f9055','%20 (Commission Tax)','20','TRY',0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,4),
('5d3eef03-211b-45ac-a701-93af388a3110','e53c552b-b338-4d04-bf6c-c4925eca9b21','%20 (Commission Tax)','20','TRY',0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,4),
('f877281c-fd07-48ea-8ee5-991fb449c6f9','8327a2fe-61ad-4b63-b835-271951008ffa','%20 (Commission Tax)','20','TRY',150.0721,16.1705,25.0120,2.6951,22.3169,133.9016,111.5847,0.0000,0.0000,5),
('4f3e398c-a954-4a86-b69e-9f69736ea924','06b2bf38-06ed-4642-8f51-1143183ffb00','Tax 20%','20','TRY',924.0000,0.0000,154.0000,0.0000,154.0000,924.0000,770.0000,0.0000,0.0000,1),
('b98b7acf-e753-46a3-aaee-a87e5c01ecd4','93fe580c-0572-46cf-9297-3e293eabb706','%20 (Commission Tax)','20','TRY',125.1933,16.1705,20.8655,2.6951,18.1704,109.0228,90.8524,0.0000,0.0000,4),
('6a65bc1c-b3a2-4e14-96a6-ac86b0add429','78273a0f-8c87-4bfa-98ef-e778dcfc3d71','Tax 20%','20','TRY',617.0000,15.0000,102.8333,2.5000,100.3333,602.0000,501.6667,0.0000,0.0000,5),
('738676d8-444e-4bc8-a802-af3eb06684d1','63589806-c680-43fe-b90e-49414c4d8838','Tax 20%','20','TRY',924.0000,0.0000,154.0000,0.0000,154.0000,924.0000,770.0000,0.0000,0.0000,1),
('6ae448d0-d485-4b8a-9a88-b17a58ccfe62','f78ba73c-5618-4679-8fa4-055750addf9c','%20 (Commission Tax)','20','TRY',38.5000,0.0000,6.4167,0.0000,6.4167,38.5000,32.0833,0.0000,0.0000,1),
('9cb9094f-ab6a-4bba-a85e-b3487efba3e5','63787963-e918-4a90-9f9d-57bebb5097ee','%20 (Commission Tax)','20','TRY',150.0721,16.1705,25.0120,2.6951,22.3169,133.9016,111.5847,0.0000,0.0000,5),
('c114485d-4a95-416e-8eb1-c233354d0708','71681f78-40d6-4835-b914-990d1737a307','Tax 20%','20','TRY',924.0000,0.0000,154.0000,0.0000,154.0000,924.0000,770.0000,0.0000,0.0000,1),
('f4fc65fd-1bd0-4eac-9c9d-c4423830632f','a1df7c7a-59b1-4b8c-b6ab-97bf3ff91854','Tax 20%','20','TRY',617.0000,15.0000,102.8333,2.5000,100.3333,602.0000,501.6667,0.0000,0.0000,5),
('11ade86e-593d-42f8-9c05-cceaa8e80035','26fca8ea-1019-4114-935e-fa5ea0813209','Tax 20%','20','TRY',14.0000,0.0000,2.3333,0.0000,2.3333,14.0000,11.6667,0.0000,0.0000,1),
('e60186f0-1b4b-43d5-8a8b-d18985cce62e','85affd6d-ac73-4e03-a35c-1d1eedf58a61','Tax 20%','20','TRY',9696.0000,0.0000,1616.0000,0.0000,1616.0000,9696.0000,8080.0000,0.0000,0.0000,4),
('a371c609-5eab-43b0-837d-d63e000c6f73','5019d0a5-0a72-4cc3-960d-35ffdbf53cbb','Tax 20%','20','TRY',1541.0000,15.0000,256.8333,2.5000,254.3333,1526.0000,1271.6667,0.0000,0.0000,6),
('7ed21e17-c554-4594-b32f-e7bdf04b4db7','78273a0f-8c87-4bfa-98ef-e778dcfc3d71','Tax 10%','10','TRY',2736.0000,342.0000,248.7272,31.0909,217.6363,2394.0000,2176.3637,0.0000,0.0000,5),
('23d7243f-1045-48d5-9923-f029f6d4cc04','643e8f92-73cd-407b-a550-d255786194c4','Tax 20%','20','TRY',231.0000,0.0000,38.5000,0.0000,38.5000,231.0000,192.5000,0.0000,0.0000,1),
('b288bd6f-35db-4731-8bc5-fcf697521ccb','471bec87-227f-4069-8223-7546a8fec1a3','Tax 20%','20','TRY',924.0000,0.0000,154.0000,0.0000,154.0000,924.0000,770.0000,0.0000,0.0000,1);
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
('2de8939a-3b82-485d-b765-01998eabcca2','TRY','bd8e8e57-269a-4d27-b1ad-698289104c89','5e72f829-e4ed-4ccd-8971-509708f42212','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-29 14:36:06','2026-04-29 14:36:06','2026-04-29 14:36:06','','','CREDIT_TO_SELLER',1212.0000,202.0000,1010.0000),
('85c81e6b-2352-41b8-bc97-108d2e61b326','TRY','2684e28d-ff4b-49c1-9da0-d445df284489','5e72f829-e4ed-4ccd-8971-509708f42212','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-29 13:25:29','2026-04-29 13:25:29','2026-04-29 13:25:29','','','CREDIT_TO_SELLER',1212.0000,202.0000,1010.0000),
('526a1578-6132-49d0-b710-2c3e65b305c7','TRY','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-29 14:20:56','2026-04-29 14:20:56','2026-04-29 14:20:56','','','CREDIT_TO_SELLER',1134.0000,111.2727,1022.7273),
('13d0e596-2bd2-4082-b5b2-2f83f8bc45ab','TRY','46447df0-7deb-4677-9caa-45b4ff585820','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-27 15:22:49','2026-04-27 15:22:49','2026-04-27 15:22:49','','','CREDIT_TO_SELLER',66.0000,11.0000,55.0000),
('fb9a2192-28a1-4fe1-8846-3cd3485facc5','TRY','1b2f201a-15d0-47eb-8084-d9019c1e4970','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-29 13:58:43','2026-04-29 13:59:15','2026-04-29 10:59:15','','','DEBIT_FROM_SELLER',357.0000,33.5909,323.4091),
('e5214a05-4685-49c5-806c-65c224a1861b','TRY','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-27 15:26:08','2026-04-27 15:26:08','2026-04-27 15:26:08','','','CREDIT_TO_SELLER',924.0000,154.0000,770.0000),
('38dc3a67-3ef5-4a4e-9af6-842d057ac6e3','TRY','46447df0-7deb-4677-9caa-45b4ff585820','5e72f829-e4ed-4ccd-8971-509708f42212','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-27 15:22:49','2026-04-27 15:22:49','2026-04-27 15:22:49','','','CREDIT_TO_SELLER',4848.0000,808.0000,4040.0000),
('41fbb24f-95e3-4eed-bb3d-9a819ded9b54','TRY','46447df0-7deb-4677-9caa-45b4ff585820','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-27 15:22:49','2026-04-27 15:22:49','2026-04-27 15:22:49','','','CREDIT_TO_SELLER',500.0000,83.3334,416.6666),
('2edae005-ceb8-45ba-a84e-c4cd764c1ba6','TRY','2684e28d-ff4b-49c1-9da0-d445df284489','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-29 13:25:29','2026-04-29 13:25:29','2026-04-29 13:25:29','','','CREDIT_TO_SELLER',573.0000,69.5909,503.4091),
('54fffa5e-0147-41a9-a5ac-c9f508a5cdac','TRY','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5','5e72f829-e4ed-4ccd-8971-509708f42212','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-27 15:26:08','2026-04-27 15:26:08','2026-04-27 15:26:08','','','CREDIT_TO_SELLER',2424.0000,404.0000,2020.0000),
('a3051f6f-0a9b-4ba6-aeff-ce70aeae29ef','TRY','fadd1328-7198-408e-8405-9eda402b9dda','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-29 13:57:45','2026-04-29 13:57:45','2026-04-29 13:57:45','','','CREDIT_TO_SELLER',1080.0000,102.2727,977.7273),
('e22f46b5-5f60-4abd-a7ba-f34d5060fad1','TRY','bd8e8e57-269a-4d27-b1ad-698289104c89','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-29 14:36:06','2026-04-29 14:36:06','2026-04-29 14:36:06','','','CREDIT_TO_SELLER',566.0000,68.4242,497.5758),
('1a90acd5-a459-4bcb-9df4-f82b9e894d86','TRY','d52dbec7-70cc-4033-8efc-9cda518bc009','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-29 14:22:32','2026-04-29 12:02:14','2026-04-29 12:02:14','','','DEBIT_FROM_SELLER',369.0000,35.5909,333.4091),
('827bbe34-2766-4015-bc5f-fc74388f0322','TRY','2684e28d-ff4b-49c1-9da0-d445df284489','cbf3e25f-5586-4e5c-b0d8-7463a83da274','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-29 13:25:29','2026-04-29 13:25:29','2026-04-29 13:25:29','','','CREDIT_TO_SELLER',14.0000,2.3333,11.6667);
/*!40000 ALTER TABLE `seller_payment_order` ENABLE KEYS */;
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

-- Dump completed on 2026-04-30 14:33:23
