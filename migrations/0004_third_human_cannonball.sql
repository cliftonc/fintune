DROP TABLE `periods`;

CREATE TABLE `periods` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	`calendar` integer NOT NULL,
	`created_by` text NOT NULL,
	`created` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`calendar`) REFERENCES `calendars`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);

DROP TABLE IF EXISTS `teams`; 

CREATE TABLE `teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`department` integer NOT NULL,
	`created_by` text NOT NULL,
	`created` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`department`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
