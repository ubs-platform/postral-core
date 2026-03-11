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
('a607c2d0-4c49-4697-afe6-4c7499aa094b','Kişisel','1111111111','INDIVIDUAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0),
('5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','1111111111','INDIVIDUAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0),
('cbf3e25f-5586-4e5c-b0d8-7463a83da274','ğeğ mağazacılık','1111111111','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0),
('913252c1-d094-40de-a13c-8dc1142b9222','English Colonial','1111111111','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0);
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
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
('21011b61-eb6e-4039-bc9a-baa274f95fc1','Akarsu yokuş sokak 3/4 😽','42',NULL,'5','3',NULL,'Akarsu yokuş sokak 3/4 😽',NULL,NULL,'BEYOĞLU','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
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
  KEY `FK_f803cfe7b8417f03ac350374af8` (`sellerPaymentOrderId`),
  CONSTRAINT `FK_03ccf846238db85401525e07cd2` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_2e8ca57c01ef57486ce9bbd3cab` FOREIGN KEY (`sellerInvoiceAddressId`) REFERENCES `invoice_address` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_49fd7d5e5ecdc03a802ffe7f66c` FOREIGN KEY (`sellerInvoiceAccountId`) REFERENCES `invoice_account` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_9c3999d01f068a9476b225bba62` FOREIGN KEY (`customerAccountId`) REFERENCES `invoice_account` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_bb1192d730c0fa301d850183419` FOREIGN KEY (`customerInvoiceAddressId`) REFERENCES `invoice_address` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_f803cfe7b8417f03ac350374af8` FOREIGN KEY (`sellerPaymentOrderId`) REFERENCES `payment_transaction` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
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
('6ba9bc79-b4b1-4fbe-b462-05eaec9299b6','Tavuk Döner','','','','PIECE','bb999e95-3de3-401a-a554-da9ae47e843c','TRY',''),
('a16429c0-3adc-46e4-a2f2-5e3ab785c91e','Kyle Broflovski Peluş oyuncak','','','','PIECE','bb999e95-3de3-401a-a554-da9ae47e843c','TRY',''),
('739263f4-a5e9-4f70-a368-8ea4891fec10','Kyle Broflovski Peluş','','','','ST','913252c1-d094-40de-a13c-8dc1142b9222','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196'),
('3954ca25-330d-4e83-aef9-96f0da591b53','Ruj','','','','ST','cbf3e25f-5586-4e5c-b0d8-7463a83da274','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196'),
('e2e402c4-ef53-40df-8591-98adfd4a1afc','Yeni ürün','','','','ST','','TRY',''),
('d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','Lotus Soru Kitabı','LOTUS','QUESTION_BOOK','c2838483-8df1-43b1-a3c0-9ab8ef1b7a11','PIECE','b6c80c5b-c6ce-42ac-bfd7-6fb7c975f7e9','TRY','');
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
('71c01ee3-d730-4f41-8db7-25147142adcd','3954ca25-330d-4e83-aef9-96f0da591b53','default','any','TRY',0,NULL,NULL,NULL,100),
('fc8fe02a-80a1-485f-9c75-2871422a8780','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','Humankite','any','TRY',0,NULL,NULL,NULL,0),
('fc8fe02a-80a1-485f-9c75-2871422a8781','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','Humankite','any','TRY',1,'2025-07-05 12:18:00','2025-07-05 16:27:00',NULL,0),
('f9628c98-20a1-4b1a-a771-36e77a827630','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','2 Years','any','TRY',0,NULL,NULL,NULL,0),
('376c042f-65e0-427f-bac3-89d456a0e1d9','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','default','any','TRY',0,NULL,NULL,NULL,0),
('176b2b7c-721d-4ca1-95eb-8df2d880dbe7','739263f4-a5e9-4f70-a368-8ea4891fec10','default','any','TRY',0,NULL,NULL,NULL,200),
('41d6cd8e-ce6a-4a2b-9093-8f256fa00b09','739263f4-a5e9-4f70-a368-8ea4891fec10','humankite','any','TRY',0,NULL,NULL,NULL,90),
('3131314b-7007-44c2-b25c-92b193b9e27a','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','default','any','TRY',3,NULL,NULL,NULL,0),
('3c31fc4b-7007-44c2-b25c-92b193b9e27a','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','default','any','TRY',0,NULL,NULL,NULL,0),
('ffcb6316-ea49-42b1-8276-c5fe0aa6c468','739263f4-a5e9-4f70-a368-8ea4891fec10','jew-elf-king','any','TRY',0,NULL,NULL,NULL,300);
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
('927c6994-7d2d-43ab-80cd-17cc74de5196','Yüzde 20');
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
('bb6aa6d4-eff6-4ed6-9e3f-29871bea0649','DEFAULT',18,NULL),
('1554ce6b-3ded-4605-a962-5b4c3021aac5','DEFAULT',20,'927c6994-7d2d-43ab-80cd-17cc74de5196'),
('fa2d423f-ec8b-41ef-8c3a-74f348418579','DEFAULT',18,NULL);
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
('fe6aeb3f-7631-4caa-82bb-0d68f293739b','PURCHASE','TRY',NULL,'',NULL,'',NULL,NULL,NULL,NULL,NULL,'2026-02-26 22:03:51','2026-02-26 22:03:51',0,0),
('d00dcadc-eeca-409f-bc42-20d2ef7d6b6e','PURCHASE','TRY',NULL,'',NULL,'',NULL,NULL,NULL,NULL,NULL,'2026-02-26 22:03:51','2026-02-26 22:03:51',0,0),
('79ed7e68-eb69-44dc-9310-28a0c4551cf2','PURCHASE','TRY',NULL,'',NULL,'',NULL,NULL,NULL,NULL,NULL,'2026-02-26 22:03:51','2026-02-26 22:03:51',0,0),
('2a55ab7c-dd02-4043-86a5-6097f9968d4e','PURCHASE','TRY',NULL,'',NULL,'',NULL,NULL,NULL,NULL,NULL,'2026-02-26 22:03:51','2026-02-26 22:03:51',0,0);
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
  `amount` float NOT NULL,
  `currency` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `paymentId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_channel_operation`
--

LOCK TABLES `payment_channel_operation` WRITE;
/*!40000 ALTER TABLE `payment_channel_operation` DISABLE KEYS */;
set autocommit=0;
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
  `quantity` float NOT NULL,
  `totalAmount` float NOT NULL,
  `originalUnitAmount` float NOT NULL,
  `unitAmount` float NOT NULL,
  `taxPercent` float NOT NULL,
  `taxAmount` float NOT NULL,
  `unTaxAmount` float NOT NULL,
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
set autocommit=0;
INSERT INTO `postral_payment_item` VALUES
('1338177f-7b50-4c5e-a10e-0ecbda26e861','LOTUS','QUESTION_BOOK','c2838483-8df1-43b1-a3c0-9ab8ef1b7a11','Lotus Soru Kitabı','fe6aeb3f-7631-4caa-82bb-0d68f293739b','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','b6c80c5b-c6ce-42ac-bfd7-6fb7c975f7e9','',0,0,0,0,0,0,0),
('0b3c5ebb-0cb4-463d-afb0-2fd1b812ef80','LOTUS','QUESTION_BOOK','c2838483-8df1-43b1-a3c0-9ab8ef1b7a11','Lotus Soru Kitabı','d00dcadc-eeca-409f-bc42-20d2ef7d6b6e','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','','',0,0,0,0,0,0,0),
('d2d38399-c8d0-4319-9171-481eda7f5048','','','','Teto Kasane Peluş oyuncak','d00dcadc-eeca-409f-bc42-20d2ef7d6b6e','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','','',0,0,0,0,0,0,0),
('d57d3b9f-c163-4d13-9ba1-6d44fed5e48d','LOTUS','QUESTION_BOOK','c2838483-8df1-43b1-a3c0-9ab8ef1b7a11','Lotus Soru Kitabı','fe6aeb3f-7631-4caa-82bb-0d68f293739b','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','b6c80c5b-c6ce-42ac-bfd7-6fb7c975f7e9','',0,0,0,0,0,0,0),
('6607fac5-58c2-4bdb-be3e-9de8038e3bdb','','','','Tavuk Döner','2a55ab7c-dd02-4043-86a5-6097f9968d4e','6ba9bc79-b4b1-4fbe-b462-05eaec9299b6','','',0,0,0,0,0,0,0),
('483f901e-8006-498d-81bb-a89b217cd5ff','LOTUS','QUESTION_BOOK','c2838483-8df1-43b1-a3c0-9ab8ef1b7a11','Lotus Soru Kitabı','2a55ab7c-dd02-4043-86a5-6097f9968d4e','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','','',0,0,0,0,0,0,0),
('6899ad53-4218-482e-b178-b8374e11ef68','','','','Kyle Broflovski Peluş oyuncak','79ed7e68-eb69-44dc-9310-28a0c4551cf2','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','bb999e95-3de3-401a-a554-da9ae47e843c','',0,0,0,0,0,0,0),
('f997d565-e389-4a3a-88a3-f008de601599','','','','Tavuk Döner','d00dcadc-eeca-409f-bc42-20d2ef7d6b6e','6ba9bc79-b4b1-4fbe-b462-05eaec9299b6','','',0,0,0,0,0,0,0);
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
('10a6e894-df2f-4523-ac29-35330f06affe','79ed7e68-eb69-44dc-9310-28a0c4551cf2',0,0,0,0),
('20c1663f-d2a0-40ca-bddd-896d4dda635e','d00dcadc-eeca-409f-bc42-20d2ef7d6b6e',0,0,0,0),
('cfd4d9a6-82b6-4ecf-9a3b-aa16b58365ae','d00dcadc-eeca-409f-bc42-20d2ef7d6b6e',0,0,0,0),
('c9657a17-e033-491e-9176-ab7b05d27c85','fe6aeb3f-7631-4caa-82bb-0d68f293739b',0,0,0,0),
('66996b44-5287-4479-a65b-b00a54336d5f','2a55ab7c-dd02-4043-86a5-6097f9968d4e',0,0,0,0);
/*!40000 ALTER TABLE `postral_payment_tax` ENABLE KEYS */;
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

-- Dump completed on 2026-02-26 22:34:51
