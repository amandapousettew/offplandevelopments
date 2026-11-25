import {Files,MessagesSquare,MapPin} from "lucide-react";
import {useLanguage} from "./language";
import {TeamContacts} from "./team-contacts";

export function BuyerGuidance(){
 const {lang}=useLanguage(),nl=lang==="nl";
 const points=[
  {icon:Files,title:nl?"De prijs van jouw woning":"The price of your specific home",text:nl?"Geef ons de woningcode. We vragen de ontwikkelaar of de woning nog beschikbaar is, wat de prijs is en welke kosten daar nog bij komen.":"Give us the unit reference. We’ll ask the developer to confirm availability, the asking price and which costs are additional."},
  {icon:MapPin,title:nl?"Een gevoel voor de locatie":"A feel for the location",text:nl?"Bekijk de route van de luchthaven en de afstand van het centrum tot het strand. Vraag ons om de situatietekening om te zien waar de woning binnen het project ligt.":"Explore the airport route and the distance from town to the beach. Ask us for the site plan to see where your home sits within the development."},
  {icon:MessagesSquare,title:nl?"Contact in je eigen taal":"A conversation in your language",text:nl?"Bespreek de plattegrond met Potros in het Nederlands of met Amanda in het Zweeds. Beiden helpen je ook in het Engels.":"Talk through a floor plan in Dutch with Potros or in Swedish with Amanda. Both can help you in English."}
 ];
 return <section className="guidance" id="om"><div><small className="eyeline">{nl?"ZO BEGELEIDEN WE JE":"HOW WE HELP BUYERS"}</small><h2>{nl?"Voordat je een woning reserveert.":"Before you reserve a home."}</h2><div className="guidancePoints">{points.map(({icon:Icon,title,text})=><div key={title}><Icon size={21}/><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></div>
 <aside><small>{nl?"JOUW CONTACTPERSONEN":"YOUR CONTACTS"}</small><h3>{nl?"Spreek ons rechtstreeks.":"Speak to us directly."}</h3><TeamContacts/></aside></section>
}
