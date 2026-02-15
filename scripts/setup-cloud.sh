#!/bin/bash

# UIForge Webapp - Supabase Cloud Setup Script
# This script helps set up the project with Supabase Cloud

set -e

echo "🚀 UIForge Webapp - Supabase Cloud Setup"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ -f "apps/web/.env.local" ]; then
    echo "⚠️  Warning: apps/web/.env.local already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 1
    fi
fi

echo "📝 Please provide your Supabase credentials"
echo "   (Get these from: https://supabase.com/dashboard/project/_/settings/api)"
echo ""

# Get Supabase URL
read -p "Enter your Supabase Project URL: " SUPABASE_URL
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Error: Supabase URL is required"
    exit 1
fi

# Get Supabase anon key
read -p "Enter your Supabase anon key: " SUPABASE_ANON_KEY
if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Supabase anon key is required"
    exit 1
fi

# Create .env.local file
echo "📄 Creating apps/web/.env.local..."
cat > apps/web/.env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_BYOK=true
NEXT_PUBLIC_ENABLE_GEMINI_FALLBACK=true

# Testing (Optional)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123
EOF

echo "✅ Environment file created successfully!"
echo ""

# Ask about linking project
read -p "Do you want to link this project to Supabase CLI? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Extract project ref from URL
    PROJECT_REF=$(echo $SUPABASE_URL | sed -E 's/https:\/\/([^.]+).*/\1/')
    
    echo "🔗 Linking to Supabase project: $PROJECT_REF"
    supabase link --project-ref $PROJECT_REF
    
    if [ $? -eq 0 ]; then
        echo "✅ Project linked successfully!"
        echo ""
        
        # Ask about generating types
        read -p "Do you want to generate TypeScript types now? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "📝 Generating TypeScript types..."
            supabase gen types typescript --linked > apps/web/src/lib/supabase/database.types.ts
            
            if [ $? -eq 0 ]; then
                echo "✅ TypeScript types generated successfully!"
            else
                echo "⚠️  Warning: Failed to generate types. You can do this later with:"
                echo "   supabase gen types typescript --linked > apps/web/src/lib/supabase/database.types.ts"
            fi
        fi
    else
        echo "⚠️  Warning: Failed to link project. You can do this later with:"
        echo "   supabase link --project-ref $PROJECT_REF"
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Apply migrations in Supabase Dashboard SQL Editor"
echo "   - Run: supabase/migrations/20260215000001_initial_schema.sql"
echo "   - Run: supabase/migrations/20260215000002_storage_setup.sql"
echo ""
echo "2. Start the development server:"
echo "   cd apps/web && npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For detailed instructions, see: docs/SUPABASE_CLOUD_SETUP.md"
