CREATE TABLE `imported_units` (
	`code` text PRIMARY KEY NOT NULL,
	`project` text NOT NULL,
	`price` integer NOT NULL,
	`source` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inventory_sources` (
	`project` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL
);
