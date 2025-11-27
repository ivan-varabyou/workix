# 🛡️ Архитектура системы защиты от взлома

**Дата создания:** 2025-11-17
**Версия:** 1.0

---

## 📋 Обзор

Комплексная система защиты от различных типов атак и подозрительной активности:
- Блокировка IP при подозрительной активности
- Обнаружение подбора пароля с разных IP к одному аккаунту
- Обнаружение инъекций (SQL, XSS, Command)
- Система блокировок и алертов
- Логирование подозрительной активности

---

## 🏗️ Архитектура

### Компоненты системы

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Middleware                      │
│  (SecurityThreatMiddleware)                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   IP Block   │ │   Account    │ │  Injection   │
│   Service    │ │   Security   │ │   Detector   │
│              │ │   Service    │ │              │
└──────┬───────┘ └──────┬────────┘ └──────┬───────┘
       │                │                  │
       └────────────────┼──────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │   Threat        │
              │   Detection     │
              │   Service       │
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Database   │ │   Logging    │ │   Alerts     │
│   (Prisma)   │ │   Service    │ │   Service    │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🔍 Типы угроз

### 1. Brute Force Attack
**Описание:** Множественные попытки подбора пароля
**Обнаружение:**
- Более N неудачных попыток входа с одного IP
- Более N неудачных попыток входа к одному аккаунту (с разных IP)

**Действия:**
- Временная блокировка IP (15 минут - 24 часа)
- Временная блокировка аккаунта (15 минут - 1 час)
- Логирование события
- Алерт администратору (при критических случаях)

### 2. Distributed Brute Force Attack
**Описание:** Подбор пароля с разных IP к одному аккаунту
**Обнаружение:**
- Более N разных IP пытаются войти к одному аккаунту за период T
- Более N неудачных попыток с разных IP

**Действия:**
- Блокировка аккаунта (1-24 часа)
- Блокировка всех участвующих IP
- Критический алерт администратору
- Логирование всех IP и попыток

### 3. SQL Injection
**Описание:** Попытки SQL инъекций в параметрах запроса
**Обнаружение:**
- Паттерны SQL инъекций в query params, body, headers
- Ключевые слова: `UNION`, `SELECT`, `DROP`, `DELETE`, `INSERT`, `UPDATE`, `--`, `;`, `'`, `"`

**Действия:**
- Немедленная блокировка IP (24 часа)
- Критический алерт
- Логирование полного запроса

### 4. XSS (Cross-Site Scripting)
**Описание:** Попытки XSS инъекций
**Обнаружение:**
- Паттерны XSS: `<script>`, `javascript:`, `onerror=`, `onload=`, `eval(`, `alert(`
- HTML теги в текстовых полях

**Действия:**
- Блокировка IP (1-6 часов)
- Алерт
- Логирование

### 5. Command Injection
**Описание:** Попытки выполнения системных команд
**Обнаружение:**
- Паттерны: `;`, `|`, `&`, `$()`, `` ` ``, `$(`, `exec(`, `system(`, `shell_exec(`
- Попытки доступа к системным файлам: `/etc/passwd`, `/etc/shadow`

**Действия:**
- Немедленная блокировка IP (24 часа)
- Критический алерт
- Логирование

### 6. Path Traversal
**Описание:** Попытки доступа к файлам вне разрешенной директории
**Обнаружение:**
- Паттерны: `../`, `..\\`, `/etc/`, `/var/`, `C:\\`, `%2e%2e%2f`

**Действия:**
- Блокировка IP (6-12 часов)
- Алерт
- Логирование

---

## 📊 Структура данных

### IP Block
```prisma
model IpBlock {
  id          String   @id @default(uuid()) @db.Uuid
  ipAddress   String   @db.VarChar(45) // IPv4 or IPv6
  reason      String   @db.VarChar(255) // "brute_force", "sql_injection", etc.
  blockedUntil DateTime @db.Timestamp
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([ipAddress])
  @@index([blockedUntil])
  @@map("ip_blocks")
}
```

### Account Security Event
```prisma
model AccountSecurityEvent {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String?  @db.Uuid
  email       String?  @db.VarChar(255)
  ipAddress   String   @db.VarChar(45)
  eventType   String   @db.VarChar(50) // "failed_login", "suspicious_ip", "injection_attempt"
  severity    String   @db.VarChar(20) // "low", "medium", "high", "critical"
  details     Json?    // Additional event data
  createdAt   DateTime @default(now())
  
  @@index([userId])
  @@index([email])
  @@index([ipAddress])
  @@index([eventType])
  @@index([createdAt])
  @@map("account_security_events")
}
```

### Account Security Status
```prisma
model AccountSecurityStatus {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @unique @db.Uuid
  email           String   @db.VarChar(255)
  isLocked        Boolean  @default(false)
  lockedUntil     DateTime?
  failedAttempts  Int      @default(0)
  lastFailedLogin DateTime?
  suspiciousIpCount Int   @default(0) // Count of unique IPs attempting login
  lastSuspiciousActivity DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([email])
  @@index([isLocked])
  @@index([lockedUntil])
  @@map("account_security_status")
}
```

### Suspicious IP Activity
```prisma
model SuspiciousIpActivity {
  id          String   @id @default(uuid()) @db.Uuid
  ipAddress   String   @db.VarChar(45)
  userId      String?  @db.Uuid
  email       String?  @db.VarChar(255)
  activityType String  @db.VarChar(50) // "failed_login", "injection", "xss", etc.
  requestPath String?  @db.VarChar(500)
  requestBody Json?    // Sanitized request body
  userAgent   String?  @db.VarChar(500)
  createdAt   DateTime @default(now())
  
  @@index([ipAddress])
  @@index([userId])
  @@index([email])
  @@index([activityType])
  @@index([createdAt])
  @@map("suspicious_ip_activities")
}
```

---

## ⚙️ Конфигурация

### Environment Variables
```bash
# Security System Configuration
SECURITY_ENABLED=true
SECURITY_IP_BLOCK_DURATION=3600000 # 1 hour in ms
SECURITY_ACCOUNT_LOCK_DURATION=900000 # 15 minutes in ms
SECURITY_BRUTE_FORCE_THRESHOLD=5 # Failed attempts before block
SECURITY_DISTRIBUTED_ATTACK_THRESHOLD=3 # Different IPs to same account
SECURITY_DISTRIBUTED_ATTACK_WINDOW=3600000 # 1 hour window
SECURITY_INJECTION_BLOCK_DURATION=86400000 # 24 hours in ms
SECURITY_ALERT_WEBHOOK_URL= # Optional webhook for alerts
```

---

## 🔄 Процесс работы

### 1. Request Processing Flow

```
Request → Security Middleware
  ├─→ Extract IP, User ID, Email, Path, Body
  ├─→ Check IP Block (if blocked → 403)
  ├─→ Check Account Lock (if locked → 403)
  ├─→ Injection Detection
  │   ├─→ SQL Injection Check
  │   ├─→ XSS Check
  │   ├─→ Command Injection Check
  │   └─→ Path Traversal Check
  ├─→ If injection detected:
  │   ├─→ Block IP
  │   ├─→ Log event
  │   ├─→ Send alert
  │   └─→ Return 403
  ├─→ Track failed login attempts
  │   ├─→ If threshold exceeded → Block IP/Account
  │   └─→ Log event
  ├─→ Track distributed attack
  │   ├─→ Count unique IPs per account
  │   ├─→ If threshold exceeded → Block account + IPs
  │   └─→ Log event
  └─→ Continue to next middleware
```

### 2. IP Blocking Logic

```typescript
// Pseudo-code
if (isIpBlocked(ip)) {
  return 403 Forbidden;
}

if (detectInjection(request)) {
  blockIp(ip, 'injection', 24 hours);
  logSecurityEvent('injection_attempt', 'critical', ip, request);
  sendAlert('critical', 'Injection attempt detected', ip, request);
  return 403 Forbidden;
}

if (failedLoginAttempts(ip) > threshold) {
  blockIp(ip, 'brute_force', 1 hour);
  logSecurityEvent('brute_force', 'high', ip);
  sendAlert('high', 'Brute force detected', ip);
}
```

### 3. Account Security Logic

```typescript
// Pseudo-code
if (isAccountLocked(userId)) {
  return 403 Forbidden;
}

if (failedLoginAttempts(userId) > threshold) {
  lockAccount(userId, 15 minutes);
  logSecurityEvent('account_lock', 'medium', userId);
}

// Distributed attack detection
const uniqueIps = getUniqueIpsForAccount(userId, timeWindow);
if (uniqueIps.length > distributedAttackThreshold) {
  lockAccount(userId, 24 hours);
  blockIps(uniqueIps, 'distributed_attack', 24 hours);
  logSecurityEvent('distributed_attack', 'critical', userId, uniqueIps);
  sendAlert('critical', 'Distributed attack detected', userId, uniqueIps);
}
```

---

## 📝 Логирование

### Security Event Log Format
```json
{
  "timestamp": "2025-11-17T22:50:00Z",
  "eventType": "injection_attempt",
  "severity": "critical",
  "ipAddress": "192.168.1.100",
  "userId": "uuid",
  "email": "user@example.com",
  "path": "/api-auth/v1/auth/login",
  "method": "POST",
  "userAgent": "Mozilla/5.0...",
  "details": {
    "injectionType": "sql",
    "detectedPattern": "UNION SELECT",
    "requestBody": "{...sanitized...}"
  }
}
```

---

## 🚨 Алерты

### Alert Levels
- **Critical**: SQL/Command injection, Distributed attacks
- **High**: Brute force attacks, Multiple failed logins
- **Medium**: Account locks, Suspicious IP activity
- **Low**: Rate limit exceeded, Single failed login

### Alert Channels
- Log file
- Webhook (optional)
- Email (optional, future)
- Database (always)

---

## 🔧 API Endpoints

### Admin Endpoints (protected)
```
GET  /api-auth/v1/security/ip-blocks
POST /api-auth/v1/security/ip-blocks/:ip/unblock
GET  /api-auth/v1/security/events
GET  /api-auth/v1/security/account-status/:userId
POST /api-auth/v1/security/account-status/:userId/unlock
```

---

## ✅ Чеклист реализации

- [ ] Создать Prisma схему для security моделей
- [ ] Создать InjectionDetectorService
- [ ] Создать IpBlockingService
- [ ] Создать AccountSecurityService
- [ ] Создать ThreatDetectionService
- [ ] Создать SecurityThreatMiddleware
- [ ] Интегрировать middleware в AppModule
- [ ] Добавить логирование
- [ ] Добавить алерты (webhook)
- [ ] Создать admin endpoints
- [ ] Добавить тесты
- [ ] Обновить документацию

---

**Последнее обновление:** 2025-11-17

