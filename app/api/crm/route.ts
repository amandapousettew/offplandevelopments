import {eq,and} from "drizzle-orm";
import {z} from "zod";
import {getChatGPTUser} from "../../chatgpt-auth";
import {roleOf,inventory} from "../../crm-server";
import {projects} from "../../catalog";
import {units,unitStates} from "../../units";
import {getDb} from "../../../db";
import {crmAccess,referrals,unitEvents,inventorySources} from "../../../db/schema";
const email=z.string().trim().email().max(254).transform(v=>v.toLowerCase());
const code=z.string().max(85);
const command=z.discriminatedUnion("action",[
 z.object({action:z.literal("source"),project:z.string().refine(p=>units.some(u=>u.project===p)||projects.some(project=>project.code===p)),url:z.string().url().refine(u=>/^https:\/\/(docs|drive)\.google\.com\//.test(u))}),
 z.object({action:z.literal("refer"),id:z.string().uuid(),unit:code,buyer:z.string().trim().min(1).max(150),email}),
 z.object({action:z.literal("invite"),email,role:z.enum(["admin","agent"])}),
 z.object({action:z.literal("remove"),email}),
 z.object({action:z.literal("review"),id:z.string().uuid(),stage:z.enum(["Approved","Declined"])}),
 z.object({action:z.literal("stock"),unit:code,status:z.enum(unitStates),version:z.number().int().nonnegative(),referral:z.string().uuid().nullable()})
]);
const response=(status:number)=>Response.json({ok:status<300},{status,headers:{"Cache-Control":"no-store"}});
export async function POST(request:Request){
 if(request.headers.get("origin")!==new URL(request.url).origin)return response(403);
 const user=await getChatGPTUser();if(!user)return response(401);
 const role=await roleOf(user);if(!role)return response(403);
 const parsed=command.safeParse(await request.json().catch(()=>null));if(!parsed.success)return response(400);
 const v=parsed.data,db=getDb(),created=new Date().toISOString();
 if("unit" in v && !(await inventory()).some(u=>u.code===v.unit))return response(400);
 if(v.action==="refer"){
  await db.insert(referrals).values({id:v.id,unit:v.unit,buyer:v.buyer,email:v.email,agentId:user.userId,agentName:user.displayName,agentEmail:user.email,stage:"Submitted",created}).onConflictDoNothing();
  return response(201);
 }
 if(role!=="admin")return response(403);
 if(v.action==="source"){await db.insert(inventorySources).values({project:v.project,url:v.url}).onConflictDoUpdate({target:inventorySources.project,set:{url:v.url}})}
 else if(v.action==="invite"){
  await db.insert(crmAccess).values({email:v.email,role:v.role,grantedBy:user.email,created}).onConflictDoUpdate({target:crmAccess.email,set:{role:v.role,grantedBy:user.email,created}});
 }else if(v.action==="remove"){await db.delete(crmAccess).where(eq(crmAccess.email,v.email))}
 else if(v.action==="review"){
  const changed=await db.update(referrals).set({stage:v.stage}).where(and(eq(referrals.id,v.id),eq(referrals.stage,"Submitted"))).returning({id:referrals.id});
  if(!changed.length)return response(409);
 }else{
  if(v.referral){
   const linked=await db.select().from(referrals).where(eq(referrals.id,v.referral)).get();
   if(linked?.unit!==v.unit||linked.stage!=="Approved"||v.status==="Available")return response(400);
  }
  const last=await db.select({version:unitEvents.version}).from(unitEvents).where(and(eq(unitEvents.unit,v.unit),eq(unitEvents.version,v.version))).get();
  if(v.version>0&&!last)return response(409);
  const added=await db.insert(unitEvents).values({id:crypto.randomUUID(),unit:v.unit,version:v.version+1,status:v.status,referral:v.referral,actor:user.email,created}).onConflictDoNothing().returning({id:unitEvents.id});
  if(!added.length)return response(409);
 }
 return response(200);
}
