import {env} from "cloudflare:workers";
import {getChatGPTUser} from "../../chatgpt-auth";
import {roleOf} from "../../crm-server";
import {projects} from "../../catalog";
import {units,unitStates} from "../../units";
import {z} from "zod";
const payload=z.object({project:z.string().refine(p=>units.some(u=>u.project===p)||projects.some(project=>project.code===p)),file:z.string().min(1).max(255),rows:z.array(z.object({
 ref:z.string().regex(/^[A-Z0-9][A-Z0-9 ._/-]{0,59}$/),price:z.number().int().positive().max(999999999),
 status:z.enum(unitStates),version:z.number().int().min(0)
})).min(1).max(200)});
export async function POST(request:Request){
 if(new URL(request.url).origin!==request.headers.get("origin"))return new Response(null,{status:403});
 const user=await getChatGPTUser();if(!user||await roleOf(user)!=="admin")return new Response(null,{status:403});
 const parsed=payload.safeParse(await request.json().catch(()=>null));if(!parsed.success)return new Response(null,{status:400});
 const {project,file,rows}=parsed.data;if(new Set(rows.map(r=>r.ref)).size!==rows.length)return new Response(null,{status:400});
 const now=new Date().toISOString(),db=env.DB!;
 const statements=rows.flatMap(r=>{
 const code=project+"-"+r.ref;
 return [db.prepare("INSERT INTO imported_units(code,project,price,source,updated) VALUES(?,?,?,?,?) ON CONFLICT(code) DO UPDATE SET price=excluded.price,source=excluded.source,updated=excluded.updated").bind(code,project,r.price,file,now),
 db.prepare("INSERT INTO crm_unit_events(id,unit,version,status,actor,created) SELECT ?,?,CASE WHEN coalesce(max(version),0)=? THEN coalesce(max(version),0)+1 ELSE NULL END,?,?,? FROM crm_unit_events WHERE unit=?").bind(crypto.randomUUID(),code,r.version,r.status,user.email,now,code)];
 });
 try{await db.batch(statements)}catch{return new Response(null,{status:409})}
 return Response.json({updated:rows.length});
}
