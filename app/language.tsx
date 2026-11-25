"use client";
import {createContext,useContext,useState} from "react";
import {pageTitles,type Language} from "./lang";
import nl from "./nl.json";
import sv from "./sv.json";
const messages:Record<Language,Record<string,string>>={en:{},nl,sv};
export const translate=(language:Language,message:string)=>messages[language][message]??message;
const LanguageContext=createContext({lang:"en" as Language,basePath:"./",setLang:(_v:Language)=>{}});
export function LanguageProvider({initial,children,basePath="./",onLanguageChange}:{initial:Language;children:React.ReactNode;basePath?:string;onLanguageChange?:(value:Language)=>void}){
 const [lang,change]=useState(initial);
 function setLang(value:Language){
  change(value);document.documentElement.lang=value;
  document.cookie="nieuw-language="+value+"; Path=/; Max-Age=31536000; SameSite=Lax";
  document.title="OffplanDevelopments | "+pageTitles[value];
  onLanguageChange?.(value);
 }
 return <LanguageContext.Provider value={{lang,setLang,basePath}}>{children}</LanguageContext.Provider>
}
export function useLanguage(){
 const {lang,setLang,basePath}=useContext(LanguageContext);
 const tr=(value:string)=>translate(lang,value);
 const price=(n:number)=>new Intl.NumberFormat({en:"en-IE",nl:"nl-NL",sv:"sv-SE"}[lang],{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);
 return {lang,setLang,tr,price,basePath};
}
