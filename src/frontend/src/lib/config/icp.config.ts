// ICP and canister configuration aligned with dfx.json
export const icpConfig = {
  // Network configuration - use DFX_NETWORK as primary indicator
  network:
    process.env.DFX_NETWORK ||
    (process.env.NODE_ENV === 'production' ? 'ic' : 'local'),

  // Canister IDs from environment variables (populated after deployment)
  canisters: {
    backend: process.env.CANISTER_ID_BACKEND || '',
  },

  // Internet Identity configuration
  internetIdentity: {
    canisterId: process.env.CANISTER_ID_INTERNET_IDENTITY || '',
    derivationOrigin: getDerivationOrigin(), // Disable if not deployed on mainnet
  },

  // Host configuration
  host:
    process.env.NODE_ENV === 'production'
      ? 'https://ic0.app'
      : 'http://localhost:4943',

  // Identity provider URL
  identityProvider: getIdentityProvider(),
} as const;

// Helper function to determine the correct derivation origin
function getDerivationOrigin(): string {
  const network =
    process.env.DFX_NETWORK ||
    (process.env.NODE_ENV === 'production' ? 'ic' : 'local');

  if (network === 'ic') {
    return 'https://decentra.app'; // Update to correct deployed mainnet (canister link) or domain
  }

  // In development, use the current origin if available (browser context)
  if (network == 'local') {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;

      // Handle different local development URLs
      if (origin.includes('localhost:3000')) {
        return 'http://localhost:3000';
      }

      // Handle canister URLs - always use localhost:3000 as derivation origin
      if (
        origin.includes('localhost:4943') ||
        origin.includes('127.0.0.1:4943')
      ) {
        return 'http://localhost:3000';
      }

      return origin;
    }
  }

  // Fallback for server-side rendering or when window is not available
  return 'http://localhost:3000';
}

// Helper function to get the correct identity provider URL
function getIdentityProvider(): string {
  const network =
    process.env.DFX_NETWORK ||
    (process.env.NODE_ENV === 'production' ? 'ic' : 'local');
  const iiCanisterId = process.env.CANISTER_ID_INTERNET_IDENTITY || '';

  if (network === 'ic') {
    return 'https://identity.ic0.app#authorize';
  }

  return `http://localhost:4943/?canisterId=${iiCanisterId}`;
}

export type ICPConfig = typeof icpConfig;

// Helper function to get canister ID with fallback
export const getCanisterId = (
  canisterName: keyof typeof icpConfig.canisters
): string => {
  const id = icpConfig.canisters[canisterName];
  if (!id) {
    console.warn(
      `Canister ID for ${canisterName} not found. Make sure to run 'dfx deploy' and check your environment variables.`
    );
  }
  return id;
};

// Helper function to check if all required canisters are configured
export const validateCanisterConfig = (): boolean => {
  const requiredCanisters = ['backend'] as const;
  return requiredCanisters.every(
    (canister) => icpConfig.canisters[canister] !== ''
  );
};

// Validation function to ensure proper configuration
export function validateConfiguration(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (icpConfig.network !== 'local' && !icpConfig.canisters.backend) {
    errors.push('Backend canister ID required for non-local networks');
  }

  if (icpConfig.network === 'local' && !icpConfig.internetIdentity) {
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
