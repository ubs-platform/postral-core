ALTER TABLE `refund_request`
  ADD COLUMN `reasonKeys` JSON NULL AFTER `paymentId`,
  ADD COLUMN `requestNote` TEXT NULL AFTER `reasonKeys`,
  ADD COLUMN `resolutionNote` TEXT NULL AFTER `requestNote`;