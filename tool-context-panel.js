import { ASCALIS_PARCOURS, ASCALIS_TOOLS, getOfferName, getRecommendedChain, getStage } from "./ecosystem.catalog.js";

const fileName = window.location.pathname.split("/").pop() || "";
const tool = ASCALIS_TOOLS[fileName];

if (tool) injectContext(tool);

function injectContext(tool) {
  const stage = getStage(tool.stage);
  const chain = getRecommendedChain(fileName);
  const section = document.createElement("section");
  section.className = "ascalis-context-panel";
  section.innerHTML = `
    <style>
      .ascalis-context-panel{max-width:1200px;margin:32px auto 24px;background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:24px;box-shadow:0 8px 24px rgba(0,0,0,.04);font-family:'Source Sans 3',sans-serif;color:#020617}
      .ascalis-context-panel *{box-sizing:border-box}
      .ascalis-context-head{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:flex-start;margin-bottom:20px}
      .ascalis-context-head h2{margin:0 0 6px;font-family:'Lexend',sans-serif;font-size:20px;color:#0F1A2E}
      .ascalis-context-head p{margin:0;font-size:14px;line-height:1.6;color:#475569;max-width:780px}
      .ascalis-chip-row{display:flex;flex-wrap:wrap;gap:8px}
      .ascalis-chip{display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;background:rgba(176,118,66,.08);border:1px solid rgba(176,118,66,.18);font-family:'Lexend',sans-serif;font-size:11px;color:#B07642}
      .ascalis-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
      .ascalis-card{background:#F8FAFC;border:1px solid #F1F5F9;border-radius:12px;padding:16px}
      .ascalis-card h3{margin:0 0 8px;font-family:'Lexend',sans-serif;font-size:13px;color:#0F1A2E}
      .ascalis-card p,.ascalis-card li,.ascalis-card dd,.ascalis-card dt{font-size:14px;line-height:1.65;color:#475569}
      .ascalis-card ul{margin:0;padding-left:18px}
      .ascalis-card dl{margin:0;display:grid;grid-template-columns:180px 1fr;gap:8px 12px}
      .ascalis-card dt{font-family:'Lexend',sans-serif;font-size:12px;color:#6B7280}
      .ascalis-card dd{margin:0}
      .ascalis-links{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:16px}
      .ascalis-link{display:block;background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:14px;text-decoration:none}
      .ascalis-link small{display:block;font-family:'Lexend',sans-serif;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#94A3B8;margin-bottom:4px}
      .ascalis-link strong{display:block;font-family:'Lexend',sans-serif;font-size:13px;color:#0F1A2E}
      .ascalis-link span{display:block;margin-top:6px;font-size:13px;line-height:1.5;color:#475569}
      .ascalis-empty{opacity:.6}
      @media (max-width:860px){.ascalis-grid,.ascalis-links{grid-template-columns:1fr}.ascalis-card dl{grid-template-columns:1fr}}
    </style>
    <div class="ascalis-context-head">
      <div>
        <h2>Parcours & contexte métier</h2>
        <p>Cet outil s’inscrit dans une progression ASCALIS : problème → diagnostic → analyse → décision → action → contrôle → revue. Le but est de replacer l’outil dans son usage métier, pas de l’isoler comme un gadget autonome.</p>
      </div>
      <div class="ascalis-chip-row">
        ${(tool.parcours || []).map((id) => `<span class="ascalis-chip">${ASCALIS_PARCOURS[id]?.title || id}</span>`).join("")}
        ${stage ? `<span class="ascalis-chip">Étape : ${stage.label}</span>` : ""}
      </div>
    </div>
    <div class="ascalis-grid">
      <article class="ascalis-card"><h3>Pourquoi utiliser cet outil</h3><p>${tool.why || ""}</p></article>
      <article class="ascalis-card"><h3>Quand l’utiliser</h3><p>${tool.when || ""}</p></article>
      <article class="ascalis-card"><h3>Entrées nécessaires</h3><ul>${(tool.inputs || []).map((item) => `<li>${item}</li>`).join("")}</ul></article>
      <article class="ascalis-card"><h3>Sorties produites</h3><ul>${(tool.outputs || []).map((item) => `<li>${item}</li>`).join("")}</ul></article>
      <article class="ascalis-card"><h3>Offres ASCALIS liées</h3><div class="ascalis-chip-row">${(tool.offers || []).map((id) => `<span class="ascalis-chip">Offre ${id} — ${getOfferName(id)}</span>`).join("")}</div><p style="margin-top:10px">${tool.problem || ""}</p></article>
      <article class="ascalis-card"><h3>Méta harmonisée</h3><dl>
        <dt>Projet / contexte</dt><dd>À renseigner pour rattacher l’outil au besoin réel.</dd>
        <dt>Offre liée</dt><dd>${(tool.offers || []).map((id) => `Offre ${id}`).join(", ") || "À définir"}</dd>
        <dt>Parcours</dt><dd>${(tool.parcours || []).map((id) => ASCALIS_PARCOURS[id]?.title || id).join(" / ") || "À définir"}</dd>
        <dt>Processus concerné</dt><dd>${tool.process || "À préciser"}</dd>
        <dt>Problème / besoin initial</dt><dd>${tool.problem || "À formuler"}</dd>
        <dt>Pilote</dt><dd>${tool.pilot || "À affecter"}</dd>
        <dt>Date</dt><dd>${new Date().toLocaleDateString("fr-FR")}</dd>
        <dt>Référence / ID</dt><dd>${fileName}</dd>
      </dl></article>
    </div>
    <div class="ascalis-links">
      ${renderLink("Outil précédent recommandé", chain?.previous)}
      ${renderLink("Parcours associé", chain?.parcours?.[0] ? { file: "parcours.html", name: chain.parcours[0].title, summary: chain.parcours[0].problem } : null)}
      ${renderLink("Outil suivant recommandé", chain?.next)}
    </div>`;
  document.body.appendChild(section);
}

function renderLink(label, data) {
  if (!data) {
    return `<div class="ascalis-link ascalis-empty"><small>${label}</small><strong>Fin de chaîne ou non défini</strong><span>Le catalogue ne propose pas encore de suite logique.</span></div>`;
  }
  return `<a class="ascalis-link" href="${data.file || "#"}"><small>${label}</small><strong>${data.name || data.file}</strong><span>${data.summary || data.problem || data.why || "Suite logique du parcours."}</span></a>`;
}
