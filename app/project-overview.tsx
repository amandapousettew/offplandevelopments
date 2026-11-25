import {Building2, CalendarDays, ChartNoAxesColumn, Euro, KeyRound, TrendingUp} from "lucide-react";
import {localGuide, distance} from "./areas";
import type {projects} from "./catalog";
import {useLanguage} from "./language";

type OverviewProps = {
  project: (typeof projects)[number];
  available: number;
  startingPrice: number | null;
  openAreaGuide: () => void;
};

export function ProjectOverview({project, available, startingPrice, openAreaGuide}: OverviewProps) {
  const {lang, tr, price} = useLanguage();
  const nl = lang === "nl";
  const {centre, shore, beach, hub, transit} = localGuide(project.town);
  const fields = [
    {icon: Building2, label: nl ? "Beschikbaarheid" : "Availability", value: nl ? `${available} beschikbaar` : `${available} available`},
    {icon: Euro, label: nl ? "Vanafprijs" : "Starting price", value: startingPrice === null ? (nl ? "Geen beschikbaar aanbod" : "None available") : price(startingPrice)},
    {icon: CalendarDays, label: nl ? "Verwachte oplevering" : "Estimated completion", value: nl ? "Nog te bevestigen" : "Awaiting confirmation"},
    {icon: KeyRound, label: nl ? "Eigendomsvorm" : "Tenure", value: nl ? "Nog te bevestigen" : "Awaiting confirmation"},
    {icon: ChartNoAxesColumn, label: nl ? "Huurrendement" : "Rental yield", value: nl ? "Geen prognose beschikbaar" : "No estimate supplied"}
  ];
  return <div className="projectOverview">
    <section><h3>{nl ? "Over dit project" : "About this project"}</h3><p>{tr(project.description)}</p></section>
    <details open className="investmentPanel">
      <summary><TrendingUp size={19} aria-hidden="true"/>{nl ? "Investeringsdetails" : "Investment details"}</summary>
      <div className="investmentBody">
        <dl>{fields.map(({icon: Icon,label,value})=><div key={label}>
          <Icon size={16} aria-hidden="true"/><dt>{label}</dt><dd>{value}</dd>
        </div>)}</dl>
        <section><h3>{nl ? "Waarom" : "Why"} {tr(project.town)}?</h3>
          <ul><li>{beach} {nl ? "ligt" : "is"} {distance(centre,shore,lang)} {nl ? "hemelsbreed van het centrum." : "from the town centre as the crow flies."}</li>
          <li>{tr(transit)}</li></ul>
          <button type="button" className="textlink" onClick={openAreaGuide}>{nl ? "Routes via" : "See routes via"} {tr(hub.name)}</button>
        </section>
      </div>
    </details>
  </div>;
}
