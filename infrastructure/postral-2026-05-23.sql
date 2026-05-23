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
('001e0253-6061-4c85-8eef-15d3abad1a0a','New Account','1111111111','INDIVIDUAL','794ac8a5-c028-442c-a6a1-8a5cef004b31',0,'','','',NULL,''),
('a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','44516019088','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'Akbank',NULL,NULL,NULL,'Bahçelievler'),
('418b63a1-45ba-4806-a99a-1d8852be3211','New Account','','INDIVIDUAL',NULL,1,NULL,'','',NULL,''),
('a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','1111111111','INDIVIDUAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'',NULL,NULL,NULL,NULL),
('5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','1111111111','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'Esen Yayınları YGS Matematik soru bankası','TR31313113131','31313131',NULL,NULL),
('cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','1111111111','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'Jerry Acelesi Yok',NULL,NULL,NULL,NULL),
('bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','11111111111','INDIVIDUAL','287c8d95-9fe2-4a22-a79b-97500dbbc8f6',0,'TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('456be558-18e9-4c48-a70a-861727616ec2','New Account','1111111111','INDIVIDUAL','794ac8a5-c028-442c-a6a1-8a5cef004b31',1,'','','',NULL,''),
('913252c1-d094-40de-a13c-8dc1142b9222','Lotus Eğitim','1111111111','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1111111111','COMMERCIAL','91587983-a95f-4934-895f-a3f9f5fdaed1',0,'Kısmet XNXX','TR760009901234567800100001','',NULL,'Testo'),
('9424fdad-b2ce-4952-973e-d6c21133eefa','saxton','1111111111','INDIVIDUAL','794ac8a5-c028-442c-a6a1-8a5cef004b31',0,'','','',NULL,''),
('eb191f6a-60ef-4450-8877-e9c1a31e2197','New Account','','INDIVIDUAL',NULL,1,NULL,NULL,NULL,NULL,NULL),
('294ecf2a-0ef0-42a6-830a-f5d17c983795','New Account','','INDIVIDUAL',NULL,1,NULL,'','',NULL,'');
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
('b0621690-b297-414b-b421-0c7407603034','a6a052c8-5a8d-41e8-86dd-4bbeebb5d71b','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','9f608673-b874-4447-bcc8-2c235780cc13',NULL,'CREDIT','COMPLETED','2026-05-08 11:22:18','2026-05-08 11:22:18','','Payment purchase for payment id 9f608673-b874-4447-bcc8-2c235780cc13. Customer: Frisk Dreemurr',112.0000,18.6667),
('4439fd15-ae00-47b8-ac96-0e0d8d9bc98f','57d30692-60bc-49f9-9147-e41d8c29d59f','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','30e09c8d-d8b2-405b-ac5c-b5c498d4bddc',NULL,'DEBIT','COMPLETED','2026-04-14 12:48:16','2026-04-14 12:48:16','','Payment purchase for payment id 30e09c8d-d8b2-405b-ac5c-b5c498d4bddc. Sellers: Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('a56d9143-f10d-4b53-a6ab-104652323549','941ffb96-d921-4e82-baf5-2bf0e4c018d4','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','3710202d-952c-4488-8f4d-4102000df39d',NULL,'CREDIT','COMPLETED','2026-05-14 12:47:44','2026-05-14 12:47:44','','Payment purchase for payment id 3710202d-952c-4488-8f4d-4102000df39d. Customer: Kyle Broflovski',33.0000,5.5000),
('52f8a3e1-d08d-4fc9-ab5c-1052d7dbbce5','8d44d12a-5d62-40f9-b3d5-26278096d5e9','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','acebf506-e0ca-42d2-b9e1-6e192b86e53f',NULL,'DEBIT','COMPLETED','2026-04-13 09:26:45','2026-04-13 09:26:45','','Payment purchase for payment id acebf506-e0ca-42d2-b9e1-6e192b86e53f. Sellers: Omodog',0.0000,0.0000),
('6029a2c6-7a29-4e1f-85d0-105c9234e43d','e66911ba-6b44-4d23-a9c7-4756aaf1f55b','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','5c94c159-611c-4a6d-8498-b0daaea9b234',NULL,'DEBIT','COMPLETED','2026-04-30 22:16:40','2026-04-30 22:16:40','','Payment purchase for payment id 5c94c159-611c-4a6d-8498-b0daaea9b234. Sellers: Esenler Motionstar Incorporated, Doofenshmirtz Evil Inc, Tetakent (H.C.G), Omodog',1976.0000,277.5152),
('6d86f58d-485b-480e-ba8d-10bb73ca9306','450ae594-635c-4f2a-9449-4252e0c56a67','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','01950684-f005-499c-8e8c-c07d62d3b85d',NULL,'CREDIT','COMPLETED','2026-04-30 22:54:54','2026-04-30 22:54:54','','Payment purchase for payment id 01950684-f005-499c-8e8c-c07d62d3b85d. Customer: Frisk Dreemurr',560.0000,93.3333),
('a7edc317-3efc-431c-a7a8-1340752d0f98','d5dfebc0-4c35-429b-8253-de801939673f','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','cbb58ca9-25c4-4f15-a903-f67d59d1ede1',NULL,'CREDIT','COMPLETED','2026-03-28 14:21:07','2026-03-28 14:21:07','','Payment purchase for payment id cbb58ca9-25c4-4f15-a903-f67d59d1ede1. Customer: Frisk Dreemurr',0.0000,0.0000),
('7dce1756-261a-42ca-9396-13c1a177936e','e66911ba-6b44-4d23-a9c7-4756aaf1f55b','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','5c94c159-611c-4a6d-8498-b0daaea9b234',NULL,'CREDIT','COMPLETED','2026-04-30 22:16:40','2026-04-30 22:16:40','','Payment purchase for payment id 5c94c159-611c-4a6d-8498-b0daaea9b234. Customer: Frisk Dreemurr',1212.0000,202.0000),
('a3f6920d-bf1e-480b-89d7-13d159ab56e7','febbfa56-580c-4219-8c73-719b50531c32','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','ed2b84ab-8476-42f8-b8ef-64e38b0b4872',NULL,'DEBIT','COMPLETED','2026-04-11 12:27:26','2026-04-11 12:27:26','','Payment purchase for payment id ed2b84ab-8476-42f8-b8ef-64e38b0b4872. Sellers: Omodog',0.0000,0.0000),
('43801b98-29f0-40f5-a25c-1879eae775d3','26dc1521-9c78-4732-9f4c-5e403c01d1c1','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a',NULL,'DEBIT','COMPLETED','2026-03-31 10:58:52','2026-03-31 10:58:52','','Payment purchase for payment id cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a. Sellers: Omodog',0.0000,0.0000),
('a9388467-8297-4bc4-a5a2-18ef7706e204','41ce3295-d12a-410b-8a09-a3797f41170f','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c3c816e5-1fdd-4021-a81a-2a211325bc15',NULL,'DEBIT','COMPLETED','2026-05-04 14:49:53','2026-05-04 14:49:53','','Payment purchase for payment id c3c816e5-1fdd-4021-a81a-2a211325bc15. Sellers: Omodog',1155.0000,192.5000),
('8bade2c0-e2ba-43bb-86ac-1997ecdf2583','26dc1521-9c78-4732-9f4c-5e403c01d1c1','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a',NULL,'CREDIT','COMPLETED','2026-03-31 10:58:52','2026-03-31 10:58:52','','Payment purchase for payment id cbc2a9fe-cdbf-4e3c-97a8-a9f69c89258a. Customer: Frisk Dreemurr',0.0000,0.0000),
('0de56aa2-085b-404b-9372-1cbef8ffdde2','53448fb3-9d45-410b-8da7-e2189fcca34c','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','97ce01db-fe13-428e-8b3f-ad9e49c2953b',NULL,'CREDIT','COMPLETED','2026-04-30 23:19:31','2026-04-30 23:19:31','','Payment purchase for payment id 97ce01db-fe13-428e-8b3f-ad9e49c2953b. Customer: Frisk Dreemurr',88.0000,14.6667),
('1c8ceccd-1b92-410b-b657-1ccc0d6b71a9','30a37fea-e140-457d-af06-bf0683dfb567','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','4258e2f6-3039-4386-867a-647b5f8ef0af',NULL,'CREDIT','COMPLETED','2026-05-04 14:47:11','2026-05-04 14:47:11','','Payment purchase for payment id 4258e2f6-3039-4386-867a-647b5f8ef0af. Customer: Kyle Broflovski',70.0000,11.6667),
('73a83802-46c4-4295-9e4f-1ce82cc22907','2732ac9c-98e4-4b59-9348-b770c9cd50ee','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','b0a028b8-c701-4e43-9d5f-1e182b236640',NULL,'DEBIT','COMPLETED','2026-04-14 12:43:14','2026-04-14 12:43:14','','Payment purchase for payment id b0a028b8-c701-4e43-9d5f-1e182b236640. Sellers: Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('175e1462-a2a9-4625-a1bb-1d50ee1e95c4','5c389de0-6456-4376-a08a-f53c86813d5d','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','23356d08-93c9-4ea2-b66d-d68c14861ec7',NULL,'DEBIT','COMPLETED','2026-05-14 12:37:22','2026-05-14 12:37:22','','Payment purchase for payment id 23356d08-93c9-4ea2-b66d-d68c14861ec7. Sellers: Tetakent (H.C.G)',5453.7367,0.0000),
('cc875da8-0b37-4685-9807-1de19ca59b4e','ce119dca-4000-4c05-987e-982a90508ec1','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','6ed605eb-41d2-4eba-ba88-e5b5ec76cb67',NULL,'CREDIT','COMPLETED','2026-03-31 11:59:13','2026-03-31 11:59:13','','Payment purchase for payment id 6ed605eb-41d2-4eba-ba88-e5b5ec76cb67. Customer: Frisk Dreemurr',0.0000,0.0000),
('449de6bd-ec01-47aa-b2e3-1dfbaa1a7098','a6a052c8-5a8d-41e8-86dd-4bbeebb5d71b','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','9f608673-b874-4447-bcc8-2c235780cc13',NULL,'CREDIT','COMPLETED','2026-05-08 11:22:18','2026-05-08 11:22:18','','Payment purchase for payment id 9f608673-b874-4447-bcc8-2c235780cc13. Customer: Frisk Dreemurr',1212.0000,202.0000),
('d4a8e2e5-d464-4230-b8ce-1eaedad9d086','ab5da9f1-a2e6-4c97-b539-987762d65493','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','21a1914c-2f02-468a-9969-c82851f5cde7',NULL,'DEBIT','COMPLETED','2026-03-31 11:41:43','2026-03-31 11:41:43','','Payment purchase for payment id 21a1914c-2f02-468a-9969-c82851f5cde7. Sellers: Omodog',0.0000,0.0000),
('b4f39290-89db-430a-b572-1f4da2b293fb','6b8ad375-e6ea-40fa-be3f-c74c2fbe9658','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','90b7bd2a-6723-4265-b782-242720019812',NULL,'CREDIT','COMPLETED','2026-04-11 12:48:28','2026-04-11 12:48:28','','Payment purchase for payment id 90b7bd2a-6723-4265-b782-242720019812. Customer: Frisk Dreemurr',0.0000,0.0000),
('63a5e9ef-9e70-46f9-a1b3-1f6f8213181d','ee69fd43-1a19-48d6-a5c1-5fcb598dfb96','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','ee6dcff0-2fec-4eee-a470-8050c3980833',NULL,'CREDIT','COMPLETED','2026-05-11 14:28:06','2026-05-11 14:28:06','','Payment purchase for payment id ee6dcff0-2fec-4eee-a470-8050c3980833. Customer: Kyle Broflovski',3636.0000,606.0000),
('22542026-5994-4b5d-aab9-1fcd466d316b','722dca1f-9c99-4374-b23c-e81ee74baa78','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','4a44fe14-64c1-4907-b9b2-a75550404178',NULL,'CREDIT','COMPLETED','2026-05-04 14:30:21','2026-05-04 14:30:21','','Payment purchase for payment id 4a44fe14-64c1-4907-b9b2-a75550404178. Customer: Esenler Motionstar Incorporated',9.6251,1.6042),
('273a0e76-d47c-4a39-be38-20bf535de24a','61627381-5591-4b77-b03f-dadd02637923','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','c2f20787-32ee-4e8a-9385-4938bc36dff6',NULL,'CREDIT','COMPLETED','2026-04-14 12:53:12','2026-04-14 12:53:12','','Payment purchase for payment id c2f20787-32ee-4e8a-9385-4938bc36dff6. Customer: Frisk Dreemurr',0.0000,0.0000),
('8877a4c6-09e1-41e9-bde3-21425b5e13df','c4296c87-1418-4465-8d3d-efefe07c5eed','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','5564f851-c835-4667-b894-c654b69a93f6',NULL,'CREDIT','COMPLETED','2026-03-28 14:23:53','2026-03-28 14:23:53','','Payment purchase for payment id 5564f851-c835-4667-b894-c654b69a93f6. Customer: Frisk Dreemurr',0.0000,0.0000),
('6bdd24cc-f0a8-4928-9204-2528c362d67d','a082003e-a2c9-4458-94f9-e0832d877504','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','9d7a02a8-6a03-4abe-98e4-15ad3416852a',NULL,'CREDIT','COMPLETED','2026-04-27 14:31:39','2026-04-27 14:31:39','','Payment purchase for payment id 9d7a02a8-6a03-4abe-98e4-15ad3416852a. Customer: Frisk Dreemurr',8484.0000,1414.0000),
('648b1749-f31a-4a9e-bcee-263ea8c38417','4e336289-a56a-4cee-ba8d-1cf06296d2dc','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','b4581706-bea2-47d3-bc0f-8afef71c056f',NULL,'DEBIT','COMPLETED','2026-05-13 19:20:40','2026-05-13 19:20:40','','Payment purchase for payment id b4581706-bea2-47d3-bc0f-8afef71c056f. Sellers: Omodog',1704.0000,180.3636),
('48ff143f-58cf-4fef-8f34-2707ef1b5195','098d595b-af3f-4511-ba22-431c9a963a76','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','fadd1328-7198-408e-8405-9eda402b9dda',NULL,'CREDIT','COMPLETED','2026-04-29 13:57:45','2026-04-29 13:57:45','','Payment purchase for payment id fadd1328-7198-408e-8405-9eda402b9dda. Customer: Frisk Dreemurr',1080.0000,102.2727),
('fa90a5b8-2f67-468b-a46c-278a99aa938f','a082003e-a2c9-4458-94f9-e0832d877504','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','9d7a02a8-6a03-4abe-98e4-15ad3416852a',NULL,'CREDIT','COMPLETED','2026-04-27 14:31:39','2026-04-27 14:31:39','','Payment purchase for payment id 9d7a02a8-6a03-4abe-98e4-15ad3416852a. Customer: Frisk Dreemurr',724.0000,120.6667),
('3eb2464c-be5d-4aa6-8d68-2848d86a3809','d5dfebc0-4c35-429b-8253-de801939673f','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','cbb58ca9-25c4-4f15-a903-f67d59d1ede1',NULL,'DEBIT','COMPLETED','2026-03-28 14:21:07','2026-03-28 14:21:07','','Payment purchase for payment id cbb58ca9-25c4-4f15-a903-f67d59d1ede1. Sellers: Omodog, Tetakent (H.C.G), Esenler Motionstar Incorporated',0.0000,0.0000),
('e8a37a5f-2eb2-4b38-bca1-284f7566321c','9f7a91ba-1674-4bcd-aa84-883fcd57ac34','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','7c5d86a3-fe30-4496-88d4-45b9d4501888',NULL,'DEBIT','COMPLETED','2026-04-13 08:54:32','2026-04-13 08:54:32','','Payment purchase for payment id 7c5d86a3-fe30-4496-88d4-45b9d4501888. Sellers: Omodog',0.0000,0.0000),
('c3996155-37a7-42f8-95be-292558c18325','2732ac9c-98e4-4b59-9348-b770c9cd50ee','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','b0a028b8-c701-4e43-9d5f-1e182b236640',NULL,'CREDIT','COMPLETED','2026-04-14 12:43:14','2026-04-14 12:43:14','','Payment purchase for payment id b0a028b8-c701-4e43-9d5f-1e182b236640. Customer: Frisk Dreemurr',0.0000,0.0000),
('b314ba9e-b1f1-4932-af8e-2abd06fde4df','17c2145f-8431-4354-bb07-38c564998f84','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','28e22fcf-fd10-495c-8273-be41b7d47cbf',NULL,'DEBIT','COMPLETED','2026-05-04 14:30:31','2026-05-04 14:30:31','','Payment purchase for payment id 28e22fcf-fd10-495c-8273-be41b7d47cbf. Sellers: Doofenshmirtz Evil Inc',24.0322,0.0000),
('7eb4b4fa-8200-4db3-92d0-2c92230b9574','27e49d1f-13be-4671-bd85-bfd960ddc61d','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','4e54d5a8-feb3-48b9-a357-76608ee633b1',NULL,'CREDIT','COMPLETED','2026-05-13 19:27:33','2026-05-13 19:27:33','','Payment purchase for payment id 4e54d5a8-feb3-48b9-a357-76608ee633b1. Customer: Kyle Broflovski',1259.0000,183.9242),
('02a8c255-fe78-4c62-80e9-2cc070b3bbfb','96266d64-1edd-450b-a660-1c393a3cecd8','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','7f06a8cc-164c-4196-a2eb-09e7f70e272b',NULL,'CREDIT','COMPLETED','2026-05-04 14:31:07','2026-05-04 14:31:07','','Payment purchase for payment id 7f06a8cc-164c-4196-a2eb-09e7f70e272b. Customer: Tetakent (H.C.G)',11278.4658,0.0000),
('fe8792da-96af-4bf9-a113-2d2ced76702c','946e4903-c899-4bb6-a320-26d37f3cdf57','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','b4912aeb-5c11-403c-81bb-588da87592ed',NULL,'CREDIT','COMPLETED','2026-03-28 14:38:32','2026-03-28 14:38:32','','Payment purchase for payment id b4912aeb-5c11-403c-81bb-588da87592ed. Customer: Frisk Dreemurr',0.0000,0.0000),
('ec0cf43c-a813-4b98-87aa-2d984190cc28','c75e19e1-8a7c-432f-b0e3-173eb2f4b4a6','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','bd8e8e57-269a-4d27-b1ad-698289104c89',NULL,'DEBIT','COMPLETED','2026-04-29 14:36:06','2026-04-29 14:36:06','','Payment purchase for payment id bd8e8e57-269a-4d27-b1ad-698289104c89. Sellers: Omodog, Tetakent (H.C.G)',1778.0000,270.4242),
('1c715dda-3a17-4213-9b1d-2e4196e488e2','2a333f87-b924-46a4-ba69-d699b1b374aa','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4',NULL,'CREDIT','COMPLETED','2026-04-29 14:20:56','2026-04-29 14:20:56','','Payment purchase for payment id 2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4. Customer: Frisk Dreemurr',1134.0000,111.2727),
('2a3238a2-9786-4418-925f-2e58d3d42922','309b68be-f65e-4a34-b7cf-8568ab4f244a','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','2f6dc481-f941-4b12-90d3-acc9554773f4',NULL,'DEBIT','COMPLETED','2026-04-13 12:34:50','2026-04-13 12:34:50','','Payment purchase for payment id 2f6dc481-f941-4b12-90d3-acc9554773f4. Sellers: Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('af79936c-565b-4867-8d10-2e7ae31fb095','df18562b-33b9-478e-b84d-1341f0cdba9f','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','b9e79db5-5d1f-4d79-8ef3-23ad5a51093a',NULL,'DEBIT','COMPLETED','2026-05-13 21:33:33','2026-05-13 21:33:33','','Payment purchase for payment id b9e79db5-5d1f-4d79-8ef3-23ad5a51093a. Sellers: Esenler Motionstar Incorporated',88.0000,14.6667),
('fb15d636-3f49-44ed-8d21-3089cedc3aeb','36a81cdb-532d-4746-bad3-8fc25b454989','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','5250a81a-6d49-4d3c-ad7e-56013dba864d',NULL,'DEBIT','COMPLETED','2026-03-28 14:33:27','2026-03-28 14:33:27','','Payment purchase for payment id 5250a81a-6d49-4d3c-ad7e-56013dba864d. Sellers: Omodog, Doofenshmirtz Evil Inc, Esenler Motionstar Incorporated, Tetakent (H.C.G)',0.0000,0.0000),
('eae4dbd2-4f5f-4bb3-b192-31042dff0f5c','8e1d661e-3135-4bb0-9891-9e690bff993f','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','e8a977da-ec64-454e-bcc6-aa14aab609b5',NULL,'CREDIT','COMPLETED','2026-04-30 22:57:40','2026-04-30 22:57:40','','Payment purchase for payment id e8a977da-ec64-454e-bcc6-aa14aab609b5. Customer: Frisk Dreemurr',2424.0000,404.0000),
('05fe6289-aead-48d5-adc2-310a6479ade4','6f271261-8978-4134-a0c4-64ca63dbbf1f','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','bdc318a1-2832-42fc-8cba-7a75a8d112d8',NULL,'CREDIT','COMPLETED','2026-04-01 12:18:00','2026-04-01 12:18:00','','Payment purchase for payment id bdc318a1-2832-42fc-8cba-7a75a8d112d8. Customer: Frisk Dreemurr',0.0000,0.0000),
('a4611bee-3d73-4bee-b357-345cc146b44b','73ab76ab-e9c2-4a81-9fa8-5b6dd0ecc24f','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c2a6c7f0-d11d-4aef-ba23-556aad150050',NULL,'DEBIT','COMPLETED','2026-03-31 12:07:20','2026-03-31 12:07:20','','Payment purchase for payment id c2a6c7f0-d11d-4aef-ba23-556aad150050. Sellers: Omodog',0.0000,0.0000),
('62133446-e84e-492e-bbcf-3669cc4597ff','4d6c363a-51f1-4d62-a62e-3c9e91f996f2','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c676457a-b61a-4fa2-a67e-f963453ebb03',NULL,'DEBIT','COMPLETED','2026-03-28 10:53:06','2026-03-28 10:53:06','','Payment purchase for payment id c676457a-b61a-4fa2-a67e-f963453ebb03. Sellers: Omodog',0.0000,0.0000),
('be7c1360-f784-49d5-ad2c-373bbc498a1b','b99199ef-0b6d-4f7f-8c39-952c4477b722','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','ceef3403-4c23-4eb9-9398-875bb44e068a',NULL,'DEBIT','COMPLETED','2026-05-04 14:30:53','2026-05-04 14:30:53','','Payment purchase for payment id ceef3403-4c23-4eb9-9398-875bb44e068a. Sellers: Esenler Motionstar Incorporated',198.2675,0.0000),
('bfa0eabb-ba89-49bc-8c54-3894e6cd225f','3645795b-d7f5-44de-902c-227844d625b8','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','4ac4c8fd-fc82-4a56-b38b-c5b4d78d5e45',NULL,'CREDIT','COMPLETED','2026-05-04 14:38:29','2026-05-04 14:38:29','','Payment purchase for payment id 4ac4c8fd-fc82-4a56-b38b-c5b4d78d5e45. Customer: Kyle Broflovski',2424.0000,404.0000),
('f2b200f5-3e35-4654-ae46-3957320ea684','17756f91-5713-4147-aac8-1f0e06581100','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','9c40090e-8c3b-4aad-a9b5-2347cc2fc6fa',NULL,'DEBIT','COMPLETED','2026-05-14 12:36:34','2026-05-14 12:36:34','','Payment purchase for payment id 9c40090e-8c3b-4aad-a9b5-2347cc2fc6fa. Sellers: Omodog',1704.0000,180.3636),
('a97f1069-c7f3-4562-b3cd-3984ec56dd4f','5367f248-d8b8-483b-9463-5492edcd5923','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','ddca578b-583d-4008-8497-39bd8e360304',NULL,'DEBIT','COMPLETED','2026-04-01 12:31:41','2026-04-01 12:31:41','','Payment purchase for payment id ddca578b-583d-4008-8497-39bd8e360304. Sellers: Omodog',0.0000,0.0000),
('6e3cb134-5766-43bc-8220-3add62da49d1','3645795b-d7f5-44de-902c-227844d625b8','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','4ac4c8fd-fc82-4a56-b38b-c5b4d78d5e45',NULL,'DEBIT','COMPLETED','2026-05-04 14:38:29','2026-05-04 14:38:29','','Payment purchase for payment id 4ac4c8fd-fc82-4a56-b38b-c5b4d78d5e45. Sellers: Omodog, Tetakent (H.C.G)',2787.0000,464.5000),
('fd7ad9fd-5840-42b7-87d9-3afe40476ea1','b8f592b9-733b-4649-b2fc-18b0c1f3bb9e','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','f12e565f-076b-4859-bb80-8995c8822379',NULL,'DEBIT','COMPLETED','2026-05-02 17:01:05','2026-05-02 17:01:05','','Payment purchase for payment id f12e565f-076b-4859-bb80-8995c8822379. Sellers: Tetakent (H.C.G)',149.6780,24.9463),
('e42362b0-e776-4130-8aa6-3ba612e9e585','0b5cfc39-99be-4663-b42b-f5d276ca8cd9','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','202f9f6f-8506-469a-a230-c746387282bd',NULL,'DEBIT','COMPLETED','2026-05-13 19:12:53','2026-05-13 19:12:53','','Payment purchase for payment id 202f9f6f-8506-469a-a230-c746387282bd. Sellers: Omodog',1370.0000,176.5152),
('8d90e84c-5427-42ac-ba38-3c5dbb3b7234','fba90408-9952-4ae0-85b2-40851cbc59e3','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','d85e328f-fea2-4558-9cb7-f163a8c2e655',NULL,'DEBIT','COMPLETED','2026-03-30 19:49:33','2026-03-30 19:49:33','','Payment purchase for payment id d85e328f-fea2-4558-9cb7-f163a8c2e655. Sellers: Omodog',0.0000,0.0000),
('4469104a-735f-4c1c-ac60-3e1b8dcfd9c4','73ab76ab-e9c2-4a81-9fa8-5b6dd0ecc24f','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c2a6c7f0-d11d-4aef-ba23-556aad150050',NULL,'CREDIT','COMPLETED','2026-03-31 12:07:20','2026-03-31 12:07:20','','Payment purchase for payment id c2a6c7f0-d11d-4aef-ba23-556aad150050. Customer: Frisk Dreemurr',0.0000,0.0000),
('ff780ea7-5090-4120-b3d6-3f7584bda21f','76d0dd57-3ad8-4493-b0ef-326fce854716','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','be446f77-c6cf-4394-8f84-f852b0ac1e8d',NULL,'DEBIT','COMPLETED','2026-05-01 21:19:11','2026-05-01 21:19:11','','Payment purchase for payment id be446f77-c6cf-4394-8f84-f852b0ac1e8d. Sellers: Omodog',290.0000,48.3333),
('aecce6c0-fa68-41da-b039-3f93c1f07124','8cd99303-310e-46bd-b468-28b701affb8c','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','b63fd97f-f09e-4ef8-875c-fcc40009bf46',NULL,'DEBIT','COMPLETED','2026-03-28 10:51:31','2026-03-28 10:51:31','','Payment purchase for payment id b63fd97f-f09e-4ef8-875c-fcc40009bf46. Sellers: Omodog',0.0000,0.0000),
('87c962b3-b193-4f0e-8c5d-40b54f240ca4','11625c02-2413-49dd-9e89-220e4e2cd253','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c4eed229-155b-48fe-8d93-a6adf4d96140',NULL,'CREDIT','COMPLETED','2026-04-21 02:32:15','2026-04-21 02:32:15','','Payment purchase for payment id c4eed229-155b-48fe-8d93-a6adf4d96140. Customer: Kyle Broflovski',467.0000,51.9243),
('14da2798-2bea-44f2-94c1-40f85935e5ce','a820ab13-eed3-44e6-9b0f-82ae20e55878','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',NULL,'CREDIT','COMPLETED','2026-04-27 15:26:08','2026-04-27 15:26:08','','Payment purchase for payment id 86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5. Customer: Frisk Dreemurr',2424.0000,404.0000),
('5a81af85-1bfd-432e-b363-421350700746','5caf1297-9beb-410a-8e57-197290cc44f0','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','ac1c1ed3-a903-4639-a3fc-403b70c7f4b3',NULL,'CREDIT','COMPLETED','2026-05-14 13:16:53','2026-05-14 13:16:53','','Payment purchase for payment id ac1c1ed3-a903-4639-a3fc-403b70c7f4b3. Customer: Kyle Broflovski',60.0000,10.0000),
('c0e8bff5-dc57-42de-9fe4-43412a36a137','ee75733d-2605-4143-8001-7148093bca55','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c937dfe7-68d2-4884-be98-0b9b77df1196',NULL,'DEBIT','COMPLETED','2026-03-28 10:54:12','2026-03-28 10:54:12','','Payment purchase for payment id c937dfe7-68d2-4884-be98-0b9b77df1196. Sellers: Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('a238781e-2d0d-4911-b773-44409a8f857e','946e4903-c899-4bb6-a320-26d37f3cdf57','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','b4912aeb-5c11-403c-81bb-588da87592ed',NULL,'CREDIT','COMPLETED','2026-03-28 14:38:32','2026-03-28 14:38:32','','Payment purchase for payment id b4912aeb-5c11-403c-81bb-588da87592ed. Customer: Frisk Dreemurr',0.0000,0.0000),
('73859d3a-cbf2-4866-9b4e-456a892492fa','b404695a-1755-4012-8251-5ba50a95e1e2','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','b95b4f3f-29b5-4937-8489-a05293cf527c',NULL,'DEBIT','COMPLETED','2026-05-14 12:37:14','2026-05-14 12:37:14','','Payment purchase for payment id b95b4f3f-29b5-4937-8489-a05293cf527c. Sellers: Tetakent (H.C.G)',3.5000,0.5833),
('aa0f98b5-e291-4833-8b8d-45803d8bba17','d4cc7675-c6ad-43ee-a493-aa5d8768ee0c','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','46447df0-7deb-4677-9caa-45b4ff585820',NULL,'CREDIT','COMPLETED','2026-04-27 15:22:49','2026-04-27 15:22:49','','Payment purchase for payment id 46447df0-7deb-4677-9caa-45b4ff585820. Customer: Frisk Dreemurr',4848.0000,808.0000),
('5232b2ed-af59-481e-b601-4a81db162ce3','9f7a91ba-1674-4bcd-aa84-883fcd57ac34','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','7c5d86a3-fe30-4496-88d4-45b9d4501888',NULL,'CREDIT','COMPLETED','2026-04-13 08:54:32','2026-04-13 08:54:32','','Payment purchase for payment id 7c5d86a3-fe30-4496-88d4-45b9d4501888. Customer: Frisk Dreemurr',0.0000,0.0000),
('84f81d1b-3220-46c9-a703-4b18f6406ba4','9b2a433d-d6dc-497c-9780-59fed73f3091','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','af94372d-4a92-4409-a49b-4d3f079129a8',NULL,'CREDIT','COMPLETED','2026-03-29 21:03:00','2026-03-29 21:03:00','','Payment purchase for payment id af94372d-4a92-4409-a49b-4d3f079129a8. Customer: Frisk Dreemurr',0.0000,0.0000),
('31f52910-6529-4e04-864b-4c9cab0b15f0','30a37fea-e140-457d-af06-bf0683dfb567','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','4258e2f6-3039-4386-867a-647b5f8ef0af',NULL,'DEBIT','COMPLETED','2026-05-04 14:47:11','2026-05-04 14:47:11','','Payment purchase for payment id 4258e2f6-3039-4386-867a-647b5f8ef0af. Sellers: Omodog, Doofenshmirtz Evil Inc, Tetakent (H.C.G)',2830.0000,471.6667),
('cb3eb26d-dbfe-42b9-9bec-4e3017d65e62','36a81cdb-532d-4746-bad3-8fc25b454989','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','5250a81a-6d49-4d3c-ad7e-56013dba864d',NULL,'CREDIT','COMPLETED','2026-03-28 14:33:27','2026-03-28 14:33:27','','Payment purchase for payment id 5250a81a-6d49-4d3c-ad7e-56013dba864d. Customer: Frisk Dreemurr',0.0000,0.0000),
('cc381bd4-ac0a-4a13-bb50-4f9fb98203e6','da7d2580-e8c4-45b0-a62f-cd777bc3397b','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','dce665d2-1d97-4cf1-9529-7e4ef5c12b1f',NULL,'DEBIT','COMPLETED','2026-03-28 14:23:17','2026-03-28 14:23:17','','Payment purchase for payment id dce665d2-1d97-4cf1-9529-7e4ef5c12b1f. Sellers: Omodog',0.0000,0.0000),
('c33afa97-d707-4811-95af-56c44c9951e5','ce119dca-4000-4c05-987e-982a90508ec1','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','6ed605eb-41d2-4eba-ba88-e5b5ec76cb67',NULL,'DEBIT','COMPLETED','2026-03-31 11:59:13','2026-03-31 11:59:13','','Payment purchase for payment id 6ed605eb-41d2-4eba-ba88-e5b5ec76cb67. Sellers: Omodog',0.0000,0.0000),
('0bd08d95-4765-4641-8d9a-57390d883ae4','744f7ffe-e6ae-4ece-ac7f-7063017a0091','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','c5cef75d-bb65-46b3-9375-3a5cc39920b6',NULL,'CREDIT','COMPLETED','2026-04-27 15:07:26','2026-04-27 15:07:26','','Payment purchase for payment id c5cef75d-bb65-46b3-9375-3a5cc39920b6. Customer: Frisk Dreemurr',33.0000,5.5000),
('12fff0f9-2686-4253-ad03-58f6e290d890','005c15be-55c5-46c8-8fca-b9cba0d9ed23','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','28100ad5-150e-4139-a68d-ff874dbb7104',NULL,'CREDIT','COMPLETED','2026-04-13 12:07:05','2026-04-13 12:07:05','','Payment purchase for payment id 28100ad5-150e-4139-a68d-ff874dbb7104. Customer: Frisk Dreemurr',0.0000,0.0000),
('e575deb4-3fff-4162-8358-59571cc1fce9','ee75733d-2605-4143-8001-7148093bca55','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','c937dfe7-68d2-4884-be98-0b9b77df1196',NULL,'CREDIT','COMPLETED','2026-03-28 10:54:12','2026-03-28 10:54:12','','Payment purchase for payment id c937dfe7-68d2-4884-be98-0b9b77df1196. Customer: Frisk Dreemurr',0.0000,0.0000),
('2ed91201-9b56-49a2-852b-59ac0e041af4','309b68be-f65e-4a34-b7cf-8568ab4f244a','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','2f6dc481-f941-4b12-90d3-acc9554773f4',NULL,'CREDIT','COMPLETED','2026-04-13 12:34:50','2026-04-13 12:34:50','','Payment purchase for payment id 2f6dc481-f941-4b12-90d3-acc9554773f4. Customer: Frisk Dreemurr',0.0000,0.0000),
('3ba74070-6e5f-4115-a934-5aa95ce1d2ff','3645795b-d7f5-44de-902c-227844d625b8','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','4ac4c8fd-fc82-4a56-b38b-c5b4d78d5e45',NULL,'CREDIT','COMPLETED','2026-05-04 14:38:29','2026-05-04 14:38:29','','Payment purchase for payment id 4ac4c8fd-fc82-4a56-b38b-c5b4d78d5e45. Customer: Kyle Broflovski',363.0000,60.5000),
('fbd2c0ea-7b2d-4090-90bb-5d16938235c9','941ffb96-d921-4e82-baf5-2bf0e4c018d4','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','3710202d-952c-4488-8f4d-4102000df39d',NULL,'CREDIT','COMPLETED','2026-05-14 12:47:44','2026-05-14 12:47:44','','Payment purchase for payment id 3710202d-952c-4488-8f4d-4102000df39d. Customer: Kyle Broflovski',14.0000,2.3333),
('1aa9b2a4-67f9-4622-8aef-5f332c607c0a','60eeebcf-c46c-458b-b45e-3a7a2abcc2e9','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','c26de1c7-9b65-4305-b0e8-ccc8d8fbb219',NULL,'CREDIT','COMPLETED','2026-04-18 12:22:47','2026-04-18 12:22:47','','Payment purchase for payment id c26de1c7-9b65-4305-b0e8-ccc8d8fbb219. Customer: Frisk Dreemurr',0.0000,0.0000),
('af81f1e3-547a-4531-93e0-5fde49e3c233','91d36acb-42c5-4812-b832-ee9c67b3f050','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','1b2f201a-15d0-47eb-8084-d9019c1e4970',NULL,'CREDIT','COMPLETED','2026-04-29 13:59:15','2026-04-29 13:59:15','','Payment refund for payment id 1b2f201a-15d0-47eb-8084-d9019c1e4970. Sellers: Omodog',357.0000,33.5909),
('a763cdce-7e05-4299-a116-6205cbf34a7f','a6a052c8-5a8d-41e8-86dd-4bbeebb5d71b','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','9f608673-b874-4447-bcc8-2c235780cc13',NULL,'CREDIT','COMPLETED','2026-05-08 11:22:18','2026-05-08 11:22:18','','Payment purchase for payment id 9f608673-b874-4447-bcc8-2c235780cc13. Customer: Frisk Dreemurr',14.0000,2.3333),
('044135fd-733c-4499-a759-650a2eead104','da7d2580-e8c4-45b0-a62f-cd777bc3397b','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','dce665d2-1d97-4cf1-9529-7e4ef5c12b1f',NULL,'CREDIT','COMPLETED','2026-03-28 14:23:17','2026-03-28 14:23:17','','Payment purchase for payment id dce665d2-1d97-4cf1-9529-7e4ef5c12b1f. Customer: Frisk Dreemurr',0.0000,0.0000),
('8c1ffc0d-bbfa-4755-8a04-668bd1c91a54','a78e3d9d-0c35-445c-b341-97bd0bcd2990','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','6bfdea2e-5e43-495c-9d89-d1d27540304e',NULL,'DEBIT','COMPLETED','2026-04-13 12:41:47','2026-04-13 12:41:47','','Payment purchase for payment id 6bfdea2e-5e43-495c-9d89-d1d27540304e. Sellers: Tetakent (H.C.G), Omodog, Doofenshmirtz Evil Inc, Esenler Motionstar Incorporated',0.0000,0.0000),
('3e220c70-07b0-4cb8-8bfa-674ad4d83dd2','c054ce4e-6521-4b2b-9b68-1aaf1b326379','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','d52dbec7-70cc-4033-8efc-9cda518bc009',NULL,'CREDIT','WAITING','2026-04-29 14:22:32','2026-04-29 14:22:32','','Payment refund for payment id d52dbec7-70cc-4033-8efc-9cda518bc009. Sellers: Omodog',369.0000,35.5909),
('584b4727-ad69-4f68-b243-67d06010f5f1','f77a5004-a061-4cef-a84c-ae445713f63d','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','eb6eadf1-a396-4eaf-b537-225ed0997447',NULL,'DEBIT','COMPLETED','2026-03-28 10:59:43','2026-03-28 10:59:43','','Payment purchase for payment id eb6eadf1-a396-4eaf-b537-225ed0997447. Sellers: Omodog',0.0000,0.0000),
('43bc6693-53d8-4642-9f09-67e82c1d1dfb','a3fa72fa-9b2a-4fd0-848c-d9384e577044','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','48d44e19-659a-406b-a335-49a73554cd21',NULL,'CREDIT','COMPLETED','2026-05-14 12:37:18','2026-05-14 12:37:18','','Payment purchase for payment id 48d44e19-659a-406b-a335-49a73554cd21. Customer: Tetakent (H.C.G)',72.0965,0.0000),
('9e780c92-bbfc-4dd1-952b-683606532a6d','6f271261-8978-4134-a0c4-64ca63dbbf1f','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','bdc318a1-2832-42fc-8cba-7a75a8d112d8',NULL,'CREDIT','COMPLETED','2026-04-01 12:18:00','2026-04-01 12:18:00','','Payment purchase for payment id bdc318a1-2832-42fc-8cba-7a75a8d112d8. Customer: Frisk Dreemurr',0.0000,0.0000),
('36c118ce-0813-41f4-9735-68c5f0d719b6','61627381-5591-4b77-b03f-dadd02637923','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','c2f20787-32ee-4e8a-9385-4938bc36dff6',NULL,'CREDIT','COMPLETED','2026-04-14 12:53:12','2026-04-14 12:53:12','','Payment purchase for payment id c2f20787-32ee-4e8a-9385-4938bc36dff6. Customer: Frisk Dreemurr',0.0000,0.0000),
('969d3645-0670-4f75-a873-6a3b4116ec46','a78e3d9d-0c35-445c-b341-97bd0bcd2990','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','6bfdea2e-5e43-495c-9d89-d1d27540304e',NULL,'CREDIT','COMPLETED','2026-04-13 12:41:47','2026-04-13 12:41:47','','Payment purchase for payment id 6bfdea2e-5e43-495c-9d89-d1d27540304e. Customer: Frisk Dreemurr',0.0000,0.0000),
('073a81d7-085e-49e4-b783-6d39bae91ebe','005c15be-55c5-46c8-8fca-b9cba0d9ed23','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','28100ad5-150e-4139-a68d-ff874dbb7104',NULL,'CREDIT','COMPLETED','2026-04-13 12:07:05','2026-04-13 12:07:05','','Payment purchase for payment id 28100ad5-150e-4139-a68d-ff874dbb7104. Customer: Frisk Dreemurr',0.0000,0.0000),
('986eab8a-da8a-4e4b-bc18-6e6d8d15d009','8e1d661e-3135-4bb0-9891-9e690bff993f','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','e8a977da-ec64-454e-bcc6-aa14aab609b5',NULL,'CREDIT','COMPLETED','2026-04-30 22:57:40','2026-04-30 22:57:40','','Payment purchase for payment id e8a977da-ec64-454e-bcc6-aa14aab609b5. Customer: Frisk Dreemurr',14.0000,2.3333),
('0c569b02-8627-4237-b26c-6e93ec5363cb','941ffb96-d921-4e82-baf5-2bf0e4c018d4','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','3710202d-952c-4488-8f4d-4102000df39d',NULL,'CREDIT','COMPLETED','2026-05-14 12:47:44','2026-05-14 12:47:44','','Payment purchase for payment id 3710202d-952c-4488-8f4d-4102000df39d. Customer: Kyle Broflovski',1212.0000,202.0000),
('8a27c366-1fba-4322-a425-6f0584fea599','d5ebe525-9c01-4f3c-847e-517fbca5a917','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','358a07b9-ec18-47b4-98cc-3d9fe1417bfb',NULL,'CREDIT','COMPLETED','2026-05-11 14:41:38','2026-05-11 14:41:38','','Payment purchase for payment id 358a07b9-ec18-47b4-98cc-3d9fe1417bfb. Customer: Kyle Broflovski',14.0000,2.3333),
('f3b8d2f2-bc60-4cdb-8f5e-6f80bb6f1fc5','d5ebe525-9c01-4f3c-847e-517fbca5a917','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','358a07b9-ec18-47b4-98cc-3d9fe1417bfb',NULL,'DEBIT','COMPLETED','2026-05-11 14:41:38','2026-05-11 14:41:38','','Payment purchase for payment id 358a07b9-ec18-47b4-98cc-3d9fe1417bfb. Sellers: Omodog, Doofenshmirtz Evil Inc, Tetakent (H.C.G)',1595.0000,239.9242),
('bf3448ba-3ba8-4f0d-9603-7290f4e92a7f','a820ab13-eed3-44e6-9b0f-82ae20e55878','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',NULL,'CREDIT','COMPLETED','2026-04-27 15:26:08','2026-04-27 15:26:08','','Payment purchase for payment id 86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5. Customer: Frisk Dreemurr',924.0000,154.0000),
('9f061610-40d8-4169-a4ae-72dc055f47a3','b0bc0b1f-0944-4e4f-a230-03ebeb236bc4','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','e15efeb5-20d4-4f81-9ba7-275034539e14',NULL,'CREDIT','COMPLETED','2026-04-27 15:14:48','2026-04-27 15:14:48','','Payment purchase for payment id e15efeb5-20d4-4f81-9ba7-275034539e14. Customer: Frisk Dreemurr',765.0000,75.6818),
('12eb9309-4970-4ea5-b0cb-7582b7b7bdac','52f855be-5bce-4d2c-8fab-b0409ccc25e8','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','8b4fa939-e3f9-470e-b97d-0eeebf4ff38a',NULL,'DEBIT','COMPLETED','2026-05-13 19:20:19','2026-05-13 19:20:19','','Payment purchase for payment id 8b4fa939-e3f9-470e-b97d-0eeebf4ff38a. Sellers: Omodog',896.0000,149.3333),
('60833f27-7f04-4c16-8d5f-75a6afbb8e7b','ee69fd43-1a19-48d6-a5c1-5fcb598dfb96','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','ee6dcff0-2fec-4eee-a470-8050c3980833',NULL,'CREDIT','COMPLETED','2026-05-11 14:28:06','2026-05-11 14:28:06','','Payment purchase for payment id ee6dcff0-2fec-4eee-a470-8050c3980833. Customer: Kyle Broflovski',54.0000,9.0000),
('bafc6ade-bf9c-4ffb-8bbb-75d81c395362','053f0a4a-bcac-4cf7-a979-665bf6693d78','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','2684e28d-ff4b-49c1-9da0-d445df284489',NULL,'DEBIT','COMPLETED','2026-04-29 13:25:29','2026-04-29 13:25:29','','Payment purchase for payment id 2684e28d-ff4b-49c1-9da0-d445df284489. Sellers: Doofenshmirtz Evil Inc, Omodog, Tetakent (H.C.G)',1799.0000,273.9242),
('d07cae81-433a-4bfb-9104-761eb194c735','61627381-5591-4b77-b03f-dadd02637923','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c2f20787-32ee-4e8a-9385-4938bc36dff6',NULL,'DEBIT','COMPLETED','2026-04-14 12:53:12','2026-04-14 12:53:12','','Payment purchase for payment id c2f20787-32ee-4e8a-9385-4938bc36dff6. Sellers: Esenler Motionstar Incorporated, Doofenshmirtz Evil Inc, Tetakent (H.C.G), Omodog',0.0000,0.0000),
('4a6d0ab4-6949-4e17-8980-76e222143b70','d5dfebc0-4c35-429b-8253-de801939673f','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','cbb58ca9-25c4-4f15-a903-f67d59d1ede1',NULL,'CREDIT','COMPLETED','2026-03-28 14:21:07','2026-03-28 14:21:07','','Payment purchase for payment id cbb58ca9-25c4-4f15-a903-f67d59d1ede1. Customer: Frisk Dreemurr',0.0000,0.0000),
('e176b76a-6595-4bce-9c92-775e10adab50','eb9f9199-f049-4d26-902d-b033ee52d8c5','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','a815c450-c725-4563-8ab1-8446c0397ef5',NULL,'CREDIT','COMPLETED','2026-04-27 15:10:27','2026-04-27 15:10:27','','Payment purchase for payment id a815c450-c725-4563-8ab1-8446c0397ef5. Customer: Frisk Dreemurr',27.0000,4.5000),
('e2d56183-4d2d-4126-8fa3-79f5e841521c','11625c02-2413-49dd-9e89-220e4e2cd253','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','c4eed229-155b-48fe-8d93-a6adf4d96140',NULL,'DEBIT','COMPLETED','2026-04-21 02:32:15','2026-04-21 02:32:15','','Payment purchase for payment id c4eed229-155b-48fe-8d93-a6adf4d96140. Sellers: Omodog, Tetakent (H.C.G)',1679.0000,253.9242),
('4067145e-f43a-49ed-b7ef-79f769c0ad3b','b8f592b9-733b-4649-b2fc-18b0c1f3bb9e','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','f12e565f-076b-4859-bb80-8995c8822379',NULL,'CREDIT','COMPLETED','2026-05-02 17:01:05','2026-05-02 17:01:05','','Payment purchase for payment id f12e565f-076b-4859-bb80-8995c8822379. Customer: Omodog',149.6780,24.9463),
('ae04e7b3-22a6-490d-82eb-7abc2570c922','5c389de0-6456-4376-a08a-f53c86813d5d','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','23356d08-93c9-4ea2-b66d-d68c14861ec7',NULL,'CREDIT','COMPLETED','2026-05-14 12:37:22','2026-05-14 12:37:22','','Payment purchase for payment id 23356d08-93c9-4ea2-b66d-d68c14861ec7. Customer: Tetakent (H.C.G)',5453.7367,0.0000),
('7772aa86-3a19-4cba-b93c-7b30e05afeb8','0b5cfc39-99be-4663-b42b-f5d276ca8cd9','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','202f9f6f-8506-469a-a230-c746387282bd',NULL,'CREDIT','COMPLETED','2026-05-13 19:12:53','2026-05-13 19:12:53','','Payment purchase for payment id 202f9f6f-8506-469a-a230-c746387282bd. Customer: Kyle Broflovski',1370.0000,176.5151),
('20dfb10a-7f14-4c36-8e33-7b6fb40d7596','aefa3606-55ea-4b32-9b98-94a6cf7657cc','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','20f53c55-86ec-43fd-82a6-41225df5fd58',NULL,'CREDIT','COMPLETED','2026-04-13 09:34:44','2026-04-13 09:34:44','','Payment purchase for payment id 20f53c55-86ec-43fd-82a6-41225df5fd58. Customer: Frisk Dreemurr',0.0000,0.0000),
('0ba1dd7b-31cf-4a2e-af44-7c4e5903f156','948402b9-2ee4-45d7-bef7-a5fe23028f56','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','6da87317-e59e-44a2-9e8e-5c182e2aaa75',NULL,'DEBIT','COMPLETED','2026-05-23 15:44:43','2026-05-23 15:44:43','','Payment purchase for payment id 6da87317-e59e-44a2-9e8e-5c182e2aaa75. Sellers: Esenler Motionstar Incorporated, Omodog, Tetakent (H.C.G)',2718.0000,453.0000),
('58a09961-9b26-450e-9c33-7c8b117df696','30a37fea-e140-457d-af06-bf0683dfb567','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','4258e2f6-3039-4386-867a-647b5f8ef0af',NULL,'CREDIT','COMPLETED','2026-05-04 14:47:11','2026-05-04 14:47:11','','Payment purchase for payment id 4258e2f6-3039-4386-867a-647b5f8ef0af. Customer: Kyle Broflovski',2424.0000,404.0000),
('db692c89-a7d9-411f-a3ef-7e7662330117','a78e3d9d-0c35-445c-b341-97bd0bcd2990','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','6bfdea2e-5e43-495c-9d89-d1d27540304e',NULL,'CREDIT','COMPLETED','2026-04-13 12:41:47','2026-04-13 12:41:47','','Payment purchase for payment id 6bfdea2e-5e43-495c-9d89-d1d27540304e. Customer: Frisk Dreemurr',0.0000,0.0000),
('40cf236b-9f2f-412a-96b9-8164184ae69c','d4cc7675-c6ad-43ee-a493-aa5d8768ee0c','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','46447df0-7deb-4677-9caa-45b4ff585820',NULL,'DEBIT','COMPLETED','2026-04-27 15:22:49','2026-04-27 15:22:49','','Payment purchase for payment id 46447df0-7deb-4677-9caa-45b4ff585820. Sellers: Esenler Motionstar Incorporated, Omodog, Tetakent (H.C.G)',5414.0000,902.3333),
('de73cc61-82a9-4c48-b34b-818f95286972','30a37fea-e140-457d-af06-bf0683dfb567','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','4258e2f6-3039-4386-867a-647b5f8ef0af',NULL,'CREDIT','COMPLETED','2026-05-04 14:47:11','2026-05-04 14:47:11','','Payment purchase for payment id 4258e2f6-3039-4386-867a-647b5f8ef0af. Customer: Kyle Broflovski',336.0000,56.0000),
('d76fb9ef-6862-4d0c-8308-827912a0cfa6','d5dfebc0-4c35-429b-8253-de801939673f','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','cbb58ca9-25c4-4f15-a903-f67d59d1ede1',NULL,'CREDIT','COMPLETED','2026-03-28 14:21:07','2026-03-28 14:21:07','','Payment purchase for payment id cbb58ca9-25c4-4f15-a903-f67d59d1ede1. Customer: Frisk Dreemurr',0.0000,0.0000),
('bbff330f-5bc0-4f71-9fee-8285d4f7bcc8','11625c02-2413-49dd-9e89-220e4e2cd253','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','c4eed229-155b-48fe-8d93-a6adf4d96140',NULL,'CREDIT','COMPLETED','2026-04-21 02:32:15','2026-04-21 02:32:15','','Payment purchase for payment id c4eed229-155b-48fe-8d93-a6adf4d96140. Customer: Kyle Broflovski',1212.0000,202.0000),
('b10eec63-26a7-432e-b1ad-82b8b145b8d0','96266d64-1edd-450b-a660-1c393a3cecd8','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','7f06a8cc-164c-4196-a2eb-09e7f70e272b',NULL,'DEBIT','COMPLETED','2026-05-04 14:31:07','2026-05-04 14:31:07','','Payment purchase for payment id 7f06a8cc-164c-4196-a2eb-09e7f70e272b. Sellers: Tetakent (H.C.G)',11278.4658,0.0000),
('4d179df1-06a8-49b2-9dbc-82f320d1b00b','d5ebe525-9c01-4f3c-847e-517fbca5a917','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','358a07b9-ec18-47b4-98cc-3d9fe1417bfb',NULL,'CREDIT','COMPLETED','2026-05-11 14:41:38','2026-05-11 14:41:38','','Payment purchase for payment id 358a07b9-ec18-47b4-98cc-3d9fe1417bfb. Customer: Kyle Broflovski',369.0000,35.5909),
('5c0032ed-f6d3-47fd-bf83-8311e8d005a2','f7ae3ad6-59e8-4c0b-973f-a4a2bef9676d','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1263a16c-8f45-4a42-8d2d-eebbb17fbaa4',NULL,'CREDIT','COMPLETED','2026-04-13 12:08:16','2026-04-13 12:08:16','','Payment purchase for payment id 1263a16c-8f45-4a42-8d2d-eebbb17fbaa4. Customer: Frisk Dreemurr',0.0000,0.0000),
('038232dd-d2c2-4853-a746-834a7caeb4f2','60eeebcf-c46c-458b-b45e-3a7a2abcc2e9','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','c26de1c7-9b65-4305-b0e8-ccc8d8fbb219',NULL,'CREDIT','COMPLETED','2026-04-18 12:22:47','2026-04-18 12:22:47','','Payment purchase for payment id c26de1c7-9b65-4305-b0e8-ccc8d8fbb219. Customer: Frisk Dreemurr',0.0000,0.0000),
('a7314bcd-e316-4bbd-ad7f-839e19c04504','3fdf6b3a-3e68-4dd2-a63f-3037e69aa8f9','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','f6e28e3d-fd4e-49f6-b740-cfcf04571146',NULL,'DEBIT','COMPLETED','2026-04-01 12:02:21','2026-04-01 12:02:21','','Payment purchase for payment id f6e28e3d-fd4e-49f6-b740-cfcf04571146. Sellers: Omodog',0.0000,0.0000),
('59c6e1ce-d187-4cd0-bade-83c1545dd6f2','9761e810-b75d-41bd-89bc-24509daa5bd8','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','3f4705e2-9d40-4c31-a637-f97960dd8597',NULL,'DEBIT','COMPLETED','2026-05-21 21:44:30','2026-05-21 21:44:30','','Payment purchase for payment id 3f4705e2-9d40-4c31-a637-f97960dd8597. Sellers: Omodog',6248.8263,0.0000),
('6a6c9bce-3dd2-4a36-b694-84712b639295','a18026e2-b710-4a4b-9c3f-a3ccbbdfc64e','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','5c474860-602f-4e3a-a6f9-a11fc1c7de86',NULL,'CREDIT','COMPLETED','2026-03-28 14:06:31','2026-03-28 14:06:31','','Payment purchase for payment id 5c474860-602f-4e3a-a6f9-a11fc1c7de86. Customer: Frisk Dreemurr',0.0000,0.0000),
('cb0fc66e-33ae-4608-a57a-84f183a00936','053f0a4a-bcac-4cf7-a979-665bf6693d78','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','2684e28d-ff4b-49c1-9da0-d445df284489',NULL,'CREDIT','COMPLETED','2026-04-29 13:25:29','2026-04-29 13:25:29','','Payment purchase for payment id 2684e28d-ff4b-49c1-9da0-d445df284489. Customer: Frisk Dreemurr',573.0000,69.5909),
('5df29b3b-6f86-4255-8144-8531da947303','0ae44fcf-883c-42a4-8f86-2c4bdd8f5bcf','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','0a22264f-1425-43c7-b78a-5fd8131dd908',NULL,'CREDIT','COMPLETED','2026-05-02 17:00:30','2026-05-02 17:00:30','','Payment purchase for payment id 0a22264f-1425-43c7-b78a-5fd8131dd908. Customer: Tetakent (H.C.G)',2999.0650,0.0000),
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
('92db0af8-96b5-4bd6-9291-8dc57efd8e5b','fd48a50b-27ae-4975-a214-553ae3ae70f2','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','87d4243f-e477-4f3f-ac6a-e7b251e797fe',NULL,'CREDIT','COMPLETED','2026-05-11 13:14:19','2026-05-11 13:14:19','','Payment purchase for payment id 87d4243f-e477-4f3f-ac6a-e7b251e797fe. Customer: Omodog',81.9167,13.6528),
('9f7d8507-48cd-49b9-8040-913341230a27','3fdf6b3a-3e68-4dd2-a63f-3037e69aa8f9','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','f6e28e3d-fd4e-49f6-b740-cfcf04571146',NULL,'CREDIT','COMPLETED','2026-04-01 12:02:21','2026-04-01 12:02:21','','Payment purchase for payment id f6e28e3d-fd4e-49f6-b740-cfcf04571146. Customer: Frisk Dreemurr',0.0000,0.0000),
('45920239-c327-4a32-9b8f-91782354106d','d5ebe525-9c01-4f3c-847e-517fbca5a917','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','358a07b9-ec18-47b4-98cc-3d9fe1417bfb',NULL,'CREDIT','COMPLETED','2026-05-11 14:41:38','2026-05-11 14:41:38','','Payment purchase for payment id 358a07b9-ec18-47b4-98cc-3d9fe1417bfb. Customer: Kyle Broflovski',1212.0000,202.0000),
('66dc876f-f36e-4a66-8f7d-92a66ef207fd','aefa3606-55ea-4b32-9b98-94a6cf7657cc','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','20f53c55-86ec-43fd-82a6-41225df5fd58',NULL,'DEBIT','COMPLETED','2026-04-13 09:34:44','2026-04-13 09:34:44','','Payment purchase for payment id 20f53c55-86ec-43fd-82a6-41225df5fd58. Sellers: Tetakent (H.C.G)',0.0000,0.0000),
('6094d828-8ae2-4836-a04c-9596551f6611','36a81cdb-532d-4746-bad3-8fc25b454989','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','5250a81a-6d49-4d3c-ad7e-56013dba864d',NULL,'CREDIT','COMPLETED','2026-03-28 14:33:27','2026-03-28 14:33:27','','Payment purchase for payment id 5250a81a-6d49-4d3c-ad7e-56013dba864d. Customer: Frisk Dreemurr',0.0000,0.0000),
('42bfccc9-fddc-4f64-b3f8-95b5c6be9c77','36e258d5-58fa-4019-b627-64cc1481436a','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','65fb3419-cb50-4c5b-b31e-98dbfe1bb430',NULL,'DEBIT','COMPLETED','2026-04-05 11:41:27','2026-04-05 11:41:27','','Payment purchase for payment id 65fb3419-cb50-4c5b-b31e-98dbfe1bb430. Sellers: Omodog',0.0000,0.0000),
('f9fae7f0-2bec-4d22-9906-96c7b438e499','67f40595-19b0-4b78-adfd-ca82894dded1','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','3377a6d8-0ae0-4e1e-a2d7-c8885587eb0f',NULL,'CREDIT','COMPLETED','2026-03-28 14:20:07','2026-03-28 14:20:07','','Payment purchase for payment id 3377a6d8-0ae0-4e1e-a2d7-c8885587eb0f. Customer: Frisk Dreemurr',0.0000,0.0000),
('9c40888b-4f25-43af-bec9-98b3c8b53bdb','e66911ba-6b44-4d23-a9c7-4756aaf1f55b','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','5c94c159-611c-4a6d-8498-b0daaea9b234',NULL,'CREDIT','COMPLETED','2026-04-30 22:16:40','2026-04-30 22:16:40','','Payment purchase for payment id 5c94c159-611c-4a6d-8498-b0daaea9b234. Customer: Frisk Dreemurr',14.0000,2.3333),
('88eb2456-254f-4b73-b9be-996c53f6193a','c75e19e1-8a7c-432f-b0e3-173eb2f4b4a6','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','bd8e8e57-269a-4d27-b1ad-698289104c89',NULL,'CREDIT','COMPLETED','2026-04-29 14:36:06','2026-04-29 14:36:06','','Payment purchase for payment id bd8e8e57-269a-4d27-b1ad-698289104c89. Customer: Frisk Dreemurr',566.0000,68.4242),
('43f2e930-9ef0-48de-8775-9c520deb6321','8e1d661e-3135-4bb0-9891-9e690bff993f','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','e8a977da-ec64-454e-bcc6-aa14aab609b5',NULL,'CREDIT','COMPLETED','2026-04-30 22:57:40','2026-04-30 22:57:40','','Payment purchase for payment id e8a977da-ec64-454e-bcc6-aa14aab609b5. Customer: Frisk Dreemurr',55.0000,9.1667),
('33990d6c-a218-4e88-8680-9c52d6bbaeaa','d025e637-0b54-4748-93a3-18b00fc50674','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','d4668779-7454-4f6a-b81c-ba9aa510e070',NULL,'DEBIT','COMPLETED','2026-03-31 12:08:07','2026-03-31 12:08:07','','Payment purchase for payment id d4668779-7454-4f6a-b81c-ba9aa510e070. Sellers: Omodog',0.0000,0.0000),
('ce99e8b8-46bd-434a-a18a-9d9cb9c8d45b','b99199ef-0b6d-4f7f-8c39-952c4477b722','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','ceef3403-4c23-4eb9-9398-875bb44e068a',NULL,'CREDIT','COMPLETED','2026-05-04 14:30:53','2026-05-04 14:30:53','','Payment purchase for payment id ceef3403-4c23-4eb9-9398-875bb44e068a. Customer: Tetakent (H.C.G)',198.2675,0.0000),
('4c3ff9d8-0534-40ed-bcba-9df4390ffb89','8d44d12a-5d62-40f9-b3d5-26278096d5e9','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','acebf506-e0ca-42d2-b9e1-6e192b86e53f',NULL,'CREDIT','COMPLETED','2026-04-13 09:26:45','2026-04-13 09:26:45','','Payment purchase for payment id acebf506-e0ca-42d2-b9e1-6e192b86e53f. Customer: Frisk Dreemurr',0.0000,0.0000),
('fa60df1e-1acf-4fae-b7a3-9e5097d3a317','5caf1297-9beb-410a-8e57-197290cc44f0','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','ac1c1ed3-a903-4639-a3fc-403b70c7f4b3',NULL,'CREDIT','COMPLETED','2026-05-14 13:16:53','2026-05-14 13:16:53','','Payment purchase for payment id ac1c1ed3-a903-4639-a3fc-403b70c7f4b3. Customer: Kyle Broflovski',6060.0000,1010.0000),
('213383a1-8bf2-47af-afda-9f3d3daf11f8','8e1d661e-3135-4bb0-9891-9e690bff993f','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','e8a977da-ec64-454e-bcc6-aa14aab609b5',NULL,'DEBIT','COMPLETED','2026-04-30 22:57:40','2026-04-30 22:57:40','','Payment purchase for payment id e8a977da-ec64-454e-bcc6-aa14aab609b5. Sellers: Doofenshmirtz Evil Inc, Tetakent (H.C.G), Omodog, Esenler Motionstar Incorporated',2847.0000,448.5909),
('2b2ed591-60df-47c6-9326-9fcad7b31c7e','c75e19e1-8a7c-432f-b0e3-173eb2f4b4a6','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','bd8e8e57-269a-4d27-b1ad-698289104c89',NULL,'CREDIT','COMPLETED','2026-04-29 14:36:06','2026-04-29 14:36:06','','Payment purchase for payment id bd8e8e57-269a-4d27-b1ad-698289104c89. Customer: Frisk Dreemurr',1212.0000,202.0000),
('03330afa-72c2-45d9-84bb-a0cd06d1f09b','4508d7c2-fa05-4eb0-9c97-50266e31dc94','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','d535fbc3-69f4-4b8a-ac31-ab4073dbb889',NULL,'DEBIT','COMPLETED','2026-04-13 12:19:24','2026-04-13 12:19:24','','Payment purchase for payment id d535fbc3-69f4-4b8a-ac31-ab4073dbb889. Sellers: Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('ed3e23b4-212e-4e0d-ad08-a190dff1d2bb','53448fb3-9d45-410b-8da7-e2189fcca34c','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','97ce01db-fe13-428e-8b3f-ad9e49c2953b',NULL,'CREDIT','COMPLETED','2026-04-30 23:19:31','2026-04-30 23:19:31','','Payment purchase for payment id 97ce01db-fe13-428e-8b3f-ad9e49c2953b. Customer: Frisk Dreemurr',6756.0000,1126.0000),
('370707cb-372b-4ccd-b467-a2213e852096','068edcd6-40a1-4f47-b25c-35b40b3dc1b6','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','9dfd48f2-f25b-4903-bed0-47e340260c33',NULL,'DEBIT','COMPLETED','2026-03-31 11:35:26','2026-03-31 11:35:26','','Payment purchase for payment id 9dfd48f2-f25b-4903-bed0-47e340260c33. Sellers: Omodog',0.0000,0.0000),
('376dd944-567f-4df8-9176-a22587b8ff9b','941ffb96-d921-4e82-baf5-2bf0e4c018d4','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','3710202d-952c-4488-8f4d-4102000df39d',NULL,'DEBIT','COMPLETED','2026-05-14 12:47:44','2026-05-14 12:47:44','','Payment purchase for payment id 3710202d-952c-4488-8f4d-4102000df39d. Sellers: Esenler Motionstar Incorporated, Tetakent (H.C.G), Doofenshmirtz Evil Inc',1259.0000,209.8333),
('561e9c43-27d4-499c-8cb4-a2629c074d52','586944a1-eb1e-4135-895b-f7ad1dfdd0e7','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','31eaa473-24b9-415d-b78c-78d46c67e5cd',NULL,'CREDIT','COMPLETED','2026-04-30 23:00:12','2026-04-30 23:00:12','','Payment purchase for payment id 31eaa473-24b9-415d-b78c-78d46c67e5cd. Customer: Frisk Dreemurr',2140.0000,356.6667),
('d768edc7-4c4f-4cf4-88d5-a26f8f9eda6b','27e49d1f-13be-4671-bd85-bfd960ddc61d','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','4e54d5a8-feb3-48b9-a357-76608ee633b1',NULL,'DEBIT','COMPLETED','2026-05-13 19:27:33','2026-05-13 19:27:33','','Payment purchase for payment id 4e54d5a8-feb3-48b9-a357-76608ee633b1. Sellers: Omodog',1259.0000,183.9242),
('98ff9440-f766-4597-8d6d-a31f91e53a3b','9761e810-b75d-41bd-89bc-24509daa5bd8','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','3f4705e2-9d40-4c31-a637-f97960dd8597',NULL,'CREDIT','COMPLETED','2026-05-21 21:44:30','2026-05-21 21:44:30','','Payment purchase for payment id 3f4705e2-9d40-4c31-a637-f97960dd8597. Customer: Tetakent (H.C.G)',6248.8263,0.0000),
('e166229b-b19c-42cd-a929-a47c21129e53','309b68be-f65e-4a34-b7cf-8568ab4f244a','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','2f6dc481-f941-4b12-90d3-acc9554773f4',NULL,'CREDIT','COMPLETED','2026-04-13 12:34:50','2026-04-13 12:34:50','','Payment purchase for payment id 2f6dc481-f941-4b12-90d3-acc9554773f4. Customer: Frisk Dreemurr',0.0000,0.0000),
('7d6dd0f8-cf8d-4ce1-92d0-a488c37851c2','2bb14f4b-001a-4409-96fb-e7c893ffc57f','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','15cb88e6-b4e2-4125-92dc-71ba0b514837',NULL,'DEBIT','COMPLETED','2026-05-04 14:31:01','2026-05-04 14:31:01','','Payment purchase for payment id 15cb88e6-b4e2-4125-92dc-71ba0b514837. Sellers: Tetakent (H.C.G)',1.1666,0.1944),
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
('ced70a4d-e249-4497-9133-af11e5058eb8','b18fd795-00db-496d-b2ee-145e29083343','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','326ba11b-633d-4f18-8735-61a3396e92d2',NULL,'CREDIT','COMPLETED','2026-05-11 13:13:36','2026-05-11 13:13:36','','Payment purchase for payment id 326ba11b-633d-4f18-8735-61a3396e92d2. Customer: Tetakent (H.C.G)',1687.3500,0.0000),
('e1dc27c4-10ed-40b8-ae43-af263c32a68f','e5def9e7-753f-43e9-9cf5-47998bcff335','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','b7a0f68b-ff5a-4840-8287-fef707e17ac1',NULL,'CREDIT','COMPLETED','2026-04-05 11:31:48','2026-04-05 11:31:48','','Payment purchase for payment id b7a0f68b-ff5a-4840-8287-fef707e17ac1. Customer: Frisk Dreemurr',0.0000,0.0000),
('18e74e14-297e-43e0-b4d6-af56fc30e7e7','744f7ffe-e6ae-4ece-ac7f-7063017a0091','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','c5cef75d-bb65-46b3-9375-3a5cc39920b6',NULL,'CREDIT','COMPLETED','2026-04-27 15:07:26','2026-04-27 15:07:26','','Payment purchase for payment id c5cef75d-bb65-46b3-9375-3a5cc39920b6. Customer: Frisk Dreemurr',14.0000,2.3333),
('f5522243-7750-45cc-8324-af74b1074856','4508d7c2-fa05-4eb0-9c97-50266e31dc94','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','d535fbc3-69f4-4b8a-ac31-ab4073dbb889',NULL,'CREDIT','COMPLETED','2026-04-13 12:19:24','2026-04-13 12:19:24','','Payment purchase for payment id d535fbc3-69f4-4b8a-ac31-ab4073dbb889. Customer: Frisk Dreemurr',0.0000,0.0000),
('48e061bb-3e38-41b7-948e-b1f09b0f16d4','36a81cdb-532d-4746-bad3-8fc25b454989','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','5250a81a-6d49-4d3c-ad7e-56013dba864d',NULL,'CREDIT','COMPLETED','2026-03-28 14:33:27','2026-03-28 14:33:27','','Payment purchase for payment id 5250a81a-6d49-4d3c-ad7e-56013dba864d. Customer: Frisk Dreemurr',0.0000,0.0000),
('dc39c1d4-0a26-4933-af70-b24fa6db32ba','fd48a50b-27ae-4975-a214-553ae3ae70f2','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','87d4243f-e477-4f3f-ac6a-e7b251e797fe',NULL,'DEBIT','COMPLETED','2026-05-11 13:14:19','2026-05-11 13:14:19','','Payment purchase for payment id 87d4243f-e477-4f3f-ac6a-e7b251e797fe. Sellers: Tetakent (H.C.G)',81.9167,13.6528),
('31c39a0b-5ec6-4af6-b520-b275d12f6f18','a18026e2-b710-4a4b-9c3f-a3ccbbdfc64e','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','5c474860-602f-4e3a-a6f9-a11fc1c7de86',NULL,'DEBIT','COMPLETED','2026-03-28 14:06:31','2026-03-28 14:06:31','','Payment purchase for payment id 5c474860-602f-4e3a-a6f9-a11fc1c7de86. Sellers: Omodog',0.0000,0.0000),
('5e329efd-00f7-42ff-9573-b62c15c66fd9','4508d7c2-fa05-4eb0-9c97-50266e31dc94','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','d535fbc3-69f4-4b8a-ac31-ab4073dbb889',NULL,'CREDIT','COMPLETED','2026-04-13 12:19:24','2026-04-13 12:19:24','','Payment purchase for payment id d535fbc3-69f4-4b8a-ac31-ab4073dbb889. Customer: Frisk Dreemurr',0.0000,0.0000),
('32f2fe20-f7a0-4a89-9917-b6f6090a5caf','b9969eae-4619-495a-b891-6c07ee08dfb0','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','725ee06e-78fc-48aa-ba01-ac936fc7190d',NULL,'DEBIT','COMPLETED','2026-04-13 12:06:29','2026-04-13 12:06:29','','Payment purchase for payment id 725ee06e-78fc-48aa-ba01-ac936fc7190d. Sellers: Tetakent (H.C.G)',0.0000,0.0000),
('9ae34953-cb30-4a72-961b-b7219b333a7d','ee69fd43-1a19-48d6-a5c1-5fcb598dfb96','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','ee6dcff0-2fec-4eee-a470-8050c3980833',NULL,'DEBIT','COMPLETED','2026-05-11 14:28:06','2026-05-11 14:28:06','','Payment purchase for payment id ee6dcff0-2fec-4eee-a470-8050c3980833. Sellers: Tetakent (H.C.G), Omodog, Esenler Motionstar Incorporated',3734.0000,622.3333),
('e0c93553-326b-49de-b7ec-b7969f508658','6f271261-8978-4134-a0c4-64ca63dbbf1f','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','bdc318a1-2832-42fc-8cba-7a75a8d112d8',NULL,'DEBIT','COMPLETED','2026-04-01 12:18:00','2026-04-01 12:18:00','','Payment purchase for payment id bdc318a1-2832-42fc-8cba-7a75a8d112d8. Sellers: Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('3cce1308-8880-46c7-9b52-b7b4daa3719d','a820ab13-eed3-44e6-9b0f-82ae20e55878','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5',NULL,'DEBIT','COMPLETED','2026-04-27 15:26:08','2026-04-27 15:26:08','','Payment purchase for payment id 86727cb4-e5e8-448a-8eb0-0a2b3d26e1c5. Sellers: Tetakent (H.C.G), Omodog',3348.0000,558.0000),
('f41872f9-6d18-44d7-854b-b83e6f0816aa','948402b9-2ee4-45d7-bef7-a5fe23028f56','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','6da87317-e59e-44a2-9e8e-5c182e2aaa75',NULL,'CREDIT','COMPLETED','2026-05-23 15:44:43','2026-05-23 15:44:43','','Payment purchase for payment id 6da87317-e59e-44a2-9e8e-5c182e2aaa75. Customer: Frisk Dreemurr',2424.0000,404.0000),
('f67f095d-fa2b-4adf-94a3-be077ce73115','948402b9-2ee4-45d7-bef7-a5fe23028f56','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','6da87317-e59e-44a2-9e8e-5c182e2aaa75',NULL,'CREDIT','COMPLETED','2026-05-23 15:44:43','2026-05-23 15:44:43','','Payment purchase for payment id 6da87317-e59e-44a2-9e8e-5c182e2aaa75. Customer: Frisk Dreemurr',44.0000,7.3333),
('458d5ab0-254d-44b3-9bb4-bfa0fdc1f359','8e1d661e-3135-4bb0-9891-9e690bff993f','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','e8a977da-ec64-454e-bcc6-aa14aab609b5',NULL,'CREDIT','COMPLETED','2026-04-30 22:57:40','2026-04-30 22:57:40','','Payment purchase for payment id e8a977da-ec64-454e-bcc6-aa14aab609b5. Customer: Frisk Dreemurr',354.0000,33.0909),
('6a06a265-e006-443a-90fe-bfff4b17221d','ee69fd43-1a19-48d6-a5c1-5fcb598dfb96','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','ee6dcff0-2fec-4eee-a470-8050c3980833',NULL,'CREDIT','COMPLETED','2026-05-11 14:28:06','2026-05-11 14:28:06','','Payment purchase for payment id ee6dcff0-2fec-4eee-a470-8050c3980833. Customer: Kyle Broflovski',44.0000,7.3333),
('4eda3f04-70a4-4227-98e3-c107d34fa7ef','6b8ad375-e6ea-40fa-be3f-c74c2fbe9658','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','90b7bd2a-6723-4265-b782-242720019812',NULL,'CREDIT','COMPLETED','2026-04-11 12:48:28','2026-04-11 12:48:28','','Payment purchase for payment id 90b7bd2a-6723-4265-b782-242720019812. Customer: Frisk Dreemurr',0.0000,0.0000),
('69f2e889-786a-42bd-9ec3-c1e5447e36a6','744f7ffe-e6ae-4ece-ac7f-7063017a0091','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c5cef75d-bb65-46b3-9375-3a5cc39920b6',NULL,'CREDIT','COMPLETED','2026-04-27 15:07:26','2026-04-27 15:07:26','','Payment purchase for payment id c5cef75d-bb65-46b3-9375-3a5cc39920b6. Customer: Frisk Dreemurr',467.0000,51.9243),
('cca04d7b-90ea-48f3-a346-c2f3295227e3','17c2145f-8431-4354-bb07-38c564998f84','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','28e22fcf-fd10-495c-8273-be41b7d47cbf',NULL,'CREDIT','COMPLETED','2026-05-04 14:30:31','2026-05-04 14:30:31','','Payment purchase for payment id 28e22fcf-fd10-495c-8273-be41b7d47cbf. Customer: Tetakent (H.C.G)',24.0322,0.0000),
('b4451af7-75cf-4c51-b948-c7228bbb45d7','df18562b-33b9-478e-b84d-1341f0cdba9f','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','b9e79db5-5d1f-4d79-8ef3-23ad5a51093a',NULL,'CREDIT','COMPLETED','2026-05-13 21:33:33','2026-05-13 21:33:33','','Payment purchase for payment id b9e79db5-5d1f-4d79-8ef3-23ad5a51093a. Customer: Kyle Broflovski',88.0000,14.6667),
('d8607eaf-af91-4bd1-948d-c87477880a94','068edcd6-40a1-4f47-b25c-35b40b3dc1b6','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','9dfd48f2-f25b-4903-bed0-47e340260c33',NULL,'CREDIT','COMPLETED','2026-03-31 11:35:26','2026-03-31 11:35:26','','Payment purchase for payment id 9dfd48f2-f25b-4903-bed0-47e340260c33. Customer: Frisk Dreemurr',0.0000,0.0000),
('89e420c2-21ee-47eb-a37f-c90987cd90e0','a6a052c8-5a8d-41e8-86dd-4bbeebb5d71b','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','9f608673-b874-4447-bcc8-2c235780cc13',NULL,'DEBIT','COMPLETED','2026-05-08 11:22:18','2026-05-08 11:22:18','','Payment purchase for payment id 9f608673-b874-4447-bcc8-2c235780cc13. Sellers: Omodog, Doofenshmirtz Evil Inc, Tetakent (H.C.G)',1338.0000,223.0000),
('69b7a283-9795-4974-b301-c9252cff4adf','2a333f87-b924-46a4-ba69-d699b1b374aa','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4',NULL,'DEBIT','COMPLETED','2026-04-29 14:20:56','2026-04-29 14:20:56','','Payment purchase for payment id 2bfd50af-8fab-4d7d-8b6d-832dbe2d3ac4. Sellers: Omodog',1134.0000,111.2727),
('c3550e37-a503-4be0-8f1d-cd26e006781e','946e4903-c899-4bb6-a320-26d37f3cdf57','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','b4912aeb-5c11-403c-81bb-588da87592ed',NULL,'DEBIT','COMPLETED','2026-03-28 14:38:32','2026-03-28 14:38:32','','Payment purchase for payment id b4912aeb-5c11-403c-81bb-588da87592ed. Sellers: Esenler Motionstar Incorporated, Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('f18a6a58-da66-4942-9017-cefadbc8312d','d4c6f778-46c9-4daa-bd7a-b5ec09ce7d81','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','69e44495-cab2-4dde-ae7e-70c89451c286',NULL,'CREDIT','COMPLETED','2026-03-29 21:04:58','2026-03-29 21:04:58','','Payment purchase for payment id 69e44495-cab2-4dde-ae7e-70c89451c286. Customer: Frisk Dreemurr',0.0000,0.0000),
('ae2328d1-0a28-41d1-b958-d0893e54ab6b','c4296c87-1418-4465-8d3d-efefe07c5eed','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','5564f851-c835-4667-b894-c654b69a93f6',NULL,'DEBIT','COMPLETED','2026-03-28 14:23:53','2026-03-28 14:23:53','','Payment purchase for payment id 5564f851-c835-4667-b894-c654b69a93f6. Sellers: Tetakent (H.C.G), Omodog',0.0000,0.0000),
('f50b7c20-b9f4-471f-a8cc-d13fc0562afc','41ce3295-d12a-410b-8a09-a3797f41170f','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','c3c816e5-1fdd-4021-a81a-2a211325bc15',NULL,'CREDIT','COMPLETED','2026-05-04 14:49:53','2026-05-04 14:49:53','','Payment purchase for payment id c3c816e5-1fdd-4021-a81a-2a211325bc15. Customer: Frisk Dreemurr',1155.0000,192.5000),
('ebb28ebd-daa3-48fa-8431-d152ff4d2b7f','a3fa72fa-9b2a-4fd0-848c-d9384e577044','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','48d44e19-659a-406b-a335-49a73554cd21',NULL,'DEBIT','COMPLETED','2026-05-14 12:37:18','2026-05-14 12:37:18','','Payment purchase for payment id 48d44e19-659a-406b-a335-49a73554cd21. Sellers: Doofenshmirtz Evil Inc',72.0965,0.0000),
('616ec240-64dd-43f0-afb3-d23e37ead0ab','e66911ba-6b44-4d23-a9c7-4756aaf1f55b','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','5c94c159-611c-4a6d-8498-b0daaea9b234',NULL,'CREDIT','COMPLETED','2026-04-30 22:16:40','2026-04-30 22:16:40','','Payment purchase for payment id 5c94c159-611c-4a6d-8498-b0daaea9b234. Customer: Frisk Dreemurr',684.0000,62.1818),
('f41c8ac0-174c-42af-836c-d30cb3055095','febbfa56-580c-4219-8c73-719b50531c32','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','ed2b84ab-8476-42f8-b8ef-64e38b0b4872',NULL,'CREDIT','COMPLETED','2026-04-11 12:27:26','2026-04-11 12:27:26','','Payment purchase for payment id ed2b84ab-8476-42f8-b8ef-64e38b0b4872. Customer: Kyle Broflovski',0.0000,0.0000),
('39f965d1-a7a7-4bb0-99a4-d5405bbaf42d','36e258d5-58fa-4019-b627-64cc1481436a','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','65fb3419-cb50-4c5b-b31e-98dbfe1bb430',NULL,'CREDIT','COMPLETED','2026-04-05 11:41:27','2026-04-05 11:41:27','','Payment purchase for payment id 65fb3419-cb50-4c5b-b31e-98dbfe1bb430. Customer: Frisk Dreemurr',0.0000,0.0000),
('22d7007d-02b6-4e75-b61a-d737d2954a69','d4cc7675-c6ad-43ee-a493-aa5d8768ee0c','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','46447df0-7deb-4677-9caa-45b4ff585820',NULL,'CREDIT','COMPLETED','2026-04-27 15:22:49','2026-04-27 15:22:49','','Payment purchase for payment id 46447df0-7deb-4677-9caa-45b4ff585820. Customer: Frisk Dreemurr',500.0000,83.3334),
('2ba404eb-c6a3-4e54-9afc-d7d8b679e1f8','744f7ffe-e6ae-4ece-ac7f-7063017a0091','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','c5cef75d-bb65-46b3-9375-3a5cc39920b6',NULL,'CREDIT','COMPLETED','2026-04-27 15:07:26','2026-04-27 15:07:26','','Payment purchase for payment id c5cef75d-bb65-46b3-9375-3a5cc39920b6. Customer: Frisk Dreemurr',1212.0000,202.0000),
('388e64ea-e147-4684-88bc-d84244be01bd','2732ac9c-98e4-4b59-9348-b770c9cd50ee','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','b0a028b8-c701-4e43-9d5f-1e182b236640',NULL,'CREDIT','COMPLETED','2026-04-14 12:43:14','2026-04-14 12:43:14','','Payment purchase for payment id b0a028b8-c701-4e43-9d5f-1e182b236640. Customer: Frisk Dreemurr',0.0000,0.0000),
('b84e2dff-fe6a-4b75-ad15-d8d526c2d184','a78e3d9d-0c35-445c-b341-97bd0bcd2990','cbf3e25f-5586-4e5c-b0d8-7463a83da274','Doofenshmirtz Evil Inc','6bfdea2e-5e43-495c-9d89-d1d27540304e',NULL,'CREDIT','COMPLETED','2026-04-13 12:41:47','2026-04-13 12:41:47','','Payment purchase for payment id 6bfdea2e-5e43-495c-9d89-d1d27540304e. Customer: Frisk Dreemurr',0.0000,0.0000),
('27887b78-6b4f-4d9f-8f04-d94b169426c3','2bb14f4b-001a-4409-96fb-e7c893ffc57f','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','15cb88e6-b4e2-4125-92dc-71ba0b514837',NULL,'CREDIT','COMPLETED','2026-05-04 14:31:01','2026-05-04 14:31:01','','Payment purchase for payment id 15cb88e6-b4e2-4125-92dc-71ba0b514837. Customer: Doofenshmirtz Evil Inc',1.1666,0.1944),
('8b4ccd60-b5dd-4708-bf6f-d9fcc6ad2bee','f77a5004-a061-4cef-a84c-ae445713f63d','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','eb6eadf1-a396-4eaf-b537-225ed0997447',NULL,'CREDIT','COMPLETED','2026-03-28 10:59:43','2026-03-28 10:59:43','','Payment purchase for payment id eb6eadf1-a396-4eaf-b537-225ed0997447. Customer: Frisk Dreemurr',0.0000,0.0000),
('56a9c0df-2359-4d5d-9c17-daea84a1c467','6b8ad375-e6ea-40fa-be3f-c74c2fbe9658','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','90b7bd2a-6723-4265-b782-242720019812',NULL,'DEBIT','COMPLETED','2026-04-11 12:48:28','2026-04-11 12:48:28','','Payment purchase for payment id 90b7bd2a-6723-4265-b782-242720019812. Sellers: Esenler Motionstar Incorporated, Doofenshmirtz Evil Inc, Omodog, Tetakent (H.C.G)',0.0000,0.0000),
('eb1efab3-2b25-4d99-b768-dbd4efc3a6af','4279e074-f4ba-40b8-aa28-4cc0ee46ad35','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','33b8b817-fa78-461c-8abd-60ecb0493698',NULL,'DEBIT','COMPLETED','2026-04-09 13:09:43','2026-04-09 13:09:43','','Payment purchase for payment id 33b8b817-fa78-461c-8abd-60ecb0493698. Sellers: Omodog',0.0000,0.0000),
('66ed407b-1f2a-4784-b21e-dd6e4ccc5164','b0bc0b1f-0944-4e4f-a230-03ebeb236bc4','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','e15efeb5-20d4-4f81-9ba7-275034539e14',NULL,'DEBIT','COMPLETED','2026-04-27 15:14:48','2026-04-27 15:14:48','','Payment purchase for payment id e15efeb5-20d4-4f81-9ba7-275034539e14. Sellers: Omodog',765.0000,75.6818),
('ccdf6f88-524c-4924-84a5-dd808c3da00c','b404695a-1755-4012-8251-5ba50a95e1e2','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','b95b4f3f-29b5-4937-8489-a05293cf527c',NULL,'CREDIT','COMPLETED','2026-05-14 12:37:14','2026-05-14 12:37:14','','Payment purchase for payment id b95b4f3f-29b5-4937-8489-a05293cf527c. Customer: Doofenshmirtz Evil Inc',3.5000,0.5833),
('10043ab8-d833-4dd5-bd46-e01b43a8aa56','f7ae3ad6-59e8-4c0b-973f-a4a2bef9676d','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','1263a16c-8f45-4a42-8d2d-eebbb17fbaa4',NULL,'DEBIT','COMPLETED','2026-04-13 12:08:16','2026-04-13 12:08:16','','Payment purchase for payment id 1263a16c-8f45-4a42-8d2d-eebbb17fbaa4. Sellers: Omodog',0.0000,0.0000),
('54084cf4-bea0-41d9-9647-e083388157fb','722dca1f-9c99-4374-b23c-e81ee74baa78','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Esenler Motionstar Incorporated','4a44fe14-64c1-4907-b9b2-a75550404178',NULL,'DEBIT','COMPLETED','2026-05-04 14:30:21','2026-05-04 14:30:21','','Payment purchase for payment id 4a44fe14-64c1-4907-b9b2-a75550404178. Sellers: Tetakent (H.C.G)',9.6251,1.6042),
('75c75e0d-29af-490c-9d12-e1576c7701e3','6b8ad375-e6ea-40fa-be3f-c74c2fbe9658','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','90b7bd2a-6723-4265-b782-242720019812',NULL,'CREDIT','COMPLETED','2026-04-11 12:48:28','2026-04-11 12:48:28','','Payment purchase for payment id 90b7bd2a-6723-4265-b782-242720019812. Customer: Frisk Dreemurr',0.0000,0.0000),
('2c625bb8-941f-4c61-97c3-e57517aad86b','5367f248-d8b8-483b-9463-5492edcd5923','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','ddca578b-583d-4008-8497-39bd8e360304',NULL,'CREDIT','COMPLETED','2026-04-01 12:31:41','2026-04-01 12:31:41','','Payment purchase for payment id ddca578b-583d-4008-8497-39bd8e360304. Customer: Frisk Dreemurr',0.0000,0.0000),
('1acb2940-5dbe-4675-ad57-e606dfc0ad70','6b8ad375-e6ea-40fa-be3f-c74c2fbe9658','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','90b7bd2a-6723-4265-b782-242720019812',NULL,'CREDIT','COMPLETED','2026-04-11 12:48:28','2026-04-11 12:48:28','','Payment purchase for payment id 90b7bd2a-6723-4265-b782-242720019812. Customer: Frisk Dreemurr',0.0000,0.0000),
('8934d435-e482-4666-8765-e61884f68f36','60eeebcf-c46c-458b-b45e-3a7a2abcc2e9','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','c26de1c7-9b65-4305-b0e8-ccc8d8fbb219',NULL,'CREDIT','COMPLETED','2026-04-18 12:22:47','2026-04-18 12:22:47','','Payment purchase for payment id c26de1c7-9b65-4305-b0e8-ccc8d8fbb219. Customer: Frisk Dreemurr',0.0000,0.0000),
('f27e5835-dfe9-40f8-943f-ea390291412c','f3275dc6-188a-4879-9240-eba4ea0ba438','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','55242586-5b62-4fbc-957d-42739f898b2f',NULL,'CREDIT','COMPLETED','2026-04-14 12:49:38','2026-04-14 12:49:38','','Payment purchase for payment id 55242586-5b62-4fbc-957d-42739f898b2f. Customer: Frisk Dreemurr',0.0000,0.0000),
('0688470a-3509-422a-9c42-ebe690378cb8','57d30692-60bc-49f9-9147-e41d8c29d59f','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','30e09c8d-d8b2-405b-ac5c-b5c498d4bddc',NULL,'CREDIT','COMPLETED','2026-04-14 12:48:16','2026-04-14 12:48:16','','Payment purchase for payment id 30e09c8d-d8b2-405b-ac5c-b5c498d4bddc. Customer: Frisk Dreemurr',0.0000,0.0000),
('bdfd1409-5291-42af-b653-ee22bce50055','948402b9-2ee4-45d7-bef7-a5fe23028f56','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','6da87317-e59e-44a2-9e8e-5c182e2aaa75',NULL,'CREDIT','COMPLETED','2026-05-23 15:44:43','2026-05-23 15:44:43','','Payment purchase for payment id 6da87317-e59e-44a2-9e8e-5c182e2aaa75. Customer: Frisk Dreemurr',250.0000,41.6666),
('8bd79276-3cf5-47c4-b72e-ef8d51dc0989','744f7ffe-e6ae-4ece-ac7f-7063017a0091','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','c5cef75d-bb65-46b3-9375-3a5cc39920b6',NULL,'DEBIT','COMPLETED','2026-04-27 15:07:26','2026-04-27 15:07:26','','Payment purchase for payment id c5cef75d-bb65-46b3-9375-3a5cc39920b6. Sellers: Omodog, Tetakent (H.C.G), Esenler Motionstar Incorporated, Doofenshmirtz Evil Inc',1726.0000,261.7576),
('5fb36fbd-6e40-4f3e-8867-f03af66a385b','5caf1297-9beb-410a-8e57-197290cc44f0','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kyle Broflovski','ac1c1ed3-a903-4639-a3fc-403b70c7f4b3',NULL,'DEBIT','COMPLETED','2026-05-14 13:16:53','2026-05-14 13:16:53','','Payment purchase for payment id ac1c1ed3-a903-4639-a3fc-403b70c7f4b3. Sellers: Omodog, Tetakent (H.C.G)',6120.0000,1020.0000),
('98bf6f70-45d1-4982-953f-f07570315f40','450ae594-635c-4f2a-9449-4252e0c56a67','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','01950684-f005-499c-8e8c-c07d62d3b85d',NULL,'DEBIT','COMPLETED','2026-04-30 22:54:54','2026-04-30 22:54:54','','Payment purchase for payment id 01950684-f005-499c-8e8c-c07d62d3b85d. Sellers: Omodog',560.0000,93.3333),
('c75fd6cf-98b8-4d14-ac84-f0cccfd3d2aa','b18fd795-00db-496d-b2ee-145e29083343','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','326ba11b-633d-4f18-8735-61a3396e92d2',NULL,'DEBIT','COMPLETED','2026-05-11 13:13:36','2026-05-11 13:13:36','','Payment purchase for payment id 326ba11b-633d-4f18-8735-61a3396e92d2. Sellers: Omodog',1687.3500,0.0000),
('a9a0f732-e535-40b2-bd9a-f22304908329','b9969eae-4619-495a-b891-6c07ee08dfb0','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','725ee06e-78fc-48aa-ba01-ac936fc7190d',NULL,'CREDIT','COMPLETED','2026-04-13 12:06:29','2026-04-13 12:06:29','','Payment purchase for payment id 725ee06e-78fc-48aa-ba01-ac936fc7190d. Customer: Frisk Dreemurr',0.0000,0.0000),
('2f136be2-2805-481b-bd03-f404148c66f9','ab5da9f1-a2e6-4c97-b539-987762d65493','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','21a1914c-2f02-468a-9969-c82851f5cde7',NULL,'CREDIT','COMPLETED','2026-03-31 11:41:43','2026-03-31 11:41:43','','Payment purchase for payment id 21a1914c-2f02-468a-9969-c82851f5cde7. Customer: Frisk Dreemurr',0.0000,0.0000),
('777a98d5-ea9d-4cd0-9ba9-f59c2bc588cc','d025e637-0b54-4748-93a3-18b00fc50674','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','d4668779-7454-4f6a-b81c-ba9aa510e070',NULL,'CREDIT','COMPLETED','2026-03-31 12:08:07','2026-03-31 12:08:07','','Payment purchase for payment id d4668779-7454-4f6a-b81c-ba9aa510e070. Customer: Frisk Dreemurr',0.0000,0.0000),
('a3761199-9bc4-4fef-9178-f6d248418c1b','eb9f9199-f049-4d26-902d-b033ee52d8c5','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','a815c450-c725-4563-8ab1-8446c0397ef5',NULL,'CREDIT','COMPLETED','2026-04-27 15:10:27','2026-04-27 15:10:27','','Payment purchase for payment id a815c450-c725-4563-8ab1-8446c0397ef5. Customer: Frisk Dreemurr',6756.0000,1126.0000),
('966f7bad-f06f-4778-b015-f85cc388f1bc','57d30692-60bc-49f9-9147-e41d8c29d59f','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','30e09c8d-d8b2-405b-ac5c-b5c498d4bddc',NULL,'CREDIT','COMPLETED','2026-04-14 12:48:16','2026-04-14 12:48:16','','Payment purchase for payment id 30e09c8d-d8b2-405b-ac5c-b5c498d4bddc. Customer: Frisk Dreemurr',0.0000,0.0000),
('df5afce1-8b89-451b-908f-f85f98c2dedf','61627381-5591-4b77-b03f-dadd02637923','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','c2f20787-32ee-4e8a-9385-4938bc36dff6',NULL,'CREDIT','COMPLETED','2026-04-14 12:53:12','2026-04-14 12:53:12','','Payment purchase for payment id c2f20787-32ee-4e8a-9385-4938bc36dff6. Customer: Frisk Dreemurr',0.0000,0.0000),
('3fa9cc6e-1af2-463d-a694-fa7aac19400d','4e336289-a56a-4cee-ba8d-1cf06296d2dc','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','b4581706-bea2-47d3-bc0f-8afef71c056f',NULL,'CREDIT','COMPLETED','2026-05-13 19:20:40','2026-05-13 19:20:40','','Payment purchase for payment id b4581706-bea2-47d3-bc0f-8afef71c056f. Customer: Kyle Broflovski',1704.0000,180.3636),
('20be54c3-d86e-49e2-84bf-fb3d687f4b72','17756f91-5713-4147-aac8-1f0e06581100','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','9c40090e-8c3b-4aad-a9b5-2347cc2fc6fa',NULL,'CREDIT','COMPLETED','2026-05-14 12:36:34','2026-05-14 12:36:34','','Payment purchase for payment id 9c40090e-8c3b-4aad-a9b5-2347cc2fc6fa. Customer: Kyle Broflovski',1704.0000,180.3636),
('37dae9f6-5dcc-4c8e-9b37-fb755fc65dfe','0ae44fcf-883c-42a4-8f86-2c4bdd8f5bcf','5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','0a22264f-1425-43c7-b78a-5fd8131dd908',NULL,'DEBIT','COMPLETED','2026-05-02 17:00:30','2026-05-02 17:00:30','','Payment purchase for payment id 0a22264f-1425-43c7-b78a-5fd8131dd908. Sellers: Omodog',2999.0650,0.0000),
('ffd52e53-a162-453a-9ef8-fdf648f121bb','92f41d0a-e91e-4fd5-8329-08ba2ba86ce8','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','a515959c-24ee-470b-86cd-698646ee3ae9',NULL,'CREDIT','COMPLETED','2026-04-11 12:05:42','2026-04-11 12:05:42','','Payment purchase for payment id a515959c-24ee-470b-86cd-698646ee3ae9. Customer: Frisk Dreemurr',0.0000,0.0000),
('642dbfef-df61-4bf9-9aaa-fe729a2b3ae2','91d36acb-42c5-4812-b832-ee9c67b3f050','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1b2f201a-15d0-47eb-8084-d9019c1e4970',NULL,'DEBIT','COMPLETED','2026-04-29 13:59:15','2026-04-29 13:59:15','','Payment refund for payment id 1b2f201a-15d0-47eb-8084-d9019c1e4970. Customer: Frisk Dreemurr',357.0000,33.5909),
('ba8110e8-5bb3-4020-821f-feab95c67f7b','eb9f9199-f049-4d26-902d-b033ee52d8c5','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','a815c450-c725-4563-8ab1-8446c0397ef5',NULL,'DEBIT','COMPLETED','2026-04-27 15:10:27','2026-04-27 15:10:27','','Payment purchase for payment id a815c450-c725-4563-8ab1-8446c0397ef5. Sellers: Omodog, Tetakent (H.C.G)',6783.0000,1130.5000),
('d7324b8d-3705-4f2b-80eb-febac49d3a94','52f855be-5bce-4d2c-8fab-b0409ccc25e8','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','8b4fa939-e3f9-470e-b97d-0eeebf4ff38a',NULL,'CREDIT','COMPLETED','2026-05-13 19:20:19','2026-05-13 19:20:19','','Payment purchase for payment id 8b4fa939-e3f9-470e-b97d-0eeebf4ff38a. Customer: Kyle Broflovski',896.0000,149.3333),
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
('794ac8a5-c028-442c-a6a1-8a5cef004b31','Takımsal','42','','5','3','','Deneme Sokak','','','BAHÇELİEVLER','İSTANBUL','34180','','','TURKIYE','','','','','','','','','','',''),
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
('d894351b-f29b-4e32-8ecd-77acb27dec8d',1,1,'2026-04-09 16:09:31','2026-04-09 16:09:31','927c6994-7d2d-43ab-80cd-17cc74de5196','5e72f829-e4ed-4ccd-8971-509708f42212','[15,28]');
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
('202f9f6f-8506-469a-a230-c746387282bd','COMPLETED','2026-05-13 16:12:52','2026-05-13 16:12:52'),
('31eaa473-24b9-415d-b78c-78d46c67e5cd','COMPLETED','2026-04-30 20:00:11','2026-04-30 20:00:11'),
('358a07b9-ec18-47b4-98cc-3d9fe1417bfb','COMPLETED','2026-05-11 11:41:38','2026-05-11 11:41:38'),
('3710202d-952c-4488-8f4d-4102000df39d','COMPLETED','2026-05-14 09:47:35','2026-05-14 09:47:44'),
('4258e2f6-3039-4386-867a-647b5f8ef0af','COMPLETED','2026-05-04 11:47:11','2026-05-04 11:47:11'),
('4ac4c8fd-fc82-4a56-b38b-c5b4d78d5e45','COMPLETED','2026-05-04 11:38:28','2026-05-04 11:38:28'),
('4e54d5a8-feb3-48b9-a357-76608ee633b1','COMPLETED','2026-05-13 16:27:32','2026-05-13 16:27:32'),
('5c94c159-611c-4a6d-8498-b0daaea9b234','COMPLETED','2026-04-30 19:16:40','2026-04-30 19:16:40'),
('6da87317-e59e-44a2-9e8e-5c182e2aaa75','COMPLETED','2026-05-23 12:44:43','2026-05-23 12:44:43'),
('8b4fa939-e3f9-470e-b97d-0eeebf4ff38a','COMPLETED','2026-05-13 16:20:00','2026-05-13 16:20:00'),
('97ce01db-fe13-428e-8b3f-ad9e49c2953b','COMPLETED','2026-04-30 20:19:30','2026-04-30 20:19:30'),
('9c40090e-8c3b-4aad-a9b5-2347cc2fc6fa','COMPLETED','2026-05-14 09:36:34','2026-05-14 09:36:34'),
('9f608673-b874-4447-bcc8-2c235780cc13','COMPLETED','2026-05-08 08:22:17','2026-05-08 08:22:17'),
('ac1c1ed3-a903-4639-a3fc-403b70c7f4b3','COMPLETED','2026-05-14 10:16:52','2026-05-14 10:16:52'),
('b4581706-bea2-47d3-bc0f-8afef71c056f','COMPLETED','2026-05-13 16:20:40','2026-05-13 16:20:40'),
('b9e79db5-5d1f-4d79-8ef3-23ad5a51093a','COMPLETED','2026-05-13 18:33:32','2026-05-13 18:33:32'),
('bd8e8e57-269a-4d27-b1ad-698289104c89','COMPLETED','2026-04-29 11:36:05','2026-04-29 11:36:05'),
('be446f77-c6cf-4394-8f84-f852b0ac1e8d','COMPLETED','2026-05-01 18:19:10','2026-05-01 18:19:10'),
('c067f04c-a728-41bc-bb22-c940f487b445','COMPLETED','2026-04-30 20:23:33','2026-04-30 20:23:33'),
('c3c816e5-1fdd-4021-a81a-2a211325bc15','COMPLETED','2026-05-04 11:49:52','2026-05-04 11:49:52'),
('d52dbec7-70cc-4033-8efc-9cda518bc009','COMPLETED','2026-04-29 11:38:18','2026-04-29 11:38:18'),
('e8a977da-ec64-454e-bcc6-aa14aab609b5','COMPLETED','2026-04-30 19:57:40','2026-04-30 19:57:40'),
('ee6dcff0-2fec-4eee-a470-8050c3980833','COMPLETED','2026-05-11 11:28:06','2026-05-11 11:28:06');
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
('1377f62d-18b7-4de7-aaae-4df861855f94','Tetakun peluş','','','','','5e72f829-e4ed-4ccd-8971-509708f42212','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196','toys'),
('e283db5a-2ad4-4fe7-98c0-6ca1601b80cd','','','','','','','','',''),
('e793092f-ef61-44ea-b025-8cc806815c4d','Yeni ürün','','','','C62','','TRY','',''),
('739263f4-a5e9-4f70-a368-8ea4891fec10','Kyle Broflovski Peluş','','','','GFI','5e72f829-e4ed-4ccd-8971-509708f42212','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196','electronics'),
('3954ca25-330d-4e83-aef9-96f0da591b53','Drillinator','','','','C62','cbf3e25f-5586-4e5c-b0d8-7463a83da274','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196',''),
('e2e402c4-ef53-40df-8591-98adfd4a1afc','Esenler Note Calculation','','','','C62','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196',''),
('86c1d964-dbb5-4b36-9f7b-f1d40b43cb1f','Yeni ürün','','','','C62','','TRY','',''),
('c0cba439-b401-4da3-bd44-f2a9a38fac88','Yeni ürün','','','','C62','','TRY','',''),
('7465f598-29ee-4b73-8e12-fcff0c5e2e5c','Yeni ürün','','','','C62','','TRY','','');
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
('c7188def-4b5f-4486-8c37-a0c686e5b2e3','739263f4-a5e9-4f70-a368-8ea4891fec10','default','İSTANBUL','TRY',0,NULL,NULL,NULL,100.0000),
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
  `openPayment` tinyint(4) NOT NULL DEFAULT 0,
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
('6da87317-e59e-44a2-9e8e-5c182e2aaa75','PURCHASE','TRY',NULL,'COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-05-23 12:43:14','2026-05-23 12:44:43',NULL,2718.0000,453.0000,1,'bb251590-67d6-4165-8321-7a04fa357242',0);
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `payment_channel_config`
--

DROP TABLE IF EXISTS `payment_channel_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_channel_config` (
  `id` uuid NOT NULL,
  `channelId` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `enabled` tinyint(4) NOT NULL DEFAULT 1,
  `devOnly` tinyint(4) NOT NULL DEFAULT 0,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_a0de084d4f8d94e4311e5d2677` (`channelId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_channel_config`
--

LOCK TABLES `payment_channel_config` WRITE;
/*!40000 ALTER TABLE `payment_channel_config` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `payment_channel_config` VALUES
('c8fd6047-14ed-463b-9b13-1ffa98dc6d68','bobrek','Böbrek',1,1,'dsadsadasdasdasd','2026-05-13 19:07:44','2026-05-13 19:07:44'),
('8b49bc1a-74ca-4a55-a333-816bfa131ba8','dummy-ecommerce','Dummy E-Commerce',1,1,'Sadece development amaçlı test ödeme yöntemi','2026-05-11 13:51:59','2026-05-11 13:51:59');
/*!40000 ALTER TABLE `payment_channel_config` ENABLE KEYS */;
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
('1be6aad4-9485-4116-a6d2-02645135b5b1','dummy-ecommerce','4258e2f6-3039-4386-867a-647b5f8ef0af','','TRY','COMPLETED','4258e2f6-3039-4386-867a-647b5f8ef0af','2026-05-04 14:47:09','2026-05-04 11:47:11','SELLER',1,2830.0000,283.1000),
('41126fc4-88b2-464e-8ca3-127125a9f70b','dummy-ecommerce','5c94c159-611c-4a6d-8498-b0daaea9b234','','TRY','COMPLETED','5c94c159-611c-4a6d-8498-b0daaea9b234','2026-04-30 22:16:39','2026-04-30 19:16:40','SELLER',1,1976.0000,197.7000),
('7317f246-f196-49cb-ac3b-1341f0e399e2','dummy-ecommerce','202f9f6f-8506-469a-a230-c746387282bd','','TRY','COMPLETED','202f9f6f-8506-469a-a230-c746387282bd','2026-05-13 19:12:51','2026-05-13 16:12:52','SELLER',1,1370.0000,137.1000),
('863b28b8-41a0-496b-835f-1809a3d15483','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','b95b4f3f-29b5-4937-8489-a05293cf527c','2026-05-11 13:10:45','2026-05-11 13:10:45','PLATFORM',0,3.5000,0.0000),
('ddc03bd0-f57e-4998-a887-19d18c827f13','dummy-ecommerce','3710202d-952c-4488-8f4d-4102000df39d','','TRY','EXPIRED','3710202d-952c-4488-8f4d-4102000df39d','2026-05-14 12:47:33','2026-05-14 09:47:35','SELLER',1,1259.0000,126.0000),
('4000bc6f-b5e3-4715-a7b1-1a4adbd27762','dummy-ecommerce','9f608673-b874-4447-bcc8-2c235780cc13','','TRY','COMPLETED','9f608673-b874-4447-bcc8-2c235780cc13','2026-05-08 11:22:03','2026-05-08 08:22:17','SELLER',1,1338.0000,133.9000),
('62e4223e-eeb3-4322-825c-1a4c8bfc05b7','dummy-ecommerce','01950684-f005-499c-8e8c-c07d62d3b85d','','TRY','COMPLETED','01950684-f005-499c-8e8c-c07d62d3b85d','2026-04-30 22:54:52','2026-04-30 19:54:53','SELLER',1,560.0000,56.1000),
('cd905358-2425-46d0-bcad-1bc9a886d20e','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','554da67e-22df-4ba5-bd07-205854d3a1fc','2026-05-15 00:50:57','2026-05-15 00:50:57','PLATFORM',0,22.6303,0.0000),
('fa0dea0e-e8eb-4e5a-b23a-24489c9b80b2','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','f12e565f-076b-4859-bb80-8995c8822379','2026-05-02 17:00:09','2026-05-02 17:00:09','PLATFORM',0,149.6780,0.0000),
('2dbc5194-abb3-498f-9f87-24ed1ea9a8b8','dummy-ecommerce','ee6dcff0-2fec-4eee-a470-8050c3980833','','TRY','COMPLETED','ee6dcff0-2fec-4eee-a470-8050c3980833','2026-05-11 14:28:01','2026-05-11 11:28:06','SELLER',1,3734.0000,373.5000),
('be999829-cf2b-4160-8bc5-2f5c18c263c5','dummy-ecommerce','97ce01db-fe13-428e-8b3f-ad9e49c2953b','','TRY','COMPLETED','97ce01db-fe13-428e-8b3f-ad9e49c2953b','2026-04-30 23:19:29','2026-04-30 20:19:30','SELLER',1,6844.0000,684.5000),
('a8ef89d6-c372-4c57-b78a-332403627847','dummy-ecommerce','3710202d-952c-4488-8f4d-4102000df39d','','TRY','COMPLETED','3710202d-952c-4488-8f4d-4102000df39d','2026-05-14 12:47:42','2026-05-14 09:47:44','SELLER',1,1259.0000,126.0000),
('61764d0b-3629-4863-892a-34df2e05f4b3','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','48d44e19-659a-406b-a335-49a73554cd21','2026-05-11 13:10:45','2026-05-11 13:10:45','PLATFORM',0,72.0965,0.0000),
('2406174f-a927-4a4b-9239-3906bee6fec7','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','7f06a8cc-164c-4196-a2eb-09e7f70e272b','2026-05-02 17:00:09','2026-05-02 17:00:09','PLATFORM',0,11278.4658,0.0000),
('b8af0606-f119-45af-95cf-4b7f51cd2c89','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','9c15da2d-117f-4c66-979b-dfd73f5debb3','2026-05-15 00:50:57','2026-05-15 00:50:57','PLATFORM',0,6.8750,0.0000),
('42ff4dbe-04ae-45a7-9469-5d23df732304','dummy-ecommerce','be446f77-c6cf-4394-8f84-f852b0ac1e8d','','TRY','COMPLETED','be446f77-c6cf-4394-8f84-f852b0ac1e8d','2026-05-01 21:19:09','2026-05-01 18:19:10','SELLER',1,290.0000,29.1000),
('af39aa9c-23ed-4308-ba5c-5ff1353d7796','dummy-ecommerce','c3c816e5-1fdd-4021-a81a-2a211325bc15','','TRY','COMPLETED','c3c816e5-1fdd-4021-a81a-2a211325bc15','2026-05-04 14:49:50','2026-05-04 11:49:52','SELLER',1,1155.0000,115.6000),
('7275b42e-7f6a-4a55-b1e2-65a85208fe56','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','4a44fe14-64c1-4907-b9b2-a75550404178','2026-05-02 17:00:09','2026-05-02 17:00:09','PLATFORM',0,9.6251,0.0000),
('211a6685-ebe7-46de-8cd8-6dd5bc0d30c5','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','ceef3403-4c23-4eb9-9398-875bb44e068a','2026-05-02 17:00:09','2026-05-02 17:00:09','PLATFORM',0,198.2675,0.0000),
('bf21e209-510f-457e-bc88-760942ee21ca','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','74ffeedb-ee8d-4b5b-ae8d-e97c8ebf636e','2026-05-15 00:50:57','2026-05-15 00:50:57','PLATFORM',0,10058.9402,0.0000),
('ae7d1e58-dc06-491b-bbb4-781fa70f6182','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','2ffc2063-3101-445d-bade-2e62fdcea1f5','2026-05-15 00:50:57','2026-05-15 00:50:57','PLATFORM',0,1.1666,0.0000),
('ac4324ae-260f-4973-af2d-7d8ba22bc8d5','dummy-ecommerce','31eaa473-24b9-415d-b78c-78d46c67e5cd','','TRY','COMPLETED','31eaa473-24b9-415d-b78c-78d46c67e5cd','2026-04-30 23:00:10','2026-04-30 20:00:11','SELLER',1,2401.0000,240.2000),
('e407522a-cd98-4f89-8244-8b984f17de10','dummy-ecommerce','4e54d5a8-feb3-48b9-a357-76608ee633b1','','TRY','COMPLETED','4e54d5a8-feb3-48b9-a357-76608ee633b1','2026-05-13 19:27:31','2026-05-13 16:27:32','SELLER',1,1259.0000,126.0000),
('5a8bfc83-847b-400f-9ff4-911e15bc7d97','dummy-ecommerce','9c40090e-8c3b-4aad-a9b5-2347cc2fc6fa','','TRY','COMPLETED','9c40090e-8c3b-4aad-a9b5-2347cc2fc6fa','2026-05-14 12:36:32','2026-05-14 09:36:34','SELLER',1,1704.0000,170.5000),
('03314f0b-92c7-4c63-ba31-922711fc61cc','dummy-ecommerce','6da87317-e59e-44a2-9e8e-5c182e2aaa75','','TRY','COMPLETED','6da87317-e59e-44a2-9e8e-5c182e2aaa75','2026-05-23 15:44:41','2026-05-23 12:44:43','SELLER',1,2718.0000,271.9000),
('7cdfa259-cc88-45b6-b946-94941e7f2f53','dummy-ecommerce','358a07b9-ec18-47b4-98cc-3d9fe1417bfb','','TRY','COMPLETED','358a07b9-ec18-47b4-98cc-3d9fe1417bfb','2026-05-11 14:41:37','2026-05-11 11:41:38','SELLER',1,1595.0000,159.6000),
('3ea7727a-0151-4d6f-867d-984f548f9b90','dummy-ecommerce','b9e79db5-5d1f-4d79-8ef3-23ad5a51093a','','TRY','COMPLETED','b9e79db5-5d1f-4d79-8ef3-23ad5a51093a','2026-05-13 21:33:31','2026-05-13 18:33:32','SELLER',1,88.0000,8.9000),
('a1907e29-50c2-4949-8b66-98d457f4984c','dummy-ecommerce','8b4fa939-e3f9-470e-b97d-0eeebf4ff38a','','TRY','FAILED','8b4fa939-e3f9-470e-b97d-0eeebf4ff38a','2026-05-13 19:19:58','2026-05-13 16:20:00','SELLER',1,896.0000,89.7000),
('9282d280-c35d-432b-88ef-9f99db17714a','dummy-ecommerce','4ac4c8fd-fc82-4a56-b38b-c5b4d78d5e45','','TRY','COMPLETED','4ac4c8fd-fc82-4a56-b38b-c5b4d78d5e45','2026-05-04 14:38:26','2026-05-04 11:38:28','SELLER',1,2787.0000,278.8000),
('ca4299ef-b735-4647-a66d-a37713483323','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','0a22264f-1425-43c7-b78a-5fd8131dd908','2026-05-02 17:00:09','2026-05-02 17:00:09','PLATFORM',0,2999.0650,0.0000),
('746e1d64-bc05-460d-a5aa-a72f1d283e90','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','15cb88e6-b4e2-4125-92dc-71ba0b514837','2026-05-02 17:00:09','2026-05-02 17:00:09','PLATFORM',0,1.1666,0.0000),
('2d84944a-2852-4d01-bee5-b1533b90c6ef','dummy-ecommerce','ee6dcff0-2fec-4eee-a470-8050c3980833','','TRY','FAILED','ee6dcff0-2fec-4eee-a470-8050c3980833','2026-05-11 14:27:57','2026-05-11 11:28:00','SELLER',1,3734.0000,373.5000),
('0fd6c523-4989-4d22-843f-b72529098db2','dummy-ecommerce','b4581706-bea2-47d3-bc0f-8afef71c056f','','TRY','COMPLETED','b4581706-bea2-47d3-bc0f-8afef71c056f','2026-05-13 19:20:38','2026-05-13 16:20:40','SELLER',1,1704.0000,170.5000),
('f29bdcb7-84c3-4328-9c0a-b94d50d26f71','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','87d4243f-e477-4f3f-ac6a-e7b251e797fe','2026-05-11 13:10:45','2026-05-11 13:10:45','PLATFORM',0,81.9167,0.0000),
('cd825d00-4384-4472-881e-c038579123aa','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','3f4705e2-9d40-4c31-a637-f97960dd8597','2026-05-15 00:50:57','2026-05-15 00:50:57','PLATFORM',0,6248.8263,0.0000),
('3cfad984-3eef-4f5a-a403-c243c75f5888','dummy-ecommerce','e8a977da-ec64-454e-bcc6-aa14aab609b5','','TRY','COMPLETED','e8a977da-ec64-454e-bcc6-aa14aab609b5','2026-04-30 22:57:22','2026-04-30 19:57:40','SELLER',1,2847.0000,284.8000),
('cf4276ea-c691-4aec-ba04-c64d9eae17e4','dummy-ecommerce','ac1c1ed3-a903-4639-a3fc-403b70c7f4b3','','TRY','COMPLETED','ac1c1ed3-a903-4639-a3fc-403b70c7f4b3','2026-05-14 13:16:51','2026-05-14 10:16:52','SELLER',1,6120.0000,612.1000),
('1f317a39-c95b-4241-9de2-d69dbb5cec39','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','28e22fcf-fd10-495c-8273-be41b7d47cbf','2026-05-02 17:00:09','2026-05-02 17:00:09','PLATFORM',0,24.0322,0.0000),
('e745327b-ce75-40e8-aebf-d9a4e74ed8b5','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','23356d08-93c9-4ea2-b66d-d68c14861ec7','2026-05-11 13:10:45','2026-05-11 13:10:45','PLATFORM',0,5453.7367,0.0000),
('9dcf501f-9fb7-46f5-a288-e3135f128484','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','57d29df3-d0ef-4b31-aab8-016cd3fe7d41','2026-05-15 00:50:57','2026-05-15 00:50:57','PLATFORM',0,129.4162,0.0000),
('b7ce3fa0-e8d0-4553-9633-eab0e871abb4','dummy-ecommerce','ee6dcff0-2fec-4eee-a470-8050c3980833','','TRY','COMPLETED','ee6dcff0-2fec-4eee-a470-8050c3980833','2026-05-11 14:28:05','2026-05-11 11:28:06','SELLER',1,3734.0000,373.5000),
('b02c803a-b926-47a4-ab18-f4b3cea52aed','dummy-ecommerce','c067f04c-a728-41bc-bb22-c940f487b445','','TRY','COMPLETED','c067f04c-a728-41bc-bb22-c940f487b445','2026-04-30 23:23:31','2026-04-30 20:23:33','SELLER',1,1372.0000,137.3000),
('e29a21f6-86b3-4b74-91b2-f59fd41699b4','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','3e6a30f1-5cfb-43f7-9798-1343f1ff6d18','2026-05-15 00:50:57','2026-05-15 00:50:57','PLATFORM',0,324.5454,0.0000),
('4915d286-daeb-4a2d-9406-f92577534ad2','OPEN_PAYMENT','OPEN_PAYMENT','','TRY','COMPLETED','326ba11b-633d-4f18-8735-61a3396e92d2','2026-05-11 13:10:45','2026-05-11 13:10:45','PLATFORM',0,1687.3500,0.0000),
('5f06ee8f-723f-42d6-9421-fe0f6b1f97f8','dummy-ecommerce','8b4fa939-e3f9-470e-b97d-0eeebf4ff38a','','TRY','COMPLETED','8b4fa939-e3f9-470e-b97d-0eeebf4ff38a','2026-05-13 19:20:17','2026-05-13 16:20:19','SELLER',1,896.0000,89.7000);
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
('f5474b48-bf70-48cb-9fa5-25e24bf43439','','','','Esenler Note Calculation','6da87317-e59e-44a2-9e8e-5c182e2aaa75','e2e402c4-ef53-40df-8591-98adfd4a1afc','1years','C62',0,NULL,NULL,'','2026-05-23 12:43:14','2026-05-23 12:43:14',2.0000,44.0000,22.0000,22.0000,20.0000,7.3333,36.6667,0.0000,1.8333,5.0000,0.0000,0.0000,'a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('aba4c9f2-9b47-4a6a-b4f8-33a0ddccfe39','','','','Something','6da87317-e59e-44a2-9e8e-5c182e2aaa75','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','basils','C62',0,NULL,NULL,'automotive','2026-05-23 12:43:14','2026-05-23 12:43:14',2.0000,26.0000,13.0000,13.0000,20.0000,4.3333,21.6667,0.0000,1.0833,5.0000,0.0000,0.0000,'c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('fe2fa5d9-09e0-4b62-8962-5ba8963adbec','','','','Kyle Broflovski Peluş','6da87317-e59e-44a2-9e8e-5c182e2aaa75','739263f4-a5e9-4f70-a368-8ea4891fec10','humankite','GFI',0,NULL,NULL,'electronics','2026-05-23 12:43:14','2026-05-23 12:43:14',2.0000,2424.0000,1212.0000,1212.0000,20.0000,404.0000,2020.0000,0.0000,0.0000,0.0000,0.0000,0.0000,'5e72f829-e4ed-4ccd-8971-509708f42212'),
('5ddd1923-e098-4bd6-89ab-9dbcefd63e19','','','','Tost','6da87317-e59e-44a2-9e8e-5c182e2aaa75','dbf8a42f-69f0-4181-8373-2a0b3ea01061','aubrey','KPO',0,NULL,NULL,'electronics','2026-05-23 12:43:14','2026-05-23 12:43:14',2.0000,224.0000,112.0000,112.0000,20.0000,37.3333,186.6667,0.0000,9.3333,5.0000,0.0000,0.0000,'c783e9dc-07aa-4fe4-95e9-be16246156bb');
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
('b0cd9ea6-bfa4-44eb-8b79-16691e7945e8','6da87317-e59e-44a2-9e8e-5c182e2aaa75',453.0000,2265.0000,2718.0000,20.0000);
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
('bdc41de9-7bd3-4c48-8e66-33ee9b01984a','023ecb88-20b4-4dd0-bd13-e544526d27b4','2026-05-23','TRY','2026-05-23 15:45:00','2026-05-23 15:44:43',1,12.2499,0.0000,2.0417,0.0000,2.0417,12.2499,10.2083,'6da87317-e59e-44a2-9e8e-5c182e2aaa75',0,0.0000,0.0000,'PLATFORM',12.2499,-2.0417,NULL,0.0000),
('c0c13590-c38f-48c3-8715-39cd09b92275','00603de7-3573-4be2-b952-1d2a093e5d24','2026-05-23','TRY','2026-05-23 15:45:00','2026-05-23 15:44:43',1,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,'6da87317-e59e-44a2-9e8e-5c182e2aaa75',0,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL,0.0000),
('e481ebc0-43f7-4a49-87be-4cdb42fa7aa4','72cf238e-a96a-44a2-b7b6-1c185a1df3a7','2026-05-23','TRY','2026-05-23 15:45:00','2026-05-23 15:44:43',1,2424.0000,0.0000,404.0000,0.0000,404.0000,2424.0000,2020.0000,'6da87317-e59e-44a2-9e8e-5c182e2aaa75',0,0.0000,0.0000,'SELLER',242.4892,1777.5108,NULL,2181.5108),
('5f49422e-587f-4cca-b75d-8ad9feb602d7','4e64b4f2-aae1-40d1-b6d4-31d1a2791780','2026-05-23','TRY','2026-05-23 15:45:00','2026-05-23 15:44:43',1,250.0000,0.0000,41.6666,0.0000,41.6666,250.0000,208.3334,'6da87317-e59e-44a2-9e8e-5c182e2aaa75',0,0.0000,0.0000,'SELLER',35.4258,172.9076,NULL,214.5742),
('4b23f12b-805a-4e32-a7a9-8dd3d62ecf9a','9e72b629-d785-47b7-b945-32cdd253023c','2026-05-23','TRY','2026-05-23 15:45:00','2026-05-23 15:44:43',1,10.4166,0.0000,1.7361,0.0000,1.7361,10.4166,8.6805,'6da87317-e59e-44a2-9e8e-5c182e2aaa75',0,0.0000,0.0000,'PLATFORM_SELLER',10.4166,-1.7361,NULL,0.0000),
('2b9c60dd-5782-4e7d-9b66-a52401146483','123057a4-5e08-4483-9cc4-26537267918b','2026-05-23','TRY','2026-05-23 15:45:00','2026-05-23 15:44:43',1,44.0000,0.0000,7.3333,0.0000,7.3333,44.0000,36.6667,'6da87317-e59e-44a2-9e8e-5c182e2aaa75',0,0.0000,0.0000,'SELLER',6.2349,30.4318,NULL,37.7651),
('4a738385-01ea-4574-9af3-a7f48020a4c8','b9243d78-24fd-4f05-964f-dcb12547ba7f','ALL','TRY','2026-05-23 15:45:00','2026-05-23 15:44:43',1,250.0000,0.0000,41.6666,0.0000,41.6666,250.0000,208.3334,'6da87317-e59e-44a2-9e8e-5c182e2aaa75',0,0.0000,0.0000,'SELLER',35.4258,172.9076,NULL,214.5742),
('2f2ebe8c-2a3f-42f8-9b5c-b5c5cdcda5a3','153d7879-0137-4bd3-b449-cbbf99b3e914','2026-05-23','TRY','2026-05-23 15:45:00','2026-05-23 15:44:43',1,1.8333,0.0000,0.3056,0.0000,0.3056,1.8333,1.5278,'6da87317-e59e-44a2-9e8e-5c182e2aaa75',0,0.0000,0.0000,'PLATFORM_SELLER',1.8333,-0.3056,NULL,0.0000),
('40e92691-8d26-41a5-b9f7-bfbab9e2a786','874d081f-dea6-46df-b834-e7be221262d1','2026-05-23','TRY','2026-05-23 15:45:00','2026-05-23 15:44:43',1,2718.0000,0.0000,452.9999,0.0000,452.9999,2718.0000,2265.0001,'6da87317-e59e-44a2-9e8e-5c182e2aaa75',0,0.0000,0.0000,'PLATFORM_FLOW',12.2499,2252.7502,NULL,2705.7501),
('2b89861b-cc88-4e30-9ed2-dfabedebcc51','882e1a6e-743e-4592-9266-8ff803261e2c','2026-05-23','TRY','2026-05-23 15:45:00','2026-05-23 15:44:43',0,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,'6da87317-e59e-44a2-9e8e-5c182e2aaa75',0,0.0000,0.0000,'PLATFORM_SELLER',0.0000,0.0000,NULL,0.0000),
('8fa56501-8609-4da1-b859-ebe91e809536','c32beff3-1fcc-410a-9562-debe2d5e40bc','2026-05','TRY','2026-05-23 15:45:00','2026-05-23 15:44:43',1,2424.0000,0.0000,404.0000,0.0000,404.0000,2424.0000,2020.0000,'6da87317-e59e-44a2-9e8e-5c182e2aaa75',0,0.0000,0.0000,'SELLER',242.4892,1777.5108,NULL,2181.5108);
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
('0026096c-092c-4601-8646-002d3c9f216b','12bf23a4-a296-4f1e-baea-27f9d8732466','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-02 14:00:00','2026-05-02 14:00:00',2,12.0833),
('6c8e26a5-270b-4394-abd4-0081386f7fd7','8b0da262-25f2-4d12-a7cb-d472b01a49fc','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-04 11:50:00','2026-05-04 11:39:00',3,77.2500),
('74aa16e8-022d-4690-8f35-016919c30be8','4e75cf65-a653-4b96-ab03-b8a8f5e7d85a','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-05-13 16:28:00','2026-05-13 16:13:00',1,839.9431),
('b37dc8a2-1996-41cb-90f8-01c620a1370a','12bf23a4-a296-4f1e-baea-27f9d8732466','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-05-02 14:00:00','2026-05-02 14:00:00',3,2.2500),
('427383dd-1c6a-4c8f-861c-01f21860a734','e481ebc0-43f7-4a49-87be-4cdb42fa7aa4','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',1,242.4892),
('de02e5ef-0d49-4ac1-8290-04e362c03786','d75daedc-ad97-47ac-a470-39e68b996e44','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',2,21.3371),
('e6f1d084-9654-4b2e-ba56-0574f52bfef9','9e37e372-ba53-421f-b595-296a5fde4baf','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',1,72.0478),
('c9d8cf22-8118-4763-b5eb-0792b4962d96','c0c13590-c38f-48c3-8715-39cd09b92275','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,0.0000),
('9f50c879-bc67-4ee5-98d0-0858d2a0f34f','30314323-97a3-4d2a-82af-5bcadee11142','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-04 11:48:00','2026-05-04 11:48:00',2,2.9167),
('d6b8184f-0005-4c01-9314-0aeb6f76adf3','0f0fe8d2-0133-4e84-b3db-5cfe4f012d1b','cbf3e25f-5586-4e5c-b0d8-7463a83da274','REPORT_TOTAL',NULL,1,'2026-05-13 16:13:00','2026-05-13 16:13:00',1,0.0000),
('fd05b0da-84ff-427e-a87e-0b453eccce7a','e1397508-4d0e-4ee8-b2f3-93e8d01901df','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,0.5833),
('82c19516-68c0-4f40-becb-0c69567ef51c','e481ebc0-43f7-4a49-87be-4cdb42fa7aa4','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,0.0000),
('2be500c0-55c0-4b16-974b-0f067698d6fe','c3d5e2b7-e750-4d3a-ac7b-6bc97ec65dd5','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',1,0.0000),
('5d5788c4-d6c2-4f15-811a-1100b5d218e2','f0e82eb1-3e5c-4691-91ac-899217446ed4','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',1,1034.6000),
('7745d092-ab2a-4690-9265-11094a04b17d','d75daedc-ad97-47ac-a470-39e68b996e44','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-11 11:42:00','2026-05-11 11:29:00',3,1.5000),
('6ac10e75-24c9-4642-bdcb-113b9f7c74ae','eea86d8c-5789-4a66-8b6c-09699a998e14','cbf3e25f-5586-4e5c-b0d8-7463a83da274','REPORT_TOTAL',NULL,1,'2026-04-30 19:58:00','2026-04-30 19:17:00',1,3.9678),
('85f07b3c-6151-44f1-8df5-118b0adcdaa8','73bd3055-b286-4e9e-a56b-a93ac941a626','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,121.2906),
('0fc440ff-8e22-48fd-85f5-12767a298172','31b395ab-9eb1-4c64-96ec-a5625d620386','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',1,133.9000),
('4c4053b7-5815-485c-98f5-13731a56aaeb','f0e82eb1-3e5c-4691-91ac-899217446ed4','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',2,1034.6000),
('ae87d602-e100-450a-9e56-13c9b1d53cce','909d2b9f-a18c-443f-976f-6920a4585832','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',2,21.3371),
('5254e876-07d3-49e8-bff2-143cd1f99e16','8fb8c9f3-8d3a-4e7f-bf45-f087891324df','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',2,1034.6000),
('ba9f32e0-8480-4646-a5bf-14e727417299','be254c82-fc7c-4c64-bc4b-e698ffbc509b','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,4.6667),
('e9dc55d1-0f46-4a4b-9945-150a82d22c2c','d75daedc-ad97-47ac-a470-39e68b996e44','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',1,21.3371),
('1d78ba51-ade0-4cef-85b0-16c26c61ce37','748c9945-eae9-43e4-9b5c-2ae6201f63e6','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',2,0.0000),
('bc8ab2ac-27ec-4df1-9dd7-1a8ed2168850','40e92691-8d26-41a5-b9f7-bfbab9e2a786','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,271.9000),
('984f8376-b878-4445-a98e-1abb56eecff6','d69d75f4-6afd-41bc-897a-086d6e22b3aa','cbf3e25f-5586-4e5c-b0d8-7463a83da274','REPORT_TOTAL',NULL,1,'2026-05-04 11:39:00','2026-05-04 11:39:00',1,0.0000),
('b28cd0ee-2993-4521-a821-1b484a711fc7','8b0da262-25f2-4d12-a7cb-d472b01a49fc','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-04 11:50:00','2026-05-04 11:39:00',2,77.2500),
('47bd87fb-632f-4fc4-a49e-1b7b254f54e1','be254c82-fc7c-4c64-bc4b-e698ffbc509b','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,133.9000),
('77860f58-1992-4f29-9915-1bb3daf58fc0','d75daedc-ad97-47ac-a470-39e68b996e44','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',1,1280.1000),
('e3429d16-b261-446a-82b8-1bcf5506ea80','40e92691-8d26-41a5-b9f7-bfbab9e2a786','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-23 12:45:00','2026-05-23 12:45:00',3,9.3333),
('1660a8ae-2dee-4fa1-9d09-1c7c80f1ed99','30314323-97a3-4d2a-82af-5bcadee11142','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-04 11:48:00','2026-05-04 11:48:00',2,7.0025),
('5759e555-4180-42e6-9d7c-1d6f3be9924e','8fa56501-8609-4da1-b859-ebe91e809536','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,242.4892),
('a9bc4184-bb4c-43d5-860c-1f918c223f3e','79cc334b-bdba-41f5-8a4f-80c13de7904c','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-04 11:50:00','2026-05-04 11:39:00',1,677.5000),
('1e4361d5-7a13-4f02-8bcc-207f1c0b309a','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-14 09:37:00','2026-04-30 19:55:00',3,315.7082),
('fdbfef65-c6f1-4cea-a2aa-209930a34b0c','6f21d693-2c9c-48a1-b555-c17584bcaabf','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-04 11:50:00','2026-05-04 11:39:00',1,677.5000),
('0931e553-3b80-47f1-9c76-20c7eafc6b39','5f49422e-587f-4cca-b75d-8ad9feb602d7','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-23 12:45:00','2026-05-23 12:45:00',3,9.3333),
('6429c019-028f-4965-8398-2191f7338978','0f0fe8d2-0133-4e84-b3db-5cfe4f012d1b','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',2,621.9000),
('0af32897-c483-4cfc-bf2e-22f46ca30bc4','2cb4a34f-b838-4f63-80e8-5900b1162a7d','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-04 11:48:00','2026-05-04 11:39:00',1,484.9727),
('ef13a32f-b99c-457f-9b5d-231407361de7','6f21d693-2c9c-48a1-b555-c17584bcaabf','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-05-04 11:39:00','2026-05-04 11:39:00',1,0.0000),
('d37fb3e6-7cfc-47f9-82d0-236392e8e3ec','c75fa5a8-6483-413f-809f-85de7c9cf19b','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',2,176.5010),
('25dfcbd9-2e29-4746-8bc5-240fd7a2881d','bdc41de9-7bd3-4c48-8e66-33ee9b01984a','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,12.2499),
('9b3e31cc-837e-4a51-9fb7-24311a86fa25','2431617d-a10f-4d4f-8b7c-b63e82af19ca','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,11.2084),
('d05f5d5a-2d59-4756-859d-24575c89e32d','c8882798-8def-4b39-a0be-66c05c6b9243','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',2,1034.6000),
('b1272f1d-b455-48f7-99e7-257c34f20342','b1fbaea9-633c-46c7-b5c0-b0ab8e251a76','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-04 11:39:00','2026-05-04 11:39:00',2,0.0000),
('e5dbce1d-ef67-4611-831a-25d2f2dfbd87','678a0deb-3a97-4652-aebc-5f2a8acd9b11','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',2,621.9000),
('42e3c0ca-e97d-497c-97f0-2695b1e1b76c','40e92691-8d26-41a5-b9f7-bfbab9e2a786','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-05-23 12:45:00','2026-05-23 12:45:00',3,1.0833),
('03610a4a-1730-4bf4-b010-26eaf48b8713','2431617d-a10f-4d4f-8b7c-b63e82af19ca','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',1,15.8751),
('048b182a-fc7e-423d-be36-272261f14df2','c0c13590-c38f-48c3-8715-39cd09b92275','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,271.9000),
('800ab2e5-6198-4359-9cf7-2754b5cbfbe9','31b395ab-9eb1-4c64-96ec-a5625d620386','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,133.9000),
('8a599086-3b81-4106-b10a-27ebbfdb3d81','a00c698d-2c77-4a00-ab9d-8427b7c10ce7','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-05 14:04:00','2026-05-05 14:04:00',1,677.5000),
('88a024ba-0174-4dce-95e0-295623d88b27','1690ece6-d060-4266-9d22-ac12b08a9373','cbf3e25f-5586-4e5c-b0d8-7463a83da274','REPORT_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',1,0.0000),
('fd279eb6-3429-457f-b71f-297bbc36300f','69a482d3-e386-401c-a884-b6253aa9fb90','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-05-02 14:00:00','2026-05-02 14:00:00',1,0.0000),
('b9c5c1ce-080b-4e66-8684-2c436711cfbf','5f49422e-587f-4cca-b75d-8ad9feb602d7','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-05-23 12:45:00','2026-05-23 12:45:00',3,1.0833),
('5c79ea0c-4993-4ced-bb57-2e112f54dea8','17eb4311-c9f2-4fad-99da-401f0894d529','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-13 18:34:00','2026-05-13 18:34:00',2,8.9000),
('5523f155-fb7e-418c-a2ba-2f2a61edbe86','4a738385-01ea-4574-9af3-a7f48020a4c8','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,25.0092),
('31879223-3535-4f84-ae02-2f301187f494','9ebe5574-80dd-4a2b-a102-81cd8db9a82a','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-05-14 10:17:00','2026-05-14 10:17:00',3,2.5000),
('0b02bd3d-1a01-452d-95c0-30f4b7b9ab59','9ebe5574-80dd-4a2b-a102-81cd8db9a82a','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',2,80.6401),
('ff74eabd-77b0-41ac-b0ba-341a0b11f478','ddc6a09e-83f0-4a96-8bc9-83fcb16ef3ae','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',1,1280.1000),
('eab19067-d4af-44f1-a7c2-3588b99b9905','2cb4a34f-b838-4f63-80e8-5900b1162a7d','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-04 11:39:00','2026-05-04 11:39:00',2,0.0000),
('e0495987-b64c-4fd5-b27c-35f72a7e10be','c4b7d120-0f9c-4e89-b577-9d4d61647a18','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-04 11:50:00','2026-05-04 11:39:00',1,677.5000),
('7ca84b50-0bd0-42a8-89ff-3750f494e56f','6f21d693-2c9c-48a1-b555-c17584bcaabf','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-04 11:39:00','2026-05-04 11:39:00',2,0.0000),
('11728855-d2cc-4200-8858-3814dbdefc76','e42f84a5-03bf-4cf3-a0a3-ed516e544b2c','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',1,1212.3682),
('9b7a6ea5-176a-4fb3-be45-38d4a619dc30','2f2ebe8c-2a3f-42f8-9b5c-b5c5cdcda5a3','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,271.9000),
('8aa091f1-988f-4947-b289-38f2b176b3d9','2cb4a34f-b838-4f63-80e8-5900b1162a7d','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-04 11:39:00','2026-05-04 11:39:00',3,0.0000),
('12b700f0-19fb-4742-9f0f-395cc50bd6d7','ddc6a09e-83f0-4a96-8bc9-83fcb16ef3ae','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',1,18.9205),
('738cf6e0-1c0a-4a3a-9566-3bcba9031ec6','2431617d-a10f-4d4f-8b7c-b63e82af19ca','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-08 08:23:00','2026-05-08 08:23:00',3,4.6667),
('7aba61a9-f888-48f5-899f-3c6d4eab2dca','8b47f554-8531-40d6-b980-4a2a53f2ad65','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-05-14 09:48:00','2026-05-14 09:48:00',1,7.9802),
('acd7be01-c573-4d95-a699-3da5905e72c4','bf41dd94-428f-4812-9608-652b740d6b2d','cbf3e25f-5586-4e5c-b0d8-7463a83da274','REPORT_TOTAL',NULL,1,'2026-05-14 09:48:00','2026-05-14 09:37:00',1,0.5833),
('89e7db41-0015-4f0d-ba0d-3dc6f95f1d95','7ca1a98c-39a7-4351-b367-8565e42116b9','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,133.9000),
('8158e87b-3be9-4638-ac01-3ddd05c81e82','e9183ab9-daf3-47dd-88d8-d3bde476eb04','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',1,0.0000),
('65758dcb-f15b-4f6f-a57e-3f1b430291e3','b79f2a28-c46c-426c-a26f-c8fc4c7ed626','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-30 19:17:00','2026-04-30 19:17:00',3,0.0000),
('87888735-b6eb-4477-a573-40d08193714e','c0c13590-c38f-48c3-8715-39cd09b92275','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',1,271.9000),
('26056826-c552-405c-b892-43a0876a3f09','8b0da262-25f2-4d12-a7cb-d472b01a49fc','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-04 11:50:00','2026-05-04 11:39:00',2,185.5249),
('e31bc17a-573d-4258-a385-443ed2b15d9f','c3d5e2b7-e750-4d3a-ac7b-6bc97ec65dd5','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,0.0000),
('e9a31e43-99d9-46bc-83e9-4479bf7f324b','b79f2a28-c46c-426c-a26f-c8fc4c7ed626','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',2,0.0000),
('18f2ee9c-1023-45e1-b9ee-44d160318e21','4a738385-01ea-4574-9af3-a7f48020a4c8','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-23 12:45:00','2026-05-23 12:45:00',3,9.3333),
('7bc9a703-43a2-4652-98a1-4549f25b283c','40e92691-8d26-41a5-b9f7-bfbab9e2a786','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',1,12.2499),
('5fdf6405-f748-45b8-b1ce-456acdbbe90a','33a80d52-b533-424e-aca9-358df01f6236','cbf3e25f-5586-4e5c-b0d8-7463a83da274','REPORT_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:42:00',1,1.9842),
('6a43e06a-e953-4746-817d-464be29d1ba0','f8a581e8-065e-429d-bd11-b77215eaf842','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-04-30 19:58:00','2026-04-30 19:17:00',3,46.6364),
('1c287d05-51ba-44ef-b65c-482036764c34','0e26c125-af3d-42ab-89c6-a9d4375be675','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',1,1280.1000),
('c12e6993-7831-4b1c-b93c-48af320cde53','2431617d-a10f-4d4f-8b7c-b63e82af19ca','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,4.6667),
('1b5f1c7b-d94d-45a1-bf0a-492cec70dd15','3086c2f7-eade-4d0d-af57-1f01183d7fe3','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-11 11:29:00','2026-05-11 11:29:00',2,1.8333),
('5037150b-837a-4d6c-b873-49511bc3d782','c75fa5a8-6483-413f-809f-85de7c9cf19b','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',2,78.6818),
('9ccc0665-2ba4-4f2e-a270-4caf29075f31','eea86d8c-5789-4a66-8b6c-09699a998e14','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-30 19:58:00','2026-04-30 19:17:00',2,2.8012),
('d4e4dfcb-d350-4d3d-a373-4d331498cc4f','be10de1d-f66c-46a0-83da-15a9933e2dfc','cbf3e25f-5586-4e5c-b0d8-7463a83da274','REPORT_TOTAL',NULL,1,'2026-05-02 14:00:00','2026-05-02 14:00:00',1,0.0000),
('2c049a3f-794d-4bb3-8fd4-4dd81e7fcedc','12bf23a4-a296-4f1e-baea-27f9d8732466','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-02 14:00:00','2026-05-02 14:00:00',2,29.1000),
('f4240cf2-cb5b-4f3d-b8a9-4ec31941cf98','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-14 10:17:00','2026-04-30 19:17:00',2,1389.6186),
('0df7856f-53a2-457e-b05e-4f5aaa791c17','8b0da262-25f2-4d12-a7cb-d472b01a49fc','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-05-04 11:50:00','2026-05-04 11:39:00',1,262.7749),
('2a6e0072-55f6-4bef-9b7c-517721ffa702','9e37e372-ba53-421f-b595-296a5fde4baf','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-05-11 11:42:00','2026-05-11 11:42:00',3,15.5455),
('2a0a7c1e-a4ec-4802-94a4-51963d116f0b','8fb8c9f3-8d3a-4e7f-bf45-f087891324df','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',2,78.6818),
('a316c1ab-61a4-4e68-9878-51b3ebfcc4fd','e42f84a5-03bf-4cf3-a0a3-ed516e544b2c','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-11 11:29:00','2026-05-11 11:29:00',2,0.0000),
('6f76ac40-8ecd-44c6-8d20-51d937e340e9','5f49422e-587f-4cca-b75d-8ad9feb602d7','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',1,35.4258),
('55614acf-d1f2-43b6-95e5-52008eaf5075','bdc41de9-7bd3-4c48-8e66-33ee9b01984a','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,271.9000),
('fe0e0828-1039-432b-a885-5292f1ec9fb8','c75fa5a8-6483-413f-809f-85de7c9cf19b','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-05-14 09:37:00','2026-05-14 09:37:00',3,62.1818),
('969fa4ff-fe33-4960-b4ea-53d0a6c5e0ca','bdc41de9-7bd3-4c48-8e66-33ee9b01984a','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',1,12.2499),
('77b793a6-cdbc-40a6-8c51-540d6a35f39e','671634cf-3a1f-4c22-8773-2a6935f51aa5','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-04 11:50:00','2026-05-04 11:39:00',2,677.5000),
('03ea5c15-8a4f-4308-84ac-57e26b58138f','c623a7f7-350a-4805-8ff4-4d8906c5a814','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-02 14:00:00','2026-05-02 14:00:00',1,0.0000),
('2df1d897-5d6e-45fa-9a41-589ebb41b202','2f2ebe8c-2a3f-42f8-9b5c-b5c5cdcda5a3','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,1.8333),
('f40da91b-8115-4d84-bfb0-58f8fd7e1830','f8a581e8-065e-429d-bd11-b77215eaf842','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-04-30 20:01:00','2026-04-30 20:01:00',3,0.6250),
('0016fff6-0cb6-47ea-87ee-5aa0c28f2e1f','4b23f12b-805a-4e32-a7a9-8dd3d62ecf9a','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,271.9000),
('fd121dad-0271-4cd5-bf77-5bdc573d2941','f0e82eb1-3e5c-4691-91ac-899217446ed4','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-14 09:37:00','2026-05-14 09:37:00',1,0.0000),
('ca3fd8f4-8c56-4cdc-995b-5c8697955997','a00c698d-2c77-4a00-ab9d-8427b7c10ce7','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-05-05 14:04:00','2026-05-05 14:04:00',1,0.0000),
('6b610bdc-de57-4be3-a213-5d2175767009','2a3fe158-4002-46db-9b43-32c4b969829f','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',1,0.0000),
('c6df7a2a-2d0b-40c7-9fb3-5dfc82ee6593','1690ece6-d060-4266-9d22-ac12b08a9373','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',2,0.0000),
('3afcf1c5-044a-41cb-ab1e-5eec559bc3fc','cdd5f199-1815-479b-a5d4-2989f8a33922','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-30 20:20:00','2026-04-30 19:17:00',2,23.1074),
('6afce12b-3a6e-4c2f-9dcd-5f43a0ab594e','a00c698d-2c77-4a00-ab9d-8427b7c10ce7','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-05 14:04:00','2026-05-05 14:04:00',2,677.5000),
('5e31faa1-dffe-4d72-bdf3-5f6f4cf60cdb','d75daedc-ad97-47ac-a470-39e68b996e44','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-05-11 11:42:00','2026-05-11 11:29:00',3,1.8750),
('700cc351-f471-4b1c-a587-6025e58eb40f','c8882798-8def-4b39-a0be-66c05c6b9243','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',2,80.6401),
('7292f3a3-7aa5-452d-9a0e-60885330f087','79cc334b-bdba-41f5-8a4f-80c13de7904c','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-04 11:39:00','2026-05-04 11:39:00',1,0.0000),
('7c4b8e89-f04e-41bb-aa3c-61d429c424d7','c623a7f7-350a-4805-8ff4-4d8906c5a814','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-02 14:00:00','2026-05-02 14:00:00',2,0.0000),
('fddfa92d-c083-41d6-9d62-6304d5eb76c2','e42f84a5-03bf-4cf3-a0a3-ed516e544b2c','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-11 11:29:00','2026-05-11 11:29:00',3,0.0000),
('54880800-4532-4bb4-b875-651b2d59a060','b1fbaea9-633c-46c7-b5c0-b0ab8e251a76','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-04 11:39:00','2026-05-04 11:39:00',3,0.0000),
('160acd14-b793-40f5-a155-6706fbd529ee','2b9c60dd-5782-4e7d-9b66-a52401146483','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',1,6.2349),
('7eb72ff3-9684-48af-a0ed-6744eb66b274','8fa56501-8609-4da1-b859-ebe91e809536','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-23 12:45:00','2026-05-23 12:45:00',3,0.0000),
('de69b6c5-6cea-45eb-98d4-688a57da6308','909d2b9f-a18c-443f-976f-6920a4585832','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',2,1280.1000),
('e0872628-22c8-4311-a62e-6a2ff5d075e0','678a0deb-3a97-4652-aebc-5f2a8acd9b11','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',1,3.6667),
('c4a22986-bf7b-4605-ae74-6a46975fd5ba','33a80d52-b533-424e-aca9-358df01f6236','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:42:00',2,0.5833),
('28092257-09dc-4f17-801a-6c83d433b808','73bd3055-b286-4e9e-a56b-a93ac941a626','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',1,121.2906),
('e303746d-7d0d-4cf9-b803-70b2c74c3d58','e42f84a5-03bf-4cf3-a0a3-ed516e544b2c','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',2,1212.3682),
('0fa5640d-53cb-43f5-9dd8-72201bfe2aff','be254c82-fc7c-4c64-bc4b-e698ffbc509b','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',1,4.6667),
('e02db8bc-9421-4ebe-93e8-72c47ef4c008','0e26c125-af3d-42ab-89c6-a9d4375be675','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-11 11:29:00','2026-05-11 11:29:00',2,0.0000),
('5c9c49c7-3111-4e8c-be4b-73bf06fba721','4b23f12b-805a-4e32-a7a9-8dd3d62ecf9a','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',1,271.9000),
('ac30bbe7-bea7-4dde-96be-73dd81317161','3086c2f7-eade-4d0d-af57-1f01183d7fe3','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-05-11 11:29:00','2026-05-11 11:29:00',1,1.8333),
('640fa6aa-4fdf-4906-851d-749b0396e550','d69d75f4-6afd-41bc-897a-086d6e22b3aa','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-04 11:50:00','2026-05-04 11:39:00',2,677.5000),
('04f61c85-816e-4dc9-bdec-754a1d6527a0','2b89861b-cc88-4e30-9ed2-dfabedebcc51','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,271.9000),
('5c75684c-d167-47c0-98f5-7559bd7ee21d','bf41dd94-428f-4812-9608-652b740d6b2d','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',2,1034.6000),
('0b85ab37-6965-446c-979d-75ec1c1d83d0','76caf719-2491-4d6b-a18d-cc86a8e5726a','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-04 12:14:00','2026-05-04 12:14:00',1,398.7000),
('7b90b0c0-1c55-4c51-8bcb-7632ae7f2438','4e75cf65-a653-4b96-ab03-b8a8f5e7d85a','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-05-13 16:28:00','2026-05-13 16:13:00',3,108.8182),
('c5fed712-77ac-4939-9c2a-770d7f99d658','8fa56501-8609-4da1-b859-ebe91e809536','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',1,242.4892),
('c31e4a9e-68fe-4df7-b7ae-7711c841165b','24628506-791b-49d4-bdb9-7f1814631705','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-13 16:13:00','2026-05-13 16:13:00',2,0.0000),
('8dc4199a-e4b6-477e-978f-78820510710c','01aa518a-745a-42bd-ade1-b22b120bba97','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',2,621.9000),
('ddc2bd77-8d1b-4fe6-ad93-795fb798988e','bcda320a-cb56-4f64-a40e-bcc6fde1fe63','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',2,1280.1000),
('c682055f-3970-42be-b26f-79ac47a96b89','e9183ab9-daf3-47dd-88d8-d3bde476eb04','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,133.9000),
('ce49e59f-b198-4d4f-8bf1-7be8ab426bad','678a0deb-3a97-4652-aebc-5f2a8acd9b11','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',2,3.6667),
('45b17976-16b4-4f50-99db-7d141ed79b16','5985c493-cd51-4b9e-8020-c18d0f05e870','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',2,0.0000),
('749015c8-fc06-481b-b7e1-7daa36dc0049','40e92691-8d26-41a5-b9f7-bfbab9e2a786','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,12.2499),
('81b09f6b-8dba-4477-96e1-80a846d44f3b','f8a581e8-065e-429d-bd11-b77215eaf842','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 20:24:00','2026-04-30 19:17:00',2,137.5947),
('d4222639-0edd-42bf-a528-815813936af2','9e37e372-ba53-421f-b595-296a5fde4baf','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-11 11:42:00','2026-05-11 11:29:00',3,1.5000),
('d1042acd-baa7-4acf-8336-81e9d37d5e8f','6ce08931-0d16-468c-91ec-94b30936baa8','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',2,0.0000),
('0d4e90f1-0e29-40f4-a665-82983916a275','31b395ab-9eb1-4c64-96ec-a5625d620386','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,0.5833),
('c0733515-36c5-4e68-8bb2-82dc1f0477ea','bcda320a-cb56-4f64-a40e-bcc6fde1fe63','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',1,1280.1000),
('c706978f-46ec-425f-a749-834f0207fbb6','b1fbaea9-633c-46c7-b5c0-b0ab8e251a76','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-05-04 11:39:00',1,2667.3231),
('a3ff4267-7fb2-4ac7-83e7-835a161a5d1e','9ebe5574-80dd-4a2b-a102-81cd8db9a82a','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-14 09:37:00','2026-05-14 09:37:00',3,14.0000),
('394ccd16-a3c1-45c0-9bb3-84c3c4aa339a','c0c13590-c38f-48c3-8715-39cd09b92275','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',1,0.0000),
('df64e188-c248-4aee-98b8-86250234a05e','e9dd12bd-ceae-412f-bab0-514abd2c95f2','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-02 14:00:00','2026-05-02 14:00:00',2,0.0000),
('732fd218-2f94-40f6-b716-87233ce6c1f1','c75fa5a8-6483-413f-809f-85de7c9cf19b','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-05-14 10:17:00','2026-05-14 10:17:00',3,2.5000),
('af3b4b9e-2e81-44fc-b691-886035e173d6','43add937-b1d5-47f7-97b3-17bb6d590727','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-14 09:48:00','2026-05-14 09:37:00',2,1.3750),
('52c19ce7-9297-43e9-92ea-892bc1b54a4c','01aa518a-745a-42bd-ade1-b22b120bba97','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',1,621.9000),
('33525fc3-cb5d-4a0d-a11e-89321f62716c','43add937-b1d5-47f7-97b3-17bb6d590727','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-05-14 09:48:00','2026-05-14 09:37:00',1,1.3750),
('4ad75167-bcf4-41cf-b5a3-8acfbf325ec8','73bd3055-b286-4e9e-a56b-a93ac941a626','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-08 08:23:00','2026-05-08 08:23:00',3,0.0000),
('7560d4e7-5bb5-4d26-bf61-8b09701ab00f','b79f2a28-c46c-426c-a26f-c8fc4c7ed626','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-30 20:20:00','2026-04-30 19:17:00',1,1253.5342),
('452bc35b-92b0-40b7-bbb0-8b3344e13545','8b47f554-8531-40d6-b980-4a2a53f2ad65','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-14 09:48:00','2026-05-14 09:48:00',2,6.6052),
('39a8a302-1031-42bc-a048-8b3dd5277799','6ce08931-0d16-468c-91ec-94b30936baa8','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-04-30 20:20:00','2026-04-30 19:17:00',1,1253.5342),
('95f78392-ad5a-446b-852b-8d4a238456cb','12bf23a4-a296-4f1e-baea-27f9d8732466','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-02 14:00:00','2026-05-02 14:00:00',3,9.8333),
('a11116a0-9922-4894-b6a0-8d4cba2851e5','6d7bcadd-a8c4-4383-b919-e9ae550e1a53','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',2,621.9000),
('56ffeee5-ca3b-4863-a49d-8fe26790f616','8515ed44-8d2a-458e-a4c9-7eee930b4cad','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',1,621.9000),
('016a4de2-b020-4cef-96a0-909956e5d867','671634cf-3a1f-4c22-8773-2a6935f51aa5','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-04 11:39:00','2026-05-04 11:39:00',2,0.0000),
('47c13eff-392a-497a-b691-91b40577b63a','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-04-30 19:17:00',2,556.1401),
('9d9fae00-52b4-43cb-9875-95242869e354','bdc41de9-7bd3-4c48-8e66-33ee9b01984a','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',1,271.9000),
('b7ba8d15-50fb-42b0-b89d-95a3947c3208','9ebe5574-80dd-4a2b-a102-81cd8db9a82a','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-05-14 09:37:00','2026-05-14 09:37:00',3,62.1818),
('158cc3f3-4d66-419d-bb46-9687bd68137a','eea86d8c-5789-4a66-8b6c-09699a998e14','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 19:58:00','2026-04-30 19:17:00',2,1.1666),
('0835f3e8-7081-411c-bd22-999a105581b0','be10de1d-f66c-46a0-83da-15a9933e2dfc','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-02 14:00:00','2026-05-02 14:00:00',2,0.0000),
('86e65aa8-5b4f-43db-bfc8-9a605c55714c','2b89861b-cc88-4e30-9ed2-dfabedebcc51','cbf3e25f-5586-4e5c-b0d8-7463a83da274','REPORT_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',1,0.0000),
('7bf8c55e-0c26-4fbc-b156-9b0c9b3eea9e','24628506-791b-49d4-bdb9-7f1814631705','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',2,621.9000),
('8733d51e-f3c9-4bb8-b4bf-9b286862d751','2b89861b-cc88-4e30-9ed2-dfabedebcc51','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,0.0000),
('498aa553-c8d2-42de-badf-9bd4c41d9d98','c3d5e2b7-e750-4d3a-ac7b-6bc97ec65dd5','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,133.9000),
('48411c08-2ba9-450e-981e-9c26a05d94a8','8fb8c9f3-8d3a-4e7f-bf45-f087891324df','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',1,1034.6000),
('3a861431-dca1-4942-a10b-9dcefd1c8317','9ebe5574-80dd-4a2b-a102-81cd8db9a82a','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',1,80.6401),
('9bee564c-832e-4a97-aa39-9ddbecbe6c67','be254c82-fc7c-4c64-bc4b-e698ffbc509b','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',1,133.9000),
('04b114e6-f632-4ca2-a346-9e36393a1708','6d7bcadd-a8c4-4383-b919-e9ae550e1a53','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-05-13 16:28:00','2026-05-13 16:13:00',1,226.9431),
('c161de45-bd3d-47ed-a774-a0377f1b04bb','8b47f554-8531-40d6-b980-4a2a53f2ad65','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-14 09:48:00','2026-05-14 09:48:00',2,1.3750),
('1a0d66a4-0115-4cc1-9e0f-a288107d0327','4e75cf65-a653-4b96-ab03-b8a8f5e7d85a','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-13 16:28:00','2026-05-13 16:13:00',2,226.9431),
('70880706-c04a-4c77-b658-a33b7a886536','bf41dd94-428f-4812-9608-652b740d6b2d','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-14 09:48:00','2026-05-14 09:37:00',2,0.5833),
('cd345ecb-79b2-4a75-8ce4-a3625902b8b3','17eb4311-c9f2-4fad-99da-401f0894d529','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-13 18:34:00','2026-05-13 18:34:00',2,3.6667),
('68c6be18-a16b-41b7-b4b8-a39980c51d2a','4a738385-01ea-4574-9af3-a7f48020a4c8','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',1,35.4258),
('0a20e771-100a-44e6-b2aa-a6a35c8df42b','8515ed44-8d2a-458e-a4c9-7eee930b4cad','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',2,230.6098),
('e18c7120-2869-41ba-b229-a82b80c21153','2cb4a34f-b838-4f63-80e8-5900b1162a7d','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-04 11:48:00','2026-05-04 11:39:00',2,484.9727),
('ea598fa5-7758-4ce2-a00c-a84dbfea9205','e481ebc0-43f7-4a49-87be-4cdb42fa7aa4','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,242.4892),
('2d473261-70d5-44c7-95d1-a8f256c3a16e','24628506-791b-49d4-bdb9-7f1814631705','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',1,621.9000),
('ed784f61-40ee-41af-aafb-a912a3969e10','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-05-14 10:17:00','2026-04-30 20:01:00',3,7.2500),
('9434b648-3701-4dc0-83e2-a93cd977b4e7','40e92691-8d26-41a5-b9f7-bfbab9e2a786','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',1,271.9000),
('81407968-303c-42b0-93da-aab595b374fc','2a3fe158-4002-46db-9b43-32c4b969829f','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',2,0.0000),
('f5ce574d-47b0-4e66-933d-ac4c9959cc0d','43add937-b1d5-47f7-97b3-17bb6d590727','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',2,1034.6000),
('f5ea389b-efc6-4339-ba3e-ad1bcf8c0d6f','c75fa5a8-6483-413f-809f-85de7c9cf19b','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',1,255.1828),
('08aaf7c8-bd9a-4d3b-a8f2-af7270c414d1','30ade514-a2c7-4303-81c6-b5fc34f2456f','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-14 09:48:00','2026-05-14 09:48:00',2,0.0000),
('788ce0ca-1056-428c-a9bd-afcf17b4bc04','8515ed44-8d2a-458e-a4c9-7eee930b4cad','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-13 16:28:00','2026-05-13 16:13:00',3,118.1249),
('2561f72c-31cf-405d-9a2a-b298d265c521','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-04-30 19:17:00',1,1945.7587),
('9c097460-fa78-496e-a3ca-b32eb09ba14b','c4b7d120-0f9c-4e89-b577-9d4d61647a18','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-05-04 11:39:00','2026-05-04 11:39:00',1,0.0000),
('0f5583c9-9d25-4caa-b0f4-b39ae1a5a663','18fefc02-9f9c-4668-a2c6-2ce18ee4be9d','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-05-14 09:37:00','2026-04-30 19:17:00',3,233.1819),
('53c1fa8f-579a-47af-8367-b40dc17f2b14','4b23f12b-805a-4e32-a7a9-8dd3d62ecf9a','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,10.4166),
('8bdd5e69-bbea-4f28-999e-b4d60889f18c','4a738385-01ea-4574-9af3-a7f48020a4c8','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,10.4166),
('4f02de00-7fd5-47cf-96e0-b52033011ab0','7ca1a98c-39a7-4351-b367-8565e42116b9','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',1,133.9000),
('b475fe4e-76bd-444a-983c-b54ac174a831','121b7a1e-5729-43b7-aff0-ef5248d653a0','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',1,5.2500),
('16244284-531e-4ec7-a6af-b575e9830ada','b1fbaea9-633c-46c7-b5c0-b0ab8e251a76','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-14 10:17:00','2026-05-04 11:39:00',2,2667.3231),
('6b6213e2-fd0d-4d92-8af1-b738465a0cc3','c8882798-8def-4b39-a0be-66c05c6b9243','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',1,1034.6000),
('294eb17d-352a-4ee5-9aa9-ba31bf41426b','671634cf-3a1f-4c22-8773-2a6935f51aa5','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-04 11:50:00','2026-05-04 11:39:00',1,677.5000),
('c8048de8-6020-438c-a7ff-babc70ed605a','30ade514-a2c7-4303-81c6-b5fc34f2456f','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:48:00',1,848.6916),
('5e72ff0e-8ffe-4c6a-9377-bad5a8dd4f36','cdd5f199-1815-479b-a5d4-2989f8a33922','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-04-30 20:20:00','2026-04-30 19:17:00',1,32.7325),
('dfa061c4-86bb-4f0a-a0f6-bd5e39919715','8fa56501-8609-4da1-b859-ebe91e809536','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,0.0000),
('58685e13-09aa-431c-9a7e-bd8bd2e7469b','d69d75f4-6afd-41bc-897a-086d6e22b3aa','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-04 11:39:00','2026-05-04 11:39:00',2,0.0000),
('220c2bc3-213e-4268-ad4c-beecd22f350f','121b7a1e-5729-43b7-aff0-ef5248d653a0','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,5.2500),
('0fb52f38-c18f-4280-98fd-c08021dfb765','6ce08931-0d16-468c-91ec-94b30936baa8','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-30 19:17:00','2026-04-30 19:17:00',3,0.0000),
('c946098c-9d9d-4037-8eee-c0ed6bb7e4c9','6ce08931-0d16-468c-91ec-94b30936baa8','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-30 20:20:00','2026-04-30 19:17:00',2,1253.5342),
('1e3acc56-5049-4ce3-9935-c1e9ad504dc3','01aa518a-745a-42bd-ade1-b22b120bba97','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',1,230.6098),
('c2627bc5-dc0d-495c-a08d-c2b983afa828','69a482d3-e386-401c-a884-b6253aa9fb90','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-02 14:00:00','2026-05-02 14:00:00',2,0.0000),
('91fbdbdf-2908-45c5-8d94-c3affc8d9719','cdd5f199-1815-479b-a5d4-2989f8a33922','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-04-30 20:20:00','2026-04-30 19:17:00',2,9.6251),
('da13f778-7c0d-4d3c-ac68-c4c5d6c9e3ae','121b7a1e-5729-43b7-aff0-ef5248d653a0','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',1,133.9000),
('c0a6d1c1-2df0-4979-9f3b-c4f0a329b8e7','c4b7d120-0f9c-4e89-b577-9d4d61647a18','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-04 11:39:00','2026-05-04 11:39:00',2,0.0000),
('6edc8abe-34f6-4df9-86f3-c561dc4bec15','4b23f12b-805a-4e32-a7a9-8dd3d62ecf9a','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',1,10.4166),
('eee7a975-4193-45e6-b9cb-c5dfdca58f83','bcda320a-cb56-4f64-a40e-bcc6fde1fe63','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',2,0.5833),
('88bc3e1a-1d39-445a-91b7-c626dee63c5e','9ebe5574-80dd-4a2b-a102-81cd8db9a82a','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',1,1034.6000),
('6a4baa1f-3823-4f5c-ac9a-c650b4a1abf1','f8a581e8-065e-429d-bd11-b77215eaf842','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-30 20:24:00','2026-04-30 19:17:00',1,458.7517),
('efbf98e8-ce9b-45ed-81f6-c65eed7cb68a','2b89861b-cc88-4e30-9ed2-dfabedebcc51','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',1,271.9000),
('cb8c3170-3e2d-43f0-a1ad-c6f5ce5b874b','e9dd12bd-ceae-412f-bab0-514abd2c95f2','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-05-02 14:00:00','2026-05-02 14:00:00',1,0.0000),
('f89871b0-f01e-402d-bfaf-c7cca5c14e5e','30ade514-a2c7-4303-81c6-b5fc34f2456f','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:48:00',2,848.6916),
('db7fa8ea-03b9-4e76-9682-c8900e395594','8515ed44-8d2a-458e-a4c9-7eee930b4cad','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',1,230.6098),
('a57c162a-f3a7-45f9-bf63-c8f90d0a3907','30ade514-a2c7-4303-81c6-b5fc34f2456f','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-14 09:48:00','2026-05-14 09:48:00',3,0.0000),
('8ca93f4e-210e-4d09-8036-c9b0622698ee','65903e00-ee9a-4ebe-8860-d9cafedf085f','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-14 09:48:00','2026-05-14 09:48:00',2,0.5833),
('b6a2a226-4fc2-4a9c-85e9-ca323d16f605','2b9c60dd-5782-4e7d-9b66-a52401146483','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,4.4016),
('d6b49ab4-8fde-4e73-8e70-ca545a33c0c4','c75fa5a8-6483-413f-809f-85de7c9cf19b','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-14 09:37:00','2026-05-14 09:37:00',3,14.0000),
('b65a48af-18a4-4e3b-8015-ca8b5eb5b061','7ca1a98c-39a7-4351-b367-8565e42116b9','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-08 08:23:00','2026-05-08 08:23:00',3,4.6667),
('77181581-99f9-4184-8b3f-cd3511dba64f','f0e82eb1-3e5c-4691-91ac-899217446ed4','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-14 09:37:00','2026-05-14 09:37:00',2,0.0000),
('a5006f10-48fe-4565-9bac-cd5e7067c65a','678a0deb-3a97-4652-aebc-5f2a8acd9b11','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',1,621.9000),
('b1e996e0-d077-483d-9313-ce720e5d43f8','3086c2f7-eade-4d0d-af57-1f01183d7fe3','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',1,1280.1000),
('eb92dbbf-ce51-4bb0-8005-ce72b09c5633','909d2b9f-a18c-443f-976f-6920a4585832','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',1,21.3371),
('50504774-0816-4e59-84d4-cea8d1ee48af','4e75cf65-a653-4b96-ab03-b8a8f5e7d85a','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-13 16:28:00','2026-05-13 16:13:00',2,613.0000),
('4f5d1b7f-6388-430e-a8eb-d2c19470602d','a00c698d-2c77-4a00-ab9d-8427b7c10ce7','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-05 14:04:00','2026-05-05 14:04:00',2,0.0000),
('a1846f16-7162-4376-98f2-d2c3e48b6727','c4b7d120-0f9c-4e89-b577-9d4d61647a18','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-04 11:50:00','2026-05-04 11:39:00',2,677.5000),
('01b1ef6d-f6e3-4048-a611-d2d4bad43a19','79cc334b-bdba-41f5-8a4f-80c13de7904c','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-04 11:39:00','2026-05-04 11:39:00',2,0.0000),
('6d8a23ce-802c-48d0-92f4-d325711c226b','671634cf-3a1f-4c22-8773-2a6935f51aa5','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-04 11:39:00','2026-05-04 11:39:00',1,0.0000),
('d8cc3743-a15e-4200-b61d-d410e393c519','c3d5e2b7-e750-4d3a-ac7b-6bc97ec65dd5','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',1,133.9000),
('26bddf12-d50c-4316-a156-d507811f7a1d','e9183ab9-daf3-47dd-88d8-d3bde476eb04','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',1,133.9000),
('302a2f61-5530-4ba4-aca6-d65810f076a2','76caf719-2491-4d6b-a18d-cc86a8e5726a','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-04 12:14:00','2026-05-04 12:14:00',2,398.7000),
('c21cff36-e54b-4dc9-9361-d6cd4d49092a','e481ebc0-43f7-4a49-87be-4cdb42fa7aa4','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-23 12:45:00','2026-05-23 12:45:00',3,0.0000),
('e5bc7395-8bf5-4967-b5a8-d6f12f9610cb','24628506-791b-49d4-bdb9-7f1814631705','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-13 16:13:00','2026-05-13 16:13:00',1,0.0000),
('6dd9c213-fd4f-46b3-b311-d73d054ff4e2','7ca1a98c-39a7-4351-b367-8565e42116b9','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,5.2500),
('9465162c-7a0b-4558-8b85-d73f2fd8861f','6d7bcadd-a8c4-4383-b919-e9ae550e1a53','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-13 16:28:00','2026-05-13 16:13:00',2,226.9431),
('527e9645-fe8f-41fe-a43e-d7515a042483','9e37e372-ba53-421f-b595-296a5fde4baf','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',2,18.9205),
('51597dd7-9696-48b9-8920-d82fef6ae089','ddc6a09e-83f0-4a96-8bc9-83fcb16ef3ae','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',2,1280.1000),
('79df072f-b5cc-48b6-9b62-d8f522398f7d','c8882798-8def-4b39-a0be-66c05c6b9243','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',1,80.6401),
('54f89514-c411-4834-83d8-da0f85f6f016','d75daedc-ad97-47ac-a470-39e68b996e44','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',2,1280.1000),
('83448bd5-a577-441b-a58b-da5f2c606e16','12bf23a4-a296-4f1e-baea-27f9d8732466','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-05-02 14:00:00','2026-05-02 14:00:00',1,41.1833),
('85ec1d2d-c761-476f-8a40-da93e264d419','2b9c60dd-5782-4e7d-9b66-a52401146483','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,1.8333),
('74976df0-271e-46e5-aa61-daa6c7e6e2d9','17eb4311-c9f2-4fad-99da-401f0894d529','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-05-13 18:34:00','2026-05-13 18:34:00',1,12.5667),
('d7928f7f-6bb7-4522-a391-dab47f2aa2b0','0c989fca-cff3-4d22-bb8f-949fd278e3e8','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-05-11 11:29:00','2026-05-11 11:29:00',1,15.0369),
('df4f07e7-496e-4824-9644-db039c482f3d','d69d75f4-6afd-41bc-897a-086d6e22b3aa','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-04 11:50:00','2026-05-04 11:39:00',1,677.5000),
('6af98914-4ee4-492d-9c4d-db09f8b1d93b','9ebe5574-80dd-4a2b-a102-81cd8db9a82a','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',2,1034.6000),
('37429649-8f88-4c2a-aaab-db1e96dbf4f3','9e37e372-ba53-421f-b595-296a5fde4baf','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-05-11 11:42:00','2026-05-11 11:29:00',3,1.8750),
('f92f9735-113b-4a20-8446-db2ba1a28613','73bd3055-b286-4e9e-a56b-a93ac941a626','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,0.0000),
('7e8fd853-fd2f-4248-a3bd-db80ef650dec','6d7bcadd-a8c4-4383-b919-e9ae550e1a53','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',1,621.9000),
('515d897e-8b69-496f-9020-dba8fcc703bd','6f21d693-2c9c-48a1-b555-c17584bcaabf','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-04 11:50:00','2026-05-04 11:39:00',2,677.5000),
('8df0eb7a-1149-46de-a94b-dc8c7595dcb7','76caf719-2491-4d6b-a18d-cc86a8e5726a','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-04 12:14:00','2026-05-04 12:14:00',1,65.0417),
('eca6434f-4174-451d-b761-dd30407ec65b','8515ed44-8d2a-458e-a4c9-7eee930b4cad','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',2,621.9000),
('a897db86-8988-426e-9f0d-deb006c50310','9e37e372-ba53-421f-b595-296a5fde4baf','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',2,53.1273),
('c086a519-df30-41ba-af98-df2a638a1024','f8a581e8-065e-429d-bd11-b77215eaf842','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-30 20:24:00','2026-04-30 19:17:00',2,321.1570),
('aab2626a-1fd7-41ae-bff8-e0ba5b71447a','e9183ab9-daf3-47dd-88d8-d3bde476eb04','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,0.0000),
('6d66a170-37e6-42d1-b881-e0cfcfae0501','01aa518a-745a-42bd-ade1-b22b120bba97','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',2,230.6098),
('a70cf0d1-c563-4e07-8335-e17d27f7ebfa','d75daedc-ad97-47ac-a470-39e68b996e44','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-05-11 11:42:00','2026-05-11 11:42:00',3,15.5455),
('88dd0d2a-7437-4821-b0f9-e2581e79b575','4a738385-01ea-4574-9af3-a7f48020a4c8','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:automotive','automotive',1,'2026-05-23 12:45:00','2026-05-23 12:45:00',3,1.0833),
('99c84ed6-a5f1-4db6-bf0d-e268e4a07a9a','b79f2a28-c46c-426c-a26f-c8fc4c7ed626','5e72f829-e4ed-4ccd-8971-509708f42212','PAYMENT_SERVICE_FEE',NULL,1,'2026-04-30 20:20:00','2026-04-30 19:17:00',2,1253.5342),
('5f45f93f-de83-4a7c-ab6b-e2b226084572','0f0fe8d2-0133-4e84-b3db-5cfe4f012d1b','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-13 18:34:00','2026-05-13 16:13:00',1,621.9000),
('1c33d733-a4eb-4e2b-8ade-e5120c33f31e','76caf719-2491-4d6b-a18d-cc86a8e5726a','5e72f829-e4ed-4ccd-8971-509708f42212','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-04 12:14:00','2026-05-04 12:14:00',2,65.0417),
('12db2743-193d-4d26-ae0e-e5503cfd3599','f8a581e8-065e-429d-bd11-b77215eaf842','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-04-30 20:24:00','2026-04-30 19:55:00',3,90.3333),
('1102602f-fe56-46eb-864f-e56fb2a37093','7ca1a98c-39a7-4351-b367-8565e42116b9','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',1,5.2500),
('49bf8da2-fa83-4131-8046-e63c26c2a585','909d2b9f-a18c-443f-976f-6920a4585832','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',1,1280.1000),
('82c0d403-28ad-44dd-a34d-e71a5f10aee6','ddc6a09e-83f0-4a96-8bc9-83fcb16ef3ae','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',2,18.9205),
('c82c28e9-8812-482f-9c5c-e7c794cc44cd','bcda320a-cb56-4f64-a40e-bcc6fde1fe63','cbf3e25f-5586-4e5c-b0d8-7463a83da274','REPORT_TOTAL',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',1,0.5833),
('4600922c-6ed1-4e53-bbbf-e88dddbe6a77','31b395ab-9eb1-4c64-96ec-a5625d620386','cbf3e25f-5586-4e5c-b0d8-7463a83da274','REPORT_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',1,0.5833),
('798861cb-678a-46a7-ab01-e8c1949eee0d','5f49422e-587f-4cca-b75d-8ad9feb602d7','c783e9dc-07aa-4fe4-95e9-be16246156bb','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,25.0092),
('f1772083-96e7-4a7f-a490-e91d67528e03','0e26c125-af3d-42ab-89c6-a9d4375be675','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',2,1280.1000),
('80617a1d-5edc-4c7c-8261-eaa5434a6128','3086c2f7-eade-4d0d-af57-1f01183d7fe3','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:29:00',2,1280.1000),
('b653580c-1f8e-4ca3-a043-ed05be27c7aa','8fb8c9f3-8d3a-4e7f-bf45-f087891324df','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',1,78.6818),
('c9291800-8a88-4dcd-ba8e-ed1b15907a91','0e26c125-af3d-42ab-89c6-a9d4375be675','5e72f829-e4ed-4ccd-8971-509708f42212','REPORT_TOTAL',NULL,1,'2026-05-11 11:29:00','2026-05-11 11:29:00',1,0.0000),
('c669f2f1-6774-4b01-9651-ef5c25fa4797','0c989fca-cff3-4d22-bb8f-949fd278e3e8','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-11 11:29:00','2026-05-11 11:29:00',2,1.8333),
('dde66c9f-56fe-49ff-94f0-ef6024b8918f','79cc334b-bdba-41f5-8a4f-80c13de7904c','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-04 11:50:00','2026-05-04 11:39:00',2,677.5000),
('3ca4f5f7-8e64-47ac-a83a-ef6f33ec28aa','0f0fe8d2-0133-4e84-b3db-5cfe4f012d1b','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-13 16:13:00','2026-05-13 16:13:00',2,0.0000),
('41bdb212-9cdc-4502-9dcc-ef8b7847fcda','0c989fca-cff3-4d22-bb8f-949fd278e3e8','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-11 11:29:00','2026-05-11 11:29:00',2,13.2036),
('65262f67-39eb-4ede-80c4-f08584e40839','8515ed44-8d2a-458e-a4c9-7eee930b4cad','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:books_media','books_media',1,'2026-05-13 16:28:00','2026-05-13 16:13:00',3,108.8182),
('35f93c7f-2753-490c-803e-f2f0dfc0ea70','65903e00-ee9a-4ebe-8860-d9cafedf085f','cbf3e25f-5586-4e5c-b0d8-7463a83da274','REPORT_TOTAL',NULL,1,'2026-05-14 09:48:00','2026-05-14 09:48:00',1,3.3855),
('d4ea3098-23a4-4321-9878-f2ffd221eaf5','33a80d52-b533-424e-aca9-358df01f6236','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-11 11:42:00','2026-05-11 11:42:00',2,1.4009),
('2c2addd0-8b09-4731-a121-f40fc8821e7f','4e75cf65-a653-4b96-ab03-b8a8f5e7d85a','c783e9dc-07aa-4fe4-95e9-be16246156bb','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-13 16:28:00','2026-05-13 16:13:00',3,118.1249),
('acf3c8bd-a1d1-41a4-b904-f6a7747f5992','748c9945-eae9-43e4-9b5c-2ae6201f63e6','c783e9dc-07aa-4fe4-95e9-be16246156bb','REPORT_TOTAL',NULL,1,'2026-04-30 19:17:00','2026-04-30 19:17:00',1,0.0000),
('b9a42fe0-6125-430b-8c90-f77d0a60ebe8','5f49422e-587f-4cca-b75d-8ad9feb602d7','c783e9dc-07aa-4fe4-95e9-be16246156bb','PLATFORM_COMISSION_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',2,10.4166),
('252346e5-2554-4e0d-8ede-f795d95b9664','43add937-b1d5-47f7-97b3-17bb6d590727','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',1,1034.6000),
('106d136a-a186-4347-a6a1-f79cc0dc5908','e1397508-4d0e-4ee8-b2f3-93e8d01901df','cbf3e25f-5586-4e5c-b0d8-7463a83da274','REPORT_TOTAL',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',1,1.9843),
('6ecd7d6a-7e1a-4b83-808e-f7c03752e1e5','30314323-97a3-4d2a-82af-5bcadee11142','cbf3e25f-5586-4e5c-b0d8-7463a83da274','REPORT_TOTAL',NULL,1,'2026-05-04 11:48:00','2026-05-04 11:48:00',1,9.9192),
('aedf085a-b058-4211-bf8b-f852542c05f1','65903e00-ee9a-4ebe-8860-d9cafedf085f','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-14 09:48:00','2026-05-14 09:48:00',2,2.8022),
('52379cb9-3266-4826-9987-f937a8d31fec','2f2ebe8c-2a3f-42f8-9b5c-b5c5cdcda5a3','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',1,271.9000),
('e4e0e2f7-a8c9-4769-b5a3-fb9db3e86d27','e1397508-4d0e-4ee8-b2f3-93e8d01901df','cbf3e25f-5586-4e5c-b0d8-7463a83da274','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,1.4010),
('bca445b7-b5eb-40ac-bc71-fc03cbf9abba','2f2ebe8c-2a3f-42f8-9b5c-b5c5cdcda5a3','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','REPORT_TOTAL',NULL,1,'2026-05-23 12:45:00','2026-05-23 12:45:00',1,1.8333),
('d7af8855-bffe-482d-aefb-fca1aff51406','121b7a1e-5729-43b7-aff0-ef5248d653a0','PLATFORM','PAYMENT_SERVICE_FEE',NULL,1,'2026-05-08 08:23:00','2026-05-08 08:23:00',2,133.9000),
('68481278-b46d-4703-931b-fcd68b77855c','76caf719-2491-4d6b-a18d-cc86a8e5726a','5e72f829-e4ed-4ccd-8971-509708f42212','ITEM_CLASS_COMISSION:electronics','electronics',1,'2026-05-04 12:14:00','2026-05-04 12:14:00',3,62.1250),
('0cefde39-8e7d-4a5f-9558-fde00fe30e94','bf41dd94-428f-4812-9608-652b740d6b2d','PLATFORM','REPORT_TOTAL',NULL,1,'2026-05-14 10:17:00','2026-05-14 09:37:00',1,1034.6000),
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
('503c7987-91d2-4362-a168-083c35ae5891','6da87317-e59e-44a2-9e8e-5c182e2aaa75','40e92691-8d26-41a5-b9f7-bfbab9e2a786','','2026-05-23 15:45:00','COMPLETED','2026-05-23 12:45:00','2026-05-23 12:44:43','2026-05-23 15:45:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('444f98eb-b74c-4a66-bbbd-1b96f50f89da','6da87317-e59e-44a2-9e8e-5c182e2aaa75','2f2ebe8c-2a3f-42f8-9b5c-b5c5cdcda5a3','','2026-05-23 15:45:00','COMPLETED','2026-05-23 12:45:00','2026-05-23 12:44:43','2026-05-23 15:45:00','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('5c33e20c-ba1a-477f-ad03-4ddb426fd9bf','6da87317-e59e-44a2-9e8e-5c182e2aaa75','c0c13590-c38f-48c3-8715-39cd09b92275','','2026-05-23 15:45:00','COMPLETED','2026-05-23 12:45:00','2026-05-23 12:44:43','2026-05-23 15:45:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('11398aff-3100-47fb-8591-8b2ddc44049d','6da87317-e59e-44a2-9e8e-5c182e2aaa75','e481ebc0-43f7-4a49-87be-4cdb42fa7aa4','','2026-05-23 15:45:00','COMPLETED','2026-05-23 12:45:00','2026-05-23 12:44:43','2026-05-23 15:45:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('2206c70c-cd0d-4690-aedf-8d867412cfe0','6da87317-e59e-44a2-9e8e-5c182e2aaa75','bdc41de9-7bd3-4c48-8e66-33ee9b01984a','','2026-05-23 15:45:00','COMPLETED','2026-05-23 12:45:00','2026-05-23 12:44:43','2026-05-23 15:45:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('8f7b4d46-f927-44ba-9e1d-92ace112e686','6da87317-e59e-44a2-9e8e-5c182e2aaa75','4a738385-01ea-4574-9af3-a7f48020a4c8','','2026-05-23 15:45:00','COMPLETED','2026-05-23 12:45:00','2026-05-23 12:44:43','2026-05-23 15:45:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('ad3efcf6-5635-4e97-b904-9d67d60da37d','6da87317-e59e-44a2-9e8e-5c182e2aaa75','8fa56501-8609-4da1-b859-ebe91e809536','','2026-05-23 15:45:00','COMPLETED','2026-05-23 12:45:00','2026-05-23 12:44:43','2026-05-23 15:45:00','5e72f829-e4ed-4ccd-8971-509708f42212'),
('44768c34-7a06-4203-8e81-bf68b7e0f673','6da87317-e59e-44a2-9e8e-5c182e2aaa75','5f49422e-587f-4cca-b75d-8ad9feb602d7','','2026-05-23 15:45:00','COMPLETED','2026-05-23 12:45:00','2026-05-23 12:44:43','2026-05-23 15:45:00','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('49e22406-dc4c-4c8a-9c14-e18cc753e849','6da87317-e59e-44a2-9e8e-5c182e2aaa75','2b89861b-cc88-4e30-9ed2-dfabedebcc51','','2026-05-23 15:45:00','COMPLETED','2026-05-23 12:45:00','2026-05-23 12:44:43','2026-05-23 15:45:00','cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('6c633f28-5d6b-4bb0-9395-e239e0453e17','6da87317-e59e-44a2-9e8e-5c182e2aaa75','2b9c60dd-5782-4e7d-9b66-a52401146483','','2026-05-23 15:45:00','COMPLETED','2026-05-23 12:45:00','2026-05-23 12:44:43','2026-05-23 15:45:00','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('f87e7e9d-b1ee-46e9-ba7f-f5ab3f7687d9','6da87317-e59e-44a2-9e8e-5c182e2aaa75','4b23f12b-805a-4e32-a7a9-8dd3d62ecf9a','','2026-05-23 15:45:00','COMPLETED','2026-05-23 12:45:00','2026-05-23 12:44:43','2026-05-23 15:45:00','c783e9dc-07aa-4fe4-95e9-be16246156bb');
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
  `currency` varchar(255) DEFAULT NULL,
  `dateGrouping` varchar(10) NOT NULL DEFAULT 'MONTHLY',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reportType` varchar(20) NOT NULL DEFAULT 'SELLER',
  `ownerAccountId` uuid DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_be9d36c118eafaa5f85eeca315d` (`ownerAccountId`),
  CONSTRAINT `FK_be9d36c118eafaa5f85eeca315d` FOREIGN KEY (`ownerAccountId`) REFERENCES `account` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_query`
--

LOCK TABLES `report_query` WRITE;
/*!40000 ALTER TABLE `report_query` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `report_query` VALUES
('72cf238e-a96a-44a2-b7b6-1c185a1df3a7','Tetakent Platform Günlük','Tetakent Platform','TRY','DAILY','2026-04-24 17:14:12','2026-05-11 10:05:39','SELLER','5e72f829-e4ed-4ccd-8971-509708f42212'),
('00603de7-3573-4be2-b952-1d2a093e5d24','Platform Seller Report / Tetakent (H.C.G) / TRY / DAILY','Bu rapor, satıcıların platformdan elde ettiği komisyon gelirlerini ve ödeme hizmeti sağlayıcı ücretlerini günlük olarak gösterir. Her gün için ayrı bir rapor oluşturulur ve sadece ilgili satıcının verilerini içerir.','TRY','DAILY','2026-04-27 12:22:49','2026-05-11 10:05:39','PLATFORM_SELLER','5e72f829-e4ed-4ccd-8971-509708f42212'),
('123057a4-5e08-4483-9cc4-26537267918b','Seller Report / Esenler Motionstar Incorporated / TRY / DAILY','Bu rapor, satıcıların satış performansını günlük olarak gösterir. Her gün için ayrı bir rapor oluşturulur ve sadece ilgili satıcının verilerini içerir. Satıcının Platforma hakedişi için yapılacak faturalandırma için kullanılacaktır.','TRY','DAILY','2026-04-30 19:16:40','2026-05-11 10:05:46','SELLER','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('4e64b4f2-aae1-40d1-b6d4-31d1a2791780','Omodog Günlük','','TRY','DAILY','2026-03-28 10:52:22','2026-05-11 10:05:53','SELLER','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('9e72b629-d785-47b7-b945-32cdd253023c','Platform Seller Report / Omodog / TRY / DAILY','Bu rapor, satıcıların platformdan elde ettiği komisyon gelirlerini ve ödeme hizmeti sağlayıcı ücretlerini günlük olarak gösterir. Her gün için ayrı bir rapor oluşturulur ve sadece ilgili satıcının verilerini içerir.','TRY','DAILY','2026-04-27 12:22:49','2026-05-11 10:05:53','PLATFORM_SELLER','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('372ea615-3ab7-4cf1-92d9-8fd6ca018923','','',NULL,'ALL','2026-05-04 11:37:46','2026-05-04 11:37:46','SELLER',NULL),
('882e1a6e-743e-4592-9266-8ff803261e2c','Platform Seller Report / Doofenshmirtz Evil Inc / TRY / DAILY','Bu rapor, satıcıların platformdan elde ettiği komisyon gelirlerini ve ödeme hizmeti sağlayıcı ücretlerini günlük olarak gösterir. Her gün için ayrı bir rapor oluşturulur ve sadece ilgili satıcının verilerini içerir.','TRY','DAILY','2026-04-29 10:25:29','2026-05-11 10:06:42','PLATFORM_SELLER','cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('b173d78d-111d-4a15-8f62-bd29d0f75eee','Seller Report / Doofenshmirtz Evil Inc / TRY / DAILY','Bu rapor, satıcıların satış performansını günlük olarak gösterir. Her gün için ayrı bir rapor oluşturulur ve sadece ilgili satıcının verilerini içerir. Satıcının Platforma hakedişi için yapılacak faturalandırma için kullanılacaktır.','TRY','DAILY','2026-04-29 10:25:29','2026-05-11 10:06:42','SELLER','cbf3e25f-5586-4e5c-b0d8-7463a83da274'),
('b39e4fc5-1a9d-40db-bdf8-c152d3b65892','','',NULL,'ALL','2026-05-04 11:24:14','2026-05-04 11:24:14','SELLER',NULL),
('153d7879-0137-4bd3-b449-cbbf99b3e914','Platform Seller Report / Esenler Motionstar Incorporated / TRY / DAILY','Bu rapor, satıcıların platformdan elde ettiği komisyon gelirlerini ve ödeme hizmeti sağlayıcı ücretlerini günlük olarak gösterir. Her gün için ayrı bir rapor oluşturulur ve sadece ilgili satıcının verilerini içerir.','TRY','DAILY','2026-04-27 12:22:49','2026-05-11 10:06:02','PLATFORM_SELLER','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e'),
('b9243d78-24fd-4f05-964f-dcb12547ba7f','Omodog','','TRY','ALL','2026-03-28 10:50:33','2026-05-11 10:05:56','SELLER','c783e9dc-07aa-4fe4-95e9-be16246156bb'),
('c32beff3-1fcc-410a-9562-debe2d5e40bc','Tetakent','İnşallah zengin olurum amin','TRY','MONTHLY','2026-04-05 11:11:29','2026-05-11 10:05:39','SELLER','5e72f829-e4ed-4ccd-8971-509708f42212'),
('023ecb88-20b4-4dd0-bd13-e544526d27b4','Tetakent Platform','Platform','TRY','DAILY','2026-05-04 11:15:29','2026-05-11 10:05:39','PLATFORM','5e72f829-e4ed-4ccd-8971-509708f42212'),
('874d081f-dea6-46df-b834-e7be221262d1','Platform Akışı','','TRY','DAILY','2026-05-04 11:46:32','2026-05-11 10:06:07','PLATFORM_FLOW','5e72f829-e4ed-4ccd-8971-509708f42212');
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
('feb42b0f-8d84-43a4-9367-0c250a94bb5b','c0c13590-c38f-48c3-8715-39cd09b92275','%20 (Commission Tax)','20','TRY',0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1),
('5e391c20-7f20-4597-b1b4-16b78ae5534b','4b23f12b-805a-4e32-a7a9-8dd3d62ecf9a','%20 (Commission Tax)','20','TRY',10.4166,0.0000,1.7361,0.0000,1.7361,10.4166,8.6805,0.0000,0.0000,1),
('95597a22-43f6-462d-aef5-2e1d95736fa2','2f2ebe8c-2a3f-42f8-9b5c-b5c5cdcda5a3','%20 (Commission Tax)','20','TRY',1.8333,0.0000,0.3056,0.0000,0.3056,1.8333,1.5278,0.0000,0.0000,1),
('cba7d642-ee21-4982-9468-34028f35fcf8','e481ebc0-43f7-4a49-87be-4cdb42fa7aa4','Tax 20%','20','TRY',2424.0000,0.0000,404.0000,0.0000,404.0000,2424.0000,2020.0000,0.0000,0.0000,1),
('be691d31-09c5-41f8-a10a-48d13895e9ae','4a738385-01ea-4574-9af3-a7f48020a4c8','Tax 20%','20','TRY',250.0000,0.0000,41.6666,0.0000,41.6666,250.0000,208.3334,0.0000,0.0000,1),
('ed02c971-78fb-4f63-b170-67b7330fe4e1','2b89861b-cc88-4e30-9ed2-dfabedebcc51','%20 (Commission Tax)','20','TRY',0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1),
('e1f898e2-10c9-4896-b1a5-6a220c939b70','8fa56501-8609-4da1-b859-ebe91e809536','Tax 20%','20','TRY',2424.0000,0.0000,404.0000,0.0000,404.0000,2424.0000,2020.0000,0.0000,0.0000,1),
('70d55ed8-b833-4ca8-96f8-b85c29674ea6','2b9c60dd-5782-4e7d-9b66-a52401146483','Tax 20%','20','TRY',44.0000,0.0000,7.3333,0.0000,7.3333,44.0000,36.6667,0.0000,0.0000,1),
('908384d5-feb5-4701-bb5e-b95618b6ab8e','40e92691-8d26-41a5-b9f7-bfbab9e2a786','Tax 20%','20','TRY',2718.0000,0.0000,452.9999,0.0000,452.9999,2718.0000,2265.0001,0.0000,0.0000,1),
('d5fb8fb5-8cc9-494a-9bb8-dff91a344a6d','5f49422e-587f-4cca-b75d-8ad9feb602d7','Tax 20%','20','TRY',250.0000,0.0000,41.6666,0.0000,41.6666,250.0000,208.3334,0.0000,0.0000,1),
('5ab7f840-e70b-4040-b437-f77e28097326','bdc41de9-7bd3-4c48-8e66-33ee9b01984a','%20 (Commission Tax)','20','TRY',12.2499,0.0000,2.0417,0.0000,2.0417,12.2499,10.2083,0.0000,0.0000,1);
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
  `openPayment` tinyint(4) NOT NULL DEFAULT 0,
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
('b4aca860-1f78-46a9-bc36-0fb6ec028713','TRY','6da87317-e59e-44a2-9e8e-5c182e2aaa75','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-05-23 15:44:43','2026-05-23 15:44:43','2026-05-23 15:44:43','','','CREDIT_TO_SELLER',44.0000,7.3333,36.6667,0),
('338aaaff-0754-4741-8315-1bbdb9a2c388','TRY','6da87317-e59e-44a2-9e8e-5c182e2aaa75','5e72f829-e4ed-4ccd-8971-509708f42212','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-05-23 15:44:43','2026-05-23 15:44:43','2026-05-23 15:44:43','','','CREDIT_TO_SELLER',2424.0000,404.0000,2020.0000,0),
('8c7490cb-c595-47d5-9b7f-5be7e054138f','TRY','6da87317-e59e-44a2-9e8e-5c182e2aaa75','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-05-23 15:44:43','2026-05-23 15:44:43','2026-05-23 15:44:43','','','CREDIT_TO_SELLER',250.0000,41.6666,208.3334,0);
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
('ee1bd375-3726-4764-a5b3-839ae83e136f','af6985c0-0aaf-40e7-b639-1a359191b5c2','PAYMENT_COMPLETED','{\"paymentId\":\"6da87317-e59e-44a2-9e8e-5c182e2aaa75\",\"accountId\":\"c783e9dc-07aa-4fe4-95e9-be16246156bb\",\"eventType\":\"PAYMENT_COMPLETED\",\"occurredAt\":\"2026-05-23T12:44:43.694Z\"}',201,'{\"message\":\"KDialog test successful\",\"receivedBody\":{\"body\":{\"paymentId\":\"6da87317-e59e-44a2-9e8e-5c182e2aaa75\",\"accountId\":\"c783e9dc-07aa-4fe4-95e9-be16246156bb\",\"eventType\":\"PAYMENT_COMPLETED\",\"occurredAt\":\"2026-05-23T12:44:43.694Z\"}}}',0,NULL,'2026-05-23 12:44:43','2026-05-23 15:44:43');
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

-- Dump completed on 2026-05-23 13:25:53
