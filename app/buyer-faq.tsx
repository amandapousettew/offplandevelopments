import {useLanguage} from "./language";

const questions = {
 en: [
  ["Where can I currently look for a holiday home?", "The current developer-backed collection covers Spain. Contact us about your search in Portugal. Search by town or region, or choose Show map to explore the locations."],
  ["How do I check the price of a particular home?", "Open the project’s price information and send Potros or Amanda the project name and preferred layout. We request the current unit quote, availability and additional costs from the developer."],
  ["How current is the availability list?", "Each project identifies the supplied price documents and the date we reviewed them. These are document snapshots. Ask us to confirm the status of the specific home before reserving. Document dates are shown in each project. Older documents may conflict with newer summaries."],
  ["How close is the beach, and can I get there without a car?", "Open the Area guide for the development. It includes a nearby beach, public transport information and routes to and from the airport. Distances are measured from the town centre. We can check the route from the specific home you’re considering."],
  ["How can I review a home off-plan?", "Send Potros or Amanda the project name and unit reference. Ask for the floor plan, specifications, payment schedule and expected completion date. We’ll check the details with the developer so you can review them before deciding whether to reserve."]
 ],
 nl: [
  ["Waar kan ik op dit moment een vakantiewoning zoeken?", "Het huidige aanbod uit ontwikkelaarsdocumenten ligt in Spanje. Neem contact op voor je zoektocht in Portugal. Zoek op plaats of regio, of kies Toon kaart om de locaties te bekijken."],
  ["Hoe controleer ik de prijs van een specifieke woning?", "Open de prijslijst van het project en zoek de woningcode. Stuur deze naar Potros of Amanda. We vragen de ontwikkelaar naar de vraagprijs, de beschikbaarheid en eventuele bijkomende kosten."],
  ["Hoe actueel is de beschikbaarheid?", "Bij projecten met een prijslijst van de ontwikkelaar staat de laatste importdatum op het tabblad Prijslijst. Een woning kan tussentijds gereserveerd worden. Vraag ons daarom vóór een reservering om bevestiging. Documentdata staan bij elk project. Oudere documenten kunnen afwijken van nieuwe overzichten."],
  ["Hoe ver is het strand en kan ik er zonder auto komen?", "Open het tabblad Omgeving. Daar vind je een strand in de buurt, informatie over het openbaar vervoer en routes van en naar de luchthaven. De afstanden zijn gemeten vanaf het centrum. We kunnen de route vanaf de woning die je op het oog hebt voor je nagaan."],
  ["Hoe beoordeel ik een woning op tekening?", "Stuur Potros of Amanda de projectnaam en woningcode. Vraag naar de plattegrond, de technische omschrijving, het betalingsschema en de verwachte opleverdatum. Wij controleren de gegevens bij de ontwikkelaar, zodat je ze kunt bekijken voordat je besluit te reserveren."]
 ]
};

export function BuyerFaq(){
 const {lang}=useLanguage();
 return <section id="faq" className="buyerFaq" aria-labelledby="faq-title">
  <h2 id="faq-title">{lang==="nl"?"Veelgestelde vragen":"Frequently asked questions"}</h2>
  <div>{questions[lang].map(([question,answer],i)=><details key={i}>
   <summary>{question}</summary><p>{answer}</p>
  </details>)}</div>
 </section>;
}
