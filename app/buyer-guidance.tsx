import {Files,MessagesSquare,MapPin} from "lucide-react";
import {useLanguage} from "./language";
import {TeamContacts} from "./team-contacts";

export function BuyerGuidance(){
 const {lang}=useLanguage(),nl=lang==="nl";
 const points=[
  {icon:Files,title:nl?"Een schriftelijk overzicht van prijs en kosten":"A written price and cost breakdown",text:nl?"Vertel ons welk project en welke woning je op het oog hebt. We vragen de ontwikkelaar om de actuele prijs, beschikbaarheid, btw, inbegrepen opties en het betalingsschema. Je krijgt de bedragen bij elkaar, zodat je weet wat je moet vergelijken.":"Tell us which project and home you are considering. We ask the developer for the current price, availability, VAT, included extras and payment schedule, and put those figures together for you to compare."},
  {icon:MapPin,title:nl?"De documenten van jouw specifieke woning":"The documents for your specific home",text:nl?"We vragen naar de plattegrond, technische omschrijving, locatie en verwachte oplevering. Als documenten elkaar tegenspreken of een gegeven ontbreekt, leggen we dat eerst terug bij de ontwikkelaar.":"We request the floor plan, specification, location and expected completion date. When documents conflict or information is missing, we take the question back to the developer before you decide."},
  {icon:MessagesSquare,title:nl?"Een vast aanspreekpunt, van vraag tot reservering":"A named contact from enquiry to reservation",text:nl?"Potros helpt je in het Nederlands en Engels. Amanda helpt je in het Zweeds en Engels. Bespreek je budget, eigen gebruik en eventuele verhuurwensen in een kennismakingsgesprek, en ontvang daarna de relevante projectinformatie.":"Speak to Potros in Dutch or English, or Amanda in Swedish or English. In an exploration call, discuss your budget, personal use and rental plans, then receive the relevant project information and outstanding questions."}
 ];
 return <section className="guidance" id="om"><div><small className="eyeline">{nl?"ZO BEGELEIDEN WE JE":"HOW WE HELP BUYERS"}</small><h2>{nl?"Voordat je een woning reserveert.":"Before you reserve a home."}</h2><div className="guidancePoints">{points.map(({icon:Icon,title,text})=><div key={title}><Icon size={21}/><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></div>
 <aside><small>{nl?"JOUW CONTACTPERSONEN":"YOUR CONTACTS"}</small><h3>{nl?"Spreek ons rechtstreeks.":"Speak to us directly."}</h3><TeamContacts/></aside></section>
}
