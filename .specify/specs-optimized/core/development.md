# Development Process & Rules

**Version**: 3.0

## Development Cycle

```
PLANNING → PREPARATION → WORKING → TESTING → DONE
```

## Task Management

### Task Registration

Задачи регистрируются в файле `TASKS.md` в корне проекта. Каждая задача имеет:
- Номер задачи (#1, #2, ...)
- Название
- Описание
- Статус (pending, in_progress, done, cancelled, blocked)
- Ветку (task-{номер} или t{номер})

### Branch Creation

- Ветки создаются от `develop`: `task-{номер}` или `t{номер}`
- Если ветка занята, используем следующий номер (t1 → t2 → t3...)
- Используйте скрипт: `./scripts/task-manager.sh start [номер]`

### Development Process

1. **Разработка фичи/логики**:
   - Создаем библиотеку в `libs/backend/domain/` или расширяем существующую
   - Вся логика в библиотеке
   - В `apps/` только импорты и вызовы

2. **Проверка качества**:
   - TypeScript проверка: `nx run {project}:typecheck`
   - Линтер: `nx run {project}:lint`
   - Ревью на сквозную типизацию
   - Проверка на хардкодные утверждения типов (`as`, `any`)
   - Использование type guards (проверяем в libs, возможно уже есть)

3. **Тестирование**:
   - Запускаем сервер: `nx serve {project}`
   - Проверяем что все работает
   - Если эндпоинт - проверяем что отвечает как заложено
   - Если все ок - делаем коммит

4. **Коммит**:
   - Формат: `T #{номер} - {type}({scope}): description`
   - Английский, lowercase
   - Используйте скрипт: `./scripts/task-manager.sh commit 'message'`
   - Идем к следующему шагу

### Task Commands

Для быстрой работы используйте команды:

```bash
# Создать новую задачу (автоматически определит номер)
./scripts/task-manager.sh start

# Создать задачу с конкретным номером
./scripts/task-manager.sh start 5

# Создать коммит (автоматически определит номер задачи из ветки)
./scripts/task-manager.sh commit 'feat(admin): add user management'

# Показать статус задачи
./scripts/task-manager.sh status [номер]

# Показать список задач
./scripts/task-manager.sh list
```

### Chat Commands (Future)

В будущем планируется поддержка команд в чате:
- `/task {номер}` - Начать работу над задачей (создать ветку, переключиться)
- `/commit {message}` - Создать коммит с автоматическим номером задачи

## Key Rules

### Branch Workflow
- Work only on task branches (`task-{number}`)
- Never switch branches during development
- Create branches from `develop`
- Merge to `develop` when task complete

### Commit Format
- Language: English, lowercase only
- Format: `T #{number} - {type}({scope}): description`
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- Scope: module name (e.g., `auth`, `users`)

### Code Quality
- TypeScript strict mode
- **Type Safety**: Explicit types for all variables, parameters, return values
- **Forbidden**: `as`, `as unknown`, `!` (non-null assertion), `any` (except documented exceptions)
- **`any` usage**: Only allowed in exceptional cases (e.g., `NestFactory.create()`), must be documented
- **Prefer `unknown` over `any`**: Use `unknown` when type is truly unknown, then narrow with type guards
- **Type Guards**: Use type guards instead of type assertions (`as`)
- **Interface Reuse**: Before creating new interfaces/types, search existing interfaces in project first
- **No Hardcoded Types**: Don't describe objects inline - use existing interfaces or create new ones in `interfaces/` directory
- SOLID principles
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple)
- Minimum 85% test coverage for shared libraries

### Testing
- Unit tests for all services
- Integration tests for APIs
- E2E tests for critical flows
- Run tests before commit

### Documentation
- Swagger/OpenAPI for all endpoints
- JSDoc for complex functions
- README for each library/app

## SOLID Principles

1. **SRP**: Single Responsibility - one reason to change
2. **OCP**: Open/Closed - open for extension, closed for modification
3. **LSP**: Liskov Substitution - subtypes must be substitutable
4. **ISP**: Interface Segregation - many specific interfaces > one large
5. **DIP**: Dependency Inversion - depend on abstractions, not concretions

## Architecture Rules

- Business logic in `libs/domain/`
- Infrastructure in `libs/infrastructure/`
- Apps only connect modules
- No business logic in apps
- Use dependency injection

## NX Workspace Rules

**This is an NX monorepo - follow all NX conventions:**

- **Project Structure**: All business logic in `libs/`, `apps/` only connects
- **Module Boundaries**: Apps can only import from `libs/`, never from other `apps/`
- **Dependency Rules**: Follow NX tags and dependency rules (enforced by ESLint)
- **Build System**: Use NX build system (`nx build`, `nx serve`, `nx test`)
- **Code Generation**: Use NX generators (`nx generate`)
- **Affected**: Use `nx affected` for CI/CD (only build/test affected projects)
- **Project Tags**: Use tags for project categorization (`type:app`, `scope:frontend`, etc.)
- **Shared Libraries**: Place shared code in `libs/shared/`
- **Path Aliases**: Use `@workix/*` aliases for imports (configured in `tsconfig.base.json`)

## Public API Principles

- Version all public APIs (`/api/v1/`, `/api/v2/`)
  - Format: `/api/v{version}/{service}/{endpoint}`
  - Example: `POST /api/v1/auth/login`
  - Breaking changes require new version
  - Old versions supported for 12+ months
  - Deprecation: 6 months notice before removal
- Maintain backward compatibility (12 months minimum)
- Breaking changes = new version
- Deprecation policy: 6 months warning
- Document all versions

## OpenAPI/Swagger

- All endpoints documented (`@ApiTags`, `@ApiOperation`, `@ApiResponse`)
- All DTOs have `@ApiProperty()` or `@ApiPropertyOptional()`
- Examples for all fields
- No endpoint without documentation

## MCP Servers Management

**CRITICAL**: Always ensure MCP servers are running before starting work!

### Quick Commands
- **Status check**: `make mcp-status`
- **Start all**: `make mcp-start`
- **Stop all**: `make mcp-stop`

### Available MCP Servers
- **Workix MCP**: Project-specific tools (auth, users, pipelines, docs)
- **Ollama**: Local LLM models (llama3.1, mistral, codellama)
- **TypeScript**: Real-time type checking (`tsc --watch`)
- **NX**: Workspace management tools

### Pre-work Server Check
```bash
# Always run before starting work
make mcp-status

# If servers not running
make mcp-start

# Verify all running
make mcp-status
```

## Related

- [Git Workflow](./git-workflow.md)
- [Code Review](../process/code-review.md)
- [Architecture](./architecture.md)
- [MCP Servers Guide](../../.cursor/MCP_SERVERS_GUIDE.md)
