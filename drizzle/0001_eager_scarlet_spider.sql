CREATE TABLE `crm_access` (
	`email` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`granted_by` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `crm_referrals` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_id` text NOT NULL,
	`agent_name` text NOT NULL,
	`agent_email` text NOT NULL,
	`unit` text NOT NULL,
	`buyer` text NOT NULL,
	`email` text NOT NULL,
	`stage` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `crm_unit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`unit` text NOT NULL,
	`version` integer NOT NULL,
	`status` text NOT NULL,
	`referral` text,
	`actor` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unit_revision` ON `crm_unit_events` (`unit`,`version`);