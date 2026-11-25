import data from "./project-data.json";
export const projects=data.map(p=>({...p,amenities:p.amenities as string[]}));
export const money=(n:number)=>"€"+new Intl.NumberFormat("en-IE").format(n);
export const amenityOptions=[
 {id:"seaView",en:"Sea view",nl:"Zeezicht"},
 {id:"balcony",en:"Balcony or terrace",nl:"Balkon of terras"},
 {id:"garden",en:"Garden",nl:"Tuin"},
 {id:"pool",en:"Swimming pool",nl:"Zwembad"}
] as const;
export const rentalStatus=(project:(typeof projects)[number])=>project.rental;
