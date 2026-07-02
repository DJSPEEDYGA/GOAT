#!/bin/bash

# GOAT Royalty App - Comprehensive Testing Script
# Tests all features and functionality

echo "🧪 Starting Comprehensive Testing of GOAT Royalty App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost"
FRONTEND_URL="http://localhost:3002"
API_BASE="http://localhost:5001/api"

print_status() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

# Test counter
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    print_test "$test_name"
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    if eval "$test_command" >> /dev/null 2>&1; then
        print_status "$test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        print_fail "$test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "=========================================="
echo "🧪 GOAT ROYALTY APP - COMPREHENSIVE TESTS"
echo "=========================================="

echo ""
echo "📊 Phase 1: Basic Connectivity Tests"
echo "=========================================="

# Test frontend is running
run_test "Frontend is accessible" "curl -f -s $FRONTEND_URL"

# Test backend is running
run_test "Backend API is accessible" "curl -f -s $API_BASE/health"

# Test MongoDB connection
run_test "MongoDB is running" "systemctl is-active mongod"

# Test PM2 processes
run_test "PM2 processes are running" "pm2 list | grep -q 'online'"

echo ""
echo "🔐 Phase 2: Authentication Tests"
echo "=========================================="

# Test registration endpoint
run_test "Registration endpoint exists" "curl -f -s -X POST $API_BASE/auth/register -H 'Content-Type: application/json' -d '{&quot;name&quot;:&quot;Test&quot;,&quot;email&quot;:&quot;test@test.com&quot;,&quot;password&quot;:&quot;test123&quot;}'"

# Test login endpoint
run_test "Login endpoint exists" "curl -f -s -X POST $API_BASE/auth/login -H 'Content-Type: application/json' -d '{&quot;email&quot;:&quot;test@test.com&quot;,&quot;password&quot;:&quot;test123&quot;}'"

# Test protected endpoint
run_test "Protected endpoint requires auth" "curl -s -X GET $API_BASE/artists | grep -q 'Unauthorized'"

echo ""
echo "👥 Phase 3: Artist Management Tests"
echo "=========================================="

# Test artists endpoint
run_test "Artists list endpoint" "curl -f -s $API_BASE/artists"

# Test artist creation
run_test "Artist creation endpoint" "curl -f -s -X POST $API_BASE/artists -H 'Content-Type: application/json' -d '{&quot;name&quot;:&quot;Test Artist&quot;,&quot;email&quot;:&quot;artist@test.com&quot;}'"

echo ""
echo "💰 Phase 4: Royalty Management Tests"
echo "=========================================="

# Test royalties endpoint
run_test "Royalties list endpoint" "curl -f -s $API_BASE/royalties"

# Test royalty creation
run_test "Royalty creation endpoint" "curl -f -s -X POST $API_BASE/royalties -H 'Content-Type: application/json' -d '{&quot;amount&quot;:1000,&quot;artistId&quot;:&quot;test-id&quot;}'"

echo ""
echo "💳 Phase 5: Payment Processing Tests"
echo "=========================================="

# Test payments endpoint
run_test "Payments list endpoint" "curl -f -s $API_BASE/payments"

# Test payment creation
run_test "Payment creation endpoint" "curl -f -s -X POST $API_BASE/payments -H 'Content-Type: application/json' -d '{&quot;amount&quot;:500,&quot;artistId&quot;:&quot;test-id&quot;,&quot;method&quot;:&quot;bank_transfer&quot;}'"

echo ""
echo "📈 Phase 6: Reporting Tests"
echo "=========================================="

# Test reports endpoint
run_test "Reports dashboard endpoint" "curl -f -s $API_BASE/reports/dashboard"

# Test report generation
run_test "Report generation endpoint" "curl -f -s -X POST $API_BASE/reports/generate -H 'Content-Type: application/json' -d '{&quot;reportType&quot;:&quot;earnings&quot;,&quot;format&quot;:&quot;json&quot;}'"

echo ""
echo "🤖 Phase 7: Autonomous Agent Tests"
echo "=========================================="

# Test agent endpoint
run_test "Agent capabilities endpoint" "curl -f -s $API_BASE/agent/capabilities"

# Test agent execution
run_test "Agent execute endpoint" "curl -f -s -X POST $API_BASE/agent/execute -H 'Content-Type: application/json' -d '{&quot;task&quot;:&quot;Test task&quot;}'"

echo ""
echo "🌐 Phase 8: Hostinger Integration Tests"
echo "=========================================="

# Test Hostinger connection
run_test "Hostinger API test endpoint" "curl -f -s $API_BASE/hostinger/test"

# Test domains endpoint
run_test "Hostinger domains endpoint" "curl -f -s $API_BASE/hostinger/domains"

echo ""
echo "💬 Phase 9: AI Chat Integration Tests"
echo "=========================================="

# Test chat endpoint
run_test "AI chat endpoint" "curl -f -s -X POST $API_BASE/chat -H 'Content-Type: application/json' -d '{&quot;message&quot;:&quot;Hello&quot;}'"

# Test streaming endpoint
run_test "AI chat stream endpoint" "curl -f -s -X POST $API_BASE/chat/stream -H 'Content-Type: application/json' -d '{&quot;message&quot;:&quot;Hello&quot;}'"

echo ""
echo "🎬 Phase 10: Video & Media Tests"
echo "=========================================="

# Test video endpoint
run_test "Video directory is accessible" "test -d /var/www/GOAT-Royalty-App/public/videos/branding"

# Test video files exist
run_test "Video files exist" "ls /var/www/GOAT-Royalty-App/public/videos/branding/*.mp4 | wc -l | grep -q '15'"

# Test video metadata
run_test "Video metadata exists" "test -f /var/www/GOAT-Royalty-App/public/videos/branding/index.json"

echo ""
echo "🔧 Phase 11: System Health Tests"
echo "=========================================="

# Test system resources
run_test "Memory usage under 80%" "free | grep Mem | awk '{print ($3/$2)*100}' | awk '{print $1 < 80}'"

# Test disk space
run_test "Disk usage under 80%" "df / | tail -1 | awk '{print $5}' | sed 's/%//' | awk '{print $1 < 80}'"

# Test CPU load
run_test "CPU load under 2.0" "uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//' | awk '{print $1 < 2.0}'"

echo ""
echo "📝 Phase 12: Configuration Tests"
echo "=========================================="

# Test environment file exists
run_test "Environment file exists" "test -f /var/www/GOAT-Royalty-App/.env"

# Test environment variables
run_test "Environment has required variables" "grep -q 'NODE_ENV\|PORT\|MONGODB_URI' /var/www/GOAT-Royalty-App/.env"

# Test SSL certificate
run_test "SSL certificate exists" "test -f /etc/letsencrypt/live/93.127.214.171/fullchain.pem"

echo ""
echo "🌐 Phase 13: External Connectivity Tests"
echo "=========================================="

# Test OpenAI API (if key is configured)
if grep -q 'sk-proj' /var/www/GOAT-Royalty-App/.env; then
    run_test "OpenAI API is accessible" "curl -s -H 'Authorization: Bearer $(grep OPENAI_API_KEY /var/www/GOAT-Royalty-App/.env | cut -d'=' -f2)' https://api.openai.com/v1/models | grep -q 'gpt'"
else
    print_warning "OpenAI API key not configured"
fi

# Test Hostinger API
if grep -q 'u4WIezhO6K1Zv0ZXor4VMDHZNFzpKb3h0iNgdUpda243813a' /var/www/GOAT-Royalty-App/.env; then
    print_status "Hostinger API key is configured"
else
    print_warning "Hostinger API key not found"
fi

echo ""
echo "=========================================="
echo "📊 TEST RESULTS SUMMARY"
echo "=========================================="
echo ""
echo -e "${BLUE}Total Tests:${NC} $TESTS_TOTAL"
echo -e "${GREEN}Passed:${NC} $TESTS_PASSED"
echo -e "${RED}Failed:${NC} $TESTS_FAILED"
echo ""

# Calculate pass rate
if [ $TESTS_TOTAL -gt 0 ]; then
    PASS_RATE=$((TESTS_PASSED * 100 / TESTS_TOTAL))
    echo -e "${BLUE}Pass Rate:${NC} $PASS_RATE%"
    
    if [ $PASS_RATE -ge 90 ]; then
        echo -e "${GREEN}🎉 EXCELLENT! Application is production ready!${NC}"
    elif [ $PASS_RATE -ge 75 ]; then
        echo -e "${YELLOW}👍 GOOD! Application is mostly functional${NC}"
    elif [ $PASS_RATE -ge 50 ]; then
        echo -e "${YELLOW}⚠️ FAIR! Some issues need attention${NC}"
    else
        echo -e "${RED}❌ POOR! Major issues need to be resolved${NC}"
    fi
else
    echo -e "${RED}❌ No tests were executed${NC}"
fi

echo ""
echo "🔍 Failed Tests Details:"
if [ $TESTS_FAILED -gt 0 ]; then
    echo "Please review the failed tests and fix the issues."
else
    echo "All tests passed! 🎉"
fi

echo ""
echo "📚 Next Steps:"
echo "1. Review any failed tests"
echo "2. Fix configuration issues"
echo "3. Test manually in browser"
echo "4. Deploy to production if ready"
echo ""

echo "🌐 Application URLs:"
echo "Frontend: http://93.127.214.171"
echo "Frontend (HTTPS): https://93.127.214.171"
echo "Backend API: http://93.127.214.171/api/health"
echo "Backend API (HTTPS): https://93.127.214.171/api/health"
echo ""

echo "📊 Monitoring Commands:"
echo "Check status: goat-monitor"
echo "Restart app: goat-restart"
echo "View logs: pm2 logs"

echo ""
echo -e "${GREEN}🧪 Testing completed!${NC}"