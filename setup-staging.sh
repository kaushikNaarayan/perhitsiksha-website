#!/bin/bash

echo "🚀 Setting up Cloudflare Tunnel for PerhitSiksha Staging"
echo "========================================="

# Check if cloudflared is available
if [ ! -f "./cloudflared" ]; then
    echo "❌ cloudflared not found. Please ensure it's in the current directory."
    exit 1
fi

# Step 1: Login (requires manual intervention)
echo "📝 Step 1: Authenticating with Cloudflare..."
echo "Please run: ./cloudflared tunnel login"
echo "Then select the 'materiallab.io' zone in your browser."
echo ""
read -p "Press Enter after you've completed the login process..."

# Step 2: Create tunnel
echo "🔧 Step 2: Creating named tunnel..."
TUNNEL_NAME="perhitsiksha-staging"
./cloudflared tunnel create $TUNNEL_NAME

# Get tunnel UUID
TUNNEL_UUID=$(./cloudflared tunnel list | grep $TUNNEL_NAME | awk '{print $1}')
echo "✅ Created tunnel: $TUNNEL_NAME ($TUNNEL_UUID)"

# Step 3: Create config file
echo "📄 Step 3: Creating tunnel configuration..."
CONFIG_DIR="$HOME/.cloudflared"
mkdir -p "$CONFIG_DIR"

cat > "$CONFIG_DIR/config.yml" << EOF
tunnel: $TUNNEL_UUID
credentials-file: $CONFIG_DIR/$TUNNEL_UUID.json

ingress:
  - hostname: staging.materiallab.io
    service: http://localhost:8000
  - service: http_status:404
EOF

echo "✅ Configuration created at $CONFIG_DIR/config.yml"

# Step 4: Create DNS record
echo "🌐 Step 4: Creating DNS record for staging.materiallab.io..."
./cloudflared tunnel route dns $TUNNEL_NAME staging.materiallab.io

echo "✅ DNS record created: staging.materiallab.io"

# Step 5: Instructions for running
echo ""
echo "🎉 Setup Complete!"
echo "=========================="
echo ""
echo "To start the staging environment:"
echo "1. Start your local server:"
echo "   npm run build && cd dist && python3 -m http.server 8000 &"
echo ""
echo "2. Start the tunnel:"
echo "   ./cloudflared tunnel run $TUNNEL_NAME"
echo ""
echo "3. Visit: https://staging.materiallab.io"
echo ""
echo "Your staging environment will be available at:"
echo "🔗 https://staging.materiallab.io"