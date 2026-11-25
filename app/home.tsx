"use client";
import {useState,useRef,useEffect} from "react";
import {Bookmark, MapPin, SlidersHorizontal, X, Menu, ChevronLeft, ChevronRight, Building2, Ruler, BedDouble} from "lucide-react";
import {projectCode} from "./units";
import type {Workspace} from "./crm-server";
import {SearchHelp,pauseSearchHelp} from "./search-help";
import {ProjectEnquiry} from "./project-enquiry";
import {SourceProjectContent} from "./source-project-content";
import {BuyerFaq} from "./buyer-faq";
import {BuyerGuidance} from "./buyer-guidance";
import {BookingLink} from "./booking";
import {TeamContacts} from "./team-contacts";
import {AreaGuide} from "./area-guide";
import {LocationMap} from "./location-map";
import {containsPoint,validBounds,type SearchBounds} from "./search-bounds";
import {areas,searchArea} from "./areas";
import {Search} from "lucide-react";
import {useLanguage} from "./language";
import {projects,amenityOptions,isResidential,rentalStatus} from "./catalog";
import publicSite from "./public-site.json";
import {recordEnquirySource} from "./enquiry-source.mjs";
import {WhatsAppLink} from "./whatsapp";
type Project=(typeof projects)[number];
const languages=["English","Svenska","Nederlands","Português","Français"];
const heroIds=[7,8,4];
const titles:Record<string,string>={"Buyer":"Talk to our team","Agency partner":"Request a developer introduction","Developer":"Introduce a development","Project updates":"Receive project updates"};
function projectPage(slug:string,lang:"en"|"nl"){
 return lang==="nl"&&publicSite.localizedProjects.includes(slug)?`./nl/projecten/${slug}/`:`./projects/${slug}/`;
}
function Brand(){return <a className="brand" href="#" aria-label="OffplanDevelopments, home"><img src="./offplandevelopments-logo.svg" width={470} height={130} alt="OffplanDevelopments"/></a>}
function Form({kind,project,initialMessage,onSuccess,review}:{review?:boolean,kind:string,project:string,initialMessage:string,onSuccess:()=>void}){
 const {tr,lang}=useLanguage();
 const [state,set]=useState("idle");

 return <><small>{tr("GET IN TOUCH")}</small><h2>{(kind==="Agency partner"&&lang==="nl"?"Vraag een introductie bij de ontwikkelaar aan":tr(titles[kind]))}</h2><p>{project&&kind==="Buyer"?tr("You’re enquiring about")+" "+project+".":tr(kind==="Agency partner"?"Tell us your buyer’s preferred area, budget, property type and timing. We share relevant project information and connect you with the developer.":kind==="Developer"?"Tell us about your development, its location and your sales timeline.":kind==="Project updates"?"Register to hear about new releases and changes to our collection.":"Tell us what you’re looking for and how we can help.")}</p>{kind==="Buyer"&&<TeamContacts/>}{state==="ok"?<p role="status" className="notice">{tr("Thank you. Your")} {tr(kind==="Project updates"?"subscription":"enquiry")} {tr("has been received.")}</p>:<form onSubmit={async e=>{e.preventDefault();if(state==="sending")return;const f=new FormData(e.currentTarget);set("sending");try{const r=await fetch(review ? "https://formsubmit.co/ajax/"+publicSite.enquiryRecipient : "/api/inquiries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_subject:"OffplanDevelopments — "+(initialMessage?"Wish list / project enquiry":kind),_template:"table",name:f.get("name"),email:f.get("email"),language:f.get("language"),company:f.get("company")||"",phone:f.get("phone")||"",message:f.get("message")||"",project,kind,updates:f.has("updates"),...(review?{source:recordEnquirySource(),source_page:location.pathname}:{})})});const result=await r.json() as {success?:boolean|string;received?:boolean};const received=r.ok&&(review?result.success===true||result.success==="true":result.received===true);if(received)onSuccess();set(received?"ok":"error")}catch{set("error")}}}>
 <label>{tr("Name")}<input name="name" autoComplete="name" required maxLength={150}/></label><label>{tr("Email")}<input name="email" type="email" autoComplete="email" required maxLength={254}/></label><label>{lang==="nl"?"Telefoon (optioneel)":"Phone (optional)"}<input name="phone" type="tel" autoComplete="tel" maxLength={40}/></label>{["Agency partner","Developer"].includes(kind)&&<label>{tr("Company")}<input required name="company" maxLength={200}/></label>}<label>{tr("Preferred contact language")}<select name="language" defaultValue={lang==="nl"?"Nederlands":"English"}>{languages.map(l=><option key={l}>{l}</option>)}</select></label>{kind!=="Project updates"&&<><label>{tr("Message")}<textarea name="message" defaultValue={initialMessage} rows={3} maxLength={2000}/></label><label className="check"><input type="checkbox" name="updates"/>{tr("I would also like to receive project updates by email.")}</label></>}<p className="fine">{tr("OffplanDevelopments will use these details to handle your")} {tr(kind==="Project updates"?"subscription":"enquiry")}.</p>{state==="error"&&<p role="alert">{tr("We couldn’t save your enquiry. Please try again.")}</p>}<button disabled={state==="sending"} className="pill dark">{tr(state==="sending"?"Sending…":kind==="Project updates"?"Subscribe":"Send enquiry")}</button></form>}</>
}
export default function Home({stock,review=false}:{stock:Workspace["stock"];review?:boolean}){
 const {tr,lang,setLang,price}=useLanguage();
 const [country,setCountry]=useState("All"),[limit,setLimit]=useState(6),[slide,setSlide]=useState(0),[filters,setFilters]=useState(false),[type,setType]=useState("All"),[budget,setBudget]=useState("All"),[savedOnly,setSavedOnly]=useState(false),[saved,setSaved]=useState<number[]>([]),[menu,setMenu]=useState(false),[detail,setDetail]=useState<Project|null>(null),[kind,setKind]=useState(""),[selected,setSelected]=useState(""),[tab,setTab]=useState("Overview");
 const [amenities,setAmenities]=useState<string[]>([]);
 const [catalogue,setCatalogue]=useState<"homes"|"investments">("homes");
 const [rental,setRental]=useState("All");
 const [enquirySent,setEnquirySent]=useState(false);
 const [initialMessage,setInitialMessage]=useState("");
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
 useEffect(()=>{
  const params=new URLSearchParams(window.location.search);
  const slug=params.get("project");
  if(params.get("enquiry")==="developer")setKind("Developer");
  if(params.get("catalogue")==="investments"){
   setCatalogue("investments");
   setSavedOnly(false);
   setType("All");
  }
  const project=projects.find(p=>p.slug===slug);
  if(project){setDetail(project);setTab("Overview")}
 },[]);
 const dialog=useRef<HTMLDialogElement>(null);const active=Boolean(detail||kind);
 useEffect(()=>{try{const ids=JSON.parse(localStorage.getItem("nieuw-saved")||"[]");if(Array.isArray(ids))setSaved(ids.filter(id=>Number.isInteger(id)&&projects.some(p=>p.id===id)))}catch{}},[]);
 useEffect(()=>{if(active){dialog.current?.showModal();document.body.style.overflow="hidden"}else{dialog.current?.close();document.body.style.overflow=""}return()=>{document.body.style.overflow=""}},[active]);
 const showSaved=()=>{setAmenities([]);setRental("All");setMenu(false);setBounds(null);setQuery("");setSavedOnly(true);setCountry("All");setBudget("All");setType("All");document.getElementById("projekt")?.scrollIntoView()};
 const close=()=>{setDetail(null);setKind("")};const openForm=(k:string,p="",message="")=>{setInitialMessage(message);setMenu(false);setSelected(p);setDetail(null);setKind(k)};
 const save=(id:number)=>{const a=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];setSaved(a);try{localStorage.setItem("nieuw-saved",JSON.stringify(a))}catch{}};
 const show=(p:Project)=>{setKind("");setDetail(p);setTab("Overview")};const hero=projects[heroIds[slide]];
 const fromPrice=(p:Project)=>{const a=stock.filter(u=>u.project===projectCode(p.name)&&u.status==="Available");return a.length?Math.min(...a.map(u=>u.price)):p.price};

 const collection=projects.filter(p=>savedOnly?saved.includes(p.id):isResidential(p)===(catalogue==="homes"));
 const matches=collection.filter(p=>amenities.every(id=>p.amenities.includes(id))&&(rental==="All"||rentalStatus(p)===rental)&&(!bounds||containsPoint(bounds,areas[p.town].centre))&&searchArea(query,p.town,p.region,p.country)&&(country==="All"||p.country===country)&&(type==="All"||p.type===type)&&(budget==="All"||(fromPrice(p)??Infinity)<=Number(budget))).sort((a,b)=>(fromPrice(a)??Infinity)-(fromPrice(b)??Infinity));
 const agencyPage=review?"./"+publicSite.agents[lang]:"#partner";
 const showCatalogue=(view:"homes"|"investments")=>{
  setCatalogue(view);
  setSavedOnly(false);
  setType("All");
  setLimit(6);
 };
 return <><header><Brand/><nav aria-label={lang==="nl"?"Hoofdnavigatie":"Main navigation"} className={menu?"open":""}><a href="#projekt" onClick={()=>setMenu(false)}>{tr("Developments")}</a><a href={agencyPage} onClick={()=>setMenu(false)}>{lang==="nl"?"Voor makelaars":"For estate agents"}</a><a href="#om" onClick={()=>setMenu(false)}>{tr("About us")}</a>{!review&&<a href="/partners">{lang==="nl"?"Partnerlogin":"Partner login"}</a>}<button className="savedMobile" onClick={showSaved}>{tr("Saved developments")}</button><div className="mobileMenuTools"><BookingLink/><label>{lang==="nl"?"Taal":"Language"}<select aria-label="Menu language" value={lang} onChange={e=>setLang(e.target.value==="nl"?"nl":"en")}><option value="en">English</option><option value="nl">Nederlands</option></select></label><button className="pill dark" onClick={()=>openForm("Buyer")}>{tr("Get in touch")}</button></div></nav><div className="actions"><select className="languageSelect" aria-label="Language / Taal" value={lang} onChange={e=>setLang(e.target.value==="nl"?"nl":"en")}><option value="en" lang="en">English</option><option value="nl" lang="nl">Nederlands</option></select><button className="saveNav" aria-label={tr("View saved developments")} onClick={showSaved}><Bookmark size={18}/><span>{tr("Saved")}{saved.length?" ("+saved.length+")":""}</span></button><BookingLink/><button aria-label={tr("Menu")} aria-expanded={menu} className="mobile" onClick={()=>setMenu(!menu)}><span>{menu?(lang==="nl"?"Sluiten":"Close"):"Menu"}</span>{menu?<X size={20}/>:<Menu size={20}/>}</button></div></header>
 <main><section className="hero" style={{backgroundImage:"linear-gradient(90deg,rgba(23,23,23,.68),rgba(28,28,28,.17) 78%),linear-gradient(0deg,rgba(26,26,26,.43),transparent 28%),url(./project-images/"+hero.image+".webp)"}}>
 <div className="heroText">
  <small className="heroEyebrow" lang={lang}><i aria-hidden="true"/>{lang==="nl"?"Nieuwbouw in Spanje":"New developments in Spain"}</small>
  <h1 className="holidayHeading" lang={lang}>
   <span>{lang==="nl"?"Nieuwe droom­vakantiehuizen":"New dream holiday homes"}</span>{" "}
   <em>{lang==="nl"?"in heel Europa":"all over Europe"}</em>
  </h1>
  <p>{lang==="nl"?"Vergelijk nieuwbouwwoningen aan de Costa Blanca en in Valencia.":"Compare new homes on the Costa Blanca and in Valencia."}</p>
  <div className="heroLinks">
   <a className="pill light" href="#projekt" onClick={()=>{if(catalogue!=="homes"||savedOnly)showCatalogue("homes")}}>{lang==="nl"?"Bekijk nieuwbouw":"Explore new homes"}</a>
   <a className="heroAgentLink" href={agencyPage}>{lang==="nl"?"Voor makelaars":"For estate agents"}</a>
  </div>
 </div>
 <div className="heroFoot"><button className="location" onClick={()=>show(hero)}><MapPin size={16}/> {tr(hero.town)}, {tr(hero.region)} <span>{lang==="nl"?"· Beeld van ontwikkelaar":"· Developer supplied image"}</span></button><div className="slideControls"><span>0{slide+1} / 03</span><button aria-label={tr("Previous image")} onClick={()=>setSlide((slide+2)%3)}><ChevronLeft/></button><button aria-label={tr("Next image")} onClick={()=>setSlide((slide+1)%3)}><ChevronRight/></button></div></div></section>
 <section id="projekt" className="collection"><small className="eyeline">{tr("THE COLLECTION")}</small><div className="sectionHead"><h2>{catalogue==="investments"&&!savedOnly?(lang==="nl"?"Vastgoedinvesteringen":"Investment projects"):tr("Our developments")}<span>.</span></h2><span className="muted">{matches.length} {lang==="nl"?"projecten":"developments"}</span></div>
 <div className="catalogueViews" role="group" aria-label={lang==="nl"?"Soort aanbod":"Catalogue view"}>
  <button type="button" aria-pressed={catalogue==="homes"&&!savedOnly} onClick={()=>showCatalogue("homes")}>{lang==="nl"?"Nieuwbouwwoningen":"New homes"}</button>
  <button type="button" aria-pressed={catalogue==="investments"&&!savedOnly} onClick={()=>showCatalogue("investments")}>{lang==="nl"?"Investeringen":"Investments"}</button>
 </div>
 {catalogue==="investments"&&!savedOnly&&<p className="catalogueNote">{lang==="nl"?"Hotelinvesteringen, projecten in de voorverkoop en toeristische appartementen. Controleer de voorwaarden voor eigen gebruik per project.":"Hotel investments, pre-launch investments and tourist apartments. Check the terms for personal use for each project."} {review&&<a className="textlink" href={"./"+publicSite.investments[lang]}>{lang==="nl"?"Bekijk de gids":"Read the guide"}</a>}</p>}
 <div className="locationBar"><label className="locationSearch"><Search size={18}/><input aria-label={tr("Search locations")} type="search" placeholder={tr("Search a town, region or country")} value={query} onChange={e=>{setQuery(e.target.value);setLimit(6)}}/></label><label className="budgetChoice">{lang==="nl"?"Mijn budget":"My budget"}<select value={budget} onChange={e=>{setBudget(e.target.value);setLimit(6)}}><option value="All">{lang==="nl"?"Alle prijzen":"Any price"}</option>{[350000,500000,750000].map(v=><option key={v} value={v}>{lang==="nl"?"Tot ":"Up to "}{price(v)}</option>)}</select></label></div><div className="toolbar"><div className="chips">{["All","Spain","Portugal"].map(c=><button aria-pressed={country===c} className={country===c?"chip on":"chip"} key={c} onClick={()=>{setCountry(c);setLimit(6)}}>{tr(c==="All"?"All developments":c)}</button>)}</div><button className="filter" aria-expanded={filters} onClick={()=>setFilters(!filters)}><SlidersHorizontal size={16}/> {tr("Filter")}{type!=="All"||amenities.length||rental!=="All"?" •":""}</button></div>
 {filters&&<div className="filterPanel"><label>{tr("Property type")}<select value={type} onChange={e=>setType(e.target.value)}>{["All",...new Set(collection.map(p=>p.type))].map(v=><option value={v} key={v}>{tr(v)}</option>)}</select></label><fieldset className="amenityFilters"><legend>{lang==="nl"?"Woningkenmerken":"Home features"}</legend>{amenityOptions.map(option=><label key={option.id}><input type="checkbox" checked={amenities.includes(option.id)} onChange={e=>{setAmenities(current=>e.target.checked?[...current,option.id]:current.filter(id=>id!==option.id));setLimit(6)}}/>{lang==="nl"?option.nl:option.en}</label>)}</fieldset><label>{lang==="nl"?"Verhuurstatus":"Rental use"}<select value={rental} onChange={e=>{setRental(e.target.value);setLimit(6)}}><option value="All">{lang==="nl"?"Alle projecten":"All projects"}</option><option value="confirmed">{lang==="nl"?"Verhuur bevestigd":"Rental use confirmed"}</option><option value="unconfirmed">{lang==="nl"?"Bevestiging nodig":"Developer confirmation required"}</option></select></label><p className="fine filterNote">{lang==="nl"?"Kenmerken zijn gebaseerd op de voorbeeldbeschrijvingen. Verhuurtoestemming moet nog per project worden bevestigd.":"Features are described in the developer documents and may vary by unit. Rental and personal-use terms require confirmation."}</p></div>}
 {savedOnly&&<button className="chip savedTag" onClick={()=>setSavedOnly(false)}>{tr("Saved developments")} <X size={14}/></button>}
 {(amenities.length>0||rental!=="All"||bounds||country!=="All"||type!=="All"||budget!=="All"||savedOnly||query)&&<div className="searchReset">{bounds&&<button className="chip" onClick={()=>setBounds(null)}>{lang==="nl"?"Zoekgebied verwijderen":"Clear selected area"} ×</button>}<button className="textlink" onClick={resetSearch}>{lang==="nl"?"Zoekfilters wissen":"Reset search"}</button></div>}
 <div className="mapHeading"><span>{lang==="nl"?"Zoeken op de kaart":"Search by map"}{bounds?" · "+(lang==="nl"?"Gebied geselecteerd":"Area selected"):""}</span><button className="textlink" aria-expanded={mapOpen} onClick={()=>setMapOpen(!mapOpen)}>{lang==="nl"?(mapOpen?"Minimaliseren":"Kaart openen"):(mapOpen?"Minimise":"Expand map")}</button></div>
 {mapOpen&&<LocationMap onClearArea={()=>setBounds(null)} bounds={bounds} onBounds={setBounds} fromPrice={fromPrice} matches={matches} onOpen={p=>{show(p);setTab("Area guide")}}/>}
 <div className="grid">{matches.slice(0,limit).map(p=><article key={p.id}><div className="photo"><button className="picture" onClick={()=>show(p)} aria-label={tr("View")+" "+p.name}><img src={"./project-images/"+p.image+".webp"} loading="lazy" alt={lang==="nl"?"Visualisatie":"Developer image for"+" "+p.name}/></button><span className="tag">{tr(p.country)}</span><button className="bookmark" aria-label={tr(saved.includes(p.id)?"Unsave":"Save")+" "+p.name} aria-pressed={saved.includes(p.id)} onClick={()=>save(p.id)}><Bookmark size={17} fill={saved.includes(p.id)?"currentColor":"none"}/></button></div><div className="place"><MapPin size={14}/>{tr(p.town)} · {tr(p.region)}</div><div className="projectNamePrice"><button className="projectTitle" onClick={()=>show(p)}>{p.name}</button><strong>{fromPrice(p)===null?(lang==="nl"?"Prijs op aanvraag":"Price on request"):tr("From")+" "+price(fromPrice(p)!)}{p.priceNote&&<span className="priceTaxNote">{p.priceNote}</span>}</strong></div><div className="facts cardFacts"><span><Building2 size={18}/>{tr(p.type)}</span><span><BedDouble size={18}/>{p.bedrooms}</span><span><Ruler size={18}/>{p.area}</span></div>{review&&<a className="textlink projectCardLink" href={projectPage(p.slug,lang)}>{lang==="nl"?"Projectinformatie":"Project details"}</a>}</article>)}</div>
 {!matches.length&&<p>{tr("No developments match your selection.")} <button className="textlink" onClick={resetSearch}>{tr("View all developments")}</button></p>}
 {matches.length>limit&&<button className="pill more" onClick={()=>setLimit(12)}>{tr("Show more developments (")}{matches.length-limit})</button>}<p className="fine">{lang==="nl"?"Projectinformatie uit ontwikkelaarsdocumenten, gecontroleerd op 25 november 2026. Vraag naar de actuele prijs en beschikbaarheid.":"Project information from developer documents, reviewed 25 November 2026. Request current prices and availability."}</p></section>
 <BuyerGuidance/>
 <section id="partner" className="partner">
  <div><small>{lang==="nl"?"VOOR MAKELAARS":"FOR ESTATE AGENTS"}</small><h2>{lang==="nl"?"Maak kennis met de ontwikkelaars.":"Meet the developers."}</h2></div>
  <div>
   <p>{lang==="nl"?"We brengen makelaars in contact met ontwikkelaars van geselecteerde nieuwbouwprojecten aan de Costa Blanca. Wij delen de projectinformatie en regelen de introductie. Jij blijft het aanspreekpunt van je klant.":"We connect estate agents with developers behind selected Costa Blanca projects. We share the project information and make the introduction. You stay your client’s point of contact."}</p>
   {review?<a className="pill light" href={agencyPage}>{lang==="nl"?"Samenwerken als makelaar":"Work with us as an agent"}</a>:<button className="pill light" onClick={()=>openForm("Agency partner")}>{lang==="nl"?"Vraag een introductie aan":"Request an introduction"}</button>}
  </div>
 </section>
 <BuyerFaq/>
 <section className="about updates"><div><small>{tr("PROJECT UPDATES")}</small><h2>{tr("The next release.")}</h2><p>{tr("Hear from us when a new development opens for sale.")}</p><button className="textlink" onClick={()=>openForm("Project updates")}>{tr("Sign up for updates")}</button></div></section></main>
 <footer><Brand/><a href={"./"+publicSite.guides.sv} lang="sv">Köparguide på svenska</a><a href={"./"+publicSite.guides.nl} lang="nl">Koopgids in het Nederlands</a>{review&&<a href={agencyPage}>{lang==="nl"?"Voor makelaars":"For estate agents"}</a>}<a href="#faq">FAQ</a><button className="textlink" onClick={()=>openForm("Developer")}>{tr("For developers")}</button><span>© OffplanDevelopments</span></footer>
 <dialog className={detail?"caseDialog":undefined} ref={dialog} onCancel={close} onClick={e=>{if(e.target===dialog.current)close()}} aria-label={detail?.name||tr(titles[kind]||"")}><div className="modal"><button onClick={close} className="dismiss" aria-label={tr("Close")}><X/></button>{detail?<div className="caseScroll" key={detail.id} role="region" aria-label={detail.name} tabIndex={0}><img className="detailPhoto" src={"./project-images/"+detail.image+".webp"} alt={lang==="nl"?"Beeld van ontwikkelaar":"Developer supplied image"}/><div className="inside"><small>{lang==="nl"?"PROJECT ·":"DEVELOPMENT ·"} {tr(detail.country).toUpperCase()}</small><h2>{detail.name}</h2><div className="projectContactLinks"><a className="textlink projectPageLink" href={projectPage(detail.slug,lang)}>{lang==="nl"?"Projectinformatie delen":"Shareable project details"}</a><WhatsAppLink project={detail.name}/></div><p><MapPin size={15}/> {tr(detail.town)} · {tr(detail.region)}</p><div className="facts"><span><Building2/>{tr(detail.type)}</span><span><BedDouble/>{detail.bedrooms}</span><span><Ruler/>{detail.area}</span></div><div className="tabs">{["Overview","Price list","Floor plan","Area guide"].map(t=><button key={t} aria-pressed={tab===t} onClick={()=>setTab(t)}>{tr(t)}</button>)}</div><SourceProjectContent project={detail} tab={tab} openAreaGuide={()=>setTab("Area guide")}/><ProjectEnquiry onContinue={message=>openForm("Buyer",detail.name,message)}/></div></div>:kind&&<div className="inside formInside"><Form review={review} key={kind+selected} kind={kind} project={selected} initialMessage={initialMessage} onSuccess={()=>{setEnquirySent(true);pauseSearchHelp(90)}}/></div>}</div></dialog>{!active&&<WhatsAppLink floating/>}<SearchHelp projectOpen={Boolean(detail)} formOpen={Boolean(kind||menu)} completed={enquirySent||catalogue==="investments"} onRequest={choices=>{
   const area=query.trim()||(country==="All"?"":tr(country));
   const budgetText=budget==="All"?"":price(Number(budget));
   const savedProjects=projects.filter(p=>saved.includes(p.id)).map(p=>projectCode(p.name)+" "+p.name).join(", ");
   const searchDetails="\nFeatures: "+amenities.map(id=>amenityOptions.find(o=>o.id===id)!.en).join(", ")+"\nRental status preference: "+rental+"\nProperty type: "+type+"\nSaved developments: "+(savedProjects||"None")+"\nMap area: "+(bounds?.join(", ")||"Any");
   const lines=lang==="nl"?["Mijn woonwensen","Regio: "+area,"Budget: "+budgetText,"Gewenste indeling en voorzieningen: "+choices.join(", ")]:["My home search","Area: "+area,"Budget: "+budgetText,"Preferred layout and features: "+choices.join(", ")];
   openForm("Buyer","",lines.join("\n")+searchDetails);
 }}/></>
}
