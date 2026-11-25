import type {Language} from "./lang";
import {useLanguage,translate} from "./language";

const documents=[
 {id:"prices",en:"Price list"},
 {id:"availability",en:"Availability"},
 {id:"floorPlans",en:"Floor plans"},
] as const;
const features=[
 {id:"balcony",en:"Balcony"},
 {id:"seaView",en:"Sea view"},
 {id:"terrace",en:"Terrace"},
 {id:"garden",en:"Garden"},
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
 if(lang==="sv")return rooms+" rum ("+(rooms-1)+" sovrum)";
 return lang==="nl"
  ? rooms+" kamers ("+(rooms-1)+(rooms===2?" slaapkamer)":" slaapkamers)")
  : rooms+" rooms ("+(rooms-1)+(rooms===2?" bedroom)":" bedrooms)");
}

export function preferenceLines(preferences:ProjectPreferences,lang:Language){
 const tr=(message:string)=>translate(lang,message);
 const selectedDocuments=documents.filter(item=>preferences.documents.includes(item.id)).map(item=>tr(item.en));
 const selectedFeatures=features.filter(item=>preferences.features.includes(item.id)).map(item=>tr(item.en));
 return [
  selectedDocuments.length && tr("Information: ")+selectedDocuments.join(", "),
  preferences.rooms.length && tr("Layout: ")+preferences.rooms.map(rooms=>layout(rooms,lang)).join(" / "),
  selectedFeatures.length && tr("Preferred features: ")+selectedFeatures.join(", "),
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
 const {lang,tr}=useLanguage();
 return <section className="projectEnquiry" aria-label={tr("Enquiry for")+" "+projectName}>
  <h3>{tr("Request information about")} {projectName}</h3>
  <fieldset>
   <legend>{tr("What would you like to receive?")}</legend>
   {documents.map(item=><label key={item.id}>
    <input type="checkbox" checked={preferences.documents.includes(item.id)} onChange={event=>onChange({...preferences,documents:toggle(preferences.documents,item.id,event.target.checked)})}/>
    {tr(item.en)}
   </label>)}
  </fieldset>
  <details>
   <summary>{tr("Add home preferences")}</summary>
   <fieldset>
    <legend>{tr("Preferred layout")}</legend>
    {roomCounts.map(rooms=><label key={rooms}>
     <input type="checkbox" checked={preferences.rooms.includes(rooms)} onChange={event=>onChange({...preferences,rooms:toggle(preferences.rooms,rooms,event.target.checked).sort()})}/>
     {layout(rooms,lang)}
    </label>)}
   </fieldset>
   <fieldset>
    <legend>{tr("Preferred features")}</legend>
    {features.map(item=><label key={item.id}>
     <input type="checkbox" checked={preferences.features.includes(item.id)} onChange={event=>onChange({...preferences,features:toggle(preferences.features,item.id,event.target.checked)})}/>
     {tr(item.en)}
    </label>)}
   </fieldset>
   <label className="extraWishes">{tr("Anything else?")}
    <textarea rows={2} maxLength={1400} value={preferences.note} onChange={event=>onChange({...preferences,note:event.target.value})}/>
   </label>
  </details>
  <div className="enquiryActions">
   <button type="button" className="pill dark" onClick={onContinue}>{tr("Request information")}</button>
   <button type="button" className="pill shortlistButton" onClick={saved?onViewSaved:onSave}>{saved?tr("View shortlist"):tr("Save to shortlist")}</button>
  </div>
 </section>;
}
