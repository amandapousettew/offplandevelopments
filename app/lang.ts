export type Language="en"|"nl";
export function preferredLanguage(header:string, saved?:string):Language {
 if(saved==="en"||saved==="nl")return saved;
 const preferences=header.split(",").map(item=>{
  const [tag,...params]=item.trim().toLowerCase().split(";");
  const quality=params.find(p=>p.trim().startsWith("q="));
  return {code:tag.split("-")[0],quality:quality?Number(quality.trim().slice(2)):1};
 }).filter(x=>x.quality>0).sort((a,b)=>b.quality-a.quality);
 return preferences.find(x=>x.code==="nl"||x.code==="en")?.code==="nl"?"nl":"en";
}
