// Enhanced configuration with better environment handling

// Helper functions that don't reference the main config
function getNetwork(): 'local' | 'ic' | 'playground' {
  const dfxNetwork = process.env.DFX_NETWORK;
  if (dfxNetwork === 'ic' || dfxNetwork === 'playground') {
    return dfxNetwork;
  }

  // Default to local for development
  return 'local';
}

function getCanisterId(envVar: string, network: string): string {
  const id = process.env[envVar];
  if (!id && network !== 'local') {
    console.warn(`Missing canister ID for ${envVar} in ${network} network`);
  }
  return id || '';
}

function getHost(network: string): string {
  switch (network) {
    case 'ic':
      return 'https://ic0.app';
    case 'playground':
      return 'https://playground.ic0.app';
    case 'local':
    default:
      return 'http://localhost:4943';
  }
}

function getIdentityProvider(
  network: string,
  internetIdentityId: string
): string {
  switch (network) {
    case 'ic':
      return 'https://identity.ic0.app';
    case 'playground':
      return 'https://identity.playground.ic0.app';
    case 'local':
    default:
      return internetIdentityId
        ? `http://localhost:4943/?canisterId=${internetIdentityId}`
        : 'http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai'; // Default local II
  }
}

function getDerivationOrigin(network: string): string | undefined {
  // Only use derivation origin on mainnet with custom domain
  if (network === 'ic') {
    return 'https://decentra.app'; // Update when you have your domain
  }

  // For local development, use undefined to avoid CORS issues
  return undefined;
}

// Build configuration step by step to avoid circular references
const network = getNetwork();
const internetIdentityId = getCanisterId(
  'CANISTER_ID_INTERNET_IDENTITY',
  network
);

export const icpConfig = {
  // Network detection with fallbacks
  network,

  // Canister IDs with validation
  canisters: {
    backend: getCanisterId('CANISTER_ID_BACKEND', network),
    frontend: getCanisterId('CANISTER_ID_FRONTEND', network),
    internetIdentity: internetIdentityId,
  },

  // Host configuration based on network
  host: getHost(network),

  // Identity provider configuration
  identityProvider: getIdentityProvider(network, internetIdentityId),

  // Derivation origin for Internet Identity
  derivationOrigin: getDerivationOrigin(network),
} as const;

// Validation function to ensure proper configuration
export function validateConfiguration(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (icpConfig.network !== 'local' && !icpConfig.canisters.backend) {
    errors.push('Backend canister ID required for non-local networks');
  }

  if (icpConfig.network === 'local' && !icpConfig.canisters.internetIdentity) {
    errors.push('Internet Identity canister ID required for local development');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Development helper - only log in development mode
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Only log in browser development environment
  console.debug('🔧 deCentra ICP Configuration:', {
    network: icpConfig.network,
    host: icpConfig.host,
    identityProvider: icpConfig.identityProvider,
    canisterIds: icpConfig.canisters,
    configValid: validateConfiguration(),
  });
}

// Export the configuration for use in the application
export default icpConfig;
