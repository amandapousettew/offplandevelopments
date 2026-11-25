import {inventory} from "./crm-server";
import Home from "./home";
import {requestLanguage} from "./request-language";
import {LanguageProvider} from "./language";
export const dynamic="force-dynamic";
export default async function Page(){return <LanguageProvider initial={await requestLanguage()}><Home stock={await inventory()}/></LanguageProvider>}
