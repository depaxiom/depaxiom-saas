/**
 * Infisical Secrets Loader for Depaxiom
 *
 * This script fetches secrets from Infisical and exports them as environment variables.
 * Used for production deployments (Railway) where secrets should not be in files.
 *
 * Usage:
 *   npx tsx scripts/load-secrets.ts
 *
 * Required environment variables:
 *   INFISICAL_SERVICE_TOKEN - Service Token from Infisical (starts with st.)
 *   INFISICAL_SITE_URL      - Infisical instance URL (default: https://app.infisical.com)
 *
 * Optional:
 *   INFISICAL_ENVIRONMENT   - Override environment (default: from token)
 *   INFISICAL_SECRET_PATH   - Secret path (default: /)
 */

interface InfisicalSecret {
  secretKey: string;
  secretValue: string;
}

interface InfisicalResponse {
  secrets: InfisicalSecret[];
}

interface SecretConfig {
  serviceToken: string;
  siteUrl: string;
  secretPath: string;
}

function getConfig(): SecretConfig {
  const serviceToken = process.env.INFISICAL_SERVICE_TOKEN;
  const siteUrl = process.env.INFISICAL_SITE_URL || 'https://app.infisical.com';
  const secretPath = process.env.INFISICAL_SECRET_PATH || '/';

  if (!serviceToken) {
    console.error('❌ Missing required Infisical configuration:');
    console.error('   - INFISICAL_SERVICE_TOKEN');
    console.error('\nSet this environment variable in Railway or your deployment platform.');
    process.exit(1);
  }

  if (!serviceToken.startsWith('st.')) {
    console.error('❌ Invalid INFISICAL_SERVICE_TOKEN format');
    console.error('   Service tokens should start with "st."');
    process.exit(1);
  }

  return { serviceToken, siteUrl, secretPath };
}

async function loadSecrets(): Promise<void> {
  const config = getConfig();

  console.log('🔐 Loading secrets from Infisical...');

  try {
    // Parse the service token to extract workspace and environment
    // Service token format: st.<token-id>.<token-secret>.<...>
    const tokenParts = config.serviceToken.split('.');
    if (tokenParts.length < 3) {
      throw new Error('Invalid service token format');
    }

    // Fetch secrets using Service Token API
    const url = new URL('/api/v3/secrets/raw', config.siteUrl);
    url.searchParams.set('secretPath', config.secretPath);
    url.searchParams.set('include_imports', 'true');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.serviceToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch secrets: ${response.status} ${error}`);
    }

    const data: InfisicalResponse = await response.json();

    // Export secrets as environment variables
    let loadedCount = 0;
    for (const secret of data.secrets) {
      // Only set if not already defined (allows local overrides)
      if (!process.env[secret.secretKey]) {
        process.env[secret.secretKey] = secret.secretValue;
        loadedCount++;
      }
    }

    console.log(`✅ Loaded ${loadedCount} secrets from Infisical`);

    // Verify critical secrets are present
    const criticalSecrets = ['DATABASE_URL'];
    const missing = criticalSecrets.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      console.warn(`⚠️  Warning: Missing critical secrets: ${missing.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Failed to load secrets from Infisical:', error);
    process.exit(1);
  }
}

// Export for use as a module
export { loadSecrets };

// Run if executed directly
const isMainModule = process.argv[1]?.endsWith('load-secrets.ts');
if (isMainModule) {
  loadSecrets()
    .then(() => {
      console.log('\n📋 Loaded environment variables:');
      const safeKeys = Object.keys(process.env).filter(
        (k) =>
          k.startsWith('DATABASE') ||
          k.startsWith('REDIS') ||
          k.startsWith('STRIPE') ||
          k.startsWith('SENDGRID') ||
          k.startsWith('OPENAI') ||
          k.startsWith('ADMIN')
      );
      safeKeys.forEach((k) => console.log(`   ${k}=***`));
    })
    .catch((err) => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}
