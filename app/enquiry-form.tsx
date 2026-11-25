import {useState,type FormEvent} from "react";
import {languageNames} from "./lang";
import {useLanguage} from "./language";
import {preferenceLines,type ProjectPreferences} from "./project-enquiry";
import {recordEnquirySource} from "./enquiry-source.mjs";
import publicSite from "./public-site.json";

const languages=["English","Svenska","Nederlands","Português","Français"];
const titles={
 Buyer:"Talk to our team",
 "Agency partner":"Request a developer introduction",
 Developer:"Introduce a development",
 "Project updates":"Receive project updates",
} as const;

export type EnquiryKind=keyof typeof titles;

type ListedProject={id:number;name:string;preferences:ProjectPreferences};
type Props={
 kind:EnquiryKind;
 projects:ListedProject[];
 initialMessage:string;
 onSuccess:()=>void;
 review:boolean;
};

export function EnquiryForm({kind,projects,initialMessage,onSuccess,review}:Props){
 const {lang,tr}=useLanguage();
 const [state,setState]=useState<"idle"|"sending"|"ok"|"error">("idle");
 const [selected,setSelected]=useState(()=>projects.map(project=>project.id));
 const chosen=projects.filter(project=>selected.includes(project.id));
 const multiple=projects.length>1;
 const description={
  Buyer:tr("Tell us what you’re looking for and how we can help."),
  "Agency partner":tr("Tell us your buyer’s preferred area, budget, property type and timing. We share relevant project information and connect you with the developer."),
  Developer:tr("Tell us about your development, its location and your sales timeline."),
  "Project updates":tr("Register to hear about new releases and changes to our collection."),
 }[kind];

 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(state==="sending"||(projects.length&&!chosen.length))return;
  const values=new FormData(event.currentTarget);
  const project=chosen.map(item=>item.name).join(", ");
  const projectDetails=chosen.map(item=>[item.name,...preferenceLines(item.preferences,lang)].join("\n")).join("\n\n");
  const payload={
   name:values.get("name"),
   email:values.get("email"),
   language:values.get("language"),
   company:values.get("company")||"",
   phone:values.get("phone")||"",
   message:values.get("message")||"",
   project,
   project_details:projectDetails,
   kind,
   updates:values.has("updates"),
  };
  setState("sending");
  try{
   const response=await fetch(review?"https://formsubmit.co/ajax/"+publicSite.enquiryRecipient:"/api/inquiries",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(review?{
     ...payload,_subject:"OffplanDevelopments — "+(project?"Project enquiry":initialMessage?"Wish list / project enquiry":kind),
     _template:"table",source:recordEnquirySource(),source_page:location.pathname,
    }:payload),
   });
   const result=await response.json() as {success?:boolean|string;received?:boolean};
   const received=response.ok&&(review?result.success===true||result.success==="true":result.received===true);
   if(received)onSuccess();
   setState(received?"ok":"error");
  }catch{setState("error")}
 }

 const title=projects.length
  ?multiple?tr("Request project information"):tr("Information about ")+projects[0].name
  :tr(titles[kind]);

 return <>
  <small>{tr("GET IN TOUCH")}</small>
  <h2 id="enquiry-title">{title}</h2>
  {!projects.length&&<p>{description}</p>}
  {state==="ok"
   ?<p role="status" className="notice">{tr(kind==="Project updates"?"Thank you. Your subscription has been received.":"Thank you. Your enquiry has been received.")}</p>
   :<form onSubmit={submit}>
    {projects.length>0&&<fieldset className="enquirySelection">
     <legend>{tr("Projects in your enquiry")}</legend>
     {projects.map(item=>{
      const lines=preferenceLines(item.preferences,lang);
      return <div className="enquirySelectionItem" key={item.id}>
       {multiple?<label>
        <input type="checkbox" checked={selected.includes(item.id)} disabled={state==="sending"} onChange={event=>setSelected(event.target.checked?[...selected,item.id]:selected.filter(id=>id!==item.id))}/>
        <strong>{item.name}</strong>
       </label>:<strong>{item.name}</strong>}
       {lines.length>0&&<ul className="enquiryPreferences">{lines.map((line,index)=><li key={index}>{line}</li>)}</ul>}
      </div>;
     })}
    </fieldset>}
    <label>{tr("Name")}<input name="name" autoComplete="name" required maxLength={150}/></label>
    <label>{tr("Email")}<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
    <label>{tr("Phone (optional)")}<input name="phone" type="tel" autoComplete="tel" maxLength={40}/></label>
    {["Agency partner","Developer"].includes(kind)&&<label>{tr("Company")}<input required name="company" maxLength={200}/></label>}
    <label>{tr("Preferred contact language")}
     <select name="language" defaultValue={languageNames[lang]}>{languages.map(language=><option key={language}>{language}</option>)}</select>
    </label>
    {kind!=="Project updates"&&<>
     <label>{tr("Message")}<textarea name="message" defaultValue={initialMessage} rows={3} maxLength={2000}/></label>
     <label className="check"><input type="checkbox" name="updates"/>{tr("I would also like to receive project updates by email.")}</label>
    </>}
    <p className="fine">{tr(kind==="Project updates"?"OffplanDevelopments will use these details to handle your subscription.":"OffplanDevelopments will use these details to handle your enquiry.")}</p>
    {state==="error"&&<p role="alert">{tr("We couldn’t save your enquiry. Please try again.")}</p>}
    <button disabled={state==="sending"||(projects.length>0&&!chosen.length)} className="pill dark">
     {tr(state==="sending"?"Sending…":kind==="Project updates"?"Subscribe":"Send enquiry")}
    </button>
   </form>}
 </>;
}
