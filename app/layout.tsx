import "leaflet/dist/leaflet.css";
import "./globals.css";
import {requestLanguage} from "./request-language";
export const dynamic="force-dynamic";
export async function generateMetadata(){
 const nl=await requestLanguage()==="nl";
 return {title:"OffplanDevelopments | "+(nl?"Nieuwbouw in Spanje en Portugal":"New developments in Spain and Portugal"),description:nl?"Ontdek geselecteerde nieuwbouwprojecten in Spanje en Portugal. Vergelijk prijzen, plattegronden en locaties.":"Explore selected new homes in Spain and Portugal. Compare developments, prices, floor plans and locations."}
}
export default async function Layout({children}:{children:React.ReactNode}){return <html lang={await requestLanguage()}><body>{children}</body></html>}
