import {createRoot} from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "../app/globals.css";
import Home from "../app/home";
import {LanguageProvider} from "../app/language";
import {preferredLanguage,isLanguage,pageTitles,type Language} from "../app/lang";
import type {Workspace} from "../app/crm-server";

const savedLanguage = document.cookie.match(/(?:^|; )nieuw-language=([^;]+)/)?.[1];
const page = document.documentElement;
const basePath = new URL(page.dataset.siteRoot || "./",location.href).pathname;
// Keep shared head assets at their original URLs when the language changes the path.
for(const link of document.head.querySelectorAll<HTMLLinkElement>('link[rel="icon"],link[rel="stylesheet"],link[rel="modulepreload"]')){
  link.setAttribute("href",link.href);
}
const requested = new URLSearchParams(location.search).get("lang");
const language = preferredLanguage(navigator.languages.join(","),isLanguage(requested)?requested:page.lang==="sv"?"sv":savedLanguage);
const descriptions={
  en:"Compare new-build homes in Spain, including Costa Blanca and Valencia. Browse project facts and find developer introductions for Dutch and Swedish estate agents.",
  sv:"Hitta en nybyggd semesterbostad i Spanien. Jämför projekt på Costa Blanca och i Valencia, se planritningar och be om aktuella priser på svenska.",
  nl:"Vergelijk nieuwbouwwoningen aan de Costa Blanca en in Valencia. Bekijk plattegronden en vraag naar de actuele prijs en beschikbaarheid.",
};
function displayLanguage(lang:Language,explicit=true){
  page.lang=lang;
  document.title="OffplanDevelopments | "+pageTitles[lang];
  document.querySelector('meta[name="description"]')?.setAttribute("content",descriptions[lang]);
  const url=new URL(location.href);
  url.pathname=basePath+(lang==="sv"?"sv/":"");
  if(lang!=="sv"&&explicit)url.searchParams.set("lang",lang);
  else url.searchParams.delete("lang");
  if(url.href!==location.href)history.replaceState(history.state,"",url);
  const canonical=document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if(canonical)canonical.href=new URL(url.pathname,canonical.href).href;
}
displayLanguage(language,isLanguage(requested));
const stock:Workspace["stock"] = [];
createRoot(document.getElementById("root")!).render(
  <LanguageProvider initial={language} basePath={basePath} onLanguageChange={displayLanguage}><Home stock={stock} review /></LanguageProvider>
);
