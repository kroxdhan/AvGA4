const { ZBClient } = require("zeebe-node");
const axios = require("axios");

const zbc = new ZBClient({
  camundaCloud: {
    region: "bru-2",
    clusterId: "487e2664-45fe-4a21-9e53-860eddc37e5e",
    clientId: "ErSrjqHw0y0w5gk5c2htp1p.IHjXJJsK",
    clientSecret: "ldqr3jRUy1xnzi_7w_5I4GJ6L6IAnXI~YYDFAEpPTLGCHNKgAhb8~UBApivrXhsZ"
  }
});

async function callRiskService(seed) {
  const response = await axios.get(
    `http://localhost:3000/risks?seed=${seed}`,
    { timeout: 7 * 60 * 1000 }
  );

  const risk = response.data[0];
  if (!risk) {
    throw new Error(`Kein Risiko-Eintrag für Seed ${seed} gefunden`);
  }

  return {
    riskScore: risk.riskScore,
    topRiskSegment: risk.topRiskSegment,
    overloadProbability: risk.overloadProbability,
    recommendation: risk.recommendation
  };
}

zbc.createWorker({
  taskType: "risk_worker",
  timeout: 10 * 60 * 1000,
  taskHandler: async (job) => {
    console.log("== Neuer Job ==", job.key, "Seed:", job.variables.seed);

    const seed = job.variables.seed;          
    const result = await callRiskService(seed);

    console.log("Nach callRiskService, Ergebnis:", result);
    await job.complete(result);
  }
});

