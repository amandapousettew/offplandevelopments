const legacyProjects=[
{name:"Casa del Mar",price:425000},{name:"Pátio da Luz",price:365000},{name:"Villas de la Cala",price:695000},{name:"Jardim do Sol",price:480000},{name:"La Marina",price:315000},{name:"Casas da Areia",price:415000},{name:"Terra Blanca",price:345000},{name:"Luz do Tejo",price:525000},{name:"Serra Alta",price:725000},{name:"Vila dos Pinheiros",price:810000},{name:"Costa Clara",price:385000},{name:"Pátio do Porto",price:295000}
];
import {projects} from "./catalog";
// Permanent public references. Keep these assignments when catalogue ordering changes.
const references:Record<string,string>={
 "Casa del Mar":"NE-001","Pátio da Luz":"NE-002","Villas de la Cala":"NE-003","Jardim do Sol":"NE-004",
 "La Marina":"NE-005","Casas da Areia":"NE-006","Terra Blanca":"NE-007","Luz do Tejo":"NE-008",
 "Serra Alta":"NE-009","Vila dos Pinheiros":"NE-010","Costa Clara":"NE-011","Pátio do Porto":"NE-012"
};
export const projectCode=(name:string)=>references[name]??projects.find(p=>p.name===name)?.code;
export const unitStates=["Available","Reserved","Sold"] as const;
export type UnitState=typeof unitStates[number];
export const units=legacyProjects.flatMap(p=>unitStates.map((status,i)=>({
 code:projectCode(p.name)+"-A0"+(i+1), project:projectCode(p.name),name:p.name,area:[65,85,110][i],
 price:p.price+i*50000,status,version:0
})));
