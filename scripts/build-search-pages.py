#!/usr/bin/env python3
"""Build readable, multilingual public pages from the shared project catalogue."""
import json
from datetime import date
from html import escape
from pathlib import Path
from urllib.parse import urlencode, urlsplit

from search_content import COPY, PROJECT_COPY, TRAVEL

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs"
BASE = "https://amandapousettew.github.io/offplandevelopments/"
PREFIX = urlsplit(BASE).path
CONFIG = json.loads((ROOT / "app/public-site.json").read_text())
PROJECTS = json.loads((ROOT / "app/project-data.json").read_text())
BY_SLUG = {project["slug"]: project for project in PROJECTS}
LANGUAGES = {"en": "English", "sv": "Svenska", "nl": "Nederlands"}
PROJECT_PREFIXES = {"en": "projects/", "sv": "sv/projekt/", "nl": "nl/projecten/"}
MONTHS_NOVEMBER = {"en": "November", "sv": "november", "nl": "november"}
AGENT_PROJECTS = ["noa-villajoyosa", "polop-villas", "sierra-verde-finestrat"]
URLS = [BASE]


def path_to(path=""):
    return PREFIX + path


def project_path(project, lang):
    slug = project["slug"]
    prefix = PROJECT_PREFIXES[lang] if slug in CONFIG["localizedProjects"] else PROJECT_PREFIXES["en"]
    return f"{prefix}{slug}/"


def contact_for(lang):
    return CONFIG["team"]["potros" if lang == "nl" else "amanda"]


def link(url, text, class_name=""):
    css = f' class="{class_name}"' if class_name else ""
    return f'<a href="{escape(url, quote=True)}"{css}>{escape(text)}</a>'


def whatsapp(lang):
    person = contact_for(lang)
    name = "WhatsApp " + person["name"]
    url = "https://wa.me/" + person["number"][1:]
    return (f'<a class="whatsapp floating-whatsapp" href="{url}" aria-label="{escape(name)}" '
            f'target="_blank" rel="noopener noreferrer"><img src="{path_to("whatsapp.svg")}" '
            'width="20" height="20" alt=""><span>WhatsApp</span></a>')

def contacts(lang):
    primary = contact_for(lang)
    team = [primary] + [person for person in CONFIG["team"].values() if person != primary]
    rows = ''.join(
        f'<div><strong>{escape(person["name"])}</strong><br>{escape(" · ".join(person["languages"]))}<br>'
        f'{link("tel:" + person["number"], person["display"])}</div>'
        for person in team
    )
    return f'<div class="contacts">{rows}</div>'


def page(path, lang, title, description, body, alternates, project=None):
    labels = COPY[lang]["labels"]
    url = BASE + path
    browser_title = title + " | OffplanDevelopments"
    hreflang = ""
    if len(alternates) > 1:
        hreflang = "".join(
            f'<link rel="alternate" hreflang="{code}" href="{BASE + alternate}">'
            for code, alternate in alternates.items()
        ) + f'<link rel="alternate" hreflang="x-default" href="{BASE + alternates["en"]}">'
    schema = {
        "@context": "https://schema.org", "@type": "WebPage", "name": title, "url": url,
        "inLanguage": lang, "description": description,
        "publisher": {"@type": "Organization", "name": "OffplanDevelopments", "url": BASE},
    }
    if project:
        schema["about"] = {"@type": "Place", "name": project["name"],
                           "address": {"@type": "PostalAddress", "addressLocality": project["town"], "addressCountry": "ES"}}
    schema_text = json.dumps(schema, ensure_ascii=False).replace("<", "\\u003c")
    nav = "".join(link(path_to(CONFIG[group][lang]), labels[label])
                  for group, label in (("guides", "guide"), ("agents", "agents"), ("investments", "investments")))
    languages = "".join(
        f'<a href="{path_to(alternate)}" lang="{code}" hreflang="{code}"'
        + (' aria-current="page"' if code == lang else '') + f'>{LANGUAGES[code]}</a>'
        for code, alternate in alternates.items()
    )
    html = f"""<!doctype html>
<html lang="{lang}">
<head>
 <meta charset="utf-8">
 <meta name="viewport" content="width=device-width, initial-scale=1">
 <title>{escape(browser_title)}</title>
 <meta name="description" content="{escape(description, quote=True)}">
 <link rel="canonical" href="{url}">
 {hreflang}
 <meta property="og:title" content="{escape(browser_title, quote=True)}">
 <meta property="og:description" content="{escape(description, quote=True)}">
 <meta property="og:url" content="{url}">
 <meta property="og:type" content="website">
 <link rel="icon" href="{path_to("favicon.svg")}">
 <link rel="stylesheet" href="{path_to("property-guides.css")}">
 <script type="application/ld+json">{schema_text}</script>
 <script type="module" src="{path_to("enquiry-form.mjs")}"></script>
</head>
<body>
 <header class="site-header">
  <div class="shell header-row">
   <a href="{path_to()}"><img src="{path_to("offplandevelopments-logo.svg")}" width="206" height="57" alt="OffplanDevelopments"></a>
   <nav>{nav}</nav>
  </div>
 </header>
 <main class="shell">
  <nav class="language-switch" aria-label="Language">{languages}</nav>
  {body}
 </main>
 <footer class="site-footer">
  <div class="shell">
   <h2>{escape(labels["contact"])}</h2>
   {contacts(lang)}
   <p>{link(path_to(), "OffplanDevelopments")}</p>
  </div>
 </footer>
 {whatsapp(lang)}
</body>
</html>
"""
    target = OUTPUT / path / "index.html"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text("\n".join(line.rstrip() for line in html.splitlines()) + "\n", encoding="utf-8")
    URLS.append(url)


def money(amount, lang):
    precision = ".0f" if amount == int(amount) else ".2f"
    value = format(amount, "," + precision)
    if lang == "nl":
        return "€ " + value.translate(str.maketrans(",.", ".,"))
    if lang == "sv":
        return value.translate(str.maketrans(",.", " ,")) + " €"
    return "€" + value


def project_text(project, lang):
    return PROJECT_COPY.get(project["slug"], {}).get(lang, project)


def shown_price(project, lang):
    labels = COPY[lang]["labels"]
    if project["price"] is None:
        return labels["on_request"]
    suffixes = {
        ("nl", "Excl. 10% VAT"): "excl. 10% btw", ("sv", "Excl. 10% VAT"): "exkl. 10 % moms",
        ("nl", "Excl. VAT"): "excl. btw", ("sv", "Excl. VAT"): "exkl. moms",
        ("nl", "VAT basis to confirm"): "btw te bevestigen", ("sv", "VAT basis to confirm"): "moms att bekräfta"
    }
    note = suffixes.get((lang, project["priceNote"]), project["priceNote"])
    price = labels["from"] + " " + money(project["price"], lang)
    return price + (" · " + note if note else "")


def date_label(value, lang):
    reviewed = date.fromisoformat(value)
    if reviewed.month == 11:
        return f"{reviewed.day} {MONTHS_NOVEMBER[lang]} {reviewed.year}"
    return reviewed.isoformat()


def section(title, body, identifier=""):
    attr = f' id="{identifier}"' if identifier else ""
    return f'<section{attr}><h2>{escape(title)}</h2>{body}</section>'


def paragraph(text, class_name=""):
    attr = f' class="{class_name}"' if class_name else ""
    return f'<p{attr}>{escape(text)}</p>'


def facts(values):
    return '<dl>' + "".join(f'<dt>{escape(label)}</dt><dd>{escape(value)}</dd>' for label, value in values) + '</dl>'


def project_cards(projects, lang):
    labels = COPY[lang]["labels"]
    types = COPY[lang]["types"]
    cards = []
    for project in projects:
        text = project_text(project, lang)
        page_url = path_to(project_path(project, lang))
        compact_facts = [(labels["type"], types.get(project["type"], project["type"])), (labels["price"], shown_price(project, lang))]
        if lang == "en" or "title" in text:
            compact_facts.append((labels["completion"], text["completion"]))
        compact_facts += [
            (labels["status"], labels["status_value"]),
            (labels["reviewed"], date_label(project["reviewed"], lang)),
        ]
        cards.append(
            f'<article class="project-card"><a href="{page_url}"><img loading="lazy" '
            f'src="{path_to("project-images/" + project["image"] + ".webp")}" alt="{escape(project["name"])}"></a>'
            f'<div class="card-content"><p class="meta">{escape(project["town"])}</p>'
            f'<h3>{link(page_url, project["name"])}</h3>{facts(compact_facts)}</div></article>'
        )
    return '<div class="card-grid">' + "".join(cards) + '</div>'


def field(label, name, input_type="text", required=False, autocomplete="", max_length=150):
    req = " required" if required else ""
    complete = f' autocomplete="{autocomplete}"' if autocomplete else ""
    return (f'<label>{escape(label)}<input name="{name}" type="{input_type}" maxlength="{max_length}"'
            f'{complete}{req}></label>')


def enquiry_form(lang, *, agent=False, project=None):
    words = COPY[lang]["form"]
    recipient = CONFIG["enquiryRecipient"]
    investment = project is not None and project["category"] != "Residential development"
    kind = "Developer introduction" if agent else "Investment project enquiry" if investment else "Buyer project enquiry"
    subject = "OffplanDevelopments — " + kind
    if project:
        subject += " — " + project["name"]
    agent_fields = field(words["agency"], "agency", required=True, autocomplete="organization", max_length=200) if agent else ""
    target_lang = LANGUAGES[lang]
    intake = ""
    if agent or project is None:
        intake = (field(words["area"], "area", required=agent) + field(words["budget"], "budget", required=agent)
                  + field(words["type"], "property_type", required=agent) + field(words["timing"], "timing", required=agent))
    relationship = ""
    if not agent and not investment:
        choices = ''.join(f'<option value="{key}">{escape(words[translation])}</option>'
                          for key, translation in (("existing agent", "yes"), ("request agent introduction", "intro"), ("exploring", "unsure")))
        relationship = (f'<label class="wide-field">{escape(words["agent"])}<select name="agent_status">'
                        f'<option value="">{escape(words["choose"])}</option>{choices}</select></label>')
    context = (f'<input type="hidden" name="project" value="{escape(project["name"], quote=True)}">' if project else "")
    return f"""<form class="enquiry-form" method="post" action="https://formsubmit.co/{recipient}" data-enquiry-form>
 <input type="hidden" name="_subject" value="{escape(subject, quote=True)}">
 <input type="hidden" name="_template" value="table">
 <input type="hidden" name="kind" value="{kind}">
 <input type="hidden" name="language" value="{target_lang}">
 {context}
 <div data-fields class="form-fields">
  {field(words["name"], "name", required=True, autocomplete="name")}
  {field(words["email"], "email", "email", required=True, autocomplete="email", max_length=254)}
  {agent_fields}
  {field(words["phone"], "phone", "tel", autocomplete="tel", max_length=40)}
  {intake}
  {relationship}
  <label class="wide-field">{escape(words["message"])}<textarea name="message" rows="4" maxlength="2000"></textarea></label>
  <div class="wide-field">
   {paragraph(words["privacy"], "meta")}
   <p class="error" data-error role="alert" hidden>{escape(words["error"])}</p>
   <button class="button" type="submit">{escape(words["send"])}</button>
  </div>
 </div>
 <p class="confirmation" data-sent role="status" tabindex="-1" hidden>{escape(words["success"])}</p>
</form>"""


def travel_section(project, lang):
    info = TRAVEL.get(project["slug"])
    labels = COPY[lang]["labels"]
    if not info:
        return section(labels["town"], paragraph(project["town"]) +
                       link(project["locationUrl"], labels["location"]))

    def route(origin, destination, mode):
        return "https://www.google.com/maps/dir/?" + urlencode({
            "api": 1, "origin": origin, "destination": destination, "travelmode": mode,
        })

    airport = "Alicante–Elche Miguel Hernández Airport"
    routes = [
        (project["locationUrl"], labels["location"]),
        (route(info["site"], info["beach"], info["beach_mode"]), labels["directions_beach"]),
        (route(airport, info["site"], "transit"), labels["directions_airport"]),
        (route(info["site"], airport, "transit"), labels["directions_return"]),
    ]
    sources = [(info["beach_source"], labels["source_beach"]),
               (info["operator"], labels[info["operator_label"]]),
               (info["airport_info"], labels["source_airport"])]
    anchors = "".join(link(url, name) for url, name in routes)
    references = " · ".join(link(url, name) for url, name in sources)
    body = paragraph(info["text"][lang]) + f'<div class="section-links">{anchors}</div><p class="meta">{labels["source"]} · {references}</p>'
    return section(labels["travel"], body, "travel")


def intro(title, description, eyebrow="", actions=""):
    marker = f'<p class="eyebrow">{escape(eyebrow)}</p>' if eyebrow else ""
    return f'<div class="intro">{marker}<h1>{escape(title)}</h1>{paragraph(description, "lede")}{actions}</div>'


def build_guide(lang):
    content = COPY[lang]
    labels = content["labels"]
    title, subtitle, description = content["guide"]
    nav = link("#compare", subtitle, "button") + " " + link("#enquiry", labels["request"], "secondary-link")
    body = intro(title, description, subtitle, f'<div class="section-links">{nav}</div>')
    comparisons = []
    for slug, area, copy in content["areas"]:
        project = BY_SLUG[slug]
        comparisons.append(f'<article><h3>{escape(area)}</h3>{paragraph(copy)}'
                           f'{link(path_to(project_path(project, lang)), project["name"])}</article>')
    body += section(labels["regions"], '<div class="area-grid">' + "".join(comparisons) + "</div>", "compare")
    body += section(labels["homes"], project_cards([p for p in PROJECTS if p["category"] == "Residential development"], lang))
    body += '<div class="questions">' + "".join(section(heading, paragraph(copy)) for heading, copy in content["questions"]) + '</div>'
    body += section(labels["request"], paragraph(labels["role"]) + enquiry_form(lang), "enquiry")
    body += '<div class="section-links bottom-links">' + link(path_to("?lang=" + ("nl" if lang == "nl" else "en") + "#projekt"), labels["browse"]) + link(path_to(CONFIG["investments"][lang]), labels["investment_projects"]) + '</div>'
    page(CONFIG["guides"][lang], lang, f"{title} | {subtitle}", description, body, CONFIG["guides"])


def build_agents(lang):
    content = COPY[lang]
    labels = content["labels"]
    title, heading, description = content["agents"]
    body = intro(heading, description, labels["agents"], link("#enquiry", labels["ask_intro"], "button"))
    steps = '<ol class="steps">' + "".join(f'<li><h3>{escape(heading)}</h3>{paragraph(text)}</li>' for heading, text in content["steps"]) + "</ol>"
    body += section(labels["steps"], steps)
    projects = [BY_SLUG[slug] for slug in AGENT_PROJECTS]
    body += section(labels["compare"], project_cards(projects, lang))
    body += section(labels["ask_intro"], enquiry_form(lang, agent=True), "enquiry")
    developer = paragraph(labels["developer_text"]) + link(path_to("?enquiry=developer&lang=" + ("nl" if lang == "nl" else "en") + "#partner"), labels["developer_cta"])
    body += section(labels["developer"], developer)
    page(CONFIG["agents"][lang], lang, title, description, body, CONFIG["agents"])


def build_investments(lang):
    title, heading, description = COPY[lang]["investments"]
    labels = COPY[lang]["labels"]
    body = intro(heading, description)
    body += section(labels["investment_projects"], project_cards([p for p in PROJECTS if p["category"] != "Residential development"], lang))
    body += '<div class="bottom-links">' + link(path_to("?catalogue=investments&lang=" + ("nl" if lang == "nl" else "en") + "#projekt"), labels["browse"]) + '</div>'
    page(CONFIG["investments"][lang], lang, title, description, body, CONFIG["investments"])


def build_project(project, lang):
    text = project_text(project, lang)
    labels = COPY[lang]["labels"]
    residential = project["category"] == "Residential development"
    request = labels["request" if residential else "investment_request"]
    title = text.get("title", f'{project["name"]} | New development in {project["town"]}')
    path = project_path(project, lang)
    actions = link("#enquiry", request, "button")
    saved_link = path_to("?" + urlencode({"save": project["slug"], "saved": 1, "lang": "nl" if lang == "nl" else "en"}) + "#projekt")
    shortlist_label = {"en": "Save to shortlist", "sv": "Spara bland favoriter", "nl": "Bewaar bij favorieten"}
    actions += link(saved_link, shortlist_label[lang], "secondary-link")
    body = intro(project["name"], text["description"], project["town"] + " · " + project["region"], f'<div class="section-links">{actions}</div>')
    body += (f'<img class="project-photo" src="{path_to("project-images/" + project["image"] + ".webp")}" '
             f'alt="{escape(project["name"])}" fetchpriority="high">')
    values = [(labels["type"], COPY[lang]["types"].get(project["type"], project["type"])),
              (labels["layout"], text["bedrooms"]), (labels["area"], text["area"]), (labels["price"], shown_price(project, lang)),
              (labels["tax"], text["tax"]), (labels["completion"], text["completion"]), (labels["status"], labels["status_value"])]
    if not residential:
        values.append(("Ownership and use", project["tenure"]))
    body += section(labels["facts"], facts(values))
    source = paragraph(labels["source"] + " · " + text["source"], "meta")
    source += paragraph(labels["reviewed"] + " " + date_label(project["reviewed"], lang), "meta")
    body += section(labels["before"], paragraph(text["note"]) + paragraph(text["payment"]) + source)
    if project["plan"]:
        plan = path_to("project-plans/" + project["plan"] + ".png")
        body += section(labels["plan"], f'<a href="{plan}"><img class="floor-plan" loading="lazy" src="{plan}" alt="{escape(labels["plan"] + ": " + project["name"])}"></a>')
    body += travel_section(project, lang)
    enquiry_intro = ""
    if residential:
        share = "mailto:?" + urlencode({"subject": project["name"], "body": BASE + path})
        enquiry_intro = paragraph(labels["role"]) + link(share, labels["share"], "secondary-link")
    body += section(request, enquiry_intro + enquiry_form(lang, project=project), "enquiry")
    alternates = {code: project_path(project, code) for code in LANGUAGES} if project["slug"] in CONFIG["localizedProjects"] else {"en": path}
    page(path, lang, title, text["description"], body, alternates, project)


def main():
    for lang in LANGUAGES:
        build_guide(lang)
        build_agents(lang)
        build_investments(lang)
    for project in PROJECTS:
        build_project(project, "en")
        if project["slug"] in CONFIG["localizedProjects"]:
            build_project(project, "sv")
            build_project(project, "nl")
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap += "".join(f"  <url><loc>{url}</loc></url>\n" for url in URLS) + "</urlset>\n"
    (OUTPUT / "sitemap.xml").write_text(sitemap, encoding="utf-8")
    (OUTPUT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n", encoding="utf-8")
    source = ROOT / "app/enquiry-source.mjs"
    (OUTPUT / source.name).write_text(source.read_text(encoding="utf-8"), encoding="utf-8")


if __name__ == "__main__":
    main()
