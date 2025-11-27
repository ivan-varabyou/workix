# План оптимизации fileов projectа

## 📋 Категории fileов

### 1. Временные reports (УДАЛИТЬ)

Все fileы в `check-results/` кроме:

- `OPTIMIZATION_PLAN.md` (this file)
- `проанализуируй all fileы md sh возможно .ini` (задание)

**Файлы for удаления:**

- Все `any-types_*.md` и `any-types_*.txt` - временные reports checks typeов
- Все `any-unknown-types_*.md` и `any-unknown-types_*.txt` - временные reports
- `any-types-summary_*.md` - сводные reports
- `any-types-analysis*.txt` - анализ
- `any-types-detailed*.txt` - детальные reports
- `any-types-files*.txt` - списки fileов
- `tests-output.log`, `tsc-output.log` - логи проверок

### 2. Устаревшие reports в корне (УДАЛИТЬ или ОБЪЕДИНИТЬ)

- `FIXES_APPLIED.md` - устаревший report
- `CHECK_RESULTS.md` - устаревший report
- `CHECK_SUMMARY.md` - устаревший report
- `FINAL_FIXES_REPORT.md` - устаревший report
- `TYPESCRIPT_FIXES.md` - устаревший report

### 3. Временные reports в UI библиотеке (УДАЛИТЬ)

- `libs/shared/frontend/ui/COMPONENT_SEPARATION_CHECK.md`
- `libs/shared/frontend/ui/INLINE_TEMPLATE_STYLES_VIOLATIONS.md`
- `libs/shared/frontend/ui/STORYBOOK_COVERAGE_REPORT.md`
- `libs/shared/frontend/ui/TESTING_NOTES.md`
- `libs/shared/frontend/ui/UI_PROVIDER_ANALYSIS.md`
- `libs/shared/frontend/ui/UI_VERSIONING_ANALYSIS.md`

### 4. Спецификации в `.specify/specs/000-project/` (ОПТИМИЗИРОВАТЬ)

#### Большие fileы for оптимизации (>400 строк):

1. `API_GATEWAY_ENDPOINTS.md` (1392 строки) - проверить актуальность, сократить
2. `LIBS_REORGANIZATION_DETAILED.md` (860 строк) - возможно устарел, проверить
3. `API_GATEWAY_COMPLETE_SPECIFICATION.md` (668 строк) - проверить дубликаты
4. `MESSAGE_BROKER_ARCHITECTURE.md` (531 строки) - оптимизировать
5. `ARCHITECTURE_VISION.md` (505 строк) - оптимизировать, убрать лишнее
6. `MONOLITH_ARCHITECTURE.md` (500 строк) - проверить актуальность
7. `TESTING_STRATEGY_ANALYSIS.md` (487 строк) - возможно объединить с другими
8. `SPECS_AUDIT_REPORT.md` (484 строки) - устаревший report, удалить
9. `ENDPOINT_IMPLEMENTATION_TASKS.md` (474 строки) - проверить актуальность
10. `E_COMMERCE_INTEGRATIONS_DETAILED.md` (458 строк) - оптимизировать

#### Отчеты и statusы (проверить актуальность):

- `*_REPORT.md` - многие могут быть устаревшими
- `*_STATUS*.md` - проверить актуальность
- `*_SUMMARY.md` - проверить актуальность
- `*_CHECKLIST.md` - проверить актуальность

### 5. Скрипты (ПРОВЕРИТЬ)

- Дубликаты scriptов (наexample, `start-services.sh` и `scripts/start-all-services.sh`)
- Устаревшие scriptы миграции

## 🎯 План действий

1. ✅ Создать this plan
2. ⏳ Удалить временные reports из `check-results/`
3. ⏳ Удалить устаревшие reports из корня
4. ⏳ Удалить временные reports из UI libraries
5. ⏳ Оптимизировать большие спецификации
6. ⏳ Актуализировать INDEX.md
7. ⏳ Проверить и удалить дубликаты scriptов
