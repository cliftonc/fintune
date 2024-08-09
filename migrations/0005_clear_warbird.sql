CREATE TABLE `people_teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`employee` integer NOT NULL,
	`team` integer NOT NULL,
	`period` integer NOT NULL,
	FOREIGN KEY (`employee`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`period`) REFERENCES `periods`(`id`) ON UPDATE no action ON DELETE no action
);
