import {cookies,headers} from "next/headers";
import {preferredLanguage} from "./lang";
export async function requestLanguage(){
 const [jar,head]=await Promise.all([cookies(),headers()]);
 return preferredLanguage(head.get("accept-language")||"",jar.get("nieuw-language")?.value);
}
