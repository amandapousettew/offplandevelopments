import publicSite from "./public-site.json";
import {useLanguage} from "./language";

export function WhatsAppLink(){
 const {lang,tr,basePath}=useLanguage();
 const contact=lang==="nl"?publicSite.team.potros:publicSite.team.amanda;
 return <a className="whatsappButton whatsappFloating" href={"https://wa.me/"+contact.number.slice(1)}
  target="_blank" rel="noopener noreferrer" aria-label={tr("Message us on WhatsApp")}>
  <img src={basePath+"whatsapp.svg"} alt="" width={21} height={21}/><span>WhatsApp</span>
 </a>;
}
