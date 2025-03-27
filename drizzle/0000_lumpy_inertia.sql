CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`notes` varchar(255) NOT NULL,
	`debit` decimal(10,2) DEFAULT '0.00',
	`credit` decimal(10,2) DEFAULT '0.00',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
