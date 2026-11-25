"use client";
import {CalendarDays} from "lucide-react";
import {useLanguage} from "./language";

export const bookingUrl="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1Q2EINx1HbSGunhwjTczn6OTwP7oy1f6p07WQ8Pd1XK2ziahPecO6d77jzmNhj3yZeFYCljdEP?gv=true";

export function BookingLink({className="pill dark"}:{className?:string}){
 const {lang}=useLanguage();
 return <a className={className} href={bookingUrl} target="_blank" rel="noopener noreferrer"><CalendarDays size={18}/>{lang==="nl"?"Boek een kennismakingsgesprek":"Book an exploration call"}</a>;
}
