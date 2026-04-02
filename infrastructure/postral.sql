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
('a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','1111111111','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'Akbank',NULL,NULL,NULL,'Bahçelievler'),
('a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','1111111111','INDIVIDUAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'',NULL,NULL,NULL,NULL),
('5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','1111111111','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'Esen Yayınları YGS Matematik soru bankası','TR31313113131','31313131',NULL,NULL),
('cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','1111111111','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'Jerry Acelesi Yok',NULL,NULL,NULL,NULL),
('bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','11111111111','INDIVIDUAL','287c8d95-9fe2-4a22-a79b-97500dbbc8f6',0,'TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('913252c1-d094-40de-a13c-8dc1142b9222','Lotus Eğitim','1111111111','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1111111111','COMMERCIAL','91587983-a95f-4934-895f-a3f9f5fdaed1',0,'Kısmet XNXX',NULL,NULL,NULL,NULL),
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
  `amount` int(11) NOT NULL,
  `taxAmount` int(11) NOT NULL,
  `creationDate` datetime NOT NULL DEFAULT current_timestamp(),
  `updateDate` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `operationNote` mediumtext DEFAULT '',
  `description` mediumtext DEFAULT '',
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
('a1d7441b-9143-401c-b960-08e250bda114','d4c6f778-46c9-4daa-bd7a-b5ec09ce7d81','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','69e44495-cab2-4dde-ae7e-70c89451c286',NULL,'DEBIT','COMPLETED',1100,183,'2026-03-29 21:04:58','2026-03-29 21:04:58','','Payment purchase for payment id 69e44495-cab2-4dde-ae7e-70c89451c286. Sellers: Omodog, Tetakent (H.C.G)'),
('a7edc317-3efc-431c-a7a8-1340752d0f98','d5dfebc0-4c35-429b-8253-de801939673f','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','cbb58ca9-25c4-4f15-a903-f67d59d1ede1',NULL,'CREDIT','COMPLETED',400,66,'2026-03-28 14:21:07','2026-03-28 14:21:07','','Payment purchase for payment id cbb58ca9-25c4-4f15-a903-f67d59d1ede1. Customer: Frisk Dreemurr'),
('43801b98-29f0-40f5-a25c-1879eae775d3','26dc1521-9c78-4732-9f4c-5e403c01d1c1','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a',NULL,'DEBIT','COMPLETED',700,116,'2026-03-31 10:58:52','2026-03-31 10:58:52','','Payment purchase for payment id cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a. Sellers: Omodog'),
('8bade2c0-e2ba-43bb-86ac-1997ecdf2583','26dc1521-9c78-4732-9f4c-5e403c01d1c1','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a',NULL,'CREDIT','COMPLETED',700,116,'2026-03-31 10:58:52','2026-03-31 10:58:52','','Payment purchase for payment id cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a. Customer: Frisk Dreemurr'),
('cc875da8-0b37-4685-9807-1de19ca59b4e','ce119dca-4000-4c05-987e-982a90508ec1','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','6ed605eb-41d2-4eba-ba88-e5b5ec76cb67',NULL,'CREDIT','COMPLETED',1100,183,'2026-03-31 11:59:13','2026-03-31 11:59:13','','Payment purchase for payment id 6ed605eb-41d2-4eba-ba88-e5b5ec76cb67. Customer: Frisk Dreemurr'),
('d4a8e2e5-d464-4230-b8ce-1eaedad9d086','ab5da9f1-a2e6-4c97-b539-987762d65493','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','21a1914c-2f02-468a-9969-c82851f5cde7',NULL,'DEBIT','COMPLETED',800,133,'2026-03-31 11:41:43','2026-03-31 11:41:43','','Payment purchase for payment id 21a1914c-2f02-468a-9969-c82851f5cde7. Sellers: Omodog'),
('8877a4c6-09e1-41e9-bde3-21425b5e13df','c4296c87-1418-4465-8d3d-efefe07c5eed','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','5564f851-c835-4667-b894-c654b69a93f6',NULL,'CREDIT','COMPLETED',200,33,'2026-03-28 14:23:53','2026-03-28 14:23:53','','Payment purchase for payment id 5564f851-c835-4667-b894-c654b69a93f6. Customer: Frisk Dreemurr'),
('3eb2464c-be5d-4aa6-8d68-2848d86a3809','d5dfebc0-4c35-429b-8253-de801939673f','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','cbb58ca9-25c4-4f15-a903-f67d59d1ede1',NULL,'DEBIT','COMPLETED',1700,283,'2026-03-28 14:21:07','2026-03-28 14:21:07','','Payment purchase for payment id cbb58ca9-25c4-4f15-a903-f67d59d1ede1. Sellers: Omodog, Tetakent (H.C.G), Esenler Motionstar Incorporated'),
('fe8792da-96af-4bf9-a113-2d2ced76702c','946e4903-c899-4bb6-a320-26d37f3cdf57','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','b4912aeb-5c11-403c-81bb-588da87592ed',NULL,'CREDIT','COMPLETED',700,116,'2026-03-28 14:38:32','2026-03-28 14:38:32','','Payment purchase for payment id b4912aeb-5c11-403c-81bb-588da87592ed. Customer: Frisk Dreemurr'),
('fb15d636-3f49-44ed-8d21-3089cedc3aeb','36a81cdb-532d-4746-bad3-8fc25b454989','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','5250a81a-6d49-4d3c-ad7e-56013dba864d',NULL,'DEBIT','COMPLETED',2000,333,'2026-03-28 14:33:27','2026-03-28 14:33:27','','Payment purchase for payment id 5250a81a-6d49-4d3c-ad7e-56013dba864d. Sellers: Omodog, Doofenshmirtz Evil Inc, Esenler Motionstar Incorporated, Tetakent (H.C.G)'),
('05fe6289-aead-48d5-adc2-310a6479ade4','6f271261-8978-4134-a0c4-64ca63dbbf1f','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','bdc318a1-2832-42fc-8cba-7a75a8d112d8',NULL,'CREDIT','COMPLETED',500,83,'2026-04-01 12:18:00','2026-04-01 12:18:00','','Payment purchase for payment id bdc318a1-2832-42fc-8cba-7a75a8d112d8. Customer: Frisk Dreemurr'),
('a4611bee-3d73-4bee-b357-345cc146b44b','73ab76ab-e9c2-4a81-9fa8-5b6dd0ecc24f','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c2a6c7f0-d11d-4aef-ba23-556aad150050',NULL,'DEBIT','COMPLETED',1000,166,'2026-03-31 12:07:20','2026-03-31 12:07:20','','Payment purchase for payment id c2a6c7f0-d11d-4aef-ba23-556aad150050. Sellers: Omodog'),
('62133446-e84e-492e-bbcf-3669cc4597ff','4d6c363a-51f1-4d62-a62e-3c9e91f996f2','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c676457a-b61a-4fa2-a67e-f963453ebb03',NULL,'DEBIT','COMPLETED',600,100,'2026-03-28 10:53:06','2026-03-28 10:53:06','','Payment purchase for payment id c676457a-b61a-4fa2-a67e-f963453ebb03. Sellers: Omodog'),
('a97f1069-c7f3-4562-b3cd-3984ec56dd4f','5367f248-d8b8-483b-9463-5492edcd5923','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','ddca578b-583d-4008-8497-39bd8e360304',NULL,'DEBIT','COMPLETED',760,122,'2026-04-01 12:31:41','2026-04-01 12:31:41','','Payment purchase for payment id ddca578b-583d-4008-8497-39bd8e360304. Sellers: Omodog'),
('8d90e84c-5427-42ac-ba38-3c5dbb3b7234','fba90408-9952-4ae0-85b2-40851cbc59e3','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','d85e328f-fea2-4558-9cb7-f163a8c2e655',NULL,'DEBIT','COMPLETED',800,133,'2026-03-30 19:49:33','2026-03-30 19:49:33','','Payment purchase for payment id d85e328f-fea2-4558-9cb7-f163a8c2e655. Sellers: Omodog'),
('4469104a-735f-4c1c-ac60-3e1b8dcfd9c4','73ab76ab-e9c2-4a81-9fa8-5b6dd0ecc24f','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c2a6c7f0-d11d-4aef-ba23-556aad150050',NULL,'CREDIT','COMPLETED',1000,166,'2026-03-31 12:07:20','2026-03-31 12:07:20','','Payment purchase for payment id c2a6c7f0-d11d-4aef-ba23-556aad150050. Customer: Frisk Dreemurr'),
('aecce6c0-fa68-41da-b039-3f93c1f07124','8cd99303-310e-46bd-b468-28b701affb8c','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','b63fd97f-f09e-4ef8-875c-fcc40009bf46',NULL,'DEBIT','COMPLETED',500,83,'2026-03-28 10:51:31','2026-03-28 10:51:31','','Payment purchase for payment id b63fd97f-f09e-4ef8-875c-fcc40009bf46. Sellers: Omodog'),
('c0e8bff5-dc57-42de-9fe4-43412a36a137','ee75733d-2605-4143-8001-7148093bca55','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c937dfe7-68d2-4884-be98-0b9b77df1196',NULL,'DEBIT','COMPLETED',1000,166,'2026-03-28 10:54:12','2026-03-28 10:54:12','','Payment purchase for payment id c937dfe7-68d2-4884-be98-0b9b77df1196. Sellers: Omodog, Tetakent (H.C.G)'),
('a238781e-2d0d-4911-b773-44409a8f857e','946e4903-c899-4bb6-a320-26d37f3cdf57','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','b4912aeb-5c11-403c-81bb-588da87592ed',NULL,'CREDIT','COMPLETED',800,133,'2026-03-28 14:38:32','2026-03-28 14:38:32','','Payment purchase for payment id b4912aeb-5c11-403c-81bb-588da87592ed. Customer: Frisk Dreemurr'),
('84f81d1b-3220-46c9-a703-4b18f6406ba4','9b2a433d-d6dc-497c-9780-59fed73f3091','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','af94372d-4a92-4409-a49b-4d3f079129a8',NULL,'CREDIT','COMPLETED',1200,200,'2026-03-29 21:03:00','2026-03-29 21:03:00','','Payment purchase for payment id af94372d-4a92-4409-a49b-4d3f079129a8. Customer: Frisk Dreemurr'),
('cb3eb26d-dbfe-42b9-9bec-4e3017d65e62','36a81cdb-532d-4746-bad3-8fc25b454989','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','5250a81a-6d49-4d3c-ad7e-56013dba864d',NULL,'CREDIT','COMPLETED',400,66,'2026-03-28 14:33:27','2026-03-28 14:33:27','','Payment purchase for payment id 5250a81a-6d49-4d3c-ad7e-56013dba864d. Customer: Frisk Dreemurr'),
('cc381bd4-ac0a-4a13-bb50-4f9fb98203e6','da7d2580-e8c4-45b0-a62f-cd777bc3397b','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','dce665d2-1d97-4cf1-9529-7e4ef5c12b1f',NULL,'DEBIT','COMPLETED',400,66,'2026-03-28 14:23:17','2026-03-28 14:23:17','','Payment purchase for payment id dce665d2-1d97-4cf1-9529-7e4ef5c12b1f. Sellers: Omodog'),
('c33afa97-d707-4811-95af-56c44c9951e5','ce119dca-4000-4c05-987e-982a90508ec1','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','6ed605eb-41d2-4eba-ba88-e5b5ec76cb67',NULL,'DEBIT','COMPLETED',1100,183,'2026-03-31 11:59:13','2026-03-31 11:59:13','','Payment purchase for payment id 6ed605eb-41d2-4eba-ba88-e5b5ec76cb67. Sellers: Omodog'),
('e575deb4-3fff-4162-8358-59571cc1fce9','ee75733d-2605-4143-8001-7148093bca55','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','c937dfe7-68d2-4884-be98-0b9b77df1196',NULL,'CREDIT','COMPLETED',500,83,'2026-03-28 10:54:12','2026-03-28 10:54:12','','Payment purchase for payment id c937dfe7-68d2-4884-be98-0b9b77df1196. Customer: Frisk Dreemurr'),
('044135fd-733c-4499-a759-650a2eead104','da7d2580-e8c4-45b0-a62f-cd777bc3397b','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','dce665d2-1d97-4cf1-9529-7e4ef5c12b1f',NULL,'CREDIT','COMPLETED',400,66,'2026-03-28 14:23:17','2026-03-28 14:23:17','','Payment purchase for payment id dce665d2-1d97-4cf1-9529-7e4ef5c12b1f. Customer: Frisk Dreemurr'),
('584b4727-ad69-4f68-b243-67d06010f5f1','f77a5004-a061-4cef-a84c-ae445713f63d','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','eb6eadf1-a396-4eaf-b537-225ed0997447',NULL,'DEBIT','COMPLETED',800,133,'2026-03-28 10:59:43','2026-03-28 10:59:43','','Payment purchase for payment id eb6eadf1-a396-4eaf-b537-225ed0997447. Sellers: Omodog'),
('9e780c92-bbfc-4dd1-952b-683606532a6d','6f271261-8978-4134-a0c4-64ca63dbbf1f','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','bdc318a1-2832-42fc-8cba-7a75a8d112d8',NULL,'CREDIT','COMPLETED',1000,166,'2026-04-01 12:18:00','2026-04-01 12:18:00','','Payment purchase for payment id bdc318a1-2832-42fc-8cba-7a75a8d112d8. Customer: Frisk Dreemurr'),
('4a6d0ab4-6949-4e17-8980-76e222143b70','d5dfebc0-4c35-429b-8253-de801939673f','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','cbb58ca9-25c4-4f15-a903-f67d59d1ede1',NULL,'CREDIT','COMPLETED',400,66,'2026-03-28 14:21:07','2026-03-28 14:21:07','','Payment purchase for payment id cbb58ca9-25c4-4f15-a903-f67d59d1ede1. Customer: Frisk Dreemurr'),
('d76fb9ef-6862-4d0c-8308-827912a0cfa6','d5dfebc0-4c35-429b-8253-de801939673f','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','cbb58ca9-25c4-4f15-a903-f67d59d1ede1',NULL,'CREDIT','COMPLETED',900,150,'2026-03-28 14:21:07','2026-03-28 14:21:07','','Payment purchase for payment id cbb58ca9-25c4-4f15-a903-f67d59d1ede1. Customer: Frisk Dreemurr'),
('a7314bcd-e316-4bbd-ad7f-839e19c04504','3fdf6b3a-3e68-4dd2-a63f-3037e69aa8f9','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','f6e28e3d-fd4e-49f6-b740-cfcf04571146',NULL,'DEBIT','COMPLETED',500,83,'2026-04-01 12:02:21','2026-04-01 12:02:21','','Payment purchase for payment id f6e28e3d-fd4e-49f6-b740-cfcf04571146. Sellers: Omodog'),
('6a6c9bce-3dd2-4a36-b694-84712b639295','a18026e2-b710-4a4b-9c3f-a3ccbbdfc64e','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','5c474860-602f-4e3a-a6f9-a11fc1c7de86',NULL,'CREDIT','COMPLETED',700,116,'2026-03-28 14:06:31','2026-03-28 14:06:31','','Payment purchase for payment id 5c474860-602f-4e3a-a6f9-a11fc1c7de86. Customer: Frisk Dreemurr'),
('d915ffc6-c2c2-465d-93e7-862333661702','c4296c87-1418-4465-8d3d-efefe07c5eed','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','5564f851-c835-4667-b894-c654b69a93f6',NULL,'CREDIT','COMPLETED',500,83,'2026-03-28 14:23:53','2026-03-28 14:23:53','','Payment purchase for payment id 5564f851-c835-4667-b894-c654b69a93f6. Customer: Frisk Dreemurr'),
('102ce0df-7b01-402e-b205-86b9787221a6','4d6c363a-51f1-4d62-a62e-3c9e91f996f2','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c676457a-b61a-4fa2-a67e-f963453ebb03',NULL,'CREDIT','COMPLETED',600,100,'2026-03-28 10:53:06','2026-03-28 10:53:06','','Payment purchase for payment id c676457a-b61a-4fa2-a67e-f963453ebb03. Customer: Frisk Dreemurr'),
('25a1d2f3-f266-4541-953b-89a6053e949a','946e4903-c899-4bb6-a320-26d37f3cdf57','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','b4912aeb-5c11-403c-81bb-588da87592ed',NULL,'CREDIT','COMPLETED',800,133,'2026-03-28 14:38:32','2026-03-28 14:38:32','','Payment purchase for payment id b4912aeb-5c11-403c-81bb-588da87592ed. Customer: Frisk Dreemurr'),
('59bf14d9-700b-4be5-bd3b-8cf77305e85f','8cd99303-310e-46bd-b468-28b701affb8c','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','b63fd97f-f09e-4ef8-875c-fcc40009bf46',NULL,'CREDIT','COMPLETED',500,83,'2026-03-28 10:51:31','2026-03-28 10:51:31','','Payment purchase for payment id b63fd97f-f09e-4ef8-875c-fcc40009bf46. Customer: Frisk Dreemurr'),
('9f7d8507-48cd-49b9-8040-913341230a27','3fdf6b3a-3e68-4dd2-a63f-3037e69aa8f9','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','f6e28e3d-fd4e-49f6-b740-cfcf04571146',NULL,'CREDIT','COMPLETED',500,83,'2026-04-01 12:02:21','2026-04-01 12:02:21','','Payment purchase for payment id f6e28e3d-fd4e-49f6-b740-cfcf04571146. Customer: Frisk Dreemurr'),
('6094d828-8ae2-4836-a04c-9596551f6611','36a81cdb-532d-4746-bad3-8fc25b454989','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','5250a81a-6d49-4d3c-ad7e-56013dba864d',NULL,'CREDIT','COMPLETED',500,83,'2026-03-28 14:33:27','2026-03-28 14:33:27','','Payment purchase for payment id 5250a81a-6d49-4d3c-ad7e-56013dba864d. Customer: Frisk Dreemurr'),
('f9fae7f0-2bec-4d22-9906-96c7b438e499','67f40595-19b0-4b78-adfd-ca82894dded1','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','3377a6d8-0ae0-4e1e-a2d7-c8885587eb0f',NULL,'CREDIT','COMPLETED',700,116,'2026-03-28 14:20:07','2026-03-28 14:20:07','','Payment purchase for payment id 3377a6d8-0ae0-4e1e-a2d7-c8885587eb0f. Customer: Frisk Dreemurr'),
('33990d6c-a218-4e88-8680-9c52d6bbaeaa','d025e637-0b54-4748-93a3-18b00fc50674','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','d4668779-7454-4f6a-b81c-ba9aa510e070',NULL,'DEBIT','COMPLETED',500,83,'2026-03-31 12:08:07','2026-03-31 12:08:07','','Payment purchase for payment id d4668779-7454-4f6a-b81c-ba9aa510e070. Sellers: Omodog'),
('370707cb-372b-4ccd-b467-a2213e852096','068edcd6-40a1-4f47-b25c-35b40b3dc1b6','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','9dfd48f2-f25b-4903-bed0-47e340260c33',NULL,'DEBIT','COMPLETED',500,83,'2026-03-31 11:35:26','2026-03-31 11:35:26','','Payment purchase for payment id 9dfd48f2-f25b-4903-bed0-47e340260c33. Sellers: Omodog'),
('357668e4-bc30-4e07-9e90-a752688a86b3','36a81cdb-532d-4746-bad3-8fc25b454989','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','5250a81a-6d49-4d3c-ad7e-56013dba864d',NULL,'CREDIT','COMPLETED',600,100,'2026-03-28 14:33:27','2026-03-28 14:33:27','','Payment purchase for payment id 5250a81a-6d49-4d3c-ad7e-56013dba864d. Customer: Frisk Dreemurr'),
('f9655d14-95af-4ab9-b3bb-a88e57ae912d','67f40595-19b0-4b78-adfd-ca82894dded1','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','3377a6d8-0ae0-4e1e-a2d7-c8885587eb0f',NULL,'DEBIT','COMPLETED',700,116,'2026-03-28 14:20:07','2026-03-28 14:20:07','','Payment purchase for payment id 3377a6d8-0ae0-4e1e-a2d7-c8885587eb0f. Sellers: Omodog'),
('fd236dd4-c8b1-4639-b634-a8b89c97a99e','d4c6f778-46c9-4daa-bd7a-b5ec09ce7d81','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','69e44495-cab2-4dde-ae7e-70c89451c286',NULL,'CREDIT','COMPLETED',600,100,'2026-03-29 21:04:58','2026-03-29 21:04:58','','Payment purchase for payment id 69e44495-cab2-4dde-ae7e-70c89451c286. Customer: Frisk Dreemurr'),
('9c23be60-4699-4aa0-861b-aab6955f571a','fba90408-9952-4ae0-85b2-40851cbc59e3','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','d85e328f-fea2-4558-9cb7-f163a8c2e655',NULL,'CREDIT','COMPLETED',800,133,'2026-03-30 19:49:33','2026-03-30 19:49:33','','Payment purchase for payment id d85e328f-fea2-4558-9cb7-f163a8c2e655. Customer: Frisk Dreemurr'),
('3be535fc-b774-4bf2-b966-ac8b7f014764','ee75733d-2605-4143-8001-7148093bca55','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c937dfe7-68d2-4884-be98-0b9b77df1196',NULL,'CREDIT','COMPLETED',500,83,'2026-03-28 10:54:12','2026-03-28 10:54:12','','Payment purchase for payment id c937dfe7-68d2-4884-be98-0b9b77df1196. Customer: Frisk Dreemurr'),
('48e061bb-3e38-41b7-948e-b1f09b0f16d4','36a81cdb-532d-4746-bad3-8fc25b454989','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','5250a81a-6d49-4d3c-ad7e-56013dba864d',NULL,'CREDIT','COMPLETED',500,83,'2026-03-28 14:33:27','2026-03-28 14:33:27','','Payment purchase for payment id 5250a81a-6d49-4d3c-ad7e-56013dba864d. Customer: Frisk Dreemurr'),
('31c39a0b-5ec6-4af6-b520-b275d12f6f18','a18026e2-b710-4a4b-9c3f-a3ccbbdfc64e','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','5c474860-602f-4e3a-a6f9-a11fc1c7de86',NULL,'DEBIT','COMPLETED',700,116,'2026-03-28 14:06:31','2026-03-28 14:06:31','','Payment purchase for payment id 5c474860-602f-4e3a-a6f9-a11fc1c7de86. Sellers: Omodog'),
('e0c93553-326b-49de-b7ec-b7969f508658','6f271261-8978-4134-a0c4-64ca63dbbf1f','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','bdc318a1-2832-42fc-8cba-7a75a8d112d8',NULL,'DEBIT','COMPLETED',1500,250,'2026-04-01 12:18:00','2026-04-01 12:18:00','','Payment purchase for payment id bdc318a1-2832-42fc-8cba-7a75a8d112d8. Sellers: Omodog, Tetakent (H.C.G)'),
('d8607eaf-af91-4bd1-948d-c87477880a94','068edcd6-40a1-4f47-b25c-35b40b3dc1b6','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','9dfd48f2-f25b-4903-bed0-47e340260c33',NULL,'CREDIT','COMPLETED',500,83,'2026-03-31 11:35:26','2026-03-31 11:35:26','','Payment purchase for payment id 9dfd48f2-f25b-4903-bed0-47e340260c33. Customer: Frisk Dreemurr'),
('c3550e37-a503-4be0-8f1d-cd26e006781e','946e4903-c899-4bb6-a320-26d37f3cdf57','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','b4912aeb-5c11-403c-81bb-588da87592ed',NULL,'DEBIT','COMPLETED',2300,383,'2026-03-28 14:38:32','2026-03-28 14:38:32','','Payment purchase for payment id b4912aeb-5c11-403c-81bb-588da87592ed. Sellers: Esenler Motionstar Incorporated, Omodog, Tetakent (H.C.G)'),
('f18a6a58-da66-4942-9017-cefadbc8312d','d4c6f778-46c9-4daa-bd7a-b5ec09ce7d81','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','69e44495-cab2-4dde-ae7e-70c89451c286',NULL,'CREDIT','COMPLETED',500,83,'2026-03-29 21:04:58','2026-03-29 21:04:58','','Payment purchase for payment id 69e44495-cab2-4dde-ae7e-70c89451c286. Customer: Frisk Dreemurr'),
('ae2328d1-0a28-41d1-b958-d0893e54ab6b','c4296c87-1418-4465-8d3d-efefe07c5eed','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','5564f851-c835-4667-b894-c654b69a93f6',NULL,'DEBIT','COMPLETED',700,116,'2026-03-28 14:23:53','2026-03-28 14:23:53','','Payment purchase for payment id 5564f851-c835-4667-b894-c654b69a93f6. Sellers: Tetakent (H.C.G), Omodog'),
('8b4ccd60-b5dd-4708-bf6f-d9fcc6ad2bee','f77a5004-a061-4cef-a84c-ae445713f63d','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','eb6eadf1-a396-4eaf-b537-225ed0997447',NULL,'CREDIT','COMPLETED',800,133,'2026-03-28 10:59:43','2026-03-28 10:59:43','','Payment purchase for payment id eb6eadf1-a396-4eaf-b537-225ed0997447. Customer: Frisk Dreemurr'),
('2c625bb8-941f-4c61-97c3-e57517aad86b','5367f248-d8b8-483b-9463-5492edcd5923','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','ddca578b-583d-4008-8497-39bd8e360304',NULL,'CREDIT','COMPLETED',760,122,'2026-04-01 12:31:41','2026-04-01 12:31:41','','Payment purchase for payment id ddca578b-583d-4008-8497-39bd8e360304. Customer: Frisk Dreemurr'),
('2f136be2-2805-481b-bd03-f404148c66f9','ab5da9f1-a2e6-4c97-b539-987762d65493','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','21a1914c-2f02-468a-9969-c82851f5cde7',NULL,'CREDIT','COMPLETED',800,133,'2026-03-31 11:41:43','2026-03-31 11:41:43','','Payment purchase for payment id 21a1914c-2f02-468a-9969-c82851f5cde7. Customer: Frisk Dreemurr'),
('777a98d5-ea9d-4cd0-9ba9-f59c2bc588cc','d025e637-0b54-4748-93a3-18b00fc50674','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','d4668779-7454-4f6a-b81c-ba9aa510e070',NULL,'CREDIT','COMPLETED',500,83,'2026-03-31 12:08:07','2026-03-31 12:08:07','','Payment purchase for payment id d4668779-7454-4f6a-b81c-ba9aa510e070. Customer: Frisk Dreemurr'),
('84744b98-7624-48cd-86e8-ffc1fd1a2320','9b2a433d-d6dc-497c-9780-59fed73f3091','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','af94372d-4a92-4409-a49b-4d3f079129a8',NULL,'DEBIT','COMPLETED',1200,200,'2026-03-29 21:03:00','2026-03-29 21:03:00','','Payment purchase for payment id af94372d-4a92-4409-a49b-4d3f079129a8. Sellers: Omodog');
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
('287c8d95-9fe2-4a22-a79b-97500dbbc8f6','EBOTT DAĞI','42',NULL,'5','3',NULL,'EBOTT DAĞI',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('91587983-a95f-4934-895f-a3f9f5fdaed1','Faraway','42',NULL,'5','3',NULL,'Deneme Sokak',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('21011b61-eb6e-4039-bc9a-baa274f95fc1','Bahçelievler / İstanbul','42',NULL,'5','3',NULL,'Akarsu yokuş sokak 3/4 😽',NULL,NULL,'BEYOĞLU','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `address` ENABLE KEYS */;
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
  `sellerAccountId` varchar(255) NOT NULL,
  `applicationAccountId` varchar(255) NOT NULL,
  `app_default` tinyint(4) NOT NULL,
  `percent` float NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_comission`
--

LOCK TABLES `app_comission` WRITE;
/*!40000 ALTER TABLE `app_comission` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `app_comission` VALUES
('269a6327-b26b-4af2-91f3-aad84772621c','','b6c80c5b-c6ce-42ac-bfd7-6fb7c975f7e9',1,0),
('a687c5f1-564e-496b-a28e-ab6f87f5cb78','bb999e95-3de3-401a-a554-da9ae47e843c','b6c80c5b-c6ce-42ac-bfd7-6fb7c975f7e9',0,0);
/*!40000 ALTER TABLE `app_comission` ENABLE KEYS */;
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
('9dd18852-2002-46a6-87cb-0de0d0ef4ccf','Something','','','','C62','c783e9dc-07aa-4fe4-95e9-be16246156bb','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196'),
('dbf8a42f-69f0-4181-8373-2a0b3ea01061','Tost','','','','KPO','c783e9dc-07aa-4fe4-95e9-be16246156bb','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196'),
('a7d0eb1b-0c3f-4b45-8b6e-44ed9d7205a9','Hayat Reçeli','','','','TON','c783e9dc-07aa-4fe4-95e9-be16246156bb','TRY','18202eba-0abb-4a63-8112-d3ef034173d2'),
('739263f4-a5e9-4f70-a368-8ea4891fec10','Tetakent Education Suite 2025','','','','GFI','5e72f829-e4ed-4ccd-8971-509708f42212','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196'),
('3954ca25-330d-4e83-aef9-96f0da591b53','Drillinator','','','','C62','cbf3e25f-5586-4e5c-b0d8-7463a83da274','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196'),
('e2e402c4-ef53-40df-8591-98adfd4a1afc','Esenler Note Calculation','','','','C62','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196');
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
  `itemPrice` float NOT NULL DEFAULT 0,
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
('571cf63a-6189-41ed-819b-1adacc9b178d','dbf8a42f-69f0-4181-8373-2a0b3ea01061','kel','any','TRY',0,NULL,NULL,NULL,100),
('3933ee4f-61c6-4636-a41e-22731066c9f7','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','basils','any','TRY',0,NULL,NULL,NULL,100),
('71c01ee3-d730-4f41-8db7-25147142adcd','3954ca25-330d-4e83-aef9-96f0da591b53','default','any','TRY',0,NULL,NULL,NULL,100),
('fc8fe02a-80a1-485f-9c75-2871422a8780','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','Humankite','any','TRY',0,NULL,NULL,NULL,100),
('fc8fe02a-80a1-485f-9c75-2871422a8781','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','Humankite','any','TRY',1,'2025-07-05 12:18:00','2025-07-05 16:27:00',NULL,100),
('d4d41b0c-4262-4031-91e9-342a0dd20cf0','dbf8a42f-69f0-4181-8373-2a0b3ea01061','hero','any','TRY',0,NULL,NULL,NULL,100),
('a8b8e8b2-0b0c-4470-b255-3450aec10a76','e2e402c4-ef53-40df-8591-98adfd4a1afc','1years','any','TRY',0,NULL,NULL,NULL,100),
('f9628c98-20a1-4b1a-a771-36e77a827630','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','2 Years','any','TRY',0,NULL,NULL,NULL,100),
('b0e0d341-d1d2-48d6-9b3b-3f0388d7245b','e2e402c4-ef53-40df-8591-98adfd4a1afc','2years-dagestan','any','TRY',0,NULL,NULL,NULL,100),
('376c042f-65e0-427f-bac3-89d456a0e1d9','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','default','any','TRY',0,NULL,NULL,NULL,100),
('176b2b7c-721d-4ca1-95eb-8df2d880dbe7','739263f4-a5e9-4f70-a368-8ea4891fec10','default','any','TRY',0,NULL,NULL,NULL,100),
('41d6cd8e-ce6a-4a2b-9093-8f256fa00b09','739263f4-a5e9-4f70-a368-8ea4891fec10','humankite','any','TRY',0,NULL,NULL,NULL,100),
('3131314b-7007-44c2-b25c-92b193b9e27a','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','default','any','TRY',3,NULL,NULL,NULL,100),
('3c31fc4b-7007-44c2-b25c-92b193b9e27a','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','default','any','TRY',0,NULL,NULL,NULL,100),
('c8345fd4-436a-4190-95ba-9c71734767ee','a7d0eb1b-0c3f-4b45-8b6e-44ed9d7205a9','default','any','TRY',0,NULL,NULL,NULL,10),
('af17e972-0b8c-4573-88f9-b295919da74a','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','any','TRY',0,NULL,NULL,NULL,100),
('ffcb6316-ea49-42b1-8276-c5fe0aa6c468','739263f4-a5e9-4f70-a368-8ea4891fec10','jew-elf-king','any','TRY',0,NULL,NULL,NULL,100),
('c7b82dfe-684a-47b9-bef6-cc0cfa302cb0','dbf8a42f-69f0-4181-8373-2a0b3ea01061','mari','any','TRY',0,NULL,NULL,NULL,100),
('8f9b0333-412c-47d3-80b4-d5c9acc677e7','dbf8a42f-69f0-4181-8373-2a0b3ea01061','aubrey','any','TRY',0,NULL,NULL,NULL,100),
('180513eb-6fa8-4bb7-94e0-db996e68c465','dbf8a42f-69f0-4181-8373-2a0b3ea01061','basil','any','TRY',0,NULL,NULL,NULL,100);
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
('695221ba-5366-42e3-85aa-ab04b1698c20','DEFAULT',10,'18202eba-0abb-4a63-8112-d3ef034173d2');
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
  `totalAmount` float NOT NULL,
  `taxAmount` float NOT NULL,
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
('ddca578b-583d-4008-8497-39bd8e360304','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-04-01 12:31:36','2026-04-01 12:31:41',NULL,760,122.121),
('bdc318a1-2832-42fc-8cba-7a75a8d112d8','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-04-01 12:17:56','2026-04-01 12:18:00',NULL,1500,250),
('f6e28e3d-fd4e-49f6-b740-cfcf04571146','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-04-01 12:00:01','2026-04-01 12:02:21',NULL,500,83.3333);
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
  `amount` float NOT NULL,
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
('1f1da008-5dd1-4477-9ab6-059e9773ff11','dummy-ecommerce','6ed605eb-41d2-4eba-ba88-e5b5ec76cb67',NULL,'TRY','COMPLETED','6ed605eb-41d2-4eba-ba88-e5b5ec76cb67','2026-03-31 11:59:10','2026-03-31 11:59:12',1100),
('c74fe7e7-822b-45ad-a073-0b7c816f8b92','dummy-ecommerce','9dfd48f2-f25b-4903-bed0-47e340260c33',NULL,'TRY','COMPLETED','9dfd48f2-f25b-4903-bed0-47e340260c33','2026-03-31 11:35:18','2026-03-31 11:35:23',500),
('41aaacac-5802-4c35-adf4-0bc037b29dd0','dummy-ecommerce','21a1914c-2f02-468a-9969-c82851f5cde7',NULL,'TRY','COMPLETED','21a1914c-2f02-468a-9969-c82851f5cde7','2026-03-31 11:41:40','2026-03-31 11:41:43',800),
('115793b5-6e15-4125-9b58-0ee34f26ec72','dummy-ecommerce','d4668779-7454-4f6a-b81c-ba9aa510e070',NULL,'TRY','COMPLETED','d4668779-7454-4f6a-b81c-ba9aa510e070','2026-03-31 12:08:03','2026-03-31 12:08:04',500),
('db9207fd-778a-42ca-8ae6-11c8b9832d6d','dummy-ecommerce','cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a',NULL,'TRY','COMPLETED','cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a','2026-03-31 10:58:49','2026-03-31 10:58:51',700),
('6ffad36c-7433-43eb-86c0-164259eae375','dummy-ecommerce','af94372d-4a92-4409-a49b-4d3f079129a8',NULL,'TRY','COMPLETED','af94372d-4a92-4409-a49b-4d3f079129a8','2026-03-29 21:02:56','2026-03-29 21:02:57',1200),
('7bacc0f8-3231-42ec-b58e-2fab3d59d436','dummy-ecommerce','69e44495-cab2-4dde-ae7e-70c89451c286',NULL,'TRY','COMPLETED','69e44495-cab2-4dde-ae7e-70c89451c286','2026-03-29 21:04:54','2026-03-29 21:04:55',1100),
('d3a4d126-1c32-4ef9-902f-5eba8dc433aa','dummy-ecommerce','bdc318a1-2832-42fc-8cba-7a75a8d112d8',NULL,'TRY','COMPLETED','bdc318a1-2832-42fc-8cba-7a75a8d112d8','2026-04-01 12:17:57','2026-04-01 12:17:59',1500),
('52d42e28-60a6-42c4-8285-6e7d5e5ea299','dummy-ecommerce','d85e328f-fea2-4558-9cb7-f163a8c2e655',NULL,'TRY','COMPLETED','d85e328f-fea2-4558-9cb7-f163a8c2e655','2026-03-30 19:49:29','2026-03-30 19:49:31',800),
('5f77de79-dabd-447f-91d1-87d932905dc8','dummy-ecommerce','cbb58ca9-25c4-4f15-a903-f67d59d1ede1',NULL,'TRY','COMPLETED','cbb58ca9-25c4-4f15-a903-f67d59d1ede1','2026-03-28 14:21:04','2026-03-28 14:21:05',1700),
('c957ad97-6283-45c6-862b-90f851b5ae65','dummy-ecommerce','f6e28e3d-fd4e-49f6-b740-cfcf04571146',NULL,'TRY','COMPLETED','f6e28e3d-fd4e-49f6-b740-cfcf04571146','2026-04-01 12:00:03','2026-04-01 12:02:17',500),
('51bb0819-27d8-4e1f-98dc-a8cc99ebdfca','dummy-ecommerce','3377a6d8-0ae0-4e1e-a2d7-c8885587eb0f',NULL,'TRY','COMPLETED','3377a6d8-0ae0-4e1e-a2d7-c8885587eb0f','2026-03-28 14:19:48','2026-03-28 14:20:05',700),
('6b1b30b7-b2af-4438-a0e5-ac62d0b9f762','dummy-ecommerce','dce665d2-1d97-4cf1-9529-7e4ef5c12b1f',NULL,'TRY','COMPLETED','dce665d2-1d97-4cf1-9529-7e4ef5c12b1f','2026-03-28 14:23:13','2026-03-28 14:23:14',400),
('3f3ca01d-89db-40d0-853f-b79d4d3c5195','dummy-ecommerce','5564f851-c835-4667-b894-c654b69a93f6',NULL,'TRY','COMPLETED','5564f851-c835-4667-b894-c654b69a93f6','2026-03-28 14:23:49','2026-03-28 14:23:50',700),
('346615ca-809d-49cd-8d4a-d6e2b814e7b9','dummy-ecommerce','5250a81a-6d49-4d3c-ad7e-56013dba864d',NULL,'TRY','COMPLETED','5250a81a-6d49-4d3c-ad7e-56013dba864d','2026-03-28 14:33:23','2026-03-28 14:33:25',2000),
('f68c740e-ec21-43b6-828c-dc754c66401b','dummy-ecommerce','b4912aeb-5c11-403c-81bb-588da87592ed',NULL,'TRY','COMPLETED','b4912aeb-5c11-403c-81bb-588da87592ed','2026-03-28 14:38:28','2026-03-28 14:38:29',2300),
('ee20ebed-dd26-4e09-9448-e42bab02e469','dummy-ecommerce','c2a6c7f0-d11d-4aef-ba23-556aad150050',NULL,'TRY','COMPLETED','c2a6c7f0-d11d-4aef-ba23-556aad150050','2026-03-31 12:07:17','2026-03-31 12:07:19',1000),
('adf42327-849d-4de7-8f17-fa9ed18663fd','dummy-ecommerce','ddca578b-583d-4008-8497-39bd8e360304',NULL,'TRY','COMPLETED','ddca578b-583d-4008-8497-39bd8e360304','2026-04-01 12:31:37','2026-04-01 12:31:38',760);
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
  `quantity` float NOT NULL,
  `totalAmount` float NOT NULL,
  `originalUnitAmount` float NOT NULL,
  `unitAmount` float NOT NULL,
  `taxPercent` float NOT NULL,
  `taxAmount` float NOT NULL,
  `unTaxAmount` float NOT NULL,
  `refundCount` float NOT NULL DEFAULT 0,
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
('87a1cc2f-0bea-4e58-a0d4-02c74f858659','','','','Tost','ddca578b-583d-4008-8497-39bd8e360304','dbf8a42f-69f0-4181-8373-2a0b3ea01061','hero','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','KPO',0,NULL,NULL,7,700,100,100,20,116.667,583.333,0),
('aa8c8825-4c27-41fe-a334-1a9ce5935847','','','','Tost','bdc318a1-2832-42fc-8cba-7a75a8d112d8','dbf8a42f-69f0-4181-8373-2a0b3ea01061','hero','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','KPO',0,NULL,NULL,5,500,100,100,20,83.3333,416.667,0),
('b0ed8fcb-2962-4a53-a89f-6e1c336b52a0','','','','Hayat Reçeli','ddca578b-583d-4008-8497-39bd8e360304','a7d0eb1b-0c3f-4b45-8b6e-44ed9d7205a9','default','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','TON',0,NULL,NULL,6,60,10,10,10,5.45455,54.5455,0),
('944be9e0-7b68-49dc-b21c-89c18d2358bb','','','','Tetakent Education Suite 2025','bdc318a1-2832-42fc-8cba-7a75a8d112d8','739263f4-a5e9-4f70-a368-8ea4891fec10','default','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','GFI',0,NULL,NULL,5,500,100,100,20,83.3333,416.667,0),
('84b137d6-491d-42f7-86ff-a76779d150f2','','','','Tost','f6e28e3d-fd4e-49f6-b740-cfcf04571146','dbf8a42f-69f0-4181-8373-2a0b3ea01061','kel','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','KPO',0,NULL,NULL,5,500,100,100,20,83.3333,416.667,0),
('4fdc5955-f80a-450f-b608-fd1dec06533a','','','','Something','bdc318a1-2832-42fc-8cba-7a75a8d112d8','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','basils','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','C62',0,NULL,NULL,5,500,100,100,20,83.3333,416.667,0);
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
  `taxAmount` float NOT NULL,
  `untaxAmount` float NOT NULL,
  `fullAmount` float NOT NULL,
  `percent` float NOT NULL,
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
('6815520e-c7b0-421a-a4e8-5626f2a9d208','ddca578b-583d-4008-8497-39bd8e360304',116.667,583.333,700,20),
('221cc415-ae08-4644-a18d-7097f00f2bb6','bdc318a1-2832-42fc-8cba-7a75a8d112d8',250,1250,1500,20),
('a9d5cb53-fb6f-4925-bc23-7223b885927e','f6e28e3d-fd4e-49f6-b740-cfcf04571146',83.3333,416.667,500,20),
('3de893c6-5099-4bcc-8e37-9f1d9a5de606','ddca578b-583d-4008-8497-39bd8e360304',5.45455,54.5455,60,10);
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
  `refundCount` float NOT NULL,
  `unitAmount` float DEFAULT NULL,
  `unitAmountWithoutTax` float DEFAULT NULL,
  `refundAmount` float DEFAULT NULL,
  `refundAmountWithoutTax` float DEFAULT NULL,
  `refundTaxAmount` float DEFAULT NULL,
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
  `totalSaleAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `totalRefundAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `totalSaleTaxAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `totalRefundTaxAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `netTaxAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `netSaleAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `netRevenue` decimal(15,2) NOT NULL DEFAULT 0.00,
  `lastDigestedPaymentId` varchar(255) DEFAULT NULL,
  `archived` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_12ff44ad30c27967e29c0fd42e` (`queryId`,`periodLabel`,`currency`),
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
('d84b932d-6c1d-402a-a035-0425efb4281b','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-01_OLD_1775047060048','TRY','2026-04-01 15:31:50','2026-04-01 15:25:48',2,1760.00,0.00,288.79,0.00,288.79,1760.00,1471.21,'ddca578b-583d-4008-8497-39bd8e360304',1),
('99ddf8f6-dd1b-4216-ae92-0ff70047239b','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-01','TRY','2026-04-02 16:41:00','2026-04-02 16:40:55',2,1760.00,0.00,288.79,0.00,288.79,1760.00,1471.21,'bdc318a1-2832-42fc-8cba-7a75a8d112d8',0),
('1e915f06-1069-498d-aafc-2d1d77cec555','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-01_OLD_1775046306355','TRY','2026-04-01 15:23:20','2026-04-01 15:23:15',1,1000.00,0.00,166.67,0.00,166.67,1000.00,833.33,'bdc318a1-2832-42fc-8cba-7a75a8d112d8',1),
('ed82e664-a902-4f20-8a1b-353da2ca052f','b9243d78-24fd-4f05-964f-dcb12547ba7f','c783e9dc-07aa-4fe4-95e9-be16246156bb','ALL_OLD_1775046798812','TRY',NULL,'2026-04-01 15:18:00',0,0.00,0.00,0.00,0.00,0.00,0.00,0.00,NULL,1),
('c8ab9cfe-df0d-4f75-b785-4cef573b6055','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-01_OLD_1775046348020','TRY','2026-04-01 15:25:10','2026-04-01 15:25:06',1,1000.00,0.00,166.67,0.00,166.67,1000.00,833.33,'bdc318a1-2832-42fc-8cba-7a75a8d112d8',1),
('88a37564-c25b-4504-a359-7f5d650caeb1','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-01_OLD_1775046195840','TRY','2026-04-01 15:18:10','2026-04-01 15:18:00',1,1000.00,0.00,166.67,0.00,166.67,1000.00,833.33,'bdc318a1-2832-42fc-8cba-7a75a8d112d8',1),
('1a634925-5526-4be5-8128-8a93518ab20a','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-01_OLD_1775055383785','TRY','2026-04-01 15:37:50','2026-04-01 15:37:40',2,1760.00,0.00,288.79,0.00,288.79,1760.00,1471.21,'bdc318a1-2832-42fc-8cba-7a75a8d112d8',1),
('dea0aaa1-dc85-490c-a11e-b6b57c69bd5b','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','c783e9dc-07aa-4fe4-95e9-be16246156bb','2026-04-01_OLD_1775137255790','TRY','2026-04-01 17:56:30','2026-04-01 17:56:23',2,1760.00,0.00,288.79,0.00,288.79,1760.00,1471.21,'ddca578b-583d-4008-8497-39bd8e360304',1),
('fb1440b3-a4f0-49cd-afd8-c34b1f6dd88c','b9243d78-24fd-4f05-964f-dcb12547ba7f','c783e9dc-07aa-4fe4-95e9-be16246156bb','ALL','TRY','2026-04-01 15:33:20','2026-04-01 15:33:18',2,1760.00,0.00,288.79,0.00,288.79,1760.00,1471.21,'ddca578b-583d-4008-8497-39bd8e360304',0);
/*!40000 ALTER TABLE `report` ENABLE KEYS */;
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
('800d8029-188d-444a-92af-0c05a8367a84','bdc318a1-2832-42fc-8cba-7a75a8d112d8','dea0aaa1-dc85-490c-a11e-b6b57c69bd5b','','2026-04-01 17:56:30','COMPLETED','2026-04-01 14:56:30','2026-04-01 14:56:23','2026-04-01 17:56:30','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('0c886a6a-2705-42a5-9ebc-0e8c3ea3cec2','ddca578b-583d-4008-8497-39bd8e360304','1a634925-5526-4be5-8128-8a93518ab20a','','2026-04-01 15:37:50','COMPLETED','2026-04-01 12:37:50','2026-04-01 12:37:40','2026-04-01 15:37:50','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('2cae846f-48ec-47b8-9304-143785f16f13','bdc318a1-2832-42fc-8cba-7a75a8d112d8','88a37564-c25b-4504-a359-7f5d650caeb1','1775045890002_7becaaa8-0b8f-4f18-b0f3-b04642327787','2026-04-01 15:18:10','DIGESTING','2026-04-01 12:18:10','2026-04-01 12:18:00',NULL,'c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('a422a4f3-42bd-4e13-9681-179c80a15926','bdc318a1-2832-42fc-8cba-7a75a8d112d8','fb1440b3-a4f0-49cd-afd8-c34b1f6dd88c','','2026-04-01 15:33:20','COMPLETED','2026-04-01 12:33:20','2026-04-01 12:33:18','2026-04-01 15:33:20','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('2fe63cc4-c9aa-45db-8750-286fb8374f27','bdc318a1-2832-42fc-8cba-7a75a8d112d8','c8ab9cfe-df0d-4f75-b785-4cef573b6055','1775046310002_3027af33-1530-430b-8bd6-4641dd96b47b','2026-04-01 15:25:10','DIGESTING','2026-04-01 12:25:10','2026-04-01 12:25:06',NULL,'c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('8c0b777a-f0f6-4e3e-9c4e-4cf9710f0006','ddca578b-583d-4008-8497-39bd8e360304','ed82e664-a902-4f20-8a1b-353da2ca052f',NULL,NULL,'WAITING','2026-04-01 12:31:41','2026-04-01 12:31:41',NULL,'c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('170beed8-f93e-475e-a234-4e30d8a75dce','ddca578b-583d-4008-8497-39bd8e360304','99ddf8f6-dd1b-4216-ae92-0ff70047239b','','2026-04-02 16:41:00','COMPLETED','2026-04-02 13:41:00','2026-04-02 13:40:55','2026-04-02 16:41:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('46a41927-89cf-4ca0-baf6-6b8790d2adc6','ddca578b-583d-4008-8497-39bd8e360304','dea0aaa1-dc85-490c-a11e-b6b57c69bd5b','','2026-04-01 17:56:30','COMPLETED','2026-04-01 14:56:30','2026-04-01 14:56:23','2026-04-01 17:56:30','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('703e7a41-0bbf-4923-8db7-6f7b31e53414','bdc318a1-2832-42fc-8cba-7a75a8d112d8','d84b932d-6c1d-402a-a035-0425efb4281b','','2026-04-01 15:25:50','COMPLETED','2026-04-01 12:25:50','2026-04-01 12:25:48','2026-04-01 15:25:50','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('1b9f4dda-69c0-4ee9-9d0a-6fd57916788b','ddca578b-583d-4008-8497-39bd8e360304','d84b932d-6c1d-402a-a035-0425efb4281b','','2026-04-01 15:31:50','COMPLETED','2026-04-01 12:31:50','2026-04-01 12:31:41','2026-04-01 15:31:50','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('976ec796-edad-4f3c-be3b-7a48d89e5852','bdc318a1-2832-42fc-8cba-7a75a8d112d8','99ddf8f6-dd1b-4216-ae92-0ff70047239b','','2026-04-02 16:41:00','COMPLETED','2026-04-02 13:41:00','2026-04-02 13:40:55','2026-04-02 16:41:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('cceec7f8-d74d-4085-b147-8af4a7bef51d','ddca578b-583d-4008-8497-39bd8e360304','fb1440b3-a4f0-49cd-afd8-c34b1f6dd88c','','2026-04-01 15:33:20','COMPLETED','2026-04-01 12:33:20','2026-04-01 12:33:18','2026-04-01 15:33:20','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('d8e3db7c-9de5-4380-a597-d9fd8c94c92d','bdc318a1-2832-42fc-8cba-7a75a8d112d8','ed82e664-a902-4f20-8a1b-353da2ca052f','1775045890002_7becaaa8-0b8f-4f18-b0f3-b04642327787','2026-04-01 15:18:10','DIGESTING','2026-04-01 12:18:10','2026-04-01 12:18:00',NULL,'c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('7e5cbe95-f526-4553-a92e-e02027c2eec2','bdc318a1-2832-42fc-8cba-7a75a8d112d8','1a634925-5526-4be5-8128-8a93518ab20a','','2026-04-01 15:37:50','COMPLETED','2026-04-01 12:37:50','2026-04-01 12:37:40','2026-04-01 15:37:50','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('e00b91f2-a7ba-45c5-b3b1-fcfed86260b0','bdc318a1-2832-42fc-8cba-7a75a8d112d8','1e915f06-1069-498d-aafc-2d1d77cec555','1775046200004_f3552d47-fd52-4f46-8c80-d44944508d2e','2026-04-01 15:23:20','DIGESTING','2026-04-01 12:23:20','2026-04-01 12:23:15',NULL,'c783e9dc-07aa-4fe4-95e9-be16246156bb');
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
('4e64b4f2-aae1-40d1-b6d4-31d1a2791780','Omodog Günlük','','c783e9dc-07aa-4fe4-95e9-be16246156bb','TRY','DAILY','2026-03-28 10:52:22','2026-03-29 13:09:35'),
('b9243d78-24fd-4f05-964f-dcb12547ba7f','Omodog','','c783e9dc-07aa-4fe4-95e9-be16246156bb','TRY','ALL','2026-03-28 10:50:33','2026-03-29 13:05:15');
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
  `paymentCount` int(11) NOT NULL DEFAULT 0,
  `totalSaleAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `totalRefundAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `totalSaleTaxAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `totalRefundTaxAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `netTaxAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `netSaleAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `netRevenue` decimal(15,2) NOT NULL DEFAULT 0.00,
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
('ee16c68c-7698-4f03-9d03-03d5261dd058','fb1440b3-a4f0-49cd-afd8-c34b1f6dd88c','Tax 20%','20','TRY',3,2760.00,0.00,455.46,0.00,455.46,2760.00,2304.54),
('b36fc36c-7ec6-4032-b5d8-08e4823c1f53','fb1440b3-a4f0-49cd-afd8-c34b1f6dd88c','Tax 10%','10','TRY',1,760.00,0.00,122.12,0.00,122.12,760.00,637.88),
('84fd4579-739b-4ef8-a974-23ca8ed5f7bc','d84b932d-6c1d-402a-a035-0425efb4281b','Tax 20%','20','TRY',3,2760.00,0.00,455.46,0.00,455.46,2760.00,2304.54),
('e2b56c74-2e62-4d7d-be14-2d04c1995dda','d84b932d-6c1d-402a-a035-0425efb4281b','Tax 10%','10','TRY',1,760.00,0.00,122.12,0.00,122.12,760.00,637.88),
('df6e7d0d-f094-461b-bc74-3d8a866ea1c6','1a634925-5526-4be5-8128-8a93518ab20a','Tax 20%','20','TRY',3,2760.00,0.00,455.46,0.00,455.46,2760.00,2304.54),
('73a485c7-b091-4e1d-a398-4cff844b5379','99ddf8f6-dd1b-4216-ae92-0ff70047239b','Tax 10%','10','TRY',1,760.00,0.00,122.12,0.00,122.12,760.00,637.88),
('81219a29-755f-4403-b089-6a9f8e7e963a','dea0aaa1-dc85-490c-a11e-b6b57c69bd5b','Tax 20%','20','TRY',3,2760.00,0.00,455.46,0.00,455.46,2760.00,2304.54),
('55c803c4-d90a-4a6f-9dc2-717823e12fea','dea0aaa1-dc85-490c-a11e-b6b57c69bd5b','Tax 10%','10','TRY',1,760.00,0.00,122.12,0.00,122.12,760.00,637.88),
('a9676429-7fe3-4b9f-8e8c-7ee773f3fc10','1a634925-5526-4be5-8128-8a93518ab20a','Tax 10%','10','TRY',1,760.00,0.00,122.12,0.00,122.12,760.00,637.88),
('faf6a0bb-f049-4c51-b638-a066fb09b1e8','99ddf8f6-dd1b-4216-ae92-0ff70047239b','Tax 20%','20','TRY',3,2760.00,0.00,455.46,0.00,455.46,2760.00,2304.54);
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
  `amount` float NOT NULL,
  `taxAmount` float NOT NULL,
  `untaxedAmount` float NOT NULL,
  PRIMARY KEY (`id`),
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
('22cb86b1-0387-4fe2-823f-35d6a1e34c2a','TRY','ddca578b-583d-4008-8497-39bd8e360304','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-01 12:31:41','2026-04-01 12:31:41','2026-04-01 12:31:41','','','CREDIT_TO_SELLER',760,122.122,637.878),
('c35389b5-113e-4a56-9e7a-36cb6ee9fd04','TRY','bdc318a1-2832-42fc-8cba-7a75a8d112d8','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-01 12:18:00','2026-04-01 12:18:00','2026-04-01 12:18:00','','','CREDIT_TO_SELLER',1000,166.667,833.333),
('323dbc65-b4b7-45aa-8549-595c67d67993','TRY','b4912aeb-5c11-403c-81bb-588da87592ed','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,1,1,'2026-03-28 14:38:32','2026-03-29 13:05:48','2026-03-29 13:05:48','','','CREDIT_TO_SELLER',800,133.333,666.667),
('b05fea1c-11dc-4e4c-8cc9-5d6af7d2d954','TRY','cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-31 10:58:52','2026-03-31 10:58:52','2026-03-31 10:58:52','','','CREDIT_TO_SELLER',700,116.667,583.333),
('f1dfaf39-5b59-47b6-91f5-6964ac6e4be1','TRY','c2a6c7f0-d11d-4aef-ba23-556aad150050','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-31 12:07:20','2026-03-31 12:07:20','2026-03-31 12:07:20','','','CREDIT_TO_SELLER',1000,166.667,833.333),
('345d1b0d-be1a-4bf4-b252-71319c56e707','TRY','bdc318a1-2832-42fc-8cba-7a75a8d112d8','5e72f829-e4ed-4ccd-8971-509708f42212','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-01 12:18:00','2026-04-01 12:18:00','2026-04-01 12:18:00','','','CREDIT_TO_SELLER',500,83.3333,416.667),
('09e616d7-2ef8-4326-bc5b-7873cb211c39','TRY','af94372d-4a92-4409-a49b-4d3f079129a8','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-29 21:03:00','2026-03-29 21:03:00','2026-03-29 21:03:00','','','CREDIT_TO_SELLER',1200,200,1000),
('700b692e-1dc5-436d-b21e-842dda9a4edc','TRY','b4912aeb-5c11-403c-81bb-588da87592ed','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-28 14:38:32','2026-03-28 14:38:32','2026-03-28 14:38:32','','','CREDIT_TO_SELLER',700,116.667,583.333),
('7ba4e0e1-8f5a-43bd-be70-86667fa05b33','TRY','5250a81a-6d49-4d3c-ad7e-56013dba864d','5e72f829-e4ed-4ccd-8971-509708f42212','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-28 14:33:27','2026-03-28 14:33:27','2026-03-28 14:33:27','','','CREDIT_TO_SELLER',500,83.3333,416.667),
('cfd42d82-05c6-4b34-ba76-87d0b29e610a','TRY','5250a81a-6d49-4d3c-ad7e-56013dba864d','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,1,1,'2026-03-28 14:33:27','2026-03-29 22:03:34','2026-03-29 22:03:34','','','CREDIT_TO_SELLER',600,100,500),
('4075653d-133e-4f4c-83a4-a6be7013cff5','TRY','3377a6d8-0ae0-4e1e-a2d7-c8885587eb0f','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-28 14:20:07','2026-03-28 14:20:07','2026-03-28 14:20:07','','','CREDIT_TO_SELLER',700,116.667,583.333),
('c3e9150b-7ab1-45f0-94b2-c6d4130477d6','TRY','dce665d2-1d97-4cf1-9529-7e4ef5c12b1f','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-28 14:23:17','2026-03-28 14:23:17','2026-03-28 14:23:17','','','CREDIT_TO_SELLER',400,66.6667,333.333),
('64c2b726-3771-45d0-897f-c8c2dee97e99','TRY','b4912aeb-5c11-403c-81bb-588da87592ed','5e72f829-e4ed-4ccd-8971-509708f42212','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-28 14:38:32','2026-03-28 14:38:32','2026-03-28 14:38:32','','','CREDIT_TO_SELLER',800,133.333,666.667),
('2229f700-3c4c-4ae8-8225-d0f8afb52c18','TRY','f6e28e3d-fd4e-49f6-b740-cfcf04571146','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-04-01 12:02:21','2026-04-01 12:02:21','2026-04-01 12:02:21','','','CREDIT_TO_SELLER',500,83.3333,416.667),
('910bdee6-1548-418c-8e34-d38664734d8f','TRY','69e44495-cab2-4dde-ae7e-70c89451c286','5e72f829-e4ed-4ccd-8971-509708f42212','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-29 21:04:58','2026-03-29 21:04:58','2026-03-29 21:04:58','','','CREDIT_TO_SELLER',500,83.3333,416.667),
('55d54801-06d8-43f6-ad38-f1a1e32f5848','TRY','cbb58ca9-25c4-4f15-a903-f67d59d1ede1','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-28 14:21:07','2026-03-28 14:21:07','2026-03-28 14:21:07','','','CREDIT_TO_SELLER',900,150,750),
('8253d141-418d-44cb-80f6-f3fb0cc7617d','TRY','d4668779-7454-4f6a-b81c-ba9aa510e070','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-31 12:08:07','2026-03-31 12:08:07','2026-03-31 12:08:07','','','CREDIT_TO_SELLER',500,83.3333,416.667),
('7a9dfcc1-a257-4d22-a311-ffb31cf884f6','TRY','5564f851-c835-4667-b894-c654b69a93f6','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-28 14:23:53','2026-03-28 14:23:53','2026-03-28 14:23:53','','','CREDIT_TO_SELLER',200,33.3333,166.667);
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

-- Dump completed on 2026-04-02 16:24:07
