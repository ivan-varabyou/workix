# Port Configuration

**Version**: 3.0

## Port Assignment

**Port Structure**: `7vnn` where:
- `7` - prefix for backend services
- `v` - API version (1, 2, 3...)
- `nn` - service number (01, 02, 03...)

| Application | Port | Structure | Purpose | Environment |
|------------|------|-----------|---------|-------------|
| api-gateway | 7000 | Special | API Gateway | Development/Production |
| api-monolith | 7101 | 7vnn (v=1, nn=01) | Monolithic API | Development/Production |
| api-auth | 7102 | 7vnn (v=1, nn=02) | Auth service | Development/Production |
| api-notifications | 7103 | 7vnn (v=1, nn=03) | Notifications service | Development/Production |
| app-admin | 7300 | 73nn | Admin frontend | Development/Production |
| app-web | 7301 | 73nn | Web frontend | Development/Production |

## Port Ranges

- **7000**: API Gateway (special case)
- **7100-7199**: Backend services (7vnn structure)
  - **7101**: api-monolith (v=1, nn=01)
  - **7102**: api-auth (v=1, nn=02)
  - **7103**: api-notifications (v=1, nn=03)
  - **7104-7199**: Future microservices
- **7300-7399**: Frontend applications

## Database Port Mapping

**Rule**: Database ports logically map to API service ports by changing first digit from 7 to 5 (API 7xxx → DB 5xxx) to avoid port conflicts.

| API Service | API Port | Database Port | Database Name | Notes |
|-------------|----------|---------------|---------------|-------|
| api-gateway | 7000 | 5000 | workix_gateway | API 7000 → DB 5000 (change first digit: 7 → 5) |
| api-monolith | 7101 | 5101 | workix_monolith | API 7101 → DB 5101 (change first digit: 7 → 5) |
| api-auth | 7102 | 5102 | workix_auth | API 7102 → DB 5102 (change first digit: 7 → 5) |
| api-notifications | 7103 | 5103 | workix_notifications | API 7103 → DB 5103 (change first digit: 7 → 5) |

**Development & Production**: Separate PostgreSQL instances with ports matching API ports (change first digit: 7xxx → 5xxx).

## Database Strategy

### Database Ports
- Separate PostgreSQL instances per service
- Port mapping: API port → DB port (change first digit from 7 to 5)
- API 7000 → DB 5000 (gateway)
- API 7101 → DB 5101 (monolith)
- API 7102 → DB 5102 (auth)
- API 7103 → DB 5103 (notifications)
- Connection: `postgresql://postgres:postgres@localhost:{db_port}/{database_name}`
- Full isolation and independent scaling

## Rules

1. Ports assigned sequentially
2. No port conflicts
3. Document all ports in app README
4. Use environment variables for port configuration
5. Database ports logically map to API ports (change first digit from 7 to 5: API 7xxx → DB 5xxx, e.g., 7000 → 5000, 7101 → 5101, 7102 → 5102, 7103 → 5103)
6. Port structure: `7vnn` where v=version, nn=service number (e.g., 7101 = version 1, service 01)

## Related

- [Applications](../core/applications.md)
- [API Gateway](./api-gateway.md)
