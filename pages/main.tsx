import {createRoot} from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "../app/globals.css";
import Home from "../app/home";
import {LanguageProvider} from "../app/language";
import {preferredLanguage} from "../app/lang";
import {units} from "../app/units";

const savedLanguage = document.cookie.match(/(?:^|; )nieuw-language=([^;]+)/)?.[1];
const language = preferredLanguage(navigator.languages.join(","), savedLanguage);
document.documentElement.lang = language;
const stock = units.map(unit => ({...unit, illustrative: true, importDate: null}));
createRoot(document.getElementById("root")!).render(
  <LanguageProvider initial={language}><Home stock={stock} review /></LanguageProvider>
);
