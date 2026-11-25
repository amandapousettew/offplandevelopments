"use client";
import {useEffect,useRef,useState} from "react";
import type * as Leaflet from "leaflet";
import {validBounds,type SearchBounds} from "./search-bounds";
import {areas} from "./areas";
import {useLanguage} from "./language";
import {projects} from "./catalog";
type Project=(typeof projects)[number];
export function LocationMap({matches,onOpen,fromPrice,bounds,onBounds,onClearArea}:{onClearArea:()=>void;bounds:SearchBounds|null;onBounds:(v:SearchBounds)=>void;fromPrice:(p:Project)=>number|null;matches:Project[];onOpen:(p:Project)=>void}){
 const {tr,price,lang}=useLanguage();
 const container=useRef<HTMLDivElement>(null);
 const [ready,setReady]=useState(false);
 const mapRef=useRef<{map:Leaflet.Map;L:typeof Leaflet}|null>(null);
 const [drawing,setDrawing]=useState(false);
 const [draft,setDraft]=useState<SearchBounds|null>(null);
 const [hasCorner,setHasCorner]=useState(false);
 const [picked,setPicked]=useState("");
 const towns:string[]=[...new Set(matches.map(p=>p.town))];
 const markerKey=JSON.stringify(matches.map(p=>p.id));
 const town=towns.includes(picked)?picked:towns[0];
 useEffect(()=>{
  let disposed=false;let observer:ResizeObserver|undefined;
  import("leaflet").then(async module=>{
   if(disposed||!container.current)return;
   const L=module.default??module;
   const map=L.map(container.current,{scrollWheelZoom:false,zoomSnap:0.25}).setView([39,-5],5);
   mapRef.current={map,L};
   map.attributionControl.setPrefix(false);
   L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
   observer=new ResizeObserver(()=>map.invalidateSize());observer.observe(container.current);
   setReady(true);
  });
  return ()=>{disposed=true;observer?.disconnect();mapRef.current?.map.remove();mapRef.current=null}
 },[]);
 useEffect(()=>{
  if(!ready||!mapRef.current)return;
  const {map,L}=mapRef.current;
  const markers=L.layerGroup().addTo(map);
  const items=projects.filter(p=>(JSON.parse(markerKey) as number[]).includes(p.id));
  const names=[...new Set(projects.map(p=>p.town))];
  for(const name of names){
   const count=items.filter(p=>p.town===name).length;
   const marker=L.marker(areas[name].centre,{title:tr(name),alt:tr(name)+", "+count+(lang==="nl"?" projecten":" developments"),icon:L.divIcon({className:"townMarker"+(count?"":" mutedMarker"),html:count?String(count):"·",iconSize:[30,30],iconAnchor:[15,15]})}).addTo(markers);
   marker.bindTooltip(tr(name)).on("click",()=>{setPicked(name);map.setView(areas[name].centre,12)});
  }
  if(!bounds&&names.length)map.fitBounds(L.latLngBounds(names.map(n=>areas[n].centre)),{padding:[35,35],maxZoom:12,animate:false});
  return ()=>{markers.remove()};
 },[markerKey,ready,lang,bounds]);
 useEffect(()=>{
  if(!ready||!mapRef.current||!(draft||bounds))return;
  const {map,L}=mapRef.current;
  const selected=draft||bounds!;
  const box=L.latLngBounds([selected[0],selected[1]],[selected[2],selected[3]]);
  const outline=L.rectangle(box,{color:"#343434",weight:2,dashArray:"6 5",fillOpacity:.025,interactive:false}).addTo(map);
  map.fitBounds(box,{padding:[16,16],maxZoom:16,animate:false});
  return ()=>{outline.remove()};
 },[bounds,draft,ready]);
 useEffect(()=>{
  if(!drawing||!ready||!mapRef.current||!container.current)return;
  const {map,L}=mapRef.current,el=container.current;
  let start:Leaflet.LatLng|null=null;
  const preview=L.layerGroup().addTo(map);
  const wasDragging=map.dragging.enabled();
  map.dragging.disable();
  const corners=(end:Leaflet.LatLng)=>L.latLngBounds(start!,end);
  const previewAt=(end:Leaflet.LatLng)=>{
   preview.clearLayers();
   if(start){L.circleMarker(start,{radius:5,color:"#222",interactive:false}).addTo(preview);L.rectangle(corners(end),{weight:2,color:"#222",dashArray:"5 4",interactive:false}).addTo(preview)}
  };
  const click=(e:MouseEvent)=>{
   if((e.target as Element).closest(".leaflet-control"))return;
   e.stopImmediatePropagation();
   const pos=map.mouseEventToLatLng(e);
   if(!start){start=pos;setHasCorner(true);previewAt(pos);return}
   const b=corners(pos);
   const area=[b.getSouth(),b.getWest(),b.getNorth(),b.getEast()];
   if(validBounds(area)){setDraft(area as SearchBounds);setDrawing(false)}
  };
  const move=(e:MouseEvent)=>{if(start)previewAt(map.mouseEventToLatLng(e))};
  const escape=(e:KeyboardEvent)=>{if(e.key==="Escape")setDrawing(false)};
  el.addEventListener("click",click,true);el.addEventListener("mousemove",move);
  document.addEventListener("keydown",escape);
  return ()=>{el.removeEventListener("click",click,true);el.removeEventListener("mousemove",move);document.removeEventListener("keydown",escape);preview.remove();if(wasDragging)map.dragging.enable()};
 },[drawing,ready,onBounds]);
 function useVisibleArea(){
  const b=mapRef.current?.map.getBounds();
  if(!b)return;
  const area=[b.getSouth(),Math.max(-180,b.getWest()),b.getNorth(),Math.min(180,b.getEast())];
  if(validBounds(area)){setDraft(area as SearchBounds);setDrawing(false)}
 }
 return <section className="mapLayout" aria-label={tr("Development locations")}><div className="mapWorkspace"><div className="areaControls"><button className="filter" disabled={!ready} aria-pressed={drawing} onClick={()=>{setDraft(null);setHasCorner(false);setDrawing(!drawing)}}>{drawing?(lang==="nl"?"Annuleren":"Cancel"):(lang==="nl"?"Zoekgebied tekenen":"Draw search area")}</button><button className="textlink" disabled={!ready} onClick={useVisibleArea}>{lang==="nl"?"Zoek in dit kaartbeeld":"Search this map view"}</button>{draft&&<button className="filter" onClick={()=>{onBounds(draft);setDraft(null)}}>{lang==="nl"?"OK, zoek in dit gebied":"OK, search this area"}</button>}{(draft||bounds)&&<button className="textlink" onClick={()=>{setDraft(null);setDrawing(false);onClearArea()}}>{lang==="nl"?"Gebied wissen":"Clear area"}</button>}</div>
 <p className="fine mapStatus" role="status">{draft?(lang==="nl"?"Bevestig dit gebied om te zoeken.":"Confirm this area to search.") :drawing?(hasCorner?(lang==="nl"?"Tik op de tegenoverliggende hoek.":"Tap the opposite corner."):(lang==="nl"?"Tik op de eerste hoek van je zoekgebied.":"Tap the first corner of your search area.")):(lang==="nl"?"Verplaats of zoom de kaart, of teken een gebied.":"Move or zoom the map, or draw an area.")}</p><div className={"mapCanvas"+(drawing?" drawingArea":"")} ref={container} aria-label={tr("Map of development towns")}/></div><aside>{!matches.length?<div className="mapEmpty"><strong>{lang==="nl"?"Geen projecten in deze selectie":"No projects in this selection"}</strong><p>{lang==="nl"?"De stippen tonen waar we projecten hebben. Pas je gebied of filters aan.":"The dots show where we have projects. Adjust your area or filters."}</p>{bounds&&<button className="filter" onClick={onClearArea}>{lang==="nl"?"Alle locaties tonen":"Show all locations"}</button>}</div>:<><label htmlFor="town-choice">{tr("Explore a town")}</label><select id="town-choice" value={town||""} disabled={!town} onChange={e=>{setPicked(e.target.value);mapRef.current?.map.setView(areas[e.target.value].centre,12)}}>{towns.map(t=><option key={t} value={t}>{tr(t)}</option>)}</select><p className="fine">{tr("Pins mark town centres. Select a development for airport routes, public transport and beach access.")}</p>{matches.filter(p=>p.town===town).map(p=><button key={p.id} onClick={()=>onOpen(p)}><strong>{p.name}</strong><span>{fromPrice(p)===null?(lang==="nl"?"Geen aanbod":"None available"):tr("From")+" "+price(fromPrice(p)!)} {tr("· Area guide")}</span></button>)}</>}</aside></section>
}
