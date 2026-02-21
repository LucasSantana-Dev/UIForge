#!/bin/bash

# Zero-Cost AI Setup Script
# Installs and configures Ollama for local AI model hosting

set -e

echo "🚀 Setting up Zero-Cost AI with Ollama..."

# Check if Ollama is already installed
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is already installed"
    ollama --version
else
    echo "📦 Installing Ollama..."
    
    # Detect OS and install accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install ollama
        else
            echo "❌ Homebrew not found. Please install Homebrew first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://ollama.com/install.sh | sh
    else
        echo "❌ Unsupported OS. Please install Ollama manually from https://ollama.com"
        exit 1
    fi
fi

# Start Ollama service
echo "🔄 Starting Ollama service..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    ollama serve &
    OLLAMA_PID=$!
    echo "Ollama started with PID: $OLLAMA_PID"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    sudo systemctl start ollama || ollama serve &
    OLLAMA_PID=$!
    echo "Ollama started"
fi

# Wait for Ollama to be ready
echo "⏳ Waiting for Ollama to be ready..."
sleep 5

# Check if Ollama is running
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is running and accessible"
else
    echo "❌ Ollama failed to start. Please check the logs:"
    echo "   macOS: Check Console.app for errors"
    echo "   Linux: sudo journalctl -u ollama"
    exit 1
fi

# Install a free model
echo "📥 Installing Llama2 model (free, 4GB)..."
ollama pull llama2:7b

# Verify installation
echo "🔍 Verifying model installation..."
if ollama list | grep -q "llama2:7b"; then
    echo "✅ Llama2 model installed successfully"
else
    echo "❌ Model installation failed"
    exit 1
fi

# Test the AI service
echo "🧪 Testing AI service..."
TEST_RESPONSE=$(curl -s -X POST http://localhost:11434/api/generate \
    -H "Content-Type: application/json" \
    -d '{
      "model": "llama2:7b",
      "prompt": "Respond with just OK",
      "stream": false
    }' | jq -r '.response' 2>/dev/null || echo "")

if [[ "$TEST_RESPONSE" == *"OK"* ]]; then
    echo "✅ AI service is working correctly"
else
    echo "⚠️  AI service test failed, but installation may still be working"
fi

echo ""
echo "🎉 Zero-Cost AI Setup Complete!"
echo ""
echo "📋 Summary:"
echo "   • Ollama installed and running"
echo "   • Llama2 model downloaded"
echo "   • Local AI service ready at http://localhost:11434"
echo "   • Cost: $0/month (self-hosted)"
echo ""
echo "🔗 Next steps:"
echo "   1. Start the API server: npm run dev"
echo "   2. Test AI generation: POST http://localhost:3001/api/ai/generate"
echo "   3. Check AI status: GET http://localhost:3001/api/ai/status"
echo ""
echo "💡 To install more models:"
echo "   ollama pull codellama     # Code generation"
echo "   ollama pull mistral        # General purpose"
echo "   ollama pull phi            # Small and fast"
echo ""

# Save PID to file for later cleanup
if [[ -n "$OLLAMA_PID" ]]; then
    echo $OLLAMA_PID > /tmp/ollama.pid
    echo "💾 Ollama PID saved to /tmp/ollama.pid"
fi
