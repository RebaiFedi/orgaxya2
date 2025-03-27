ALTER TABLE `transactions` ADD `category` varchar(100);--> statement-breakpoint
ALTER TABLE `transactions` ADD `payment_method` varchar(100);--> statement-breakpoint
ALTER TABLE `transactions` ADD `total` decimal(10,2);