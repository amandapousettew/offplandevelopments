import {Files,MessagesSquare,MapPin} from "lucide-react";
import {useLanguage} from "./language";
import {TeamContacts} from "./team-contacts";

export function BuyerGuidance(){
 const {tr}=useLanguage();
 const points=[
  {icon:Files,title:tr("A written price and cost breakdown"),text:tr("Tell us which project and home you are considering. We ask the developer for the current price, availability, VAT, included extras and payment schedule, and put those figures together for you to compare.")},
  {icon:MapPin,title:tr("The documents for your specific home"),text:tr("We request the floor plan, specification, location and expected completion date. When documents conflict or information is missing, we take the question back to the developer before you decide.")},
  {icon:MessagesSquare,title:tr("Project advice in your language"),text:tr("Ask us about a project in English, Dutch or Swedish. You can share the details with your own agent or ask us to introduce you to one in the area.")}
 ];
 return <section className="guidance" id="om"><div><small className="eyeline">{tr("HOW WE HELP BUYERS")}</small><h2>{tr("Before you reserve a home.")}</h2><div className="guidancePoints">{points.map(({icon:Icon,title,text})=><div key={title}><Icon size={21}/><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></div>
 <aside><small>{tr("YOUR CONTACTS")}</small><h3>{tr("Speak to us directly.")}</h3><TeamContacts/></aside></section>
}
