CREATE TABLE `calendars` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'month' NOT NULL,
	`firstPeriod` text NOT NULL,
	`created_by` text NOT NULL,
	`created` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`employeeId` text NOT NULL,
	`name` text NOT NULL,
	`checked` integer DEFAULT true NOT NULL,
	`started` text DEFAULT (CURRENT_DATE) NOT NULL,
	`finished` text,
	`created_by` text NOT NULL,
	`created` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `periods` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	`calendar` text NOT NULL,
	`created_by` text NOT NULL,
	`created` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`calendar`) REFERENCES `calendars`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
