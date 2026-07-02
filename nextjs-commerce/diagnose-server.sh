#!/bin/bash

# Server Diagnostics Script
# Server: 72.61.193.184:8080

echo "🔍 Diagnosing Server Issues"
echo "=========================="
echo ""

SERVER_IP="72.61.193.184"
SERVER_PORT="8080"

# Test 1: Basic connectivity
echo "📡 Test 1: Basic Connectivity"
if ping -c 1 $SERVER_IP &> /dev/null; then
    echo "✅ Server is reachable"
else
    echo "❌ Server is not reachable"
    exit 1
fi

# Test 2: Port accessibility
echo ""
echo "🔌 Test 2: Port ${SERVER_PORT} Accessibility"
if nc -zv -w5 $SERVER_IP $SERVER_PORT 2>&1 | grep -q succeeded; then
    echo "✅ Port ${SERVER_PORT} is open"
else
    echo "❌ Port ${SERVER_PORT} is closed or filtered"
fi

# Test 3: HTTP response
echo ""
echo "🌐 Test 3: HTTP Response"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://${SERVER_IP}:${SERVER_PORT}/)
echo "HTTP Status Code: ${HTTP_STATUS}"

# Test 4: Homepage content
echo ""
echo "📄 Test 4: Homepage Content"
curl -s http://${SERVER_IP}:${SERVER_PORT}/ | head -n 20

# Test 5: Check specific pages
echo ""
echo "🔍 Test 5: Check Specific Pages"

check_page() {
    local page=$1
    local status=$(curl -s -o /dev/null -w "%{http_code}" http://${SERVER_IP}:${SERVER_PORT}/${page})
    
    if [ "$status" = "200" ]; then
        echo "✅ ${page} - Accessible"
    else
        echo "❌ ${page} - Status: ${status}"
        
        # Check if it redirects
        final_url=$(curl -s -I http://${SERVER_IP}:${SERVER_PORT}/${page} | grep -i location | cut -d' ' -f2 | tr -d '\r')
        if [ -n "$final_url" ]; then
            echo "   Redirects to: ${final_url}"
        fi
    fi
}

check_page "index.html"
check_page "ai-models-download.html"
check_page "download_models_windows.bat"
check_page "download_ollama_models.sh"
check_page "models.html"
check_page "downloads.html"

# Test 6: Check server headers
echo ""
echo "📋 Test 6: Server Headers"
curl -s -I http://${SERVER_IP}:${SERVER_PORT}/ | grep -iE "server|x-powered-by"

# Test 7: Check for common issues
echo ""
echo "⚠️  Test 7: Common Issues"

# Check if files exist (if we had access to the server filesystem)
echo "   Note: Full filesystem check requires SSH access to the server"
echo "   Current diagnostics are limited to network-level checks"

# Test 8: Suggest fixes
echo ""
echo "🔧 Test 8: Suggested Fixes"
echo "Based on the page redirects observed, the likely issues are:"
echo "1. Client-side routing not properly configured"
echo "2. Web server redirecting all requests to index.html"
echo "3. Missing files on server"
echo "4. Incorrect server configuration"
echo ""
echo "Recommended solutions:"
echo "1. Use nginx configuration (provided in nginx-config.conf)"
echo "2. Deploy updated files including ai-models-download.html"
echo "3. Ensure web server serves .html files directly"
echo "4. Check server logs for more details"

echo ""
echo "🎯 Next Steps:"
echo "1. Run deploy-to-server.sh to deploy updated files"
echo "2. Apply nginx-config.conf if using nginx"
echo "3. Restart web server after changes"
echo "4. Test all pages again"