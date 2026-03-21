-- =============================================================================
-- Postral Payment Archive Script
-- Kaynak DB : postral_core
-- Hedef DB  : postral_archive_YYYYMMDD_HHmm  (çalıştırma anında oluşturulur)
--
-- Taşınan tablolar (ve bağımlılıkları):
--   address, account,
--   invoice_address, invoice_account,
--   refund_request, refund_request_item,
--   payment, postral_payment_item, postral_payment_tax,
--   seller_payment_order,
--   invoice
--
-- ❌ Kaynak DB'den HİÇBİR ŞEY SILINMIYOR / DROP EDİLMİYOR
-- =============================================================================

DROP PROCEDURE IF EXISTS `postral_archive_payments`;

DELIMITER $$

CREATE PROCEDURE `postral_archive_payments`()
BEGIN
    DECLARE src VARCHAR(64)  DEFAULT 'postral_core';
    DECLARE dst VARCHAR(100) DEFAULT CONCAT('postral_archive_', DATE_FORMAT(NOW(), '%Y%m%d_%H%i'));

    -- -------------------------------------------------------------------------
    -- 1. Arşiv veritabanını oluştur
    -- -------------------------------------------------------------------------
    SET @sql = CONCAT('CREATE DATABASE IF NOT EXISTS `', dst, '` '
                      'CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

    -- FK kontrolünü geçici olarak kapat (INSERT sıralaması için)
    SET FOREIGN_KEY_CHECKS = 0;

    -- =========================================================================
    -- 2. Tablo kopyalama: önce bağımsız tablolar, sonra bağımlılar
    -- =========================================================================

    -- ── address ───────────────────────────────────────────────────────────────
    SET @sql = CONCAT('CREATE TABLE `', dst, '`.`address` LIKE `', src, '`.`address`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    SET @sql = CONCAT('INSERT INTO `', dst, '`.`address` SELECT * FROM `', src, '`.`address`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

    -- ── account  (→ address) ──────────────────────────────────────────────────
    SET @sql = CONCAT('CREATE TABLE `', dst, '`.`account` LIKE `', src, '`.`account`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    SET @sql = CONCAT('INSERT INTO `', dst, '`.`account` SELECT * FROM `', src, '`.`account`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

    -- ── invoice_address ───────────────────────────────────────────────────────
    SET @sql = CONCAT('CREATE TABLE `', dst, '`.`invoice_address` LIKE `', src, '`.`invoice_address`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    SET @sql = CONCAT('INSERT INTO `', dst, '`.`invoice_address` SELECT * FROM `', src, '`.`invoice_address`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

    -- ── invoice_account ───────────────────────────────────────────────────────
    SET @sql = CONCAT('CREATE TABLE `', dst, '`.`invoice_account` LIKE `', src, '`.`invoice_account`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    SET @sql = CONCAT('INSERT INTO `', dst, '`.`invoice_account` SELECT * FROM `', src, '`.`invoice_account`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

    -- ── refund_request ────────────────────────────────────────────────────────
    SET @sql = CONCAT('CREATE TABLE `', dst, '`.`refund_request` LIKE `', src, '`.`refund_request`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    SET @sql = CONCAT('INSERT INTO `', dst, '`.`refund_request` SELECT * FROM `', src, '`.`refund_request`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

    -- ── refund_request_item  (→ refund_request) ───────────────────────────────
    SET @sql = CONCAT('CREATE TABLE `', dst, '`.`refund_request_item` LIKE `', src, '`.`refund_request_item`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    SET @sql = CONCAT('INSERT INTO `', dst, '`.`refund_request_item` SELECT * FROM `', src, '`.`refund_request_item`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

    -- ── payment  (→ refund_request) ───────────────────────────────────────────
    SET @sql = CONCAT('CREATE TABLE `', dst, '`.`payment` LIKE `', src, '`.`payment`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    SET @sql = CONCAT('INSERT INTO `', dst, '`.`payment` SELECT * FROM `', src, '`.`payment`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

    -- ── postral_payment_item  (→ payment) ─────────────────────────────────────
    SET @sql = CONCAT('CREATE TABLE `', dst, '`.`postral_payment_item` LIKE `', src, '`.`postral_payment_item`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    SET @sql = CONCAT('INSERT INTO `', dst, '`.`postral_payment_item` SELECT * FROM `', src, '`.`postral_payment_item`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

    -- ── postral_payment_tax  (→ payment) ──────────────────────────────────────
    SET @sql = CONCAT('CREATE TABLE `', dst, '`.`postral_payment_tax` LIKE `', src, '`.`postral_payment_tax`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    SET @sql = CONCAT('INSERT INTO `', dst, '`.`postral_payment_tax` SELECT * FROM `', src, '`.`postral_payment_tax`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

    -- ── seller_payment_order  (→ account) ─────────────────────────────────────
    SET @sql = CONCAT('CREATE TABLE `', dst, '`.`seller_payment_order` LIKE `', src, '`.`seller_payment_order`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    SET @sql = CONCAT('INSERT INTO `', dst, '`.`seller_payment_order` SELECT * FROM `', src, '`.`seller_payment_order`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

    -- ── invoice  (→ payment, seller_payment_order, invoice_address, invoice_account)
    SET @sql = CONCAT('CREATE TABLE `', dst, '`.`invoice` LIKE `', src, '`.`invoice`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    SET @sql = CONCAT('INSERT INTO `', dst, '`.`invoice` SELECT * FROM `', src, '`.`invoice`');
    PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

    -- -------------------------------------------------------------------------
    -- 3. FK kontrolünü geri aç
    -- -------------------------------------------------------------------------
    SET FOREIGN_KEY_CHECKS = 1;

    -- -------------------------------------------------------------------------
    -- 4. Sonuç özeti
    -- -------------------------------------------------------------------------
    SELECT
        dst                                         AS archive_database,
        (SELECT COUNT(*) FROM `postral_core`.`payment`)              AS payment_count,
        (SELECT COUNT(*) FROM `postral_core`.`seller_payment_order`) AS seller_payment_order_count,
        (SELECT COUNT(*) FROM `postral_core`.`invoice`)              AS invoice_count,
        (SELECT COUNT(*) FROM `postral_core`.`refund_request`)       AS refund_request_count
    ;
END$$

DELIMITER ;

-- =============================================================================
-- Prosedürü çalıştır
-- =============================================================================
CALL `postral_archive_payments`();

-- Temizlik: prosedür tek kullanımlık
DROP PROCEDURE IF EXISTS `postral_archive_payments`;
