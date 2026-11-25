"use client";
import {createContext,useContext,useState} from "react";
import type {Language} from "./lang";
import nl from "./nl.json";
const words:Record<string,string>=nl;
const LanguageContext=createContext({lang:"en" as Language,setLang:(_v:Language)=>{}});
export function LanguageProvider({initial,children}:{initial:Language;children:React.ReactNode}){
 const [lang,change]=useState(initial);
 function setLang(value:Language){
  change(value);document.documentElement.lang=value;
  document.cookie="nieuw-language="+value+"; Path=/; Max-Age=31536000; SameSite=Lax";
  document.title="OffplanDevelopments | "+(value==="nl"?"Nieuwbouw in Spanje en Portugal":"New developments in Spain and Portugal");
 }
 return <LanguageContext.Provider value={{lang,setLang}}>{children}</LanguageContext.Provider>
}
export function useLanguage(){
 const {lang,setLang}=useContext(LanguageContext);
 const tr=(value:string)=>lang==="nl"?(words[value]??value):value;
 const price=(n:number)=>new Intl.NumberFormat(lang==="nl"?"nl-NL":"en-IE",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);
 return {lang,setLang,tr,price};
}
