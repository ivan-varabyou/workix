#!/bin/bash
# Скрипт для проверки всех endpoints API Auth

set -e

PORT=${API_ADMIN_PORT:-7100}
BASE_URL="http://localhost:${PORT}/api-admin/v1"
HEALTH_URL="${BASE_URL}/auth/health"

echo "🔍 Проверка endpoints API Auth"
echo "================================"
echo "Base URL: ${BASE_URL}"
echo "Port: ${PORT}"
echo ""

# Проверка доступности сервиса
echo "1️⃣ Проверка доступности сервиса..."
if curl -s -f "${HEALTH_URL}" > /dev/null 2>&1; then
    echo "✅ Сервис доступен"
    curl -s "${HEALTH_URL}" | jq '.' 2>/dev/null || curl -s "${HEALTH_URL}"
    echo ""
else
    echo "❌ Сервис недоступен на ${HEALTH_URL}"
    echo "   Убедитесь, что сервис запущен: nx serve api-admin"
    exit 1
fi

# Список endpoints для проверки
echo "2️⃣ Проверка основных endpoints..."
echo ""

# Публичные endpoints (не требуют авторизации)
echo "📋 Публичные endpoints:"
echo "  POST ${BASE_URL}/auth/register - Регистрация"
echo "  POST ${BASE_URL}/auth/login - Вход"
echo "  POST ${BASE_URL}/auth/verify - Проверка токена"
echo "  POST ${BASE_URL}/auth/refresh - Обновление токена"
echo "  POST ${BASE_URL}/auth/logout - Выход"
echo "  POST ${BASE_URL}/auth/password-reset/request - Запрос сброса пароля"
echo "  GET  ${BASE_URL}/auth/health - Health check"
echo ""

# Защищенные endpoints (требуют JWT)
echo "📋 Защищенные endpoints (требуют JWT):"
echo "  GET  ${BASE_URL}/auth/me - Текущий пользователь"
echo "  POST ${BASE_URL}/auth/2fa/generate - Генерация 2FA"
echo "  POST ${BASE_URL}/auth/2fa/enable - Включение 2FA"
echo "  POST ${BASE_URL}/auth/2fa/verify - Проверка 2FA"
echo "  DELETE ${BASE_URL}/auth/2fa/disable - Отключение 2FA"
echo "  GET  ${BASE_URL}/auth/2fa/status - Статус 2FA"
echo ""

# Security endpoints
echo "📋 Security endpoints:"
echo "  POST ${BASE_URL}/auth/security/verify-code - Проверка кода"
echo "  POST ${BASE_URL}/auth/security/resend-code - Повторная отправка"
echo ""

# Users endpoints
echo "📋 Users endpoints:"
echo "  GET  ${BASE_URL}/users/me - Текущий пользователь"
echo "  GET  ${BASE_URL}/users/:userId - Пользователь по ID"
echo "  GET  ${BASE_URL}/users - Список пользователей"
echo "  GET  ${BASE_URL}/users/search - Поиск пользователей"
echo "  PUT  ${BASE_URL}/users/:userId - Обновить пользователя"
echo "  POST ${BASE_URL}/users/:userId/avatar - Загрузить аватар"
echo "  DELETE ${BASE_URL}/users/:userId - Удалить пользователя"
echo ""

# OAuth2 endpoints
echo "📋 OAuth2 endpoints:"
echo "  GET  ${BASE_URL}/auth/oauth2/:provider - Инициация OAuth2"
echo "  GET  ${BASE_URL}/auth/oauth2/:provider/callback - Callback OAuth2"
echo ""

# Phone OTP endpoints
echo "📋 Phone OTP endpoints:"
echo "  POST ${BASE_URL}/auth/phone-otp/send - Отправить OTP"
echo "  POST ${BASE_URL}/auth/phone-otp/verify - Проверить OTP"
echo ""

# Email Verification endpoints
echo "📋 Email Verification endpoints:"
echo "  POST ${BASE_URL}/auth/email-verification/send - Отправить код"
echo "  POST ${BASE_URL}/auth/email-verification/verify - Проверить код"
echo ""

echo "✅ Проверка завершена"
echo ""
echo "💡 Для детального тестирования используйте:"
echo "   - Swagger UI: http://localhost:${PORT}/docs"
echo "   - Интеграционные тесты: nx test api-admin --testPathPattern=integration"
