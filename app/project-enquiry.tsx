import type {Language} from "./lang";
import {useLanguage} from "./language";

const documents=[
 {id:"prices",en:"Price list",nl:"Prijslijst"},
 {id:"availability",en:"Availability",nl:"Beschikbaarheid"},
 {id:"floorPlans",en:"Floor plans",nl:"Plattegronden"},
] as const;
const features=[
 {id:"balcony",en:"Balcony",nl:"Balkon"},
 {id:"seaView",en:"Sea view",nl:"Zeezicht"},
 {id:"terrace",en:"Terrace",nl:"Terras"},
 {id:"garden",en:"Garden",nl:"Tuin"},
] as const;
const roomCounts=[2,3,4];

export type ProjectPreferences={
 documents:string[];
 rooms:number[];
 features:string[];
 note:string;
};

export const emptyPreferences:ProjectPreferences={documents:[],rooms:[],features:[],note:""};

export function readPreferences(value:unknown):ProjectPreferences{
 if(!value||typeof value!=="object")return emptyPreferences;
 const stored=value as Partial<ProjectPreferences>;
 const allowed=(options:readonly {id:string}[], ids:unknown)=>Array.isArray(ids)
  ? options.filter(option=>ids.includes(option.id)).map(option=>option.id)
  : [];
 return {
  documents:allowed(documents,stored.documents),
  rooms:Array.isArray(stored.rooms)?roomCounts.filter(room=>stored.rooms!.includes(room)):[],
  features:allowed(features,stored.features),
  note:typeof stored.note==="string"?stored.note.slice(0,1400):"",
 };
}

function layout(rooms:number,lang:Language){
 return lang==="nl"
  ? rooms+" kamers ("+(rooms-1)+(rooms===2?" slaapkamer)":" slaapkamers)")
  : rooms+" rooms ("+(rooms-1)+(rooms===2?" bedroom)":" bedrooms)");
}

export function preferenceLines(preferences:ProjectPreferences,lang:Language){
 const nl=lang==="nl";
 const selectedDocuments=documents.filter(item=>preferences.documents.includes(item.id)).map(item=>item[lang]);
 const selectedFeatures=features.filter(item=>preferences.features.includes(item.id)).map(item=>item[lang]);
 return [
  selectedDocuments.length && (nl?"Informatie: ":"Information: ")+selectedDocuments.join(", "),
  preferences.rooms.length && (nl?"Indeling: ":"Layout: ")+preferences.rooms.map(rooms=>layout(rooms,lang)).join(" / "),
  selectedFeatures.length && (nl?"Woonwensen: ":"Preferred features: ")+selectedFeatures.join(", "),
  preferences.note.trim(),
 ].filter((line):line is string=>Boolean(line));
}

function toggle<T>(values:T[], value:T, checked:boolean){
 return checked?[...values,value]:values.filter(item=>item!==value);
}

type Props={
 projectName:string;
 preferences:ProjectPreferences;
 saved:boolean;
 onChange:(preferences:ProjectPreferences)=>void;
 onSave:()=>void;
 onViewSaved:()=>void;
 onContinue:()=>void;
};

export function ProjectEnquiry({projectName,preferences,saved,onChange,onSave,onViewSaved,onContinue}:Props){
 const {lang}=useLanguage();
 const nl=lang==="nl";
 return <section className="projectEnquiry" aria-label={nl?"Aanvraag voor "+projectName:"Enquiry for "+projectName}>
  <h3>{nl?"Vraag informatie over":"Request information about"} {projectName}</h3>
  <fieldset>
   <legend>{nl?"Wat wil je ontvangen?":"What would you like to receive?"}</legend>
   {documents.map(item=><label key={item.id}>
    <input type="checkbox" checked={preferences.documents.includes(item.id)} onChange={event=>onChange({...preferences,documents:toggle(preferences.documents,item.id,event.target.checked)})}/>
    {item[lang]}
   </label>)}
  </fieldset>
  <details>
   <summary>{nl?"Woningwensen toevoegen":"Add home preferences"}</summary>
   <fieldset>
    <legend>{nl?"Gewenste indeling":"Preferred layout"}</legend>
    {roomCounts.map(rooms=><label key={rooms}>
     <input type="checkbox" checked={preferences.rooms.includes(rooms)} onChange={event=>onChange({...preferences,rooms:toggle(preferences.rooms,rooms,event.target.checked).sort()})}/>
     {layout(rooms,lang)}
    </label>)}
   </fieldset>
   <fieldset>
    <legend>{nl?"Woonwensen":"Preferred features"}</legend>
    {features.map(item=><label key={item.id}>
     <input type="checkbox" checked={preferences.features.includes(item.id)} onChange={event=>onChange({...preferences,features:toggle(preferences.features,item.id,event.target.checked)})}/>
     {item[lang]}
    </label>)}
   </fieldset>
   <label className="extraWishes">{nl?"Andere wensen":"Anything else?"}
    <textarea rows={2} maxLength={1400} value={preferences.note} onChange={event=>onChange({...preferences,note:event.target.value})}/>
   </label>
  </details>
  <div className="enquiryActions">
   <button type="button" className="pill dark" onClick={onContinue}>{nl?"Vraag informatie aan":"Request information"}</button>
   <button type="button" className="pill shortlistButton" onClick={saved?onViewSaved:onSave}>{saved?(nl?"Bekijk favorieten":"View shortlist"):(nl?"Bewaar voor later":"Save to shortlist")}</button>
  </div>
 </section>;
}
