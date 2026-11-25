import {useLanguage} from "./language";
import {Plane,TramFront,Waves} from "lucide-react";
import {localGuide,directions,distance} from "./areas";
export function AreaGuide({town}:{town:string}){
 const {tr,lang}=useLanguage();
 const {centre,hub,beach,shore,transit,operator,beachAccess}=localGuide(town);
 return <section className="areaGuide"><h3>{tr("Getting around")} {tr(town)}</h3>
 <p className="fine">{tr("Distances are approximate straight lines from the town-centre pin. Open a route for travel distance and time.")}</p>
 <h4><Plane size={18}/> {tr("Airport connections")}</h4><p>{tr(hub.name)} · {distance(centre,hub.point,lang)}</p>
 <div className="routeLinks"><a href={directions(hub.point,centre,"transit")} target="_blank" rel="noreferrer">{tr("From the airport")}</a><a href={directions(centre,hub.point,"transit")} target="_blank" rel="noreferrer">{tr("To the airport")}</a><a href={hub.guide} target="_blank" rel="noreferrer">{tr("Airport transport guide")}</a></div>
 <h4><TramFront size={18}/> {tr("Public transport")}</h4><p>{tr(transit)}</p><a href={operator} target="_blank" rel="noreferrer">{tr("Local transport information")}</a>
 <h4><Waves size={18}/> {tr("Beach access")}</h4><p>{beach} · {distance(centre,shore,lang)}</p>{beachAccess&&<p>{tr(beachAccess)}</p>}<a href={directions(centre,shore,beachAccess?"transit":"walking")} target="_blank" rel="noreferrer">{tr("Plan a beach trip")}</a></section>
}
