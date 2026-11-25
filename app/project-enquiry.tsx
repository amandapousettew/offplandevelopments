import {useState} from "react";
import {useLanguage} from "./language";

export function ProjectEnquiry({onContinue}:{onContinue:(message:string)=>void}){
  const {lang,tr}=useLanguage();
  const nl=lang==="nl";
  const [rooms,setRooms]=useState<number[]>([]);
  const [features,setFeatures]=useState<string[]>([]);
  const [note,setNote]=useState("");
  const layout=(n:number)=>nl
    ? `${n} kamers (${n-1} ${n===2?"slaapkamer":"slaapkamers"})`
    : `${n} rooms (${n-1} ${n===2?"bedroom":"bedrooms"})`;
  const options=nl?["Balkon","Zeezicht","Terras","Tuin"]:["Balcony","Sea view","Terrace","Garden"];
  function continueToForm(){
    const message=[
      rooms.length && (nl?"Indeling: ":"Layout: ")+rooms.map(layout).join(" / "),
      features.length && (nl?"Woonwensen: ":"Preferred features: ")+features.join(", "),
      note.trim()
    ].filter(Boolean).join("\n");
    onContinue(message);
  }
  return <div className="projectEnquiry">
    <details>
      <summary>{nl?"Welke woning zoek je?":"What kind of home are you looking for?"}</summary>
      <fieldset><legend>{nl?"Gewenste indeling":"Preferred layout"}</legend>
        {[2,3,4].map(n=><label key={n}><input type="checkbox" checked={rooms.includes(n)} onChange={e=>setRooms(e.target.checked?[...rooms,n].sort():rooms.filter(v=>v!==n))}/>{layout(n)}</label>)}
      </fieldset>
      <fieldset><legend>{nl?"Woonwensen":"Preferred features"}</legend>
        {options.map(f=><label key={f}><input type="checkbox" checked={features.includes(f)} onChange={e=>setFeatures(e.target.checked?[...features,f]:features.filter(v=>v!==f))}/>{f}</label>)}
      </fieldset>
      <label className="extraWishes">{nl?"Andere wensen":"Anything else?"}<textarea rows={2} maxLength={1400} value={note} onChange={e=>setNote(e.target.value)}/></label>
    </details>
    <button className="pill dark" onClick={continueToForm}>{tr("Enquire about this development")}</button>
  </div>;
}
