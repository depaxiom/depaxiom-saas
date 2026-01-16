#!/bin/bash
#
# Railway Start Script for Depaxiom
#
# This script loads secrets from Infisical before starting the server.
# Set these environment variables in Railway:
#   INFISICAL_SERVICE_TOKEN  - Service Token from Infisical (starts with st.)
#   INFISICAL_SITE_URL       - Infisical URL (default: https://app.infisical.com)
#

set -e

echo "🚀 Starting Depaxiom..."

# Check if Infisical is configured
if [ -n "$INFISICAL_SERVICE_TOKEN" ]; then
    echo "🔐 Loading secrets from Infisical..."

    # Fetch secrets and export them
    SECRETS=$(curl -s "${INFISICAL_SITE_URL:-https://app.infisical.com}/api/v3/secrets/raw?secretPath=/" \
        -H "Authorization: Bearer $INFISICAL_SERVICE_TOKEN" \
        -H "Content-Type: application/json")

    # Check if curl succeeded
    if [ $? -ne 0 ] || echo "$SECRETS" | grep -q '"error"'; then
        echo "❌ Failed to fetch secrets from Infisical"
        echo "$SECRETS"
        exit 1
    fi

    # Parse and export each secret
    echo "$SECRETS" | node -e "
        const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
        data.secrets.forEach(s => {
            // Escape special characters for shell
            const val = s.secretValue.replace(/'/g, \"'\\\\''\");
            console.log('export ' + s.secretKey + \"='\" + val + \"'\");
        });
    " > /tmp/secrets.sh

    source /tmp/secrets.sh
    rm -f /tmp/secrets.sh

    echo "✅ Secrets loaded"
else
    echo "ℹ️  Infisical not configured - using environment variables directly"
fi

# Start the Wasp server
echo "🌐 Starting server..."
exec node .wasp/build/server/bundle/server.js
