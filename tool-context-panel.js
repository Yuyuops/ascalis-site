import {
  getBlocksRequiredOnEveryTool,
  getProject,
  getSharedMetaFields,
  getToolChain
} from "./ascalis-ecosystem.js";

const fileName = window.location.pathname.split("/").pop() || "";

boot().catch((error) => {
  console.error("ASCALIS context panel error:", error);
});

async function boot() {
  const chain = await getToolChain(fileName);
  if (!chain?.tool) return;

  const [project, sharedMetaFields, blocksRequired] = await Promise.all([
    getProject(),
    getSharedMetaFields(),
    getBlocksRequiredOnEveryTool()
  ]);

  injectContext({
    ...chain,
    project,
    sharedMetaFields,
    blocksRequired
  });
}

function injectContext({ tool, previous, next, offers, pathways, stage, project, sharedMetaFields, blocksRequired }) {
  const stageText = stage ? `${stage.label} — étape ${stage.order}` : "Étape non définie";
  const pathwaysText = pathways.map((pathway) => pathway.name).join(" / ");
  const offersText = offers.map((offer) => offer.name).join(" / ");

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
      .ascalis-meta-fields{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
      .ascalis-meta-field{display:inline-flex;padding:4px 10px;border-radius:999px;background:#fff;border:1px solid #E2E8F0;font-family:'Lexend',sans-serif;font-size:11px;color:#64748B}
      @media (max-width:860px){.ascalis-grid,.ascalis-links{grid-template-columns:1fr}.ascalis-card dl{grid-template-columns:1fr}}
    </style>
    <div class="ascalis-context-head">
      <div>
        <h2>Parcours & contexte métier</h2>
        <p>${project.name} suit un fil conducteur explicite : problème → diagnostic → analyse → décision → action → contrôle → revue. Cet outil est donc relié à une logique de décision, pas isolé comme une page autonome.</p>
      </div>
      <div class="ascalis-chip-row">
        <span class="ascalis-chip">${stageText}</span>
        ${pathways.map((pathway) => `<span class="ascalis-chip">${pathway.name}</span>`).join("")}
      </div>
    </div>
    <div class="ascalis-grid">
      <article class="ascalis-card"><h3>Pourquoi utiliser cet outil</h3><p>${tool.role || "Rôle non défini dans la map."}</p></article>
      <article class="ascalis-card"><h3>Quand l’utiliser</h3><p>Quand le besoin ressemble à ceci : ${tool.typicalStartingProblem || "cas d’usage non décrit"}. Étape de référence : ${stageText.toLowerCase()}.</p></article>
      <article class="ascalis-card"><h3>Entrées nécessaires</h3><ul>${(tool.inputsNeeded || []).map((item) => `<li>${item}</li>`).join("")}</ul></article>
      <article class="ascalis-card"><h3>Sorties produites</h3><ul>${(tool.outputsProduced || []).map((item) => `<li>${item}</li>`).join("")}</ul></article>
      <article class="ascalis-card"><h3>Offres ASCALIS liées</h3><div class="ascalis-chip-row">${offers.map((offer) => `<span class="ascalis-chip">${offer.name}</span>`).join("")}</div><p style="margin-top:10px">${offersText || "Aucune offre liée dans la map."}</p></article>
      <article class="ascalis-card"><h3>Parcours associé</h3><div class="ascalis-chip-row">${pathways.map((pathway) => `<span class="ascalis-chip">${pathway.name}</span>`).join("")}</div><p style="margin-top:10px">${pathwaysText || "Aucun parcours lié dans la map."}</p></article>
      <article class="ascalis-card"><h3>Problème de départ typique</h3><p>${tool.typicalStartingProblem || "Non défini."}</p></article>
      <article class="ascalis-card"><h3>Méta harmonisée</h3><dl>
        <dt>Projet / contexte</dt><dd>${project.name}</dd>
        <dt>Offre liée</dt><dd>${offersText || "À définir"}</dd>
        <dt>Parcours</dt><dd>${pathwaysText || "À définir"}</dd>
        <dt>Processus concerné</dt><dd>${tool.role || "À préciser"}</dd>
        <dt>Problème / besoin initial</dt><dd>${tool.typicalStartingProblem || "À formuler"}</dd>
        <dt>Pilote</dt><dd>${sharedMetaFields.includes("owner") ? "Champ owner prévu dans la map" : "À affecter"}</dd>
        <dt>Date</dt><dd>${sharedMetaFields.includes("date") ? new Date().toLocaleDateString("fr-FR") : "À préciser"}</dd>
        <dt>Référence / ID</dt><dd>${fileName}</dd>
      </dl>
      <div class="ascalis-meta-fields">${blocksRequired.map((block) => `<span class="ascalis-meta-field">${block}</span>`).join("")}</div>
      </article>
    </div>
    <div class="ascalis-links">
      ${renderLink("Outil précédent recommandé", previous)}
      ${renderLink("Outil suivant recommandé", next)}
      ${renderLink("Parcours public associé", pathways[0] ? { file: "parcours.html", title: pathways[0].name, description: pathways[0].entryProblems?.[0] || "Voir le parcours complet." } : null)}
    </div>`;
  document.body.appendChild(section);
}

function renderLink(label, target) {
  if (!target) {
    return `<div class="ascalis-link ascalis-empty"><small>${label}</small><strong>Non défini</strong><span>La map n’indique pas de suite logique explicite.</span></div>`;
  }
  return `<a class="ascalis-link" href="${target.file}"><small>${label}</small><strong>${target.title || target.name || target.file}</strong><span>${target.description || target.typicalStartingProblem || target.role || "Suite logique du parcours."}</span></a>`;
}
