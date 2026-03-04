export function calculateCost(
  modelName: string,
  promptTokens: number,
  candidateTokens: number,
): number {
  let promptPricePer1M = 0;
  let candidatePricePer1M = 0;

  const modelLower = modelName.toLowerCase();

  // Gemini 1.5/2.5 Pro pricing (approximate, often $1.25 / $5.00 for <128k context)
  if (modelLower.includes("pro")) {
    promptPricePer1M = 1.25;
    candidatePricePer1M = 5.0;
  }
  // Gemini 1.5/2.5 Flash pricing (approximate, often $0.075 / $0.30)
  else if (modelLower.includes("flash")) {
    promptPricePer1M = 0.075;
    candidatePricePer1M = 0.3;
  }

  const promptCost = (promptTokens / 1_000_000) * promptPricePer1M;
  const candidateCost = (candidateTokens / 1_000_000) * candidatePricePer1M;

  return promptCost + candidateCost;
}

export function formatCost(cost: number): string {
  if (cost === 0) return "$0.00";
  if (cost < 0.0001) {
    return "< $0.0001";
  }
  return `$${cost.toFixed(4)}`;
}
