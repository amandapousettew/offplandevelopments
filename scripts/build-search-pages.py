"""Build crawlable language guides and project pages from the published catalogue."""
from pathlib import Path
from html import escape
import json

root=Path(__file__).resolve().parents[1]
out=root/"docs"
base="https://amandapousettew.github.io/offplandevelopments/"
projects=json.loads((root/"app/project-data.json").read_text())
guides={
 "en":("en/holiday-home-spain/","Buying a holiday home in Spain | New developments on the Costa Blanca","Find a new-build holiday home in Spain","Compare new developments in Benidorm, Finestrat, Polop, Villajoyosa and Valencia. Speak to Amanda or Potros about your budget, preferred location and how you plan to use your home.",[
 ("Compare the location before choosing a holiday home","A home on the Costa Blanca can mean a coastal apartment, an inland villa or a tourist apartment with operating conditions. Check the exact address, airport route, public transport and beach access for each project."),
 ("Buying off-plan in Spain","Request the unit floor plan, specification, total purchase costs, payment milestones and expected completion date. Our project pages identify the supplied documents and flag information that still needs confirmation."),
 ("Can I rent out my holiday home?","Ask about permitted use, any management agreement, personal-use restrictions and ongoing costs for the specific home. A residential apartment, tourist apartment and hotel investment can have different terms. Request confirmation before relying on rental projections."),
 ("Looking for a home in Portugal?","Tell us which region you are considering, such as the Algarve, and whether you want personal use or a rental property. Our current documented collection is in Spain. Contact the team about Portugal rather than treating the Spanish catalogue as Portuguese stock.")
 ]),
 "sv":("sv/semesterbostad-spanien/","Köpa semesterbostad i Spanien | Nyproduktion Costa Blanca","Köpa semesterbostad i Spanien","Letar du efter ett hem i solen? Jämför nyproduktion på Costa Blanca och i Valencia. Amanda hjälper dig på svenska och engelska att hitta rätt projekt utifrån budget, läge och hur du vill använda bostaden.",[
 ("Nyproduktion på Costa Blanca","Jämför lägenheter i Benidorm och Villajoyosa med villor i Finestrat och Polop. Kontrollera den exakta adressen, vägen till stranden och förbindelserna till Alicante flygplats. En villa i inlandet ger andra förutsättningar än en lägenhet vid kusten."),
 ("Köpa bostad på ritning i Spanien","Be om bostadens planritning, tekniska beskrivning, totalpris, betalningsplan och beräknade färdigställande. Vi samlar frågor till utvecklaren och uppmärksammar uppgifter som saknas eller skiljer sig mellan dokumenten."),
 ("Kan jag hyra ut min semesterbostad?","Kontrollera tillåten användning, eventuellt förvaltningsavtal, begränsningar för eget bruk och löpande kostnader för den aktuella bostaden. En vanlig bostad, turistlägenhet och hotellinvestering kan ha olika villkor. Beräknad avkastning är en prognos."),
 ("Söker du semesterbostad i Portugal?","Berätta om du söker en lägenhet eller villa i exempelvis Algarve, vilken budget du har och om du vill bo där själv eller hyra ut. Det dokumenterade utbudet på webbplatsen ligger för närvarande i Spanien. Kontakta oss om din sökning i Portugal.")
 ]),
 "nl":("nl/vakantiehuis-spanje/","Vakantiehuis kopen Spanje | Nieuwbouw Costa Blanca","Een vakantiehuis kopen in Spanje","Zoek je een tweede woning in de zon? Vergelijk nieuwbouwprojecten aan de Costa Blanca en in Valencia. Potros helpt je in het Nederlands en Engels bij het vergelijken van locatie, budget en het gebruik van jouw toekomstige woning.",[
 ("Nieuwbouw aan de Costa Blanca vergelijken","Vergelijk appartementen in Benidorm en Villajoyosa met villa’s in Finestrat en Polop. Bekijk het exacte adres, de route naar het strand en de verbinding met de luchthaven van Alicante. Een villa in het binnenland biedt andere mogelijkheden dan een appartement aan de kust."),
 ("Een woning op tekening kopen in Spanje","Vraag om de plattegrond, technische omschrijving, totale aankoopkosten, betalingstermijnen en verwachte opleverdatum. Wij leggen openstaande vragen terug bij de ontwikkelaar en benoemen verschillen tussen de aangeleverde documenten."),
 ("Kan ik mijn vakantiewoning verhuren?","Controleer toegestaan gebruik, beheerovereenkomsten, beperkingen voor eigen gebruik en terugkerende kosten voor de specifieke woning. Een woonappartement, toeristisch appartement en hotelinvestering kunnen verschillende voorwaarden hebben. Rendementsberekeningen zijn prognoses."),
 ("Een vakantiehuis kopen in Portugal","Vertel ons of je een appartement of villa zoekt, bijvoorbeeld in de Algarve, en wat je budget en verhuurwensen zijn. Het huidige gedocumenteerde aanbod op deze website ligt in Spanje. Neem contact op voor jouw zoektocht in Portugal.")
 ])
}
style="""body{margin:0;background:#fafafa;color:#373737;font:17px/1.65 Arial,sans-serif}main,header,footer{max-width:1040px;margin:auto;padding:24px}header{display:flex;align-items:center;justify-content:space-between;gap:20px}header img{width:220px;max-width:55vw}nav{display:flex;gap:16px;flex-wrap:wrap}a{color:inherit;text-underline-offset:4px}h1{font:clamp(34px,6vw,60px)/1.12 Georgia,serif;max-width:21ch;margin:32px 0 24px}h2{font:30px/1.2 Georgia,serif}p{max-width:75ch}section{padding:22px 0;border-bottom:1px solid #ddd}.cta{display:inline-block;padding:12px 22px;border-radius:28px;background:#373737;color:white;text-decoration:none;margin:12px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px}.grid img{width:100%;height:200px;object-fit:cover}.grid h3{margin-bottom:0}.meta{font-size:.85rem;color:#555}.photo{width:100%;max-height:480px;object-fit:cover}dl{display:grid;grid-template-columns:minmax(100px,180px) 1fr;gap:10px}dt{font-weight:bold}dd{margin:0}.plan{max-width:100%;height:auto}footer{border-top:1px solid #ddd}"""
def page(path,lang,title,description,body,alternates=None,schema=None):
 url=base+path
 links=''.join(f'<link rel="alternate" hreflang="{l}" href="{base+g[0]}">' for l,g in guides.items()) if alternates else ""
 schema=schema or {"@context":"https://schema.org","@type":"WebPage","name":title,"url":url,"inLanguage":lang,"description":description}
 schema_json=json.dumps(schema,ensure_ascii=False).replace("<",chr(92)+"u003c")
 html=f'<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(title)}</title><meta name="description" content="{escape(description,quote=True)}"><link rel="canonical" href="{url}">{links}<meta property="og:title" content="{escape(title,quote=True)}"><meta property="og:description" content="{escape(description,quote=True)}"><meta property="og:url" content="{url}"><meta property="og:type" content="website"><style>{style}</style><script type="application/ld+json">{schema_json}</script></head><body><header><a href="{base}"><img src="{base}offplandevelopments-logo.svg" alt="OffplanDevelopments"></a><nav>'+''.join(f'<a href="{base+g[0]}" lang="{l}">{label}</a>' for (l,g),label in zip(guides.items(),["English","Svenska","Nederlands"]))+'</nav></header><main>'+body+f'</main><footer><p>Potros Abrahim · Nederlands / English · <a href="tel:+351960006926">+351 960 006 926</a><br>Amanda Pousette · Svenska / English · <a href="tel:+46738800099">+46 73 880 00 99</a></p><a href="{base}">OffplanDevelopments</a></footer></body></html>'
 dest=out/path/"index.html";dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(html)
urls=[base]
for lang,(path,title,h1,intro,sections) in guides.items():
 body=f'<h1>{h1}</h1><p>{intro}</p><a class="cta" href="{base}?lang={"nl" if lang=="nl" else "en"}#projekt">'+{"sv":"Se projekten","nl":"Bekijk projecten","en":"Explore developments"}[lang]+'</a>'
 for heading,copy in sections:body+=f'<section><h2>{heading}</h2><p>{copy}</p></section>'
 body+='<section><h2>'+{"sv":"Aktuella projekt i Spanien","nl":"Projecten in Spanje","en":"Projects in Spain"}[lang]+'</h2><div class="grid">'
 for p in projects:
  body+=f'<article><a href="{base}projects/{p["slug"]}/"><img loading="lazy" src="{base}project-images/{p["image"]}.webp" alt="{escape(p["name"])} – {escape(p["town"])}"><h3>{escape(p["name"])}</h3></a><p>{escape(p["town"])} · {escape(p["category"])}</p></article>'
 body+='</div></section>'
 page(path,lang,title,intro,body,alternates=True);urls.append(base+path)
for p in projects:
 path="projects/"+p["slug"]+"/"
 title=p["name"]+" | "+p["town"]+" new development"
 body=f'<h1>{escape(p["name"])}</h1><p>{escape(p["town"])} · {escape(p["region"])} · {escape(p["category"])}</p><img class="photo" src="{base}project-images/{p["image"]}.webp" alt="{escape(p["name"])} developer rendering"><p>{escape(p["description"])}</p><section><h2>Project facts</h2><dl>'
 facts=[("Layout",p["bedrooms"]),("Area",p["area"]),("Price","Request current price" if p["price"] is None else "From €"+format(p["price"],",.2f")),("Tax and costs",p["tax"]),("Completion",p["completion"]),("Ownership",p["tenure"])]
 for label,value in facts:body+=f'<dt>{label}</dt><dd>{escape(value)}</dd>'
 body+='</dl></section>'+f'<section><h2>Before you reserve</h2><p>{escape(p["note"])}</p><p>{escape(p["payment"])}</p><p class="meta">Source pack — {escape(p["source"])}. Reviewed 25 November 2026. Current availability and final contract terms require confirmation.</p></section>'
 if p["plan"]:body+=f'<section><h2>Plan from the project pack</h2><a href="{base}project-plans/{p["plan"]}.png"><img class="plan" loading="lazy" src="{base}project-plans/{p["plan"]}.png" alt="{escape(p["name"])} project plan"></a></section>'
 body+=f'<a class="cta" href="{base}?project={p["slug"]}#projekt">Enquire about {escape(p["name"])}</a>'
 schema={"@context":"https://schema.org","@type":"WebPage","name":title,"url":base+path,"description":p["description"],"inLanguage":"en","dateModified":"2026-11-25","about":{"@type":"Place","name":p["name"],"address":{"@type":"PostalAddress","addressLocality":p["town"],"addressCountry":"ES"}}}
 page(path,"en",title,p["description"],body,schema=schema);urls.append(base+path)
(out/"sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+u+'</loc></url>' for u in urls)+'</urlset>')
(out/"robots.txt").write_text("User-agent: *\nAllow: /\nSitemap: "+base+"sitemap.xml\n")
