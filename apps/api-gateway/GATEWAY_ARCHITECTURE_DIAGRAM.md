# 🏗️ API Gateway - 

**Date:** 2025-11-16

---

## 📊 

```mermaid
graph TB
    subgraph "Client Layer"
        CLIENT[Client / Browser]
    end

    subgraph "API Gateway (Port 4200)"
        GATEWAY[API Gateway]
        ROUTING[Routing Engine]
        ACCESS[Access Control]
        QUEUE_ROUTER[Queue Router]
        ADMIN_API[Admin API]

        GATEWAY --> ROUTING
        GATEWAY --> ACCESS
        GATEWAY --> QUEUE_ROUTER
        GATEWAY --> ADMIN_API
    end

    subgraph "Configuration Database"
        DB[(PostgreSQL)]
        CONFIG_CACHE[In-Memory Cache]

        DB --> CONFIG_CACHE
    end

    subgraph "Admin Panel"
        ADMIN[Admin Panel<br/>Port 4201]
        ADMIN --> ADMIN_API
    end

    subgraph "HTTP Services"
        AUTH[Auth API<br/>Port 7200]
        MONOLITH[Monolith API<br/>Port 7000]
        PIPELINE[Pipeline Service<br/>Port 7202]
    end

    subgraph "Message Broker"
        RABBITMQ[RabbitMQ / Redis]
        EMAIL_QUEUE[Email Queue]
        SMS_QUEUE[SMS Queue]
        AI_QUEUE[AI Queue]
        ANALYTICS_QUEUE[Analytics Queue]
        EXECUTION_QUEUE[Execution Queue]

        RABBITMQ --> EMAIL_QUEUE
        RABBITMQ --> SMS_QUEUE
        RABBITMQ --> AI_QUEUE
        RABBITMQ --> ANALYTICS_QUEUE
        RABBITMQ --> EXECUTION_QUEUE
    end

    subgraph "Workers"
        EMAIL_WORKER[Email Worker]
        SMS_WORKER[SMS Worker]
        AI_WORKER[AI Worker]
        ANALYTICS_WORKER[Analytics Worker]
        EXECUTION_WORKER[Execution Worker]

        EMAIL_QUEUE --> EMAIL_WORKER
        SMS_QUEUE --> SMS_WORKER
        AI_QUEUE --> AI_WORKER
        ANALYTICS_QUEUE --> ANALYTICS_WORKER
        EXECUTION_QUEUE --> EXECUTION_WORKER
    end

    CLIENT -->|HTTP /api/v1/*| GATEWAY
    ROUTING -->|HTTP REST| AUTH
    ROUTING -->|HTTP REST| MONOLITH
    ROUTING -->|HTTP REST| PIPELINE
    QUEUE_ROUTER -->|Publish| RABBITMQ
    ADMIN_API -->|Read/Write| DB
    ROUTING -->|Read Config| CONFIG_CACHE

    style GATEWAY fill:#4CAF50
    style ROUTING fill:#2196F3
    style ACCESS fill:#FF9800
    style QUEUE_ROUTER fill:#9C27B0
    style DB fill:#607D8B
    style RABBITMQ fill:#E91E63
```

---

## 🔄 

```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway
    participant R as Routing Engine
    participant CACHE as Config Cache
    participant DB as Database
    participant S as Service (Auth/Monolith)
    participant Q as Message Broker
    participant W as Worker

    Note over C,W: 
    C->>G: POST /api/v1/pipelines
    G->>R: Route request
    R->>CACHE: Get service config
    CACHE->>R: Service URL
    R->>S: HTTP POST /api/v1/pipelines
    S->>R: Response
    R->>G: Response
    G->>C: Response

    Note over C,W: 
    C->>G: POST /api/v1/auth/password-reset/request
    G->>R: Route request
    R->>CACHE: Get service config
    CACHE->>R: Service URL
    R->>S: HTTP POST /api/auth/password-reset/request
    S->>Q: Publish to Email Queue
    S->>R: 202 Accepted (task_id)
    R->>G: Response
    G->>C: 202 Accepted
    Q->>W: Consume message
    W->>W: Process email
    W->>C: Webhook/Callback (optional)
```

---

## 🗄️ 

```mermaid
erDiagram
    GatewayServiceConfig ||--o{ GatewayServiceVersion : "has versions"
    GatewayApplication ||--o{ GatewayEndpointWhitelist : "has whitelist"
    GatewayApplication ||--o{ GatewayApiKey : "has api keys"

    GatewayServiceConfig {
        string id PK
        string serviceName UK
        string defaultUrl
        string currentVersion
        string fallbackUrl
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    GatewayServiceVersion {
        string id PK
        string serviceId FK
        string version
        string url
        int weight
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    GatewayApplication {
        string id PK
        string name
        string description
        string[] allowedServices
        string[] allowedVersions
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    GatewayEndpointWhitelist {
        string id PK
        string applicationId FK
        string endpointPath
        string[] allowedMethods
        string[] allowedVersions
        int rateLimit
        boolean isPublic
        datetime createdAt
        datetime updatedAt
    }

    GatewayApiKey {
        string id PK
        string applicationId FK
        string apiKeyHash
        string name
        datetime expiresAt
        boolean isActive
        datetime lastUsedAt
        datetime createdAt
        datetime updatedAt
    }
```

---

## 🔐 

```mermaid
graph LR
    subgraph "Safe to Store in DB ✅"
        A1[Service URLs]
        A2[Endpoint Paths]
        A3[Versions]
        A4[Rate Limits]
        A5[Application IDs]
    end

    subgraph "Store as Hash in DB ✅"
        B1[API Keys<br/>bcrypt/argon2]
    end

    subgraph "Environment Variables Only ❌"
        C1[Service Keys]
        C2[Database Passwords]
        C3[JWT Secrets]
        C4[OAuth Secrets]
    end

    subgraph "Secrets Manager 🔐"
        D1[AWS Secrets Manager]
        D2[HashiCorp Vault]
        D3[Azure Key Vault]
    end

    A1 --> DB[(Database)]
    A2 --> DB
    A3 --> DB
    A4 --> DB
    A5 --> DB
    B1 --> DB
    C1 --> ENV[.env file]
    C2 --> ENV
    C3 --> ENV
    C4 --> ENV
    C1 -.->|Production| D1
    C2 -.->|Production| D1
    C3 -.->|Production| D1
    C4 -.->|Production| D1

    style A1 fill:#4CAF50
    style A2 fill:#4CAF50
    style A3 fill:#4CAF50
    style A4 fill:#4CAF50
    style A5 fill:#4CAF50
    style B1 fill:#FF9800
    style C1 fill:#F44336
    style C2 fill:#F44336
    style C3 fill:#F44336
    style C4 fill:#F44336
    style D1 fill:#2196F3
```

---

## 🔄 

```mermaid
sequenceDiagram
    participant A as Admin User
    participant P as Admin Panel
    participant API as Admin API
    participant DB as Database
    participant CACHE as In-Memory Cache
    participant ROUTING as Routing Engine
    participant CLIENT as Client

    A->>P: Update Service Config
    P->>API: PUT /admin/routing/services/:name
    API->>DB: UPDATE gateway_service_config
    DB->>API: Success
    API->>CACHE: Update cache
    CACHE->>ROUTING: Notify change
    API->>P: 200 OK
    P->>A: Success message

    Note over CLIENT,ROUTING: Next request uses new config
    CLIENT->>ROUTING: Request
    ROUTING->>CACHE: Get config
    CACHE->>ROUTING: New config
    ROUTING->>CLIENT: Route to new service
```

---

## 📊 

```mermaid
pie title 
    "HTTP REST (
    "HTTP → Queue (
    "Gateway Internal (Admin)" : 16
```

---

## 🎯 

### ✅ 
- Service URLs (
- Endpoint paths (
- Version numbers (
- Rate limiting rules (
- Application IDs (

### ⚠️ 
- API Keys (bcrypt/argon2 hash)
- 

### ❌ 
- Service Keys (
- Database passwords (
- JWT Secrets (
- OAuth Secrets (

### 🔐 Production (use Secrets Manager):
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Google Secret Manager

---

**
**Status:** ✅ 
