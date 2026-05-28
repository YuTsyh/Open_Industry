export const providerAdapterRegistry = {};

export function buildProviderRequestPlan(contract, {
  enabled = true,
  missingSecrets = []
} = {}) {
  return {
    providerId: contract.id,
    provider: contract.provider,
    feedType: contract.feedType,
    markets: contract.markets || [],
    sourceKeys: contract.sourceKeys || [],
    outputTables: contract.outputTables || [],
    requiredSecrets: contract.requiredSecrets || [],
    missingSecrets,
    status: !enabled ? "disabled" : missingSecrets.length ? "missing-secret" : "ready",
    licenseBoundary: contract.licenseBoundary
  };
}
