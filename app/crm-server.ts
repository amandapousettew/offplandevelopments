import {asc,desc,eq} from "drizzle-orm";
import {getDb} from "../db";
import {crmAccess,referrals,unitEvents,importedUnits,inventorySources} from "../db/schema";
import {units,unitStates,type UnitState} from "./units";
import type {ChatGPTUser} from "./chatgpt-auth";

// Bootstrap administrator is the verified owner of this Site.
const owner="amanda.pousette.w@gmail.com";
export async function roleOf(user:ChatGPTUser){
 if(user.email.toLowerCase()===owner)return "admin";
 const member=await getDb().select().from(crmAccess).where(eq(crmAccess.email,user.email.toLowerCase())).get();
 return member?.role??null;
}
export async function inventory(){
 const imported=await getDb().select().from(importedUnits);
 const history=await getDb().select({unit:unitEvents.unit,status:unitEvents.status,version:unitEvents.version}).from(unitEvents).orderBy(asc(unitEvents.version));
 const latest=new Map(history.map(e=>[e.unit,e]));
 const importedDates=new Map(imported.map(r=>[r.code,r.updated]));
 const liveProjects=new Set(imported.map(r=>r.project));
 const base=[...units.filter(u=>!liveProjects.has(u.project)),...imported.map(r=>({code:r.code,project:r.project,name:units.find(u=>u.project===r.project)!.name,price:r.price,area:null,status:"Available" as UnitState,version:0}))];
 return base.map(u=>{const e=latest.get(u.code);return {...u,status:e?e.status as UnitState:u.status,version:e?.version??0,illustrative:!liveProjects.has(u.project),importDate:importedDates.get(u.code)??null}});
}
export async function workspace(user:ChatGPTUser,role:string){
 const db=getDb(),admin=role==="admin";
 const [stock,leads,members,events,sources]=await Promise.all([
  inventory(),db.select().from(referrals).where(admin?undefined:eq(referrals.agentId,user.userId)).orderBy(desc(referrals.created)),
  admin?db.select().from(crmAccess).orderBy(asc(crmAccess.email)):[],
  admin?db.select().from(unitEvents).orderBy(desc(unitEvents.created)):[],admin?db.select().from(inventorySources):[]
 ]);
 return {stock,leads,members,events,sources,admin};
}
export type Workspace=Awaited<ReturnType<typeof workspace>>;
