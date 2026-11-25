const rows = [
 ["Casa del Mar","Altea","Spain",425000,"Apartments","Light-filled apartments with open kitchens and sea-facing terraces."],
 ["Pátio da Luz","Lagos","Portugal",365000,"Apartments","Apartments arranged around a shared courtyard with a pool and shaded outdoor spaces."],
 ["Villas de la Cala","Jávea","Spain",695000,"Villas","Detached villas with private gardens and generous outdoor dining spaces."],
 ["Jardim do Sol","Cascais","Portugal",480000,"Apartments","Apartments with broad balconies overlooking a landscaped garden."],
 ["La Marina","Dénia","Spain",315000,"Apartments","Coastal homes with open living spaces and sheltered balconies."],
 ["Casas da Areia","Tavira","Portugal",415000,"Townhouses","Townhouses with private entrances, courtyards and roof terraces."],
 ["Terra Blanca","Villajoyosa","Spain",345000,"Townhouses","Pale stucco townhouses with flexible rooms for visitors and everyday living."],
 ["Luz do Tejo","Lisbon","Portugal",525000,"Apartments","City apartments with tall windows and living rooms that open onto balconies."],
 ["Serra Alta","Altea","Spain",725000,"Villas","Hillside villas with stepped gardens and outdoor living spaces on several levels."],
 ["Vila dos Pinheiros","Comporta","Portugal",810000,"Villas","Low-rise villas with natural finishes and outdoor seating beneath the pines."],
 ["Costa Clara","Calpe","Spain",385000,"Apartments","Apartments with a communal pool, sun deck and spacious bedrooms."],
 ["Pátio do Porto","Porto","Portugal",295000,"Apartments","Bright city homes arranged around a shared courtyard."]
] as const;
export const projects=rows.map(([name,town,country,price,type,description],id)=>({id,name,town,country,price,type,description,region:country==="Spain"?"Costa Blanca":(["Lagos","Tavira"].includes(town)?"Algarve":town==="Porto"?"Porto":town==="Comporta"?"Alentejo":"Lisbon region")}));
export const money=(n:number)=>"€"+new Intl.NumberFormat("en-IE").format(n);
