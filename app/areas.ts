export type Point = [number, number];
type Airport = {name: string; point: Point; guide: string};
const airports: Record<string,Airport> = {
 ALC:{name:"Alicante–Elche (ALC)",point:[38.288,-0.558],guide:"https://www.aena.es/en/alicante-elche-miguel-hernandez/how-to-get-there/bus.html"},
 FAO:{name:"Faro (FAO)",point:[37.019,-7.967],guide:"https://www.faroairport.pt/en/fao/access-parking/getting-to-and-from-the-airport/public-transportation"},
 LIS:{name:"Lisbon (LIS)",point:[38.768,-9.129],guide:"https://www.lisbonairport.pt/en/lis/access-parking/getting-to-and-from-the-airport/public-transportation"},
 OPO:{name:"Porto (OPO)",point:[41.242,-8.679],guide:"https://www.portoairport.pt/en/opo/access-parking/getting-to-and-from-the-airport/public-transportation"}
};
type Area={centre:Point;airport:string;beach:string;shore:Point;transit:string;operator:string;beachAccess?:string;aliases?:string};
export const areas: Record<string,Area> = {
 Altea:{centre:[38.598,-0.052],airport:"ALC",beach:"Platja de l’Espigó",shore:[38.601,-0.044],transit:"Altea is on the coastal TRAM line between Benidorm and Dénia. Airport coaches serve Benidorm; allow for a transfer between stops.",operator:"https://www.tramalacant.es/en/"},
 Lagos:{centre:[37.102,-8.674],airport:"FAO",beach:"Praia da Batata",shore:[37.097,-8.669],transit:"Take a bus between the airport and central Faro, then use the Algarve railway between Faro and Lagos.",operator:"https://www.cp.pt/info/en/w/institucional/the-algarve-line"},
 "Jávea":{centre:[38.789,0.163],airport:"ALC",beach:"Platja de l’Arenal",shore:[38.773,0.19],aliases:"Xàbia Javea",transit:"Look up regional coaches under Xàbia, the local name for Jávea. Check the connection to the airport separately when planning your return.",operator:"https://www.alsa.com/en/web/bus/home"},
 Cascais:{centre:[38.697,-9.421],airport:"LIS",beach:"Praia da Ribeira",shore:[38.696,-9.42],transit:"Lisbon’s Cascais railway connects the town with Cais do Sodré. Change between the railway and Lisbon Metro for the airport.",operator:"https://www.cp.pt/"},
 "Dénia":{centre:[38.84,0.106],airport:"ALC",beach:"Platja de la Marineta Cassiana",shore:[38.832,0.12],transit:"Dénia is the northern terminus of the coastal TRAM from Benidorm. Compare the rail connection with regional coaches when planning an airport transfer.",operator:"https://www.tramalacant.es/en/"},
 Tavira:{centre:[37.126,-7.65],airport:"FAO",beach:"Praia da Ilha de Tavira",shore:[37.114,-7.62],beachAccess:"The beach is on an island. Check the ferry departure point and return sailing.",transit:"Regional trains connect Tavira with Faro. Change in Faro for the airport bus.",operator:"https://www.cp.pt/info/en/w/institucional/the-algarve-line"},
 Villajoyosa:{centre:[38.507,-0.231],airport:"ALC",beach:"Platja Centre",shore:[38.506,-0.229],aliases:"La Vila Joiosa",transit:"Use the coastal TRAM towards Alicante. At Luceros, change to the C6 airport bus; reverse the journey on arrival.",operator:"https://www.tramalacant.es/en/"},
 Lisbon:{centre:[38.713,-9.139],airport:"LIS",beach:"Praia de Carcavelos",shore:[38.679,-9.336],aliases:"Lisboa",beachAccess:"Take the Cascais line from Cais do Sodré to Carcavelos, then continue on foot.",transit:"The airport is on the Metro’s Red Line. Change lines for the historic centre; city buses and trams cover the onward journey.",operator:"https://www.metrolisboa.pt/en/travel/"},
 Comporta:{centre:[38.38,-8.786],airport:"LIS",beach:"Praia da Comporta",shore:[38.381,-8.803],transit:"One approach is via Setúbal and the ferry to Tróia. Arrange the onward road transfer to Comporta and check the return ferry before departure.",operator:"https://www.visitportugal.com/en/destinos/alentejo/73793"},
 Calpe:{centre:[38.644,0.045],airport:"ALC",beach:"Playa del Arenal-Bol",shore:[38.642,0.05],aliases:"Calp",transit:"Search for Calp on the Benidorm–Dénia TRAM line. Plan the connection from the station to the town centre separately.",operator:"https://www.tramalacant.es/en/"},
 Porto:{centre:[41.147,-8.611],airport:"OPO",beach:"Praia dos Ingleses",shore:[41.151,-8.678],transit:"Metro Line E serves the airport. Trindade is a central interchange for onward Metro journeys.",operator:"https://www.metrodoporto.pt/"}
};
export function normalize(value:string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim()}
export function searchArea(query:string,town:string,region:string,country:string){
 const terms=normalize(query).replace(/spanje/g,"spain").replace(/lissabon/g,"lisbon").replace(/regio/g,"region").split(/\s+/);
 const area=normalize([town,region,country,areas[town].aliases||""].join(" "));
 return terms.every(term=>area.includes(term));
}
export function localGuide(town:string){const area=areas[town];return {...area,hub:airports[area.airport]}}
export function distance(a:Point,b:Point,lang:"en"|"nl"){
 const rad=Math.PI/180;
 const h=Math.sin((b[0]-a[0])*rad/2)**2+Math.cos(a[0]*rad)*Math.cos(b[0]*rad)*Math.sin((b[1]-a[1])*rad/2)**2;
 const km=12742*Math.asin(Math.sqrt(h));
 const prefix=lang==="nl"?"circa ":"about ";
 return km<1?prefix+Math.max(100,Math.round(km*10)*100)+" m":prefix+(km<10?km.toLocaleString(lang,{minimumFractionDigits:1,maximumFractionDigits:1}):Math.round(km))+" km";
}
export function directions(from:Point,to:Point,mode:string){
 return "https://www.google.com/maps/dir/?"+new URLSearchParams({api:"1",origin:from.join(","),destination:to.join(","),travelmode:mode}).toString();
}
