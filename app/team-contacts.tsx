import {Phone,MessageCircle} from "lucide-react";
import {BookingLink} from "./booking";
import {useLanguage} from "./language";

const team=[
 {name:"Potros Abrahim",number:"+351960006926",display:"+351 960 006 926",languages:["Nederlands","English"]},
 {name:"Amanda Pousette",number:"+46738800099",display:"+46 73 880 00 99",languages:["Svenska","English"]}
];
export function TeamContacts(){
 const {lang}=useLanguage();
 return <div className="teamContacts">{team.map(person=><div className="teamContact" key={person.number}>
 <strong>{person.name}</strong><span>{person.languages.join(" · ")}</span>
 <div><a href={"tel:"+person.number} aria-label={(lang==="nl"?"Bel ":"Call ")+person.name}><Phone size={15}/>{person.display}</a>
 <a href={"https://wa.me/"+person.number.slice(1)} target="_blank" rel="noreferrer" aria-label={"WhatsApp "+person.name}><MessageCircle size={16}/>WhatsApp</a></div>
 </div>)}<div className="bookingContact"><BookingLink/><p>{lang==="nl"?"30 minuten · Google Meet":"30 minutes · Google Meet"}</p></div></div>
}
