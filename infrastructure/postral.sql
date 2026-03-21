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
('a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Nebisoft Gıda Savunma  Sanayii A.Ş','1111111111','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'Akbank',NULL,NULL,NULL,'Bahçelievler'),
('a607c2d0-4c49-4697-afe6-4c7499aa094b','Kişisel','1111111111','INDIVIDUAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,NULL,NULL,NULL,NULL,NULL),
('5e72f829-e4ed-4ccd-8971-509708f42212','Tetakent (H.C.G)','1111111111','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'Esen Yayınları YGS Matematik soru bankası','TR31313113131','31313131',NULL,NULL),
('cbf3e25f-5586-4e5c-b0d8-7463a83da274','ğeğ mağazacılık','1111111111','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'Jerry Acelesi Yok',NULL,NULL,NULL,NULL),
('bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','11111111111','INDIVIDUAL','287c8d95-9fe2-4a22-a79b-97500dbbc8f6',0,'TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('913252c1-d094-40de-a13c-8dc1142b9222','English Colonial','1111111111','COMMERCIAL','21011b61-eb6e-4039-bc9a-baa274f95fc1',0,'TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1111111111','COMMERCIAL','91587983-a95f-4934-895f-a3f9f5fdaed1',0,'Kısmet XNXX',NULL,NULL,NULL,NULL);
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
('287c8d95-9fe2-4a22-a79b-97500dbbc8f6','EBOTT DAĞI','42',NULL,'5','3',NULL,'EBOTT DAĞI',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('91587983-a95f-4934-895f-a3f9f5fdaed1','Faraway','42',NULL,'5','3',NULL,'Deneme Sokak',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
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
-- Table structure for table `data_properties`
--

DROP TABLE IF EXISTS `data_properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_properties` (
  `id` uuid NOT NULL,
  `name` varchar(255) NOT NULL,
  `valueString` text DEFAULT NULL,
  `valueBinary` longblob DEFAULT NULL,
  `valueType` enum('string','binary') NOT NULL,
  `rawDataId` uuid NOT NULL,
  `processableDataId` uuid NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_3fdf7b221f19b8a8d2935f71377` (`rawDataId`),
  KEY `FK_48ecf9c1f40156043cda4289820` (`processableDataId`),
  CONSTRAINT `FK_3fdf7b221f19b8a8d2935f71377` FOREIGN KEY (`rawDataId`) REFERENCES `project_raw_data` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_48ecf9c1f40156043cda4289820` FOREIGN KEY (`processableDataId`) REFERENCES `project_processable_data` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_properties`
--

LOCK TABLES `data_properties` WRITE;
/*!40000 ALTER TABLE `data_properties` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `data_properties` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `data_property_value_types`
--

DROP TABLE IF EXISTS `data_property_value_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_property_value_types` (
  `id` uuid NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `valueType` enum('string','binary') NOT NULL,
  `mimeType` varchar(255) DEFAULT NULL,
  `sizeInBytes` int(11) NOT NULL DEFAULT 0,
  `stringRegexPattern` text DEFAULT NULL,
  `listInPublic` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_property_value_types`
--

LOCK TABLES `data_property_value_types` WRITE;
/*!40000 ALTER TABLE `data_property_value_types` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `data_property_value_types` ENABLE KEYS */;
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
('b1ddeb46-1dd4-4511-8997-103a84fbae41','aa291695-3f1c-4b9a-a8a4-6a385d7c6dfa','d804218d-beee-454f-ab00-10f0887c8ad9','','2026-03-12','','',1,'2026-03-12 23:51:44.109518','2026-03-12 23:54:57.000000','a2f10b22-4469-4a11-8a03-26078764959e','358f61ab-f349-49d3-b81e-0cc6258b19fa','211488ce-f972-4460-8ccc-ab7b6d29b3c4','02c2bea2-5e18-4310-8ed0-f89700bd6c1b'),
('b677cac7-9d94-445e-9869-139e09ac4844','979577e7-ddc5-440e-8005-705916b62113','8170a85a-a954-4969-8016-8923135251b0','','2026-03-12','','',1,'2026-03-12 10:30:46.800155','2026-03-12 10:32:55.000000','0ca24825-4864-471c-bb74-1b84c0d72e42','08cb5820-6fe7-4f8c-b9cb-8e404c25e71d','3065e2b2-cfa9-43d5-8802-73a0bc5eb8e1','8b3eabef-ada1-4c27-b5c2-8cd590eddbc2'),
('70eac91b-959e-41c2-aa05-1bfaeab09056','979577e7-ddc5-440e-8005-705916b62113','5ad5b124-82e8-45e1-940e-cc565831b44f','','2026-03-12','','',1,'2026-03-12 10:33:05.024905','2026-03-12 10:33:14.000000','7c368604-8956-4eb5-bcfb-7465327963a1','39b8ef37-e25c-4dc1-9c0f-30a426040d7b','30f320ef-bdbc-438b-b08e-559e44e4d597','c374c52b-76fa-48a5-9ec9-22f87dc00131'),
('6049b6f3-0655-40ac-af5b-2a4e7c3cc404','dfac1870-cbb6-4c04-bd19-44631d6bb48a','e6aa199a-6f1e-409c-92ce-2ad7ec5d639c','','2026-03-13','','',1,'2026-03-13 00:39:32.009725','2026-03-13 09:14:19.000000','59b69fbe-e4a0-4bd7-bef8-3209124553ac','50d816cc-002c-40ed-b65c-c151e3034a82','3967e951-6b95-432a-af18-70370019417b','9391b4c7-1089-48a6-b61c-45b686732f88'),
('03e31d3d-06c7-490a-80c2-50adb686bf1c','87e1bd15-5905-4270-9200-fc83d4aa4c6f','acd7584c-5c5c-4d10-9032-bc4ab9ab8971','','2026-03-12','','',0,'2026-03-12 10:54:16.552629','2026-03-12 10:54:16.552629','d2d98c6a-5dfc-4b5c-a188-21a944880fff','3060086a-19e4-4bdf-9ded-9f1abe44987f','bfeb817f-2f43-4b63-b0f1-a5a00470015c','9ba9042e-f1fe-4b28-8504-6309c71f8c80'),
('eee29887-8e40-484f-9ddc-53a672b08f89','cc04a96b-6165-4fc1-b0bc-fcb4b24775ba','7005a4e2-4966-4246-bda8-3d64aca6a0b7','','2026-03-15','','',1,'2026-03-15 14:35:56.507316','2026-03-15 14:36:37.000000','ab11fc19-ecb9-450e-990e-dc6191ccff2b','c878d18a-01ae-4af9-b729-2f07d047db10','b3c61e6a-ff32-4733-8237-665d1caff768','8810ebc4-a6b2-437b-96c9-b22b47be1dc3'),
('00b02ed8-5dcd-4eec-8a82-91e06fb75d26','ef0500e5-c029-48bf-8f15-7e41ed441c59','d5855cf5-9a76-4097-af02-c9bef777a4ee','','2026-03-12','','',1,'2026-03-12 15:57:09.222798','2026-03-12 15:57:19.000000','a102050b-7473-4b5d-8b9f-54b234141ad6','342646bf-d745-4043-8bbd-d6c63d173020','5755837e-7bf4-416d-82d3-68fd05f4f67f','ca290b27-02ea-48bc-90e3-b3f4f5d8d1cd'),
('039f22a7-cd12-4402-ba16-92866eb7b834','d92c1a91-529e-4534-bae1-30c8796f9e48','da831d08-1875-40c8-8f47-0f0bf83c3af9','','2026-03-12','','',1,'2026-03-12 22:44:55.962083','2026-03-12 22:45:04.000000','b5baf2fe-46b1-4d39-b31d-6ff6c52fe729','d657c498-9cb3-4f3e-8592-d6185c6fffa0','fdb4e2d4-7e0d-491a-902f-44ccb4b3f38e','cfa3f290-b004-405e-982b-37baeed1927b'),
('ea6a3032-8e8e-406e-bd11-c3e8768f96f2','b8ca6234-a8c6-4555-b05f-5486816b77d3','9f0c2e85-99b9-453c-8ce9-0f19bfc257be','','2026-03-12','','',1,'2026-03-12 11:00:13.077740','2026-03-12 11:00:22.000000','e85ceebc-2e15-4368-bf72-b45362255764','5cf3c240-700f-42b4-9089-2fbb0f786715','a07ec4fb-5b7a-4fcc-8e5e-f8577324db16','738c4fe9-6a44-4fc8-b624-00915adfb196');
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
('358f61ab-f349-49d3-b81e-0cc6258b19fa','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','11111111111','INDIVIDUAL','TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('c878d18a-01ae-4af9-b729-2f07d047db10','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','11111111111','INDIVIDUAL','TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('5cf3c240-700f-42b4-9089-2fbb0f786715','bb251590-67d6-4165-8321-7a04fa357242','New Account','11111111111','INDIVIDUAL','TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('39b8ef37-e25c-4dc1-9c0f-30a426040d7b','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kişisel','1111111111','INDIVIDUAL',NULL,NULL,NULL,NULL,NULL),
('0c040982-87ac-4ccd-9c6c-38a40da3b9bd','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','11111111111','INDIVIDUAL','TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('fdb4e2d4-7e0d-491a-902f-44ccb4b3f38e','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1111111111','COMMERCIAL','Kısmet XNXX',NULL,NULL,NULL,NULL),
('d40cd8be-3d4c-4d59-9c3d-44cf5e2a6930','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','11111111111','INDIVIDUAL','TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('a4ce62b0-c5b1-447c-92b8-54d4bb7f262e','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1111111111','COMMERCIAL','Kısmet XNXX',NULL,NULL,NULL,NULL),
('30f320ef-bdbc-438b-b08e-559e44e4d597','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','Nebisoft Gıda Savunma  Sanayii A.Ş','1111111111','COMMERCIAL','Akbank',NULL,NULL,NULL,NULL),
('b3c61e6a-ff32-4733-8237-665d1caff768','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1111111111','COMMERCIAL','Kısmet XNXX',NULL,NULL,NULL,NULL),
('5755837e-7bf4-416d-82d3-68fd05f4f67f','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1111111111','COMMERCIAL','Kısmet XNXX',NULL,NULL,NULL,NULL),
('3967e951-6b95-432a-af18-70370019417b','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1111111111','COMMERCIAL','Kısmet XNXX',NULL,NULL,NULL,NULL),
('3065e2b2-cfa9-43d5-8802-73a0bc5eb8e1','913252c1-d094-40de-a13c-8dc1142b9222','English Colonial','1111111111','COMMERCIAL','TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('9944a752-00c1-49e5-8767-81b60ae83a96','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1111111111','COMMERCIAL','Kısmet XNXX',NULL,NULL,NULL,NULL),
('08cb5820-6fe7-4f8c-b9cb-8e404c25e71d','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kişisel','1111111111','INDIVIDUAL',NULL,NULL,NULL,NULL,NULL),
('3060086a-19e4-4bdf-9ded-9f1abe44987f','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kişisel','1111111111','INDIVIDUAL',NULL,NULL,NULL,NULL,NULL),
('bfeb817f-2f43-4b63-b0f1-a5a00470015c','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1111111111','COMMERCIAL','Kısmet XNXX',NULL,NULL,NULL,NULL),
('c08b9b86-ebcc-4fc2-9128-aa03376d4e96','a607c2d0-4c49-4697-afe6-4c7499aa094b','Kişisel','1111111111','INDIVIDUAL',NULL,NULL,NULL,NULL,NULL),
('211488ce-f972-4460-8ccc-ab7b6d29b3c4','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1111111111','COMMERCIAL','Kısmet XNXX',NULL,NULL,NULL,NULL),
('50d816cc-002c-40ed-b65c-c151e3034a82','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','11111111111','INDIVIDUAL','TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('d657c498-9cb3-4f3e-8592-d6185c6fffa0','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','11111111111','INDIVIDUAL','TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('342646bf-d745-4043-8bbd-d6c63d173020','bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','11111111111','INDIVIDUAL','TC Ziraat Bankası',NULL,NULL,NULL,NULL),
('8b0e4fec-9931-46a3-adcb-ee8f1f844f1b','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1111111111','COMMERCIAL','Kısmet XNXX',NULL,NULL,NULL,NULL),
('a07ec4fb-5b7a-4fcc-8e5e-f8577324db16','c783e9dc-07aa-4fe4-95e9-be16246156bb','Omodog','1111111111','COMMERCIAL','Kısmet XNXX',NULL,NULL,NULL,NULL);
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
('738c4fe9-6a44-4fc8-b624-00915adfb196','Faraway','42',NULL,'5','3',NULL,'Deneme Sokak',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('08c9d745-a20a-47cf-986a-09b8e445eebc','Faraway','42',NULL,'5','3',NULL,'Deneme Sokak',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('0ca24825-4864-471c-bb74-1b84c0d72e42','Akarsu yokuş sokak 3/4 😽','42',NULL,'5','3',NULL,'Akarsu yokuş sokak 3/4 😽',NULL,NULL,'BEYOĞLU','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('d2d98c6a-5dfc-4b5c-a188-21a944880fff','Akarsu yokuş sokak 3/4 😽','42',NULL,'5','3',NULL,'Akarsu yokuş sokak 3/4 😽',NULL,NULL,'BEYOĞLU','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('c374c52b-76fa-48a5-9ec9-22f87dc00131','Akarsu yokuş sokak 3/4 😽','42',NULL,'5','3',NULL,'Akarsu yokuş sokak 3/4 😽',NULL,NULL,'BEYOĞLU','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('a2f10b22-4469-4a11-8a03-26078764959e','EBOTT DAĞI','42',NULL,'5','3',NULL,'EBOTT DAĞI',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('59b69fbe-e4a0-4bd7-bef8-3209124553ac','EBOTT DAĞI','42',NULL,'5','3',NULL,'EBOTT DAĞI',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('cfa3f290-b004-405e-982b-37baeed1927b','Faraway','42',NULL,'5','3',NULL,'Deneme Sokak',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('9391b4c7-1089-48a6-b61c-45b686732f88','Faraway','42',NULL,'5','3',NULL,'Deneme Sokak',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('a102050b-7473-4b5d-8b9f-54b234141ad6','EBOTT DAĞI','42',NULL,'5','3',NULL,'EBOTT DAĞI',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('9ba9042e-f1fe-4b28-8504-6309c71f8c80','Faraway','42',NULL,'5','3',NULL,'Deneme Sokak',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('771f99c5-b938-4e92-a6e0-6cf30a1ec768','Akarsu yokuş sokak 3/4 😽','42',NULL,'5','3',NULL,'Akarsu yokuş sokak 3/4 😽',NULL,NULL,'BEYOĞLU','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('b5baf2fe-46b1-4d39-b31d-6ff6c52fe729','EBOTT DAĞI','42',NULL,'5','3',NULL,'EBOTT DAĞI',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('7c368604-8956-4eb5-bcfb-7465327963a1','Akarsu yokuş sokak 3/4 😽','42',NULL,'5','3',NULL,'Akarsu yokuş sokak 3/4 😽',NULL,NULL,'BEYOĞLU','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('f17894fc-ded8-4c98-81ae-787cce5b58e2','Faraway','42',NULL,'5','3',NULL,'Deneme Sokak',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('723b6795-7f8a-444a-b796-8ab4d30b6102','Faraway','42',NULL,'5','3',NULL,'Deneme Sokak',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('8b3eabef-ada1-4c27-b5c2-8cd590eddbc2','Akarsu yokuş sokak 3/4 😽','42',NULL,'5','3',NULL,'Akarsu yokuş sokak 3/4 😽',NULL,NULL,'BEYOĞLU','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('8810ebc4-a6b2-437b-96c9-b22b47be1dc3','Faraway','42',NULL,'5','3',NULL,'Deneme Sokak',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('ca290b27-02ea-48bc-90e3-b3f4f5d8d1cd','Faraway','42',NULL,'5','3',NULL,'Deneme Sokak',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('e85ceebc-2e15-4368-bf72-b45362255764','EBOTT DAĞI','42',NULL,'5','3',NULL,'EBOTT DAĞI',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('b6408b1f-27a8-422e-9d1a-b4f242f2e6be','EBOTT DAĞI','42',NULL,'5','3',NULL,'EBOTT DAĞI',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('39121360-80c5-46bb-9d9b-cdca4583d0b1','EBOTT DAĞI','42',NULL,'5','3',NULL,'EBOTT DAĞI',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('ab11fc19-ecb9-450e-990e-dc6191ccff2b','EBOTT DAĞI','42',NULL,'5','3',NULL,'EBOTT DAĞI',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('02c2bea2-5e18-4310-8ed0-f89700bd6c1b','Faraway','42',NULL,'5','3',NULL,'Deneme Sokak',NULL,NULL,'BAHÇELİEVLER','İSTANBUL','34180',NULL,NULL,'TURKIYE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
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
('9dd18852-2002-46a6-87cb-0de0d0ef4ccf','Something','','','','C62','c783e9dc-07aa-4fe4-95e9-be16246156bb','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196'),
('a16429c0-3adc-46e4-a2f2-5e3ab785c91e','Kyle Broflovski Peluş oyuncak','','','','PIECE','bb999e95-3de3-401a-a554-da9ae47e843c','TRY',''),
('739263f4-a5e9-4f70-a368-8ea4891fec10','Kyle Broflovski Peluş','','','','GFI','913252c1-d094-40de-a13c-8dc1142b9222','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196'),
('3954ca25-330d-4e83-aef9-96f0da591b53','Ruj','','','','C62','cbf3e25f-5586-4e5c-b0d8-7463a83da274','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196'),
('e2e402c4-ef53-40df-8591-98adfd4a1afc','Nebicloud üyeliği','','','','C62','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','TRY','927c6994-7d2d-43ab-80cd-17cc74de5196'),
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
('a8b8e8b2-0b0c-4470-b255-3450aec10a76','e2e402c4-ef53-40df-8591-98adfd4a1afc','1years','any','TRY',0,NULL,NULL,NULL,122),
('f9628c98-20a1-4b1a-a771-36e77a827630','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','2 Years','any','TRY',0,NULL,NULL,NULL,0),
('b0e0d341-d1d2-48d6-9b3b-3f0388d7245b','e2e402c4-ef53-40df-8591-98adfd4a1afc','2years-dagestan','any','TRY',0,NULL,NULL,NULL,120),
('376c042f-65e0-427f-bac3-89d456a0e1d9','d5fbd385-4d0b-4b16-8c91-f79e15ac40e1','default','any','TRY',0,NULL,NULL,NULL,0),
('176b2b7c-721d-4ca1-95eb-8df2d880dbe7','739263f4-a5e9-4f70-a368-8ea4891fec10','default','any','TRY',0,NULL,NULL,NULL,200),
('41d6cd8e-ce6a-4a2b-9093-8f256fa00b09','739263f4-a5e9-4f70-a368-8ea4891fec10','humankite','any','TRY',0,NULL,NULL,NULL,90),
('3131314b-7007-44c2-b25c-92b193b9e27a','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','default','any','TRY',3,NULL,NULL,NULL,0),
('3c31fc4b-7007-44c2-b25c-92b193b9e27a','a16429c0-3adc-46e4-a2f2-5e3ab785c91e','default','any','TRY',0,NULL,NULL,NULL,0),
('af17e972-0b8c-4573-88f9-b295919da74a','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','any','TRY',0,NULL,NULL,NULL,31),
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
  `isPublic` tinyint(4) NOT NULL,
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
('927c6994-7d2d-43ab-80cd-17cc74de5196','Yüzde 20',1);
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
('67b13d80-453d-4387-90c0-22e2b8659b55','DEFAULT',20,'927c6994-7d2d-43ab-80cd-17cc74de5196'),
('bb6aa6d4-eff6-4ed6-9e3f-29871bea0649','DEFAULT',18,NULL),
('1554ce6b-3ded-4605-a962-5b4c3021aac5','DEFAULT',20,NULL),
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
  `refundRequestId` uuid DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f8b7c24ce00e8cf0f643445559` (`billingCode`),
  UNIQUE KEY `REL_1195ab2ef90e53363c5b545fe2` (`refundRequestId`),
  CONSTRAINT `FK_1195ab2ef90e53363c5b545fe2e` FOREIGN KEY (`refundRequestId`) REFERENCES `refund_request` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `payment` VALUES
('d92c1a91-529e-4534-bae1-30c8796f9e48','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-03-12 22:41:44','2026-03-12 22:41:47',574,95.6667,NULL),
('5837e458-9f01-421a-95af-332a7c3464b2','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-03-16 14:17:34','2026-03-16 14:17:59',155,25.8333,NULL),
('04a29324-a67e-4e58-99b3-3750d2f2991e','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-03-14 16:08:48','2026-03-14 16:08:50',90,15,NULL),
('6af8f6a8-0ab5-4ba9-88fc-38043ab82009','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-03-16 14:05:21','2026-03-16 14:05:24',390,65,NULL),
('dfac1870-cbb6-4c04-bd19-44631d6bb48a','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-03-13 00:06:56','2026-03-13 00:06:58',124,20.6667,NULL),
('b8ca6234-a8c6-4555-b05f-5486816b77d3','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','New Account','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-03-12 10:59:37','2026-03-12 10:59:40',93,15.5,NULL),
('32627274-d2ea-49ef-95eb-56c5dd3a900a','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-03-16 14:11:48','2026-03-16 14:12:13',217,36.1667,NULL),
('aa291695-3f1c-4b9a-a8a4-6a385d7c6dfa','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-03-12 22:45:27','2026-03-12 22:45:29',664,110.667,NULL),
('979577e7-ddc5-440e-8005-705916b62113','PURCHASE','TRY',NULL,'a607c2d0-4c49-4697-afe6-4c7499aa094b','Kişisel','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-03-12 10:24:27','2026-03-12 10:24:31',848,141.333,NULL),
('ef0500e5-c029-48bf-8f15-7e41ed441c59','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-03-12 15:55:58','2026-03-12 15:56:00',453,75.5,NULL),
('af33b3eb-78e4-43dc-bf1c-81ca6d233712','REFUND','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','WAITING',NULL,NULL,NULL,NULL,NULL,'2026-03-16 14:39:29','2026-03-16 14:39:29',93,15.5,'ef0c30a1-748f-41b8-937e-cbf2624d3a13'),
('b79971ba-ace6-4902-b084-87ff17ca32eb','PURCHASE','TRY',NULL,'a607c2d0-4c49-4697-afe6-4c7499aa094b','Kişisel','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-03-12 10:57:42','2026-03-12 10:57:44',93,15.5,NULL),
('933294af-e707-44d8-87d7-ae4e69e0414f','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-03-14 16:08:59','2026-03-14 16:09:01',122,20.3333,NULL),
('aa9cd89e-f7c5-48b2-9962-b114dd75f228','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-03-16 13:57:17','2026-03-16 13:57:21',693,115.5,NULL),
('9f0c6536-b9a1-4323-827e-b21a890625e7','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-03-15 18:46:26','2026-03-15 18:46:29',31,5.16667,NULL),
('69ef9031-9ff9-4abf-a5db-b3845486772c','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-03-15 18:33:20','2026-03-15 18:33:23',93,15.5,NULL),
('87e1bd15-5905-4270-9200-fc83d4aa4c6f','PURCHASE','TRY',NULL,'a607c2d0-4c49-4697-afe6-4c7499aa094b','Kişisel','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-03-12 10:52:50','2026-03-12 10:52:53',155,25.8333,NULL),
('cc04a96b-6165-4fc1-b0bc-fcb4b24775ba','PURCHASE','TRY',NULL,'bb251590-67d6-4165-8321-7a04fa357242','Frisk Dreemurr','COMPLETED',NULL,NULL,NULL,NULL,NULL,'2026-03-15 14:34:45','2026-03-15 14:35:12',93,15.5,NULL);
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
INSERT INTO `payment_channel_operation` VALUES
('d92c1a91-529e-4534-bae1-30c8796f9e48','dummy-ecommerce','d92c1a91-529e-4534-bae1-30c8796f9e48',NULL,574,'TRY','COMPLETED','d92c1a91-529e-4534-bae1-30c8796f9e48'),
('5837e458-9f01-421a-95af-332a7c3464b2','dummy-ecommerce','5837e458-9f01-421a-95af-332a7c3464b2',NULL,155,'TRY','COMPLETED','5837e458-9f01-421a-95af-332a7c3464b2'),
('04a29324-a67e-4e58-99b3-3750d2f2991e','dummy-ecommerce','04a29324-a67e-4e58-99b3-3750d2f2991e',NULL,90,'TRY','COMPLETED','04a29324-a67e-4e58-99b3-3750d2f2991e'),
('6af8f6a8-0ab5-4ba9-88fc-38043ab82009','dummy-ecommerce','6af8f6a8-0ab5-4ba9-88fc-38043ab82009',NULL,390,'TRY','COMPLETED','6af8f6a8-0ab5-4ba9-88fc-38043ab82009'),
('dfac1870-cbb6-4c04-bd19-44631d6bb48a','dummy-ecommerce','dfac1870-cbb6-4c04-bd19-44631d6bb48a',NULL,124,'TRY','COMPLETED','dfac1870-cbb6-4c04-bd19-44631d6bb48a'),
('b8ca6234-a8c6-4555-b05f-5486816b77d3','dummy-ecommerce','b8ca6234-a8c6-4555-b05f-5486816b77d3',NULL,93,'TRY','COMPLETED','b8ca6234-a8c6-4555-b05f-5486816b77d3'),
('32627274-d2ea-49ef-95eb-56c5dd3a900a','dummy-ecommerce','32627274-d2ea-49ef-95eb-56c5dd3a900a',NULL,217,'TRY','COMPLETED','32627274-d2ea-49ef-95eb-56c5dd3a900a'),
('aa291695-3f1c-4b9a-a8a4-6a385d7c6dfa','dummy-ecommerce','aa291695-3f1c-4b9a-a8a4-6a385d7c6dfa',NULL,664,'TRY','COMPLETED','aa291695-3f1c-4b9a-a8a4-6a385d7c6dfa'),
('979577e7-ddc5-440e-8005-705916b62113','dummy-ecommerce','979577e7-ddc5-440e-8005-705916b62113',NULL,848,'TRY','COMPLETED','979577e7-ddc5-440e-8005-705916b62113'),
('ef0500e5-c029-48bf-8f15-7e41ed441c59','dummy-ecommerce','ef0500e5-c029-48bf-8f15-7e41ed441c59',NULL,453,'TRY','COMPLETED','ef0500e5-c029-48bf-8f15-7e41ed441c59'),
('b79971ba-ace6-4902-b084-87ff17ca32eb','dummy-ecommerce','b79971ba-ace6-4902-b084-87ff17ca32eb',NULL,93,'TRY','COMPLETED','b79971ba-ace6-4902-b084-87ff17ca32eb'),
('933294af-e707-44d8-87d7-ae4e69e0414f','dummy-ecommerce','933294af-e707-44d8-87d7-ae4e69e0414f',NULL,122,'TRY','COMPLETED','933294af-e707-44d8-87d7-ae4e69e0414f'),
('aa9cd89e-f7c5-48b2-9962-b114dd75f228','dummy-ecommerce','aa9cd89e-f7c5-48b2-9962-b114dd75f228',NULL,693,'TRY','COMPLETED','aa9cd89e-f7c5-48b2-9962-b114dd75f228'),
('9f0c6536-b9a1-4323-827e-b21a890625e7','dummy-ecommerce','9f0c6536-b9a1-4323-827e-b21a890625e7',NULL,31,'TRY','COMPLETED','9f0c6536-b9a1-4323-827e-b21a890625e7'),
('69ef9031-9ff9-4abf-a5db-b3845486772c','dummy-ecommerce','69ef9031-9ff9-4abf-a5db-b3845486772c',NULL,93,'TRY','COMPLETED','69ef9031-9ff9-4abf-a5db-b3845486772c'),
('87e1bd15-5905-4270-9200-fc83d4aa4c6f','dummy-ecommerce','87e1bd15-5905-4270-9200-fc83d4aa4c6f',NULL,155,'TRY','COMPLETED','87e1bd15-5905-4270-9200-fc83d4aa4c6f'),
('cc04a96b-6165-4fc1-b0bc-fcb4b24775ba','dummy-ecommerce','cc04a96b-6165-4fc1-b0bc-fcb4b24775ba',NULL,93,'TRY','COMPLETED','cc04a96b-6165-4fc1-b0bc-fcb4b24775ba');
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
  `quantity` float NOT NULL,
  `totalAmount` float NOT NULL,
  `originalUnitAmount` float NOT NULL,
  `unitAmount` float NOT NULL,
  `taxPercent` float NOT NULL,
  `taxAmount` float NOT NULL,
  `unTaxAmount` float NOT NULL,
  `sellerAccountName` varchar(255) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `refunded` tinyint(4) NOT NULL DEFAULT 0,
  `refundPaymentId` uuid DEFAULT NULL,
  `refundDate` timestamp NULL DEFAULT NULL,
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
('2a3e8562-44ea-4e63-b9c2-2749a14968b7','','','','Something','aa9cd89e-f7c5-48b2-9962-b114dd75f228','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb',3,93,31,31,20,15.5,77.5,'Omodog','C62',0,NULL,NULL,0),
('c995c3dc-99cb-4a9f-8a64-3a5f2989c397','','','','Nebicloud üyeliği','933294af-e707-44d8-87d7-ae4e69e0414f','e2e402c4-ef53-40df-8591-98adfd4a1afc','1years','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e',1,122,122,122,20,20.3333,101.667,'Nebisoft Gıda Savunma  Sanayii A.Ş','C62',0,NULL,NULL,0),
('1507488e-9e09-4f06-8eb8-4613fd7959ce','','','','Something','dfac1870-cbb6-4c04-bd19-44631d6bb48a','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb',4,124,31,31,20,20.6667,103.333,'Omodog','C62',0,NULL,NULL,0),
('97c86271-25ba-48cd-ac9d-51b9bd2bf3c7','','','','Something','ef0500e5-c029-48bf-8f15-7e41ed441c59','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb',3,93,31,31,20,15.5,77.5,'Omodog','C62',0,NULL,NULL,0),
('fe81e71f-df6e-4487-8a3f-54bd04028e1b','','','','Kyle Broflovski Peluş','6af8f6a8-0ab5-4ba9-88fc-38043ab82009','739263f4-a5e9-4f70-a368-8ea4891fec10','humankite','913252c1-d094-40de-a13c-8dc1142b9222',1,90,90,90,20,15,75,'English Colonial','GFI',0,NULL,NULL,0),
('7f180a56-3a6c-4a35-9618-596613dc1b07','','','','Kyle Broflovski Peluş','6af8f6a8-0ab5-4ba9-88fc-38043ab82009','739263f4-a5e9-4f70-a368-8ea4891fec10','jew-elf-king','913252c1-d094-40de-a13c-8dc1142b9222',1,300,300,300,20,50,250,'English Colonial','GFI',0,NULL,NULL,0),
('dd1833f0-abe5-4a86-879a-66814e3bb8ca','','','','Kyle Broflovski Peluş','ef0500e5-c029-48bf-8f15-7e41ed441c59','739263f4-a5e9-4f70-a368-8ea4891fec10','humankite','913252c1-d094-40de-a13c-8dc1142b9222',4,360,90,90,20,60,300,'English Colonial','GFI',0,NULL,NULL,0),
('b15b11b6-a13b-41d9-9c7d-735531072177','','','','Kyle Broflovski Peluş','d92c1a91-529e-4534-bae1-30c8796f9e48','739263f4-a5e9-4f70-a368-8ea4891fec10','humankite','913252c1-d094-40de-a13c-8dc1142b9222',5,450,90,90,20,75,375,'English Colonial','GFI',0,NULL,NULL,0),
('d533ff28-1922-416c-830e-7a698ed38f27','','','','Something','d92c1a91-529e-4534-bae1-30c8796f9e48','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb',4,124,31,31,20,20.6667,103.333,'Omodog','C62',0,NULL,NULL,0),
('0ce116c6-6b2b-4921-baf8-7e3265cb5380','','','','Kyle Broflovski Peluş','aa9cd89e-f7c5-48b2-9962-b114dd75f228','739263f4-a5e9-4f70-a368-8ea4891fec10','jew-elf-king','913252c1-d094-40de-a13c-8dc1142b9222',2,600,300,300,20,100,500,'English Colonial','GFI',0,NULL,NULL,0),
('9d5cf871-a7f3-4ff4-a2f5-7e555ed73873','','','','Nebicloud üyeliği','979577e7-ddc5-440e-8005-705916b62113','e2e402c4-ef53-40df-8591-98adfd4a1afc','1years','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e',4,488,122,122,20,81.3333,406.667,'Nebisoft Gıda Savunma  Sanayii A.Ş','C62',0,NULL,NULL,0),
('0bc5a7db-5f08-4348-8aa8-8704f49c6b8e','','','','Something','aa291695-3f1c-4b9a-a8a4-6a385d7c6dfa','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb',4,124,31,31,20,20.6667,103.333,'Omodog','C62',0,NULL,NULL,0),
('f3783bc0-35db-410a-ba31-94e2a2c31e9c','','','','Kyle Broflovski Peluş','04a29324-a67e-4e58-99b3-3750d2f2991e','739263f4-a5e9-4f70-a368-8ea4891fec10','humankite','913252c1-d094-40de-a13c-8dc1142b9222',1,90,90,90,20,15,75,'English Colonial','GFI',0,NULL,NULL,0),
('6ebfd6a1-bca9-402a-b46e-a1c87a6ee639','','','','Something','b8ca6234-a8c6-4555-b05f-5486816b77d3','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb',3,93,31,31,20,15.5,77.5,'Omodog','C62',0,NULL,NULL,0),
('8e17f8e9-2b60-4e41-95f6-a54d97fd7e08','','','','Something','cc04a96b-6165-4fc1-b0bc-fcb4b24775ba','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb',3,93,31,31,20,15.5,77.5,'Omodog','C62',0,NULL,NULL,0),
('ec53913f-9268-47ee-88b4-a94f074b6003','','','','Something','af33b3eb-78e4-43dc-bf1c-81ca6d233712','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb',3,93,31,31,20,15.5,77.5,'Omodog','C62',0,NULL,NULL,0),
('4dcf5f34-1746-45d3-8aa0-b4d64c5dbbfd','','','','Something','69ef9031-9ff9-4abf-a5db-b3845486772c','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb',3,93,31,31,20,15.5,77.5,'Omodog','C62',0,NULL,NULL,0),
('950ed5e7-35f4-4a73-96dc-b79afdc178e5','','','','Kyle Broflovski Peluş','979577e7-ddc5-440e-8005-705916b62113','739263f4-a5e9-4f70-a368-8ea4891fec10','humankite','913252c1-d094-40de-a13c-8dc1142b9222',4,360,90,90,20,60,300,'English Colonial','GFI',0,NULL,NULL,0),
('d5843324-8bd9-4914-bf7b-c4a3c6be09b1','','','','Something','b79971ba-ace6-4902-b084-87ff17ca32eb','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb',3,93,31,31,20,15.5,77.5,'Omodog','C62',0,NULL,NULL,0),
('a7dfa766-3d6e-45fd-a0c0-d72b0262d500','','','','Something','5837e458-9f01-421a-95af-332a7c3464b2','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb',5,155,31,31,20,25.8333,129.167,'Omodog','C62',0,NULL,NULL,3),
('c44985b7-81e6-40ae-9e4c-e538a057cdd0','','','','Something','32627274-d2ea-49ef-95eb-56c5dd3a900a','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb',7,217,31,31,20,36.1667,180.833,'Omodog','C62',0,NULL,NULL,0),
('c4c99d3e-b55f-4163-84b4-ecb87b33211c','','','','Kyle Broflovski Peluş','aa291695-3f1c-4b9a-a8a4-6a385d7c6dfa','739263f4-a5e9-4f70-a368-8ea4891fec10','humankite','913252c1-d094-40de-a13c-8dc1142b9222',6,540,90,90,20,90,450,'English Colonial','GFI',0,NULL,NULL,0),
('0fe1a9cb-1992-4a18-88ea-f5b96b07e33c','','','','Something','87e1bd15-5905-4270-9200-fc83d4aa4c6f','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb',5,155,31,31,20,25.8333,129.167,'Omodog','C62',0,NULL,NULL,0),
('a96a72d3-8d60-4ac8-8191-fe5a950a74ba','','','','Something','9f0c6536-b9a1-4323-827e-b21a890625e7','9dd18852-2002-46a6-87cb-0de0d0ef4ccf','default','c783e9dc-07aa-4fe4-95e9-be16246156bb',1,31,31,31,20,5.16667,25.8333,'Omodog','C62',0,NULL,NULL,0);
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
('8e3e5950-ac76-4128-a145-073dfb89b96f','933294af-e707-44d8-87d7-ae4e69e0414f',20.3333,101.667,122,20),
('ceca5df4-bf18-4a2e-9ef4-07bf4f87bb2d','979577e7-ddc5-440e-8005-705916b62113',141.333,706.667,848,20),
('3ac7ba95-8aad-4fa5-b2fb-14592c566270','ef0500e5-c029-48bf-8f15-7e41ed441c59',75.5,377.5,453,20),
('d7ab7d2a-90c3-4b27-ae23-27d1b716a90f','cc04a96b-6165-4fc1-b0bc-fcb4b24775ba',15.5,77.5,93,20),
('ca0caba2-a563-4f3a-94df-2cef59a9fccf','69ef9031-9ff9-4abf-a5db-b3845486772c',15.5,77.5,93,20),
('cd7c1e6a-3e86-4090-bc3b-4ebd2ea0dae4','aa9cd89e-f7c5-48b2-9962-b114dd75f228',115.5,577.5,693,20),
('440a21ac-db83-4b6d-901f-59ca96682140','b79971ba-ace6-4902-b084-87ff17ca32eb',15.5,77.5,93,20),
('979ead51-cede-4763-91bb-60779ce8f8c2','9f0c6536-b9a1-4323-827e-b21a890625e7',5.16667,25.8333,31,20),
('61384c24-a75a-4854-b48f-657a7f7e3c33','87e1bd15-5905-4270-9200-fc83d4aa4c6f',25.8333,129.167,155,20),
('f5e603c1-4ceb-450e-bf0a-786482f3de2a','aa291695-3f1c-4b9a-a8a4-6a385d7c6dfa',110.667,553.333,664,20),
('ac7e410b-eb98-4357-8d35-7e8700144cf5','b8ca6234-a8c6-4555-b05f-5486816b77d3',15.5,77.5,93,20),
('73bcb445-ba62-4225-ac8c-86a85175bfdc','af33b3eb-78e4-43dc-bf1c-81ca6d233712',15.5,77.5,93,20),
('86c05f8d-55cc-4427-b7dd-8e960e4f4b05','d92c1a91-529e-4534-bae1-30c8796f9e48',95.6667,478.333,574,20),
('5729c719-fe09-4ac7-8594-a9af74ce2f14','32627274-d2ea-49ef-95eb-56c5dd3a900a',36.1667,180.833,217,20),
('548ecad2-b763-411f-a1f7-b56fed780e72','5837e458-9f01-421a-95af-332a7c3464b2',25.8333,129.167,155,20),
('03b5ea67-f08b-4f06-aa94-cf6260858501','dfac1870-cbb6-4c04-bd19-44631d6bb48a',20.6667,103.333,124,20),
('671daa22-ce6b-4ad9-8971-f56db6e0ef5f','6af8f6a8-0ab5-4ba9-88fc-38043ab82009',65,325,390,20),
('e25913ac-9203-4d92-8391-ffb5b45025df','04a29324-a67e-4e58-99b3-3750d2f2991e',15,75,90,20);
/*!40000 ALTER TABLE `postral_payment_tax` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `project_categories`
--

DROP TABLE IF EXISTS `project_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_categories` (
  `id` uuid NOT NULL,
  `name` varchar(255) NOT NULL,
  `projectId` uuid NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_4b3ae99beef33e732fb63185009` (`projectId`),
  CONSTRAINT `FK_4b3ae99beef33e732fb63185009` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_categories`
--

LOCK TABLES `project_categories` WRITE;
/*!40000 ALTER TABLE `project_categories` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `project_categories` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `project_processable_data`
--

DROP TABLE IF EXISTS `project_processable_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_processable_data` (
  `id` uuid NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `projectId` uuid NOT NULL,
  `rawDataId` uuid NOT NULL,
  `dataCategoryId` uuid NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_7ba03e606c299aae3c0975fca99` (`projectId`),
  KEY `FK_4915828f2a1cf568680f20ecf76` (`rawDataId`),
  KEY `FK_64ba0b791abd9825e463743d75e` (`dataCategoryId`),
  CONSTRAINT `FK_4915828f2a1cf568680f20ecf76` FOREIGN KEY (`rawDataId`) REFERENCES `project_raw_data` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_64ba0b791abd9825e463743d75e` FOREIGN KEY (`dataCategoryId`) REFERENCES `project_categories` (`id`) ON UPDATE NO ACTION,
  CONSTRAINT `FK_7ba03e606c299aae3c0975fca99` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_processable_data`
--

LOCK TABLES `project_processable_data` WRITE;
/*!40000 ALTER TABLE `project_processable_data` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `project_processable_data` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `project_raw_data`
--

DROP TABLE IF EXISTS `project_raw_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_raw_data` (
  `id` uuid NOT NULL,
  `dataString` longtext DEFAULT NULL,
  `dataBinary` binary(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_raw_data`
--

LOCK TABLES `project_raw_data` WRITE;
/*!40000 ALTER TABLE `project_raw_data` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `project_raw_data` VALUES
('3c13b05e-6afd-491e-a6d1-3dcf921c4f8d','',NULL),
('aa0570df-a683-4c46-b4d8-ebc319fd51f2','',NULL);
/*!40000 ALTER TABLE `project_raw_data` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` uuid NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
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
  `paymentId` uuid NOT NULL,
  `requestedByPaymentAccountId` varchar(255) NOT NULL,
  `requestedToPaymentAccountId` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_9026faaf537728791a3dd2ed0e` (`paymentId`),
  CONSTRAINT `FK_9026faaf537728791a3dd2ed0ea` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refund_request`
--

LOCK TABLES `refund_request` WRITE;
/*!40000 ALTER TABLE `refund_request` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `refund_request` VALUES
('ef0c30a1-748f-41b8-937e-cbf2624d3a13','APPROVED','68fe859434da9a8bb89ce130','69b297584a58c54d129dbe60','2026-03-16 14:35:42','2026-03-16 14:39:42','5837e458-9f01-421a-95af-332a7c3464b2','bb251590-67d6-4165-8321-7a04fa357242','c783e9dc-07aa-4fe4-95e9-be16246156bb');
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
  `refundCount` float NOT NULL,
  `refundRequestId` uuid DEFAULT NULL,
  `itemName` varchar(255) DEFAULT NULL,
  `unitAmount` float DEFAULT NULL,
  `refundAmount` float DEFAULT NULL,
  `unitAmountWithoutTax` float DEFAULT NULL,
  `refundAmountWithoutTax` float DEFAULT NULL,
  `refundTaxAmount` float DEFAULT NULL,
  `variation` varchar(255) NOT NULL,
  `realItemId` varchar(255) NOT NULL,
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
('080955a0-3497-44aa-8901-3445d40fa494','a7dfa766-3d6e-45fd-a0c0-d72b0262d500',3,'ef0c30a1-748f-41b8-937e-cbf2624d3a13','Something',31,93,25.8334,77.5002,15.4998,'default','9dd18852-2002-46a6-87cb-0de0d0ef4ccf');
/*!40000 ALTER TABLE `refund_request_item` ENABLE KEYS */;
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
  `amount` float NOT NULL,
  `taxAmount` float NOT NULL,
  `untaxedAmount` float NOT NULL,
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
('634b1d61-4980-4f38-89c0-015897633928',93,15.5,77.5,'TRY','69ef9031-9ff9-4abf-a5db-b3845486772c','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-15 18:33:23','2026-03-15 18:33:23','2026-03-15 18:33:23','','','CREDIT_TO_SELLER'),
('7e9a707e-64fd-4ef1-9009-03fae4cf551f',93,15.5,77.5,'TRY','af33b3eb-78e4-43dc-bf1c-81ca6d233712','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','WAITING',NULL,0,0,'2026-03-16 14:39:42','2026-03-16 14:49:37','2026-03-16 14:49:37','','','DEBIT_FROM_SELLER'),
('79cd8b1c-252b-4494-91de-0700bb908d5c',90,15,75,'TRY','04a29324-a67e-4e58-99b3-3750d2f2991e','913252c1-d094-40de-a13c-8dc1142b9222','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-14 16:08:50','2026-03-14 16:08:50','2026-03-14 16:08:50','','','CREDIT_TO_SELLER'),
('db5dca9c-57a4-48a8-a023-07832a9ef635',93,15.5,77.5,'TRY','b79971ba-ace6-4902-b084-87ff17ca32eb','c783e9dc-07aa-4fe4-95e9-be16246156bb','a607c2d0-4c49-4697-afe6-4c7499aa094b','COMPLETED',NULL,0,0,'2026-03-12 10:57:44','2026-03-13 00:39:19','2026-03-13 00:39:19','','','CREDIT'),
('da831d08-1875-40c8-8f47-0f0bf83c3af9',124,20.6667,103.333,'TRY','d92c1a91-529e-4534-bae1-30c8796f9e48','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,1,1,'2026-03-12 22:41:47','2026-03-12 22:45:04','2026-03-12 22:45:04','','','CREDIT_TO_SELLER'),
('9f0c2e85-99b9-453c-8ce9-0f19bfc257be',93,15.5,77.5,'TRY','b8ca6234-a8c6-4555-b05f-5486816b77d3','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,1,1,'2026-03-12 10:59:40','2026-03-12 11:00:22','2026-03-12 11:00:22','','','CREDIT'),
('d804218d-beee-454f-ab00-10f0887c8ad9',124,20.6667,103.333,'TRY','aa291695-3f1c-4b9a-a8a4-6a385d7c6dfa','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,1,1,'2026-03-12 22:45:29','2026-03-12 23:54:57','2026-03-12 23:54:57','','','CREDIT_TO_SELLER'),
('fc27e27e-f5a1-42ba-b054-25c91393b0a4',31,5.16667,25.8333,'TRY','9f0c6536-b9a1-4323-827e-b21a890625e7','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-15 18:46:29','2026-03-15 18:46:29','2026-03-15 18:46:29','','','CREDIT_TO_SELLER'),
('5be95b08-88bd-4ab9-929d-29f121f4f473',217,36.1667,180.833,'TRY','32627274-d2ea-49ef-95eb-56c5dd3a900a','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-16 14:12:30','2026-03-16 14:12:30','2026-03-16 14:12:30','','','CREDIT_TO_SELLER'),
('e6aa199a-6f1e-409c-92ce-2ad7ec5d639c',124,20.6667,103.333,'TRY','dfac1870-cbb6-4c04-bd19-44631d6bb48a','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,1,1,'2026-03-13 00:06:58','2026-03-13 09:14:19','2026-03-13 09:14:19','','','CREDIT_TO_SELLER'),
('7005a4e2-4966-4246-bda8-3d64aca6a0b7',93,15.5,77.5,'TRY','cc04a96b-6165-4fc1-b0bc-fcb4b24775ba','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,1,1,'2026-03-15 14:35:12','2026-03-15 14:36:37','2026-03-15 14:36:37','','','CREDIT_TO_SELLER'),
('4437de9d-c6ce-48ea-8057-4df356af22ae',360,60,300,'TRY','ef0500e5-c029-48bf-8f15-7e41ed441c59','913252c1-d094-40de-a13c-8dc1142b9222','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-12 15:56:00','2026-03-12 15:56:00','2026-03-12 15:56:00','','','CREDIT_TO_SELLER'),
('d2dd0bb7-8ca8-48e2-9947-5a90c01965b9',390,65,325,'TRY','6af8f6a8-0ab5-4ba9-88fc-38043ab82009','913252c1-d094-40de-a13c-8dc1142b9222','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-16 14:05:24','2026-03-16 14:05:24','2026-03-16 14:05:24','','','CREDIT_TO_SELLER'),
('5d2d6edc-2851-43df-bfad-6334e42fdeac',450,75,375,'TRY','d92c1a91-529e-4534-bae1-30c8796f9e48','913252c1-d094-40de-a13c-8dc1142b9222','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-12 22:41:47','2026-03-12 22:41:47','2026-03-12 22:41:47','','','CREDIT_TO_SELLER'),
('a14f0b53-3881-497f-b856-7d8e0ad61e3b',122,20.3333,101.667,'TRY','933294af-e707-44d8-87d7-ae4e69e0414f','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-14 16:09:01','2026-03-14 16:09:01','2026-03-14 16:09:01','','','CREDIT_TO_SELLER'),
('8170a85a-a954-4969-8016-8923135251b0',360,60,300,'TRY','979577e7-ddc5-440e-8005-705916b62113','913252c1-d094-40de-a13c-8dc1142b9222','a607c2d0-4c49-4697-afe6-4c7499aa094b','COMPLETED',NULL,1,1,'2026-03-12 10:24:31','2026-03-12 10:32:55','2026-03-12 10:32:55','','','CREDIT'),
('99816af4-6157-4cac-935b-8c22ddbb9436',600,100,500,'TRY','aa9cd89e-f7c5-48b2-9962-b114dd75f228','913252c1-d094-40de-a13c-8dc1142b9222','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-16 13:57:21','2026-03-16 13:57:21','2026-03-16 13:57:21','','','CREDIT_TO_SELLER'),
('a85bbaa3-5a37-44d1-9623-90f2852649d0',540,90,450,'TRY','aa291695-3f1c-4b9a-a8a4-6a385d7c6dfa','913252c1-d094-40de-a13c-8dc1142b9222','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-12 22:45:29','2026-03-12 22:45:29','2026-03-12 22:45:29','','','CREDIT_TO_SELLER'),
('270ba33b-953f-41cb-8f79-b13ae3fac4a8',93,15.5,77.5,'TRY','aa9cd89e-f7c5-48b2-9962-b114dd75f228','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-16 13:57:21','2026-03-16 13:57:21','2026-03-16 13:57:21','','','CREDIT_TO_SELLER'),
('acd7584c-5c5c-4d10-9032-bc4ab9ab8971',155,25.8333,129.167,'TRY','87e1bd15-5905-4270-9200-fc83d4aa4c6f','c783e9dc-07aa-4fe4-95e9-be16246156bb','a607c2d0-4c49-4697-afe6-4c7499aa094b','COMPLETED',NULL,1,0,'2026-03-12 10:52:53','2026-03-12 10:54:16','2026-03-12 10:54:16','','','CREDIT'),
('b7aa1cd3-0ba7-44a9-a94e-c8c30e75b246',155,25.8333,129.167,'TRY','5837e458-9f01-421a-95af-332a7c3464b2','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,0,0,'2026-03-16 14:18:16','2026-03-16 14:18:16','2026-03-16 14:18:16','','','CREDIT_TO_SELLER'),
('d5855cf5-9a76-4097-af02-c9bef777a4ee',93,15.5,77.5,'TRY','ef0500e5-c029-48bf-8f15-7e41ed441c59','c783e9dc-07aa-4fe4-95e9-be16246156bb','bb251590-67d6-4165-8321-7a04fa357242','COMPLETED',NULL,1,1,'2026-03-12 15:56:00','2026-03-12 15:57:19','2026-03-12 15:57:19','','','CREDIT_TO_SELLER'),
('5ad5b124-82e8-45e1-940e-cc565831b44f',488,81.3333,406.667,'TRY','979577e7-ddc5-440e-8005-705916b62113','a7514c71-9a2f-41d3-979d-1c3d3ad4b21e','a607c2d0-4c49-4697-afe6-4c7499aa094b','COMPLETED',NULL,1,1,'2026-03-12 10:24:31','2026-03-12 10:33:14','2026-03-12 10:33:14','','','CREDIT');
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

-- Dump completed on 2026-03-17 16:01:20
