"use client";
import {useState} from "react";
import type {Workspace} from "../crm-server";
import {projects} from "../catalog";
import {projectCode,unitStates} from "../units";
type Row=string[];
const statuses:Record<string,string>={available:"Available",libre:"Available",livre:"Available",ledig:"Available",beschikbaar:"Available",disponible:"Available",disponivel:"Available",reserved:"Reserved",reservado:"Reserved",gereserveerd:"Reserved",sold:"Sold",vendido:"Sold",verkocht:"Sold"};
export function Importer({data,lang}:{data:Workspace;lang:string}){
 const nl=lang==="nl",t=(a:string,b:string)=>nl?b:a;
 const [project,setProject]=useState(projectCode(projects[0].name)),[file,setFile]=useState(""),[sheets,setSheets]=useState<{name:string;rows:Row[]}[]>([]),[sheet,setSheet]=useState(0),[columns,setColumns]=useState([0,1,2]),[header,setHeader]=useState(0),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 const rows=sheets[sheet]?.rows||[],titles=rows[header]||[];
 const preview=rows.slice(header+1).filter(row=>row.some(v=>v.trim())).map(row=>{
 const [ref,amount,raw]=columns.map(i=>row[i]?.trim()||"");const status=statuses[raw.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()];
 const price=/^\d+(?:\.0+)?$/.test(amount)?Number(amount):NaN;
 const old=data.stock.find(u=>u.code===project+"-"+ref.toUpperCase());
 return {ref:ref.toUpperCase(),price,status,version:old?.version||0,previous:old};
 });
 const changes=preview.filter(r=>!r.previous||r.previous.illustrative||r.previous.price!==r.price||r.previous.status!==r.status);
 const valid=preview.length>0&&preview.length<=200&&new Set(preview.map(v=>v.ref)).size===preview.length&&new Set(columns).size===3&&preview.every(v=>/^[A-Z0-9][A-Z0-9 ._/-]{0,59}$/.test(v.ref)&&v.price>0&&v.price<=999999999&&unitStates.includes(v.status as typeof unitStates[number]));
 async function read(f?:File){setSheets([]);setMessage("");if(!f)return;setBusy(true);try{
 if(f.size>8000000)throw Error();const excel=await import("exceljs");const w=new (excel.Workbook??excel.default.Workbook)();await w.xlsx.load(await f.arrayBuffer());
 const sheets=w.worksheets.filter(s=>s.state==="visible").map(s=>{const rows:Row[]=[];s.eachRow(r=>{const cells:Row=[];r.eachCell((c,i)=>{const v=c.value;cells[i-1]=v&&typeof v==="object"&&"result" in v?String(v.result??""):c.text});rows.push(Array.from({length:cells.length},(_,i)=>cells[i]||""))});return {name:s.name,rows}});setSheets(sheets);setSheet(0);setHeader(0);setColumns([0,1,2]);setFile(f.name)
 }catch{setMessage(t("Choose a readable .xlsx file under 8 MB.","Kies een leesbaar .xlsx-bestand kleiner dan 8 MB."))}finally{setBusy(false)}}
 async function apply(){setBusy(true);try{const r=await fetch("/api/stock-import",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({project,file,rows:changes.map(({previous,...v})=>v)})});if(!r.ok)throw Error();location.reload()}catch{setMessage(t("Import failed. Reload the latest inventory before trying again.","Import mislukt. Ververs eerst de voorraad."));setBusy(false)}}
 return <><h2>{t("Developer stock lists","Voorraadlijsten van ontwikkelaars")}</h2><label>{t("Project","Project")}<select value={project} onChange={e=>setProject(e.target.value)}>{projects.map(p=><option key={p.id} value={projectCode(p.name)}>{projectCode(p.name)} · {p.name}</option>)}</select></label>
 <p>{t("Select the updated .xlsx file from your developer. Choose its worksheet and match the columns for unit reference, price and status.","Selecteer het bijgewerkte .xlsx-bestand van de ontwikkelaar. Kies het werkblad en koppel de kolommen voor woningcode, prijs en status.")}</p>
 <input aria-label="Excel" type="file" accept=".xlsx" disabled={busy} onChange={e=>read(e.target.files?.[0])}/>
 {sheets.length>0&&<><label>{t("Worksheet","Werkblad")}<select value={sheet} onChange={e=>{setSheet(+e.target.value);setHeader(0)}}>{sheets.map((v,i)=><option key={i} value={i}>{v.name}</option>)}</select></label><label>{t("Header row","Kopregel")}<select value={header} onChange={e=>setHeader(+e.target.value)}>{rows.slice(0,30).map((r,i)=><option value={i} key={i}>{i+1} · {r.join(" / ").slice(0,70)}</option>)}</select></label>
 <div className="columnMap">{[t("Unit reference","Woningcode"),t("Price (EUR)","Prijs (EUR)"),"Status"].map((label,i)=><label key={i}>{label}<select value={columns[i]} onChange={e=>setColumns(columns.map((v,j)=>j===i?+e.target.value:v))}>{titles.map((v,k)=><option value={k} key={k}>{v||k+1}</option>)}</select></label>)}</div>
 <p>{t("Review all rows before applying. The first import replaces this project's illustrative inventory. Later imports retain omitted units. Use unique references, whole-euro numeric prices and Available, Reserved or Sold (or their Dutch, Spanish or Portuguese equivalents).","Controleer alle rijen. De eerste import vervangt de voorbeeldvoorraad van dit project. Later blijven ontbrekende woningen behouden. Gebruik unieke codes, numerieke prijzen in hele euro’s en Beschikbaar, Gereserveerd of Verkocht.")}</p><div className="scrollTable"><table><tbody>{preview.slice(0,200).map((r,i)=><tr key={i}><td>{project}-{r.ref}</td><td>{r.previous? r.previous.price+" / "+r.previous.status:"—"}</td><td>{r.price||"?"} / {r.status||"?"}</td></tr>)}</tbody></table></div>
 {!valid&&<p role="alert">{t("Check mapping, duplicate references and prices. Up to 200 rows per import.","Controleer kolommen, dubbele codes en prijzen. Maximaal 200 rijen per import.")}</p>}<button disabled={!valid||!changes.length||busy} onClick={apply}>{t("Apply reviewed rows","Gecontroleerde rijen importeren")} ({changes.length})</button></>}
 <p role="status">{message}</p></>
}
