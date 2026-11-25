"use client";
import {useState,useRef,useEffect} from "react";
import {Bookmark, MapPin, SlidersHorizontal, X, Menu, ChevronLeft, ChevronRight, Building2, Ruler, BedDouble} from "lucide-react";
import {projectCode} from "./units";
import type {Workspace} from "./crm-server";
import {SearchHelp,pauseSearchHelp} from "./search-help";
import {ProjectEnquiry,emptyPreferences,readPreferences,type ProjectPreferences} from "./project-enquiry";
import {EnquiryForm,type EnquiryKind} from "./enquiry-form";
import {SourceProjectContent} from "./source-project-content";
import {BuyerFaq} from "./buyer-faq";
import {BuyerGuidance} from "./buyer-guidance";
import {BookingLink} from "./booking";
import {AreaGuide} from "./area-guide";
import {LocationMap} from "./location-map";
import {containsPoint,validBounds,type SearchBounds} from "./search-bounds";
import {areas,searchArea} from "./areas";
import {Search} from "lucide-react";
import {useLanguage} from "./language";
import {projects,amenityOptions,isResidential,rentalStatus} from "./catalog";
import publicSite from "./public-site.json";
import {isLanguage,languageNames,type Language} from "./lang";
import {recordEnquirySource} from "./enquiry-source.mjs";
import {WhatsAppLink} from "./whatsapp";
type Project=(typeof projects)[number];
const heroIds=[7,8,4];
function projectPage(slug:string,lang:Language){
 if(lang==="sv")return `sv/projekt/${slug}/`;
 return lang==="nl"&&publicSite.localizedProjects.includes(slug)?`nl/projecten/${slug}/`:`projects/${slug}/`;
}
function Brand(){const {tr,basePath}=useLanguage();return <a className="brand" href="#" aria-label={tr("OffplanDevelopments, home")}><img src={basePath+"offplandevelopments-logo.svg"} width={470} height={130} alt="OffplanDevelopments"/></a>}
function LanguageSelect({className}:{className?:string}){
 const {lang,setLang,tr}=useLanguage();
 return <select className={className} aria-label={tr("Language")} value={lang} onChange={event=>{const value=event.target.value;if(isLanguage(value))setLang(value)}}>
  {Object.entries(languageNames).map(([code,label])=><option key={code} value={code} lang={code}>{label}</option>)}
 </select>;
}
export default function Home({stock,review=false}:{stock:Workspace["stock"];review?:boolean}){
 const {tr,lang,price,basePath}=useLanguage();
 const [country,setCountry]=useState("All"),[limit,setLimit]=useState(6),[slide,setSlide]=useState(0),[filters,setFilters]=useState(false),[type,setType]=useState("All"),[budget,setBudget]=useState("All"),[savedOnly,setSavedOnly]=useState(false),[saved,setSaved]=useState<number[]>([]),[menu,setMenu]=useState(false),[detail,setDetail]=useState<Project|null>(null),[kind,setKind]=useState<EnquiryKind|"">(""),[tab,setTab]=useState("Overview");
 const menuButton=useRef<HTMLButtonElement>(null);
 const [amenities,setAmenities]=useState<string[]>([]);
 const [catalogue,setCatalogue]=useState<"homes"|"investments">("homes");
 const [rental,setRental]=useState("All");
 const [enquirySent,setEnquirySent]=useState(false);
 const [initialMessage,setInitialMessage]=useState("");
 const [requestedIds,setRequestedIds]=useState<number[]>([]);
 const [preferences,setPreferences]=useState<Record<number,ProjectPreferences>>({});
 const [preferencesLoaded,setPreferencesLoaded]=useState(false);
 const [query,setQuery]=useState(""),[mapOpen,setMapOpen]=useState(false);
 const [bounds,setBounds]=useState<SearchBounds|null>(null);
 const [searchLoaded,setSearchLoaded]=useState(false);
 useEffect(()=>{if(review)recordEnquirySource()},[review]);
 useEffect(()=>{
   try{
     setMapOpen(!window.matchMedia("(max-width:680px)").matches);
     const pref=JSON.parse(localStorage.getItem("offplan-search-v1")||"null");
     if(pref){
       if(Array.isArray(pref.amenities))setAmenities(pref.amenities.filter((v:unknown)=>amenityOptions.some(o=>o.id===v)));
       if(["All","confirmed","unconfirmed"].includes(pref.rental))setRental(pref.rental);
       if(!window.matchMedia("(max-width:680px)").matches&&typeof pref.mapOpen==="boolean")setMapOpen(pref.mapOpen);
       if(pref.amenities?.length||pref.rental&&pref.rental!=="All")setFilters(true);
       if(["All","Spain","Portugal"].includes(pref.country))setCountry(pref.country);
       if(["All","350000","500000","750000"].includes(pref.budget))setBudget(pref.budget);
       if(["All",...projects.map(p=>p.type)].includes(pref.type)){setType(pref.type);setFilters(pref.type!=="All"||Boolean(pref.amenities?.length)||Boolean(pref.rental&&pref.rental!=="All"))}
       if(typeof pref.query==="string")setQuery(pref.query);
       if(validBounds(pref.bounds))setBounds(pref.bounds);
       setSavedOnly(pref.savedOnly===true);
     }
   }catch{}
   setSearchLoaded(true);
 },[]);
 useEffect(()=>{
   if(searchLoaded)try{localStorage.setItem("offplan-search-v1",JSON.stringify({country,budget,type,query,bounds,savedOnly,amenities,rental,mapOpen}))}catch{}
 },[searchLoaded,country,budget,type,query,bounds,savedOnly,amenities,rental,mapOpen]);
 function resetSearch(){setAmenities([]);setRental("All");setCountry("All");setType("All");setBudget("All");setSavedOnly(false);setQuery("");setBounds(null);setLimit(6)}
 function enterSavedView(){
  resetSearch();
  setSavedOnly(true);
  setMenu(false);
  requestAnimationFrame(()=>document.getElementById("projekt")?.scrollIntoView());
 }
 useEffect(()=>{
  const params=new URLSearchParams(window.location.search);
  let ids:number[]=[];
  try{
   const stored=JSON.parse(localStorage.getItem("nieuw-saved")||"[]");
   if(Array.isArray(stored))ids=projects.filter(project=>stored.includes(project.id)).map(project=>project.id);
   const drafts=JSON.parse(localStorage.getItem("offplan-project-preferences")||"{}");
   if(drafts&&typeof drafts==="object"){
    setPreferences(Object.fromEntries(projects.map(project=>[project.id,readPreferences(drafts[project.id])])));
   }
  }catch{}
  setPreferencesLoaded(true);

  const add=projects.find(project=>project.slug===params.get("save"));
  if(add&&!ids.includes(add.id)){
   ids=[...ids,add.id];
   try{localStorage.setItem("nieuw-saved",JSON.stringify(ids))}catch{}
  }
  setSaved(ids);
  if(params.has("save")){
   const url=new URL(window.location.href);
   url.searchParams.delete("save");
   history.replaceState(history.state,"",url);
  }
  if(params.get("enquiry")==="developer")setKind("Developer");
  if(params.get("catalogue")==="investments"){
   setCatalogue("investments");
   setSavedOnly(false);
   setType("All");
  }
  if(add||params.get("saved")==="1")enterSavedView();
  const project=projects.find(item=>item.slug===params.get("project"));
  if(project){setDetail(project);setTab("Overview")}
 },[]);
 useEffect(()=>{
  if(preferencesLoaded)try{localStorage.setItem("offplan-project-preferences",JSON.stringify(preferences))}catch{}
 },[preferencesLoaded,preferences]);

 const dialog=useRef<HTMLDialogElement>(null);
 const active=Boolean(detail||kind);
 useEffect(()=>{if(active){dialog.current?.showModal();document.body.style.overflow="hidden"}else{dialog.current?.close();document.body.style.overflow=""}return()=>{document.body.style.overflow=""}},[active]);
 const close=()=>{setDetail(null);setKind("")};
 const showSaved=()=>{close();enterSavedView()};
 const openForm=(kind:EnquiryKind,ids:number[]=[],message="")=>{
  setInitialMessage(message);
  setMenu(false);
  setRequestedIds(ids);
  setDetail(null);
  setKind(kind);
 };
 const save=(id:number)=>{
  const next=saved.includes(id)?saved.filter(item=>item!==id):[...saved,id];
  setSaved(next);
  try{localStorage.setItem("nieuw-saved",JSON.stringify(next))}catch{}
 };
 const show=(p:Project)=>{setKind("");setDetail(p);setTab("Overview")};const hero=projects[heroIds[slide]];
 const fromPrice=(p:Project)=>{const a=stock.filter(u=>u.project===projectCode(p.name)&&u.status==="Available");return a.length?Math.min(...a.map(u=>u.price)):p.price};

 const collection=projects.filter(p=>savedOnly?saved.includes(p.id):isResidential(p)===(catalogue==="homes"));
 const matches=collection.filter(p=>amenities.every(id=>p.amenities.includes(id))&&(rental==="All"||rentalStatus(p)===rental)&&(!bounds||containsPoint(bounds,areas[p.town].centre))&&searchArea(query,p.town,p.region,p.country)&&(country==="All"||p.country===country)&&(type==="All"||p.type===type)&&(budget==="All"||(fromPrice(p)??Infinity)<=Number(budget))).sort((a,b)=>(fromPrice(a)??Infinity)-(fromPrice(b)??Infinity));
 const requestedProjects=projects.filter(project=>requestedIds.includes(project.id))
  .map(project=>({id:project.id,name:project.name,preferences:preferences[project.id]||emptyPreferences}));
 const agencyPage=review?basePath+publicSite.agents[lang]:"#partner";
 const showCatalogue=(view:"homes"|"investments")=>{
  setCatalogue(view);
  setSavedOnly(false);
  setType("All");
  setLimit(6);
 };
 return <>
 <header className="siteHeader" onKeyDown={event=>{
  if(event.key==="Escape"&&menu){
   setMenu(false);
   menuButton.current?.focus();
  }
 }}>
  <Brand/>
  <nav id="site-navigation" aria-label={tr("Main navigation")} className={menu?"open":""}>
   <a href="#projekt" onClick={()=>setMenu(false)}>{tr("Developments")}</a>
   <a href={agencyPage} onClick={()=>setMenu(false)}>{tr("For estate agents")}</a>
   <a href="#om" onClick={()=>setMenu(false)}>{tr("About us")}</a>
   {!review&&<a href="/partners">{tr("Partner login")}</a>}
   <button type="button" className="savedMobile" onClick={showSaved}>{tr("Saved developments")}</button>
   <div className="mobileMenuTools">
    <BookingLink className="pill dark menuBooking"/>
    <label>{tr("Language")}
     <LanguageSelect/>
    </label>
    <button type="button" className="pill dark" onClick={()=>openForm("Buyer")}>{tr("Get in touch")}</button>
   </div>
  </nav>
  <div className="actions">
   <LanguageSelect className="languageSelect"/>
   <button type="button" className="saveNav" aria-label={tr("View saved developments")} onClick={showSaved}>
    <Bookmark size={18}/><span>{tr("Saved")}{saved.length?" ("+saved.length+")":""}</span>
   </button>
   <BookingLink className="pill dark headerBooking"/>
   <button ref={menuButton} type="button" className="mobile" aria-expanded={menu} aria-controls="site-navigation" onClick={()=>setMenu(open=>!open)}>
    <span>{menu?tr("Close"):tr("Menu")}</span>{menu?<X size={20}/>:<Menu size={20}/>}
   </button>
  </div>
 </header>
 <main><section className="hero" style={{backgroundImage:"linear-gradient(90deg,rgba(23,23,23,.68),rgba(28,28,28,.17) 78%),linear-gradient(0deg,rgba(26,26,26,.43),transparent 28%),url("+basePath+"project-images/"+hero.image+".webp)"}}>
 <div className="heroText">
  <small className="heroEyebrow" lang={lang}><i aria-hidden="true"/>{tr("New developments in Spain")}</small>
  <h1 className="holidayHeading" lang={lang}>
   <span>{tr("New dream holiday homes")}</span>{" "}
   <em>{tr("all over Europe")}</em>
  </h1>
  <p>{tr("Compare new homes on the Costa Blanca and in Valencia.")}</p>
   <a className="pill light" href="#projekt" onClick={()=>{if(catalogue!=="homes"||savedOnly)showCatalogue("homes")}}>{tr("Explore new homes")}</a>
 </div>
 <div className="heroFoot"><button className="location" onClick={()=>show(hero)}><MapPin size={16}/> {tr(hero.town)}, {tr(hero.region)} <span>{tr("· Developer supplied image")}</span></button><div className="slideControls"><span>0{slide+1} / 03</span><button aria-label={tr("Previous image")} onClick={()=>setSlide((slide+2)%3)}><ChevronLeft/></button><button aria-label={tr("Next image")} onClick={()=>setSlide((slide+1)%3)}><ChevronRight/></button></div></div></section>
 <section id="projekt" className="collection"><small className="eyeline">{tr("THE COLLECTION")}</small><div className="sectionHead"><h2>{savedOnly?tr("Saved developments"):catalogue==="investments"?tr("Investment projects"):tr("Our developments")}<span>.</span></h2><span className="muted">{matches.length} {tr("developments")}</span></div>
 <div className="catalogueViews" role="group" aria-label={tr("Catalogue view")}>
  <button type="button" aria-pressed={catalogue==="homes"&&!savedOnly} onClick={()=>showCatalogue("homes")}>{tr("New homes")}</button>
  <button type="button" aria-pressed={catalogue==="investments"&&!savedOnly} onClick={()=>showCatalogue("investments")}>{tr("Investments")}</button>
  {!savedOnly&&saved.length>0&&<button className="shortlistButton" type="button" onClick={showSaved}>
   <Bookmark size={15}/>{tr("View shortlist")} ({saved.length})
  </button>}
 </div>
 {savedOnly&&saved.length>0&&<div className="shortlistAction">
  <button className="pill dark" type="button" onClick={()=>openForm("Buyer",saved)}>
   {tr("Request information for saved projects")}
  </button>
 </div>}
 {catalogue==="investments"&&!savedOnly&&<p className="catalogueNote">{tr("Hotel investments, pre-launch investments and tourist apartments. Check the terms for personal use for each project.")} {review&&<a className="textlink" href={basePath+publicSite.investments[lang]}>{tr("Read the guide")}</a>}</p>}
 <div className="locationBar"><label className="locationSearch"><Search size={18}/><input aria-label={tr("Search locations")} type="search" placeholder={tr("Search a town, region or country")} value={query} onChange={e=>{setQuery(e.target.value);setLimit(6)}}/></label><label className="budgetChoice">{tr("My budget")}<select value={budget} onChange={e=>{setBudget(e.target.value);setLimit(6)}}><option value="All">{tr("Any price")}</option>{[350000,500000,750000].map(v=><option key={v} value={v}>{tr("Up to ")}{price(v)}</option>)}</select></label></div><div className="toolbar"><div className="chips">{["All","Spain","Portugal"].map(c=><button aria-pressed={country===c} className={country===c?"chip on":"chip"} key={c} onClick={()=>{setCountry(c);setLimit(6)}}>{tr(c==="All"?"All developments":c)}</button>)}</div><button className="filter" aria-expanded={filters} onClick={()=>setFilters(!filters)}><SlidersHorizontal size={16}/> {tr("Filter")}{type!=="All"||amenities.length||rental!=="All"?" •":""}</button></div>
 {filters&&<div className="filterPanel"><label>{tr("Property type")}<select value={type} onChange={e=>setType(e.target.value)}>{["All",...new Set(collection.map(p=>p.type))].map(v=><option value={v} key={v}>{tr(v)}</option>)}</select></label><fieldset className="amenityFilters"><legend>{tr("Home features")}</legend>{amenityOptions.map(option=><label key={option.id}><input type="checkbox" checked={amenities.includes(option.id)} onChange={e=>{setAmenities(current=>e.target.checked?[...current,option.id]:current.filter(id=>id!==option.id));setLimit(6)}}/>{tr(option.en)}</label>)}</fieldset><label>{tr("Rental use")}<select value={rental} onChange={e=>{setRental(e.target.value);setLimit(6)}}><option value="All">{tr("All projects")}</option><option value="confirmed">{tr("Rental use confirmed")}</option><option value="unconfirmed">{tr("Developer confirmation required")}</option></select></label><p className="fine filterNote">{tr("Features are described in the developer documents and may vary by unit. Rental and personal-use terms require confirmation.")}</p></div>}
 {savedOnly&&<button className="chip savedTag" onClick={()=>setSavedOnly(false)}>{tr("Saved developments")} <X size={14}/></button>}
 {(amenities.length>0||rental!=="All"||bounds||country!=="All"||type!=="All"||budget!=="All"||savedOnly||query)&&<div className="searchReset">{bounds&&<button className="chip" onClick={()=>setBounds(null)}>{tr("Clear selected area")} ×</button>}<button className="textlink" onClick={resetSearch}>{tr("Reset search")}</button></div>}
 <div className="mapHeading"><span>{tr("Search by map")}{bounds?" · "+tr("Area selected"):""}</span><button className="textlink" aria-expanded={mapOpen} onClick={()=>setMapOpen(!mapOpen)}>{tr(mapOpen?"Minimise":"Expand map")}</button></div>
 {mapOpen&&<LocationMap onClearArea={()=>setBounds(null)} bounds={bounds} onBounds={setBounds} fromPrice={fromPrice} matches={matches} onOpen={p=>{show(p);setTab("Area guide")}}/>}
 <div className="grid">{matches.slice(0,limit).map(p=><article key={p.id}><div className="photo"><button className="picture" onClick={()=>show(p)} aria-label={tr("View")+" "+p.name}><img src={basePath+"project-images/"+p.image+".webp"} loading="lazy" alt={tr("Developer image for")+" "+p.name}/></button><span className="tag">{tr(p.country)}</span><button className="bookmark" aria-label={tr(saved.includes(p.id)?"Unsave":"Save")+" "+p.name} aria-pressed={saved.includes(p.id)} onClick={()=>save(p.id)}><Bookmark size={17} fill={saved.includes(p.id)?"currentColor":"none"}/></button></div><div className="place"><MapPin size={14}/>{tr(p.town)} · {tr(p.region)}</div><div className="projectNamePrice"><button className="projectTitle" onClick={()=>show(p)}>{p.name}</button><strong>{fromPrice(p)===null?tr("Price on request"):tr("From")+" "+price(fromPrice(p)!)}{p.priceNote&&<span className="priceTaxNote">{tr(p.priceNote)}</span>}</strong></div><div className="facts cardFacts"><span><Building2 size={18}/>{tr(p.type)}</span><span><BedDouble size={18}/>{tr(p.bedrooms)}</span><span><Ruler size={18}/>{tr(p.area)}</span></div>{review&&<a className="textlink projectCardLink" href={basePath+projectPage(p.slug,lang)}>{tr("Project details")}</a>}</article>)}</div>
 {!matches.length&&<p>{savedOnly?tr("Save a project to add it to your shortlist."):tr("No developments match your selection.")} <button className="textlink" onClick={resetSearch}>{tr("View all developments")}</button></p>}
 {matches.length>limit&&<button className="pill more" onClick={()=>setLimit(12)}>{tr("Show more developments (")}{matches.length-limit})</button>}<p className="fine">{tr("Project information from developer documents, reviewed 25 November 2026. Request current prices and availability.")}</p></section>
 <section id="partner" className="partner">
  <div><small>{tr("FOR ESTATE AGENTS")}</small><h2>{tr("Meet the developers.")}</h2></div>
  <div>
   <p>{tr("We connect estate agents with developers behind selected Costa Blanca projects. We share the project information and make the introduction. You stay your client’s point of contact.")}</p>
   {review?<a className="pill light" href={agencyPage}>{tr("Work with us as an agent")}</a>:<button className="pill light" onClick={()=>openForm("Agency partner")}>{tr("Request an introduction")}</button>}
  </div>
 </section>
 <BuyerGuidance/>
 <BuyerFaq/>
 <section className="about updates"><div><small>{tr("PROJECT UPDATES")}</small><h2>{tr("The next release.")}</h2><p>{tr("Hear from us when a new development opens for sale.")}</p><button className="textlink" onClick={()=>openForm("Project updates")}>{tr("Sign up for updates")}</button></div></section></main>
 <footer><Brand/><a href={basePath+publicSite.guides.sv} lang="sv">Köparguide på svenska</a><a href={basePath+publicSite.guides.nl} lang="nl">Koopgids in het Nederlands</a>{review&&<a href={agencyPage}>{tr("For estate agents")}</a>}<a href="#faq">{tr("FAQ")}</a><button className="textlink" onClick={()=>openForm("Developer")}>{tr("For developers")}</button><span>© OffplanDevelopments</span></footer>
 <dialog className={detail?"caseDialog":undefined} ref={dialog} onCancel={close} onClick={e=>{if(e.target===dialog.current)close()}} aria-label={detail?.name} aria-labelledby={kind?"enquiry-title":undefined}><div className="modal"><button onClick={close} className="dismiss" aria-label={tr("Close")}><X/></button>{detail?<div className="caseScroll" key={detail.id} role="region" aria-label={detail.name} tabIndex={0}><img className="detailPhoto" src={basePath+"project-images/"+detail.image+".webp"} alt={tr("Developer supplied image")}/><div className="inside"><small>{tr("DEVELOPMENT ·")} {tr(detail.country).toUpperCase()}</small><h2>{detail.name}</h2><a className="textlink projectPageLink" href={basePath+projectPage(detail.slug,lang)}>{tr("Shareable project details")}</a><p><MapPin size={15}/> {tr(detail.town)} · {tr(detail.region)}</p><div className="facts"><span><Building2/>{tr(detail.type)}</span><span><BedDouble/>{tr(detail.bedrooms)}</span><span><Ruler/>{tr(detail.area)}</span></div><div className="tabs">{["Overview","Price list","Floor plan","Area guide"].map(t=><button key={t} aria-pressed={tab===t} onClick={()=>setTab(t)}>{tr(t)}</button>)}</div><SourceProjectContent project={detail} tab={tab} openAreaGuide={()=>setTab("Area guide")}/><ProjectEnquiry
    projectName={detail.name}
    preferences={preferences[detail.id]||emptyPreferences}
    saved={saved.includes(detail.id)}
    onChange={value=>setPreferences(current=>({...current,[detail.id]:value}))}
    onSave={()=>save(detail.id)}
    onViewSaved={showSaved}
    onContinue={()=>openForm("Buyer",[detail.id])}
   /></div></div>:kind&&<div className="inside formInside"><EnquiryForm review={review} key={kind+requestedIds.join(",")} kind={kind} projects={requestedProjects} initialMessage={initialMessage} onSuccess={()=>{setEnquirySent(true);pauseSearchHelp(90)}}/></div>}</div></dialog><WhatsAppLink/><SearchHelp projectOpen={Boolean(detail)} formOpen={Boolean(kind||menu)} completed={enquirySent||catalogue==="investments"} onRequest={choices=>{
   const area=query.trim()||(country==="All"?"":tr(country));
   const budgetText=budget==="All"?"":price(Number(budget));
   const chosenFeatures=amenityOptions.filter(option=>amenities.includes(option.id)).map(option=>tr(option.en));
   const lines=[
    tr("My home search"),
    tr("Area")+": "+area,
    tr("My budget")+": "+budgetText,
    tr("Preferred layout and features")+": "+choices.join(", "),
    tr("Home features")+": "+chosenFeatures.join(", "),
    tr("Rental use")+": "+tr(rental==="confirmed"?"Rental use confirmed":rental==="unconfirmed"?"Developer confirmation required":"All"),
    tr("Property type")+": "+tr(type),
    tr("Map area")+": "+(bounds?.join(", ")||tr("Any")),
   ];
   openForm("Buyer",saved,lines.join("\n"));
 }}/></>
}
