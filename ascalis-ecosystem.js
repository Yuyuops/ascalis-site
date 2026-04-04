const MAP_URL = "./ascalis-ecosystem-map.json";
let mapPromise = null;

const stageLabels = {
  probleme: "Problème",
  diagnostic: "Diagnostic",
  analyse: "Analyse",
  decision: "Décision",
  action: "Action",
  controle: "Contrôle",
  revue: "Revue",
  orientation: "Orientation"
};

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export async function loadEcosystemMap() {
  if (!mapPromise) {
    mapPromise = fetch(MAP_URL, { cache: "no-store" }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Impossible de charger ${MAP_URL} (${response.status})`);
      }
      return response.json();
    });
  }
  return mapPromise;
}

export async function getEntryModes() {
  const map = await loadEcosystemMap();
  return normalizeArray(map.entryModes);
}

export async function getOffers() {
  const map = await loadEcosystemMap();
  return normalizeArray(map.offers);
}

export async function getOfferById(id) {
  const offers = await getOffers();
  return offers.find((offer) => offer.id === id) || null;
}

export async function getPathways() {
  const map = await loadEcosystemMap();
  return normalizeArray(map.pathways);
}

export async function getPathwayById(id) {
  const pathways = await getPathways();
  return pathways.find((pathway) => pathway.id === id) || null;
}

export async function getTools() {
  const map = await loadEcosystemMap();
  return normalizeArray(map.tools);
}

export async function getToolByFile(file) {
  const tools = await getTools();
  return tools.find((tool) => tool.file === file) || null;
}

export async function getProject() {
  const map = await loadEcosystemMap();
  return map.project || {};
}

export async function getDesignSystem() {
  const map = await loadEcosystemMap();
  return map.designSystem || {};
}

export async function getDashboardIntegration() {
  const map = await loadEcosystemMap();
  return map.dashboardIntegration || {};
}

export async function getPublicIntegration() {
  const map = await loadEcosystemMap();
  return map.publicIntegration || {};
}

export async function getSharedMetaFields() {
  const map = await loadEcosystemMap();
  return normalizeArray(map.sharedMetaFields);
}

export async function getBlocksRequiredOnEveryTool() {
  const map = await loadEcosystemMap();
  return normalizeArray(map.blocksRequiredOnEveryTool);
}

export async function getGlobalFlow() {
  const map = await loadEcosystemMap();
  return normalizeArray(map.globalFlow);
}

export async function getStageById(id) {
  const flow = await getGlobalFlow();
  const index = flow.indexOf(id);
  if (index === -1) return null;
  return { id, label: stageLabels[id] || id, order: index + 1 };
}

export async function getToolsByStage(stageId) {
  const tools = await getTools();
  return tools.filter((tool) => tool.stage === stageId);
}

export async function getOffersForTool(file) {
  const tool = await getToolByFile(file);
  if (!tool) return [];
  const offers = await getOffers();
  return offers.filter((offer) => normalizeArray(tool.linkedOffers).includes(offer.id));
}

export async function getPathwaysForTool(file) {
  const tool = await getToolByFile(file);
  if (!tool) return [];
  const pathways = await getPathways();
  return pathways.filter((pathway) => normalizeArray(tool.linkedPathways).includes(pathway.id));
}

export async function getToolChain(file) {
  const tool = await getToolByFile(file);
  if (!tool) return null;
  const [previous, next, offers, pathways, stage] = await Promise.all([
    tool.previousToolRecommended ? getToolByFile(tool.previousToolRecommended) : Promise.resolve(null),
    tool.nextToolRecommended ? getToolByFile(tool.nextToolRecommended) : Promise.resolve(null),
    getOffersForTool(file),
    getPathwaysForTool(file),
    getStageById(tool.stage)
  ]);
  return { tool, previous, next, offers, pathways, stage };
}

export async function getProblemEntries() {
  const pathways = await getPathways();
  const offers = await getOffers();
  const tools = await getTools();
  return pathways.flatMap((pathway) => normalizeArray(pathway.entryProblems).map((problem, index) => {
    const startTool = tools.find((tool) => tool.file === pathway.startTool) || null;
    const linkedOffers = offers.filter((offer) => normalizeArray(pathway.linkedOffers).includes(offer.id));
    return {
      id: `${pathway.id}::${index}`,
      label: problem,
      pathwayId: pathway.id,
      pathwayName: pathway.name,
      startTool,
      linkedOffers,
      problem
    };
  }));
}

export async function getEntriesByOffer() {
  const [offers, tools, pathways] = await Promise.all([getOffers(), getTools(), getPathways()]);
  return offers.map((offer) => ({
    ...offer,
    tools: tools.filter((tool) => normalizeArray(offer.linkedTools).includes(tool.file)),
    pathways: pathways.filter((pathway) => normalizeArray(offer.linkedPathways).includes(pathway.id))
  }));
}

export async function getEntriesByStage() {
  const flow = await getGlobalFlow();
  const tools = await getTools();
  return flow.map((stageId) => ({
    id: stageId,
    label: stageLabels[stageId] || stageId,
    tools: tools.filter((tool) => tool.stage === stageId)
  }));
}

export async function searchTools(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];
  const tools = await getTools();
  return tools.filter((tool) =>
    [
      tool.file,
      tool.title,
      tool.role,
      tool.typicalStartingProblem,
      ...normalizeArray(tool.inputsNeeded),
      ...normalizeArray(tool.outputsProduced)
    ]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}

export async function getAcceptanceTests() {
  const map = await loadEcosystemMap();
  return normalizeArray(map.acceptanceTests);
}
