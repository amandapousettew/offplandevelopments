import data from "./project-data.json";
export const projects=data.map(p=>({...p,amenities:p.amenities as string[]}));
export const money=(n:number)=>"€"+new Intl.NumberFormat("en-IE").format(n);
export const amenityOptions=[
 {id:"seaView",en:"Sea view"},
 {id:"balcony",en:"Balcony or terrace"},
 {id:"garden",en:"Garden"},
 {id:"pool",en:"Swimming pool"}
] as const;
export const rentalStatus=(project:(typeof projects)[number])=>project.rental;
export const isResidential=(project:(typeof projects)[number])=>project.category==="Residential development";
