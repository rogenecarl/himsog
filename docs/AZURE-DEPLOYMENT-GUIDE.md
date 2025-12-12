# Azure Deployment Guide for Himsog

Complete guide to deploy the Himsog healthcare platform to Microsoft Azure.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Step 1: Create Azure PostgreSQL Database](#step-1-create-azure-postgresql-database)
4. [Step 2: Configure PostgreSQL Firewall & Create Database](#step-2-configure-postgresql-firewall--create-database)
5. [Step 3: Create Azure App Service](#step-3-create-azure-app-service)
6. [Step 4: Configure App Service Settings](#step-4-configure-app-service-settings)
7. [Step 5: Push Database Schema](#step-5-push-database-schema)
8. [Step 6: Configure App Service Environment Variables](#step-6-configure-app-service-environment-variables)
9. [Step 7: Setup GitHub Actions Deployment](#step-7-setup-github-actions-deployment)
10. [Step 8: Configure GitHub Secrets](#step-8-configure-github-secrets)
11. [Step 9: Deploy](#step-9-deploy)
12. [Post-Deployment Tasks](#post-deployment-tasks)
13. [Troubleshooting](#troubleshooting)
14. [Cost Estimation](#cost-estimation)

---

## Prerequisites

Before starting, ensure you have:

- [ ] Azure account (Azure for Students recommended - $100 free credit)
- [ ] GitHub account with repository access
- [ ] Azure CLI installed (optional but helpful)
- [ ] Bun package manager installed locally
- [ ] Project cloned locally

### Install Azure CLI (Optional)

```bash
# Windows (PowerShell as Admin)
winget install Microsoft.AzureCLI

# Mac
brew install azure-cli

# Linux/WSL
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### Login to Azure CLI

```bash
az login
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 AZURE SOUTHEAST ASIA (Singapore)            │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  Azure App Service (B1 Basic)                       │  │
│   │  - Next.js 16 Application                           │  │
│   │  - Always-on enabled                                │  │
│   │  - Node.js 20 LTS runtime                           │  │
│   └─────────────────────┬───────────────────────────────┘  │
│                         │                                   │
│                         │ ~5ms (same datacenter)            │
│                         ▼                                   │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  Azure PostgreSQL Flexible Server                   │  │
│   │  - Burstable B1ms tier                              │  │
│   │  - 32GB storage                                     │  │
│   │  - Automatic backups                                │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Why Southeast Asia Region?**
- Closest to Philippines users (~30-50ms latency)
- Both App Service and PostgreSQL in same datacenter (~5ms between them)
- Significantly faster than US-based hosting

---

## Step 1: Create Azure PostgreSQL Database

### 1.1 Navigate to Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"+ Create a resource"**
3. Search for **"Azure Database for PostgreSQL Flexible Server"**
4. Click **"Create"**

### 1.2 Configure Basics Tab

| Field | Value |
|-------|-------|
| Subscription | Your Azure subscription |
| Resource group | Create new → `himsog-rg` |
| Server name | `himsog-db-server` (must be globally unique) |
| Region | **Southeast Asia** |
| PostgreSQL version | **16** |
| Workload type | Development |

### 1.3 Configure Authentication

| Field | Value |
|-------|-------|
| Authentication method | PostgreSQL authentication only |
| Admin username | `himsogadmin` |
| Password | Create a strong password (save it!) |

### 1.4 Configure Compute + Storage

| Field | Value |
|-------|-------|
| Cluster options | **Server** |
| Compute tier | **Burstable** |
| Compute size | **Standard_B1ms** (1 vCore, 2 GiB) |
| Storage size | **32 GiB** |
| Storage autogrow | Enabled |
| High Availability | **Disabled** (saves cost) |
| Backup retention | 7 days |
| Backup redundancy | Locally redundant |
| Geo-redundancy | Disabled |

### 1.5 Configure Networking

| Field | Value |
|-------|-------|
| Connectivity method | **Public access (allowed IP addresses)** |
| Allow public access | **Yes** |
| Allow access from Azure services | **Yes** ✅ |

### 1.6 Create the Server

1. Click **"Review + Create"**
2. Click **"Create"**
3. Wait 5-10 minutes for deployment

---

## Step 2: Configure PostgreSQL Firewall & Create Database

### 2.1 Configure Firewall

1. Go to your PostgreSQL server (`himsog-db-server`)
2. Left sidebar → **"Networking"**
3. Ensure **"Allow public access from Azure services"** is checked
4. Click **"+ Add current client IP address"** (for local access)
5. Click **"Save"**

### 2.2 Create the Database

1. Left sidebar → **"Databases"**
2. Click **"+ Add"**
3. Enter:
   - Name: `himsog`
   - Charset: `UTF8`
   - Collation: `en_US.utf8`
4. Click **"Save"**

### 2.3 Get Connection String

Your connection string format:
```
postgresql://himsogadmin:YOUR_PASSWORD@himsog-db-server.postgres.database.azure.com:5432/himsog?sslmode=require
```

> **Note:** If your password contains special characters like `@`, URL-encode them:
> - `@` becomes `%40`
> - `#` becomes `%23`
> - etc.

---

## Step 3: Create Azure App Service

### 3.1 Create Web App

1. Go to Azure Portal
2. Click **"+ Create a resource"**
3. Search **"Web App"** → Click **"Create"**

### 3.2 Configure Basics Tab

| Field | Value |
|-------|-------|
| Subscription | Your Azure subscription |
| Resource group | **himsog-rg** (select existing) |
| Name | `himsog` (must be globally unique) |
| Publish | **Code** |
| Runtime stack | **Node 20 LTS** |
| Operating System | **Linux** |
| Region | **Southeast Asia** |

### 3.3 Configure Pricing Plan

| Field | Value |
|-------|-------|
| Linux Plan | Create new → `himsog-plan` |
| Pricing plan | **Basic B1** (~$13/month) |

> **Important:** Don't use Free F1 tier - it doesn't support "Always On"

### 3.4 Skip Other Tabs

- **Deployment**: Skip (we'll use GitHub Actions)
- **Networking**: Default
- **Monitoring**: Disable Application Insights (saves cost)
- **Tags**: Skip

### 3.5 Create

1. Click **"Review + Create"**
2. Click **"Create"**
3. Wait 2-3 minutes

---

## Step 4: Configure App Service Settings

### 4.1 Enable Basic Auth for Deployment

1. Go to **himsog** App Service
2. Left sidebar → **"Configuration"**
3. **"General settings"** tab
4. Under **Platform settings**:
   - **SCM Basic Auth Publishing Credentials** → **ON**
   - **FTP Basic Auth Publishing Credentials** → **ON**
5. Click **"Save"**

### 4.2 Configure Startup Command

1. Still in **"Configuration"** → **"General settings"**
2. Under **Stack settings**:
   - Stack: **Node**
   - Major version: **Node 20 LTS**
   - Startup Command: `node server.js`
3. Click **"Save"**

### 4.3 Enable Always On

1. Under **Platform settings**:
   - **Always on** → **ON**
2. Click **"Save"**

---

## Step 5: Push Database Schema

### 5.1 Update Local Environment

Update your `.env` file with Azure PostgreSQL connection:

```env
# AZURE POSTGRESQL (Production)
DATABASE_URL="postgresql://himsogadmin:YOUR_PASSWORD@himsog-db-server.postgres.database.azure.com:5432/himsog?sslmode=require"
DIRECT_URL="postgresql://himsogadmin:YOUR_PASSWORD@himsog-db-server.postgres.database.azure.com:5432/himsog?sslmode=require"
```

### 5.2 Push Schema to Azure

```bash
# Navigate to project
cd /path/to/your/project

# Push Prisma schema to Azure PostgreSQL
bunx prisma db push

# Expected output:
# Datasource "db": PostgreSQL database "himsog" at "himsog-db-server.postgres.database.azure.com:5432"
# 🚀 Your database is now in sync with your Prisma schema.
```

### 5.3 Seed Database (Optional)

```bash
# Seed admin user
bun prisma/seed-admin.ts

# Seed providers
bun run seed:providers

# Seed insurance options
bun run seed:insurance
```

---

## Step 6: Configure App Service Environment Variables

### 6.1 Navigate to Configuration

1. Go to **himsog** App Service
2. Left sidebar → **"Configuration"**
3. **"Application settings"** tab

### 6.2 Add Environment Variables

Click **"+ New application setting"** for each:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://himsogadmin:YOUR_PASSWORD@himsog-db-server.postgres.database.azure.com:5432/himsog?sslmode=require` |
| `DIRECT_URL` | `postgresql://himsogadmin:YOUR_PASSWORD@himsog-db-server.postgres.database.azure.com:5432/himsog?sslmode=require` |
| `BETTER_AUTH_SECRET` | Your 32+ character secret |
| `BETTER_AUTH_URL` | `https://himsog.azurewebsites.net` |
| `NEXT_PUBLIC_APP_URL` | `https://himsog.azurewebsites.net` |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth secret |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Your Mapbox token |
| `GEMINI_API_KEY` | Your Gemini API key |
| `RESEND_API_KEY` | Your Resend API key |
| `RESEND_FROM_EMAIL` | Your verified email address |
| `NODE_ENV` | `production` |

### 6.3 Alternative: Using Advanced Edit

Click **"Advanced edit"** and paste JSON:

```json
[
  {
    "name": "DATABASE_URL",
    "value": "your-connection-string",
    "slotSetting": false
  },
  {
    "name": "DIRECT_URL",
    "value": "your-connection-string",
    "slotSetting": false
  }
  // ... add all other variables
]
```

### 6.4 Save Configuration

1. Click **"Save"**
2. Click **"Continue"** when prompted
3. App will restart

---

## Step 7: Setup GitHub Actions Deployment

### 7.1 Update Next.js Config

Ensure `next.config.ts` has standalone output:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Azure App Service deployment
  output: "standalone",

  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    remotePatterns: [
      // your image patterns
    ],
  },
};

export default nextConfig;
```

### 7.2 Create GitHub Actions Workflow

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure App Service

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  AZURE_WEBAPP_NAME: himsog
  NODE_VERSION: "20.x"

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --ignore-scripts
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DATABASE_URL }}

      - name: Generate Prisma Client
        run: bunx prisma generate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DATABASE_URL }}

      - name: Build Next.js app
        run: bun run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DATABASE_URL }}
          NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}
          NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: ${{ secrets.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          BETTER_AUTH_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}
          BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
          GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
          GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}

      - name: Prepare standalone output
        run: |
          cp -r public .next/standalone/public
          cp -r .next/static .next/standalone/.next/static
          mkdir -p .next/standalone/src/lib/generated
          cp -r src/lib/generated/prisma .next/standalone/src/lib/generated/
          echo '{"name":"himsog","version":"1.0.0","scripts":{"start":"node server.js"}}' > .next/standalone/package.json

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: ${{ env.AZURE_WEBAPP_NAME }}
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: .next/standalone
```

---

## Step 8: Configure GitHub Secrets

### 8.1 Get Publish Profile

1. Go to Azure Portal → **himsog** App Service
2. Click **"Overview"**
3. Click **"Download publish profile"** (top toolbar)
4. Open the downloaded file in a text editor
5. Copy the **entire XML content**

### 8.2 Add GitHub Secrets

1. Go to your GitHub repository
2. Click **"Settings"** → **"Secrets and variables"** → **"Actions"**
3. Click **"New repository secret"**

Add these 11 secrets:

| Secret Name | Value |
|-------------|-------|
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Entire XML from publish profile |
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Your auth secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `NEXT_PUBLIC_APP_URL` | `https://himsog.azurewebsites.net` |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox token |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `GEMINI_API_KEY` | Gemini API key |
| `RESEND_API_KEY` | Resend API key |

---

## Step 9: Deploy

### 9.1 Push to GitHub

```bash
git add .
git commit -m "Configure Azure deployment"
git push origin main
```

### 9.2 Monitor Deployment

1. Go to your GitHub repository
2. Click **"Actions"** tab
3. Watch the **"Deploy to Azure App Service"** workflow
4. Wait 3-5 minutes for completion

### 9.3 Verify Deployment

Visit your app:
```
https://himsog.azurewebsites.net
```

---

## Post-Deployment Tasks

### Seed Admin User

```bash
# Make sure your .env has Azure DATABASE_URL
bun prisma/seed-admin.ts
```

**Default Admin Credentials:**
- Email: `admin@admin.com`
- Password: `admin@123`

### Configure Google OAuth (Production)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to your OAuth credentials
3. Add authorized redirect URI:
   ```
   https://himsog.azurewebsites.net/api/auth/callback/google
   ```

### View Database Tables

```bash
# Using Prisma Studio
bunx prisma studio

# Or connect via psql
psql "postgresql://himsogadmin:PASSWORD@himsog-db-server.postgres.database.azure.com:5432/himsog?sslmode=require"
```

### View Application Logs

```bash
# Azure CLI
az webapp log tail --name himsog --resource-group himsog-rg

# Or in Azure Portal
# App Service → Log stream
```

---

## Troubleshooting

### Issue: "Failed to fetch" on Sign In

**Cause:** `NEXT_PUBLIC_APP_URL` not set during build time.

**Solution:**
1. Add `NEXT_PUBLIC_APP_URL` to GitHub secrets
2. Add it to the workflow's build step env variables
3. Redeploy

### Issue: "Database connection refused"

**Cause:** Firewall not configured.

**Solution:**
1. Go to PostgreSQL server → Networking
2. Ensure "Allow public access from Azure services" is checked
3. Add your current IP if connecting locally

### Issue: "GEMINI_API_KEY is not set"

**Cause:** Environment variable missing during build.

**Solution:**
1. Add `GEMINI_API_KEY` to GitHub secrets
2. Add it to workflow's build step env variables
3. Redeploy

### Issue: "Better Auth default secret" warning

**Cause:** `BETTER_AUTH_SECRET` not provided during build.

**Solution:**
1. Add `BETTER_AUTH_SECRET` to GitHub secrets
2. Add it to workflow's build step env variables
3. Redeploy

### Issue: Build fails with Prisma error

**Cause:** `DATABASE_URL` or `DIRECT_URL` missing.

**Solution:**
1. Ensure both secrets are in GitHub
2. Use `bun install --ignore-scripts` to skip postinstall
3. Run `bunx prisma generate` separately with env variables

### Issue: App shows "Application Error"

**Solution:**
1. Check logs: `az webapp log tail --name himsog --resource-group himsog-rg`
2. Verify all environment variables are set in App Service
3. Ensure startup command is `node server.js`

---

## Cost Estimation

### Azure for Students ($100 Credit)

| Service | Monthly Cost | Description |
|---------|--------------|-------------|
| App Service B1 | ~$13 | Basic tier, always-on |
| PostgreSQL B1ms | ~$15-23 | Burstable, 32GB storage |
| **Total** | **~$28-36/month** | |

**Credit Duration:** ~3-4 months free

### After Credits Expire

Same pricing applies. Consider:
- Downgrading to Free F1 tier (cold starts, no always-on)
- Using Azure spending limits
- Renewing student benefits annually

---

## Quick Reference

### Azure Resources

| Resource | Name | Region |
|----------|------|--------|
| Resource Group | `himsog-rg` | Southeast Asia |
| PostgreSQL Server | `himsog-db-server` | Southeast Asia |
| Database | `himsog` | - |
| App Service Plan | `himsog-plan` | Southeast Asia |
| Web App | `himsog` | Southeast Asia |

### URLs

| Service | URL |
|---------|-----|
| Application | `https://himsog.azurewebsites.net` |
| PostgreSQL Host | `himsog-db-server.postgres.database.azure.com` |

### Connection String Format

```
postgresql://USERNAME:PASSWORD@himsog-db-server.postgres.database.azure.com:5432/himsog?sslmode=require
```

---

## Security Recommendations

1. **Change default passwords** after deployment
2. **Rotate secrets** periodically
3. **Use Azure Key Vault** for production secrets
4. **Enable HTTPS only** in App Service settings
5. **Set up alerts** for unusual activity
6. **Regular backups** are automatic (7-day retention)

---

## Support

- **Azure Documentation:** https://docs.microsoft.com/azure
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Prisma with Azure:** https://www.prisma.io/docs/guides/deployment
- **Better Auth:** https://better-auth.com/docs

---

*Last updated: December 2024*
