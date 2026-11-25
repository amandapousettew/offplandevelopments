"use client";
import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {Check,Plus,X} from "lucide-react";
import {useLanguage} from "./language";

const quietUntilKey = "offplan-search-help-quiet-until";
const interestDelay = 45000;

export function pauseSearchHelp(days:number) {
  try {
    localStorage.setItem(quietUntilKey,String(Date.now()+days*86400000));
  } catch { /* The component also suppresses the prompt for this visit. */ }
}

const wishes=[
  {en:"Sea view",image:"wishes/sea.jpg"},
  {en:"Balcony",image:"images/4.jpg"},
  {en:"Garden",image:"images/2.jpg"},
  {en:"Near the beach",image:"wishes/beach.jpg"},
  {en:"Swimming pool",image:"images/1.jpg"},
  {en:"Open-plan living",image:"images/9.jpg"}
];
type Props = {
  projectOpen:boolean;
  formOpen:boolean;
  completed:boolean;
  onRequest:(choices:string[])=>void;
};

export function SearchHelp({projectOpen,formOpen,completed,onRequest}:Props) {
  const {tr,basePath}=useLanguage();
  const [catalogueVisible,setCatalogueVisible]=useState(false);
  const [visibleTab,setVisibleTab]=useState(false);
  const [ready,setReady]=useState(false);
  const [dismissed,setDismissed]=useState(false);
  const [editing,setEditing]=useState(false);
  const [picked,setPicked]=useState<string[]>([]);
  const timeLeft=useRef(interestDelay);

  useEffect(()=>{
    const section=document.getElementById("projekt");
    if(!section)return;
    const observer=new IntersectionObserver(([entry])=>setCatalogueVisible(entry.isIntersecting));
    observer.observe(section);
    const visibility=()=>setVisibleTab(!document.hidden && document.hasFocus());
    const typing=()=>{
      const el=document.activeElement;
      setEditing(Boolean(el?.closest("input,textarea,select,.projectEnquiry details[open]")));
    };
    const storage=()=>{
      try{if(Number(localStorage.getItem(quietUntilKey))>Date.now())setDismissed(true)}catch{}
    };
    storage();visibility();
    const updateFocus=()=>queueMicrotask(typing);
    document.addEventListener("visibilitychange",visibility);
    window.addEventListener("focus",visibility);window.addEventListener("blur",visibility);
    window.addEventListener("storage",storage);
    document.addEventListener("focusin",updateFocus);document.addEventListener("focusout",updateFocus);
    document.addEventListener("toggle",typing,true);
    return ()=>{
      observer.disconnect();
      document.removeEventListener("visibilitychange",visibility);
      window.removeEventListener("focus",visibility);window.removeEventListener("blur",visibility);
      window.removeEventListener("storage",storage);
      document.removeEventListener("focusin",updateFocus);document.removeEventListener("focusout",updateFocus);
      document.removeEventListener("toggle",typing,true);
    };
  },[]);
  const eligible=(catalogueVisible||projectOpen)&&visibleTab&&!formOpen&&!completed&&!dismissed&&!editing;
  useEffect(()=>{
    if(!eligible||ready)return;
    const start=performance.now();
    const timer=setTimeout(()=>setReady(true),timeLeft.current);
    return ()=>{clearTimeout(timer);timeLeft.current=Math.max(0,timeLeft.current-(performance.now()-start))};
  },[eligible,ready]);
  if(!eligible||!ready)return null;
  const host=projectOpen?document.querySelector("dialog.caseDialog"):document.body;
  if(!host)return null;
  function dismiss(){setDismissed(true);pauseSearchHelp(7)}
  return createPortal(<aside className="searchHelp" aria-label={tr("Home search help")}>
    <button className="helpClose" onClick={dismiss} aria-label={tr("Dismiss")}><X size={17}/></button>
    <h3>{tr("Haven’t found the right home?")}</h3>
    <p>{tr("Pick what you’d love in your new home.")}</p>
    <div className="wishTiles">{wishes.map(w=>{
      const selected=picked.includes(w.en);
      return <button type="button" className="wishTile" key={w.en} aria-pressed={selected}
        onClick={()=>setPicked(previous=>previous.includes(w.en)?previous.filter(id=>id!==w.en):[...previous,w.en])}>
        <img src={basePath+w.image} alt=""/><span>{tr(w.en)}</span><i aria-hidden="true">{selected?<Check size={14}/>:<Plus size={14}/>}</i>
      </button>
    })}</div>
    <button className="pill dark" onClick={()=>{dismiss();onRequest(wishes.filter(w=>picked.includes(w.en)).map(w=>tr(w.en)))}}>{tr("Share my wish list")}{picked.length>0&&" ("+picked.length+")"}</button>
  </aside>,host);
}
