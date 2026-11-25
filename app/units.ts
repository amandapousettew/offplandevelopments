import {projects} from "./catalog";
// Permanent public references. Keep these assignments when catalogue ordering changes.
const references:Record<string,string>={
 "Casa del Mar":"NE-001","Pátio da Luz":"NE-002","Villas de la Cala":"NE-003","Jardim do Sol":"NE-004",
 "La Marina":"NE-005","Casas da Areia":"NE-006","Terra Blanca":"NE-007","Luz do Tejo":"NE-008",
 "Serra Alta":"NE-009","Vila dos Pinheiros":"NE-010","Costa Clara":"NE-011","Pátio do Porto":"NE-012"
};
export const projectCode=(name:string)=>references[name];
export const unitStates=["Available","Reserved","Sold"] as const;
export type UnitState=typeof unitStates[number];
export const units=projects.flatMap(p=>unitStates.map((status,i)=>({
 code:projectCode(p.name)+"-A0"+(i+1), project:projectCode(p.name),name:p.name,area:[65,85,110][i],
 price:p.price+i*50000,status,version:0
})));
