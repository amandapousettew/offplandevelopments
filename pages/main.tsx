import {createRoot} from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "../app/globals.css";
import Home from "../app/home";
import {LanguageProvider} from "../app/language";
import {preferredLanguage} from "../app/lang";
import type {Workspace} from "../app/crm-server";

const savedLanguage = document.cookie.match(/(?:^|; )nieuw-language=([^;]+)/)?.[1];
const language = preferredLanguage(navigator.languages.join(","),new URLSearchParams(location.search).get("lang")||savedLanguage);
document.documentElement.lang = language;
const stock:Workspace["stock"] = [];
createRoot(document.getElementById("root")!).render(
  <LanguageProvider initial={language}><Home stock={stock} review /></LanguageProvider>
);
