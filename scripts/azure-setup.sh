#!/bin/bash

# ============================================================================
# Azure Setup Script for Himsog
# Run this after logging into Azure CLI: az login
# ============================================================================

# Configuration - CHANGE THESE VALUES
RESOURCE_GROUP="himsog-rg"
LOCATION="southeastasia"  # Singapore - closest to Philippines
APP_NAME="himsog"     # Must be globally unique, change if taken
DB_SERVER_NAME="himsog-db-server"  # Must be globally unique
DB_NAME="himsog"
DB_ADMIN_USER="himsogadmin"
DB_ADMIN_PASSWORD="ChangeThisPassword123!"  # CHANGE THIS!

echo "============================================"
echo "Setting up Azure resources for Himsog"
echo "Region: $LOCATION (Singapore)"
echo "============================================"

# Step 1: Create Resource Group
echo ""
echo "[1/5] Creating Resource Group..."
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Step 2: Create Azure Database for PostgreSQL Flexible Server
echo ""
echo "[2/5] Creating PostgreSQL Flexible Server..."
echo "This may take 5-10 minutes..."
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER_NAME \
  --location $LOCATION \
  --tier Burstable \
  --sku-name Standard_B1ms \
  --storage-size 32 \
  --admin-user $DB_ADMIN_USER \
  --admin-password "$DB_ADMIN_PASSWORD" \
  --public-access 0.0.0.0 \
  --yes

# Step 3: Create Database
echo ""
echo "[3/5] Creating database..."
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $DB_SERVER_NAME \
  --database-name $DB_NAME

# Step 4: Create App Service Plan
echo ""
echo "[4/5] Creating App Service Plan (B1 Basic)..."
az appservice plan create \
  --name "${APP_NAME}-plan" \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku B1 \
  --is-linux

# Step 5: Create Web App
echo ""
echo "[5/5] Creating Web App..."
az webapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan "${APP_NAME}-plan" \
  --runtime "NODE:20-lts"

# Configure Web App settings
echo ""
echo "Configuring Web App settings..."
az webapp config set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --startup-file "node server.js"

# Enable always-on (available in B1 tier)
az webapp config set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --always-on true

echo ""
echo "============================================"
echo "SETUP COMPLETE!"
echo "============================================"
echo ""
echo "Your connection string:"
echo "DATABASE_URL=\"postgresql://${DB_ADMIN_USER}:${DB_ADMIN_PASSWORD}@${DB_SERVER_NAME}.postgres.database.azure.com:5432/${DB_NAME}?sslmode=require\""
echo ""
echo "Your Web App URL:"
echo "https://${APP_NAME}.azurewebsites.net"
echo ""
echo "Next steps:"
echo "1. Copy the DATABASE_URL above"
echo "2. Run: az webapp deployment list-publishing-profiles --name $APP_NAME --resource-group $RESOURCE_GROUP --xml"
echo "3. Copy the entire XML output as AZURE_WEBAPP_PUBLISH_PROFILE secret in GitHub"
echo "4. Add all environment variables to Azure App Service"
echo "============================================"
