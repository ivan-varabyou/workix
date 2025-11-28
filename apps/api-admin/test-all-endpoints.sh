#!/bin/bash

# Скрипт для проверки всех эндпоинтов auth сервиса
# Использование: ./test-all-endpoints.sh

BASE_URL="http://localhost:7100/api-admin/v1"
SERVICE_KEY="dev-service-key-minimum-32-characters-long-for-development-only"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"

echo "🧪 Тестирование всех эндпоинтов auth сервиса"
echo "=========================================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для проверки эндпоинта
check_endpoint() {
    local method=$1
    local path=$2
    local data=$3
    local headers=$4
    local description=$5

    echo -n "  $method $path ... "

    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$path" $headers 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$path" -H "Content-Type: application/json" -d "$data" $headers 2>&1)
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ OK (${http_code})${NC}"
        return 0
    elif [ "$http_code" -ge 400 ] && [ "$http_code" -lt 500 ]; then
        echo -e "${YELLOW}⚠️  Client Error (${http_code})${NC}"
        return 1
    else
        echo -e "${RED}❌ Error (${http_code})${NC}"
        return 1
    fi
}

# 1. Health Check
echo "1. Health Check"
check_endpoint "GET" "/auth/health" "" "" "Health check"
echo ""

# 2. Registration
echo "2. Registration"
check_endpoint "POST" "/auth/register" "{\"email\":\"$TEST_EMAIL\",\"name\":\"Test User\",\"password\":\"$TEST_PASSWORD\"}" "-H \"X-Service-Key: $SERVICE_KEY\"" "Register new user"
echo ""

# 3. Login
echo "3. Login"
login_response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -H "X-Service-Key: $SERVICE_KEY" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

access_token=$(echo "$login_response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('tokens', {}).get('accessToken', ''))" 2>/dev/null)
refresh_token=$(echo "$login_response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('tokens', {}).get('refreshToken', ''))" 2>/dev/null)

if [ -n "$access_token" ]; then
    echo -e "  ${GREEN}✅ Login successful${NC}"
    echo "  Access Token: ${access_token:0:50}..."
else
    echo -e "  ${RED}❌ Login failed${NC}"
    echo "  Response: $login_response"
fi
echo ""

# 4. Verify Token
echo "4. Verify Token"
if [ -n "$access_token" ]; then
    check_endpoint "POST" "/auth/verify" "{\"token\":\"$access_token\"}" "-H \"X-Service-Key: $SERVICE_KEY\"" "Verify JWT token"
else
    echo -e "  ${YELLOW}⚠️  Skipped (no token)${NC}"
fi
echo ""

# 5. Get Current User
echo "5. Get Current User"
if [ -n "$access_token" ]; then
    check_endpoint "GET" "/auth/me" "" "-H \"Authorization: Bearer $access_token\"" "Get current user"
else
    echo -e "  ${YELLOW}⚠️  Skipped (no token)${NC}"
fi
echo ""

# 6. Refresh Token
echo "6. Refresh Token"
if [ -n "$refresh_token" ]; then
    check_endpoint "POST" "/auth/refresh" "{\"refreshToken\":\"$refresh_token\"}" "-H \"X-Service-Key: $SERVICE_KEY\"" "Refresh access token"
else
    echo -e "  ${YELLOW}⚠️  Skipped (no refresh token)${NC}"
fi
echo ""

# 7. Password Reset Request
echo "7. Password Reset"
check_endpoint "POST" "/auth/password-reset/request" "{\"email\":\"$TEST_EMAIL\"}" "-H \"X-Service-Key: $SERVICE_KEY\"" "Request password reset"
echo ""

# 8. Email Verification
echo "8. Email Verification"
check_endpoint "POST" "/auth/email-verification/send" "{\"email\":\"$TEST_EMAIL\"}" "-H \"X-Service-Key: $SERVICE_KEY\"" "Send verification email"
check_endpoint "GET" "/auth/email-verification/status?email=$TEST_EMAIL" "" "-H \"X-Service-Key: $SERVICE_KEY\"" "Get verification status"
echo ""

# 9. Phone OTP (если включен)
echo "9. Phone OTP"
check_endpoint "POST" "/auth/phone-otp/send" "{\"phoneNumber\":\"+1234567890\"}" "-H \"X-Service-Key: $SERVICE_KEY\"" "Send OTP"
echo ""

# 10. OAuth2 (если включен)
echo "10. OAuth2"
echo "  GET /auth/oauth/google - OAuth2 redirect (не тестируется автоматически)"
echo "  GET /auth/oauth/github - OAuth2 redirect (не тестируется автоматически)"
echo "  GET /auth/oauth/apple - OAuth2 redirect (не тестируется автоматически)"
echo ""

# 11. 2FA (если включен)
echo "11. 2FA"
if [ -n "$access_token" ]; then
    check_endpoint "GET" "/auth/2fa/status" "" "-H \"Authorization: Bearer $access_token\"" "Get 2FA status"
else
    echo -e "  ${YELLOW}⚠️  Skipped (no token)${NC}"
fi
echo ""

echo "=========================================="
echo "✅ Тестирование завершено"
echo ""
echo "📊 Swagger документация: http://localhost:7100/docs"
echo "📋 OpenAPI JSON: http://localhost:7100/docs-json"
