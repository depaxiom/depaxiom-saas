#!/usr/bin/env npx tsx
/**
 * Production Start Script for Depaxiom
 *
 * This script:
 * 1. Loads secrets from Infisical (if configured)
 * 2. Starts the Wasp server
 *
 * For Railway deployment, set these environment variables:
 *   INFISICAL_CLIENT_ID
 *   INFISICAL_CLIENT_SECRET
 *   INFISICAL_PROJECT_ID
 *   INFISICAL_ENVIRONMENT (default: production)
 *   INFISICAL_SITE_URL (default: https://app.infisical.com)
 */

import { spawn } from 'child_process';
import { loadSecrets } from './load-secrets';

async function main() {
  // Check if Infisical is configured
  const useInfisical = !!(
    process.env.INFISICAL_CLIENT_ID &&
    process.env.INFISICAL_CLIENT_SECRET &&
    process.env.INFISICAL_PROJECT_ID
  );

  if (useInfisical) {
    console.log('🔐 Infisical configured - loading secrets...');
    await loadSecrets();
  } else {
    console.log('ℹ️  Infisical not configured - using environment variables');
  }

  // Start the Wasp server
  console.log('🚀 Starting Depaxiom server...\n');

  const serverPath = process.env.WASP_SERVER_PATH || '.wasp/build/server/bundle/server.js';

  const server = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: process.env,
  });

  server.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });

  server.on('exit', (code) => {
    process.exit(code || 0);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n📛 Received SIGTERM, shutting down...');
    server.kill('SIGTERM');
  });

  process.on('SIGINT', () => {
    console.log('\n📛 Received SIGINT, shutting down...');
    server.kill('SIGINT');
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
