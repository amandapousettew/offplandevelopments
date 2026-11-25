import publicSite from './public-site.json';
import {useLanguage} from './language';

export function WhatsAppLink({floating=false, project}: {floating?:boolean; project?:string}) {
 const {lang}=useLanguage();
 const contact=lang==='nl'?publicSite.team.potros:publicSite.team.amanda;
 const message=project?(lang==='nl'?`Hoi, ik wil graag meer informatie over ${project}.`:`Hi, I'd like more information about ${project}.`):'';
 const href=`https://wa.me/${contact.number.slice(1)}${message?'?text='+encodeURIComponent(message):''}`;
 return <a className={`whatsappButton${floating?' whatsappFloating':''}`} href={href} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${contact.name}${project?' · '+project:''}`}>
  <img src="./whatsapp.svg" alt="" width={21} height={21}/><span>WhatsApp</span>
 </a>;
}
