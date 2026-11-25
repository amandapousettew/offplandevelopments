export const languageNames={en:"English",nl:"Nederlands",sv:"Svenska"} as const;
export type Language=keyof typeof languageNames;
export function isLanguage(value:unknown):value is Language {
 return typeof value==="string"&&Object.hasOwn(languageNames,value);
}
export const pageTitles={
 en:"New homes on the Costa Blanca and in Valencia",
 nl:"Nieuwbouw aan de Costa Blanca en in Valencia",
 sv:"Nybyggda bostäder på Costa Blanca och i Valencia",
};
export function preferredLanguage(header:string, saved?:string):Language {
 if(isLanguage(saved))return saved;
 const preferences=header.split(",").map(item=>{
  const [tag,...params]=item.trim().toLowerCase().split(";");
  const quality=params.find(p=>p.trim().startsWith("q="));
  return {code:tag.split("-")[0],quality:quality?Number(quality.trim().slice(2)):1};
 }).filter(x=>x.quality>0).sort((a,b)=>b.quality-a.quality);
 for(const {code,quality} of preferences)if(quality>0&&isLanguage(code))return code;
 return "en";
}
