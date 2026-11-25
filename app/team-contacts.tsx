import {Phone} from "lucide-react";
import {BookingLink} from "./booking";
import {useLanguage} from "./language";
import publicSite from "./public-site.json";

const team=[publicSite.team.potros,publicSite.team.amanda];
export function TeamContacts(){
 const {tr}=useLanguage();
 return <div className="teamContacts">{team.map(person=><div className="teamContact" key={person.number}>
 <strong>{person.name}</strong><span>{person.languages.join(" · ")}</span>
 <div><a href={"tel:"+person.number} aria-label={tr("Call ")+person.name}><Phone size={15}/>{person.display}</a></div>
 </div>)}<div className="bookingContact"><BookingLink/><p>{tr("30 minutes · Google Meet")}</p></div></div>
}
