import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const inquiries=sqliteTable("inquiries",{
 id:text("id").primaryKey(), kind:text("kind").notNull(), name:text("name").notNull(), email:text("email").notNull(), language:text("language").notNull(), project:text("project"), company:text("company"), message:text("message"), updates:integer("updates").notNull(), created:text("created").notNull()
});

export const crmAccess=sqliteTable("crm_access",{
 email:text("email").primaryKey(), role:text("role").notNull(), grantedBy:text("granted_by").notNull(), created:text("created").notNull()
});
export const referrals=sqliteTable("crm_referrals",{
 id:text("id").primaryKey(),agentId:text("agent_id").notNull(),agentName:text("agent_name").notNull(),agentEmail:text("agent_email").notNull(),
 unit:text("unit").notNull(),buyer:text("buyer").notNull(),email:text("email").notNull(),stage:text("stage").notNull(),created:text("created").notNull()
});
import {uniqueIndex} from "drizzle-orm/sqlite-core";
export const unitEvents=sqliteTable("crm_unit_events",{
 id:text("id").primaryKey(),unit:text("unit").notNull(),version:integer("version").notNull(),status:text("status").notNull(),
 referral:text("referral"),actor:text("actor").notNull(),created:text("created").notNull()
},t=>[uniqueIndex("unit_revision").on(t.unit,t.version)]);
export const inventorySources=sqliteTable("inventory_sources",{project:text("project").primaryKey(),url:text("url").notNull()});
export const importedUnits=sqliteTable("imported_units",{code:text("code").primaryKey(),project:text("project").notNull(),price:integer("price").notNull(),source:text("source").notNull(),updated:text("updated").notNull()});
