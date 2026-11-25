import {useLanguage} from "./language";

const questions = {
 en: [
  ["Where can I currently look for a holiday home?", "The current developer-backed collection covers Spain. Contact us about your search in Portugal. Search by town or region, or choose Show map to explore the locations."],
  ["How do I check the price of a particular home?", "Open the project, choose the layout you’re interested in and send us an enquiry. We’ll ask the developer to confirm the price, availability and any extra costs for that home."],
  ["How current is the availability list?", "Each project identifies the supplied price documents and the date we reviewed them. These are document snapshots. Ask us to confirm the status of the specific home before reserving. Document dates are shown in each project. Older documents may conflict with newer summaries."],
  ["How close is the beach, and can I get there without a car?", "Open the Area guide for the development. It includes a nearby beach, public transport information and routes to and from the airport. Distances are measured from the town centre. We can check the route from the specific home you’re considering."],
  ["How can I review a home off-plan?", "Tell us which project you’re considering and include the unit reference if you have it. We’ll ask the developer for the floor plan, specifications, payment schedule and expected completion date so you can review them before you reserve."]
 ],
 sv: [
  ["Var kan jag leta efter en semesterbostad?", "I katalogen hittar du nybyggda bostäder i Spanien. Sök på en ort eller region, eller öppna kartan och markera ett område. Söker du i Portugal kan du kontakta oss och berätta vad du letar efter."],
  ["Hur får jag veta priset för en viss bostad?", "Öppna projektet, välj den planlösning du är intresserad av och skicka en förfrågan. Vi ber utvecklaren bekräfta priset, om bostaden är ledig och vilka kostnader som tillkommer."],
  ["Hur aktuell är tillgängligheten?", "På projektsidan ser du vilket underlag uppgifterna kommer från och när vi gick igenom det. En bostad kan ha reserverats sedan dess. Be oss kontrollera med utvecklaren innan du bestämmer dig."],
  ["Hur långt är det till stranden och går det att resa utan bil?", "Öppna projektets områdesguide för att se stranden, kollektivtrafiken och resvägen till och från flygplatsen. På katalogens karta räknas avstånden från ortens centrum. Fråga oss gärna om resvägen från en viss bostad."],
  ["Hur kan jag bedöma en bostad som ännu inte är byggd?", "Ange projektet och gärna vilken bostad du överväger. Vi ber utvecklaren om planritning, teknisk beskrivning, betalningsplan och beräknat färdigställande så att du kan gå igenom underlaget före en reservation."]
 ],
 nl: [
  ["Waar kan ik op dit moment een vakantiewoning zoeken?", "Het huidige aanbod uit ontwikkelaarsdocumenten ligt in Spanje. Neem contact op voor je zoektocht in Portugal. Zoek op plaats of regio, of kies Toon kaart om de locaties te bekijken."],
  ["Hoe controleer ik de prijs van een specifieke woning?", "Open het project, kies de gewenste indeling en stuur ons je aanvraag. We vragen de ontwikkelaar om de prijs, de beschikbaarheid en eventuele bijkomende kosten voor die woning te bevestigen."],
  ["Hoe actueel is de beschikbaarheid?", "Bij projecten met een prijslijst van de ontwikkelaar staat de laatste importdatum op het tabblad Prijslijst. Een woning kan tussentijds gereserveerd worden. Vraag ons daarom vóór een reservering om bevestiging. Documentdata staan bij elk project. Oudere documenten kunnen afwijken van nieuwe overzichten."],
  ["Hoe ver is het strand en kan ik er zonder auto komen?", "Open het tabblad Omgeving. Daar vind je een strand in de buurt, informatie over het openbaar vervoer en routes van en naar de luchthaven. De afstanden zijn gemeten vanaf het centrum. We kunnen de route vanaf de woning die je op het oog hebt voor je nagaan."],
  ["Hoe beoordeel ik een woning op tekening?", "Laat ons weten om welk project het gaat en vermeld de woningcode als je die hebt. We vragen de ontwikkelaar om de plattegrond, de technische omschrijving, het betalingsschema en de verwachte opleverdatum. Zo kun je alles bekijken voordat je reserveert."]
 ]
};

export function BuyerFaq(){
 const {lang}=useLanguage();
 return <section id="faq" className="buyerFaq" aria-labelledby="faq-title">
  <h2 id="faq-title">{{en:"Frequently asked questions",nl:"Veelgestelde vragen",sv:"Vanliga frågor"}[lang]}</h2>
  <div>{questions[lang].map(([question,answer],i)=><details key={i}>
   <summary>{question}</summary><p>{answer}</p>
  </details>)}</div>
 </section>;
}
