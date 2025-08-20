#!/bin/bash

echo "🚀 Starting PerhitSiksha Staging Environment"
echo "============================================"

# Check if authenticated
if [ ! -d "$HOME/.cloudflared" ] || [ ! -f "$HOME/.cloudflared/cert.pem" ]; then
    echo "❌ Cloudflare not authenticated. Please run:"
    echo "   ./cloudflared tunnel login"
    echo "   Then select 'materiallab.io' in your browser"
    exit 1
fi

# Check if tunnel exists
TUNNEL_EXISTS=$(./cloudflared tunnel list 2>/dev/null | grep "perhitsiksha-staging" | wc -l)

if [ "$TUNNEL_EXISTS" -eq 0 ]; then
    echo "🔧 Creating tunnel..."
    ./cloudflared tunnel create perhitsiksha-staging
    
    # Get tunnel UUID
    TUNNEL_UUID=$(./cloudflared tunnel list | grep "perhitsiksha-staging" | awk '{print $1}')
    
    echo "📄 Creating config..."
    mkdir -p "$HOME/.cloudflared"
    
    cat > "$HOME/.cloudflared/config.yml" << EOF
tunnel: $TUNNEL_UUID
credentials-file: $HOME/.cloudflared/$TUNNEL_UUID.json

ingress:
  - hostname: staging.materiallab.io
    service: http://localhost:8000
  - service: http_status:404
EOF
    
    echo "🌐 Creating DNS record..."
    ./cloudflared tunnel route dns perhitsiksha-staging staging.materiallab.io
    
    echo "✅ Tunnel setup complete!"
fi

# Build and start local server
echo "🔨 Building project..."
npm run build > /dev/null 2>&1

echo "🖥️  Starting local server on port 8000..."
cd dist
python3 -m http.server 8000 > /dev/null 2>&1 &
LOCAL_PID=$!
cd ..

sleep 2

# Start tunnel
echo "🔗 Starting Cloudflare tunnel..."
echo "📍 Staging URL: https://staging.materiallab.io"
echo "🎯 Testing the view counter - each page load increments!"
echo ""
echo "Press Ctrl+C to stop both server and tunnel"

# Trap to cleanup on exit
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    kill $LOCAL_PID 2>/dev/null
    pkill -f "cloudflared tunnel run" 2>/dev/null
    echo "✅ Stopped staging environment"
    exit 0
}
trap cleanup INT TERM

# Run tunnel in foreground
./cloudflared tunnel run perhitsiksha-staging