#!/bin/bash

# UIForge Web App Deployment Script
# Deploys the web app to Cloudflare Pages

set -e

echo "🚀 Starting UIForge Web App deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the apps/web directory."
    exit 1
fi

# Build the application
echo "📦 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."

# Check if this is a preview or production deployment
ENVIRONMENT=${1:-preview}

if [ "$ENVIRONMENT" = "production" ]; then
    echo "🚀 Deploying to production..."
    wrangler pages deploy .next --env production
else
    echo "👀 Deploying to preview..."
    wrangler pages deploy .next --env preview
fi

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🔗 Your app is now live on Cloudflare Pages"
else
    echo "❌ Deployment failed. Please check the logs above."
    exit 1
fi