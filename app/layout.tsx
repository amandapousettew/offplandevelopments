import "leaflet/dist/leaflet.css";
import "./globals.css";
import {requestLanguage} from "./request-language";
import {pageTitles} from "./lang";
export const dynamic="force-dynamic";
export async function generateMetadata(){
 const lang=await requestLanguage();
 const descriptions={en:"Explore selected new homes in Spain and Portugal. Compare developments, prices, floor plans and locations.",nl:"Ontdek geselecteerde nieuwbouwprojecten in Spanje en Portugal. Vergelijk prijzen, plattegronden en locaties.",sv:"Upptäck nybyggda bostäder på Costa Blanca och i Valencia. Jämför projekt, priser, planritningar och lägen."};
 return {title:"OffplanDevelopments | "+pageTitles[lang],description:descriptions[lang]};
}
export default async function Layout({children}:{children:React.ReactNode}){return <html lang={await requestLanguage()}><body>{children}</body></html>}
