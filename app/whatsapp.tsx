import publicSite from "./public-site.json";
import {useLanguage} from "./language";

export function WhatsAppLink(){
 const {lang}=useLanguage();
 const contact=lang==="nl"?publicSite.team.potros:publicSite.team.amanda;
 return <a className="whatsappButton whatsappFloating" href={"https://wa.me/"+contact.number.slice(1)}
  target="_blank" rel="noopener noreferrer" aria-label={"WhatsApp "+contact.name}>
  <img src="./whatsapp.svg" alt="" width={21} height={21}/><span>WhatsApp</span>
 </a>;
}
