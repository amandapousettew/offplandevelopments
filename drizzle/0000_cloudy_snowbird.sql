CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`language` text NOT NULL,
	`project` text,
	`company` text,
	`message` text,
	`updates` integer NOT NULL,
	`created` text NOT NULL
);
