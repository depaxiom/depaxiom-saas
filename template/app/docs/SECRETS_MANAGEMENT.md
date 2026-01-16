# Secrets Management with Infisical

Depaxiom uses [Infisical](https://infisical.com) for secure secrets management.

## Overview

- **Local Development**: Use `.env.server` file (gitignored)
- **Production (Railway)**: Secrets fetched from Infisical at startup via Service Token

## Setup

### 1. Infisical Project

1. Log into Infisical at `http://localhost:8080` (self-hosted) or `https://app.infisical.com`
2. Create a project called `depaxiom`
3. Create environments: `development`, `staging`, `production`
4. Add your secrets to each environment

### 2. Required Secrets

Add these secrets to your Infisical project:

| Secret Key | Description | Required |
|------------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `STRIPE_API_KEY` | Stripe secret key | For payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | For payments |
| `SENDGRID_API_KEY` | SendGrid API key | For emails |
| `OPENAI_API_KEY` | OpenAI API key | For AI features |
| `ADMIN_EMAILS` | Comma-separated admin emails | ✅ |

### 3. Create Service Token (for Production)

1. In Infisical, go to **Project Settings** → **Service Tokens**
2. Click **Create Token**
3. Configure:
   - **Name**: `depaxiom-production`
   - **Environment**: `production`
   - **Path**: `/`
   - **Permissions**: Read
4. Copy the token (starts with `st.`) - **save it securely, it won't be shown again**

## Local Development

Create `.env.server` with your development secrets:

```bash
cp .env.server.example .env.server
# Edit .env.server with your values
```

⚠️ **Never commit `.env.server` to git!**

## Production Deployment (Railway)

### Environment Variables

Set these in Railway dashboard:

```
INFISICAL_SERVICE_TOKEN=st.xxxxx.xxxxx.xxxxx
INFISICAL_SITE_URL=http://your-infisical-instance:8080
```

For Infisical Cloud, omit `INFISICAL_SITE_URL` (defaults to `https://app.infisical.com`).

### Start Command

Use the custom start script in Railway:

```
bash scripts/railway-start.sh
```

### How It Works

1. On startup, `railway-start.sh` checks for `INFISICAL_SERVICE_TOKEN`
2. If configured, it fetches secrets from Infisical API
3. Secrets are exported as environment variables
4. The Wasp server starts with all secrets available

## Testing Locally

Test the secrets loader:

```bash
INFISICAL_SERVICE_TOKEN="st.your-token-here" \
INFISICAL_SITE_URL="http://localhost:8080" \
npx tsx scripts/load-secrets.ts
```

## Security Best Practices

1. **Rotate Service Tokens** periodically
2. **Use separate tokens** per environment (dev, staging, prod)
3. **Limit permissions** - Service Tokens should only have Read access
4. **Set expiration** on Service Tokens if desired
5. **Never log secret values** - only log that secrets were loaded
6. **Never commit** `.env.server` or Service Tokens to git

## Troubleshooting

### "Missing required Infisical configuration"

Ensure `INFISICAL_SERVICE_TOKEN` is set in Railway environment variables.

### "Invalid INFISICAL_SERVICE_TOKEN format"

Service tokens must start with `st.` - verify you copied the complete token.

### "Failed to fetch secrets"

1. Verify the Service Token has access to the correct environment
2. Check `INFISICAL_SITE_URL` is correct for self-hosted instances
3. Ensure the Infisical server is running and accessible

### "Missing critical secrets: DATABASE_URL"

The secret doesn't exist in Infisical for the token's environment. Add it in the Infisical UI.
