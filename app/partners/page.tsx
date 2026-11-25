import {getChatGPTUser,chatGPTSignInPath,chatGPTSignOutPath} from "../chatgpt-auth";
import {roleOf,workspace} from "../crm-server";
import {requestLanguage} from "../request-language";
import {Desk} from "./desk";
export const dynamic="force-dynamic";
export default async function Partners(){
 const user=await getChatGPTUser(),lang=await requestLanguage(),nl=lang==="nl";
 const role=user?await roleOf(user):null;
 return <main className="portal"><header><a className="brand" href="/"><img src="/offplandevelopments-logo.png" width={216} height={84} alt="OffplanDevelopments"/></a><a href="/">{nl?"Naar de catalogus":"Back to catalogue"}</a>{user&&<a target="_top" href={chatGPTSignOutPath("/partners")}>{nl?"Uitloggen":"Sign out"}</a>}</header>
 {user&&role?<Desk data={await workspace(user,role)} lang={lang} identity={user.email}/>:<section className="loginBox"><small>{nl?"PARTNEROMGEVING":"PARTNER WORKSPACE"}</small><h1>{nl?"Inloggen voor partners":"Partner sign-in"}</h1>{user?<><p>{nl?"Dit account heeft nog geen toegang. Vraag het team om dit e-mailadres toe te voegen.":"This account has no partner access yet. Ask the team to add this email address."}</p><strong>{user.email}</strong><p><a className="textlink" href="/#om">{nl?"Neem contact op":"Contact the team"}</a></p></>:<><p>{nl?"Log in met het e-mailadres dat bij OffplanDevelopments is geregistreerd om klanten aan te melden en de voorraad te bekijken.":"Use the account registered with OffplanDevelopments to submit buyer introductions and check inventory."}</p><a className="pill dark" target="_top" href={chatGPTSignInPath("/partners")}>{nl?"Inloggen met ChatGPT":"Sign in with ChatGPT"}</a></>}</section>}</main>
}
