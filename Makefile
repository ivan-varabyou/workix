.PHONY: help check-types continue-types find-any fix-types-progress monitor-start monitor-stop monitor-status auto-continue auto-continue-exec mcp-start mcp-stop mcp-status mcp-build mcp-pull mcp-config docs-organize docs-archive docs-cleanup

help: ## Показать справку по командам
	@echo "Доступные команды:"
	@echo ""
	@echo "  make check-types          - Проверить использование 'any' и 'unknown' типов"
	@echo "  make continue-types       - Показать прогресс и следующий шаг"
	@echo "  make find-any DIR=path    - Найти 'any' и 'unknown' в конкретной директории"
	@echo "  make fix-types-progress   - Показать статистику исправления типов"
	@echo ""
	@echo "🔄 Автоматическое продолжение:"
	@echo "  make monitor-start        - Запустить монитор в фоне"
	@echo "  make monitor-stop         - Остановить монитор"
	@echo "  make monitor-status       - Показать статус монитора"
	@echo "  make auto-continue        - Показать инструкции для продолжения"
	@echo "  make auto-continue-exec   - Автоматически создать команду для продолжения"
	@echo "  make copy-continue        - Создать команду и скопировать в буфер обмена"
	@echo "  make send-continue        - Автоматически отправить 'продолжай' в чат Cursor"
	@echo "  make auto-send            - Полный цикл: создать + отправить в Cursor"
	@echo ""
	@echo "🤖 MCP Серверы:"
	@echo "  make mcp-start            - Запустить все MCP серверы"
	@echo "  make mcp-stop             - Остановить все MCP серверы"
	@echo "  make mcp-status           - Проверить статус MCP серверов"
	@echo "  make mcp-build            - Собрать Workix MCP сервер"
	@echo "  make mcp-pull             - Скачать Ollama модели"
	@echo "  make mcp-config           - Показать конфигурацию MCP"
	@echo ""
	@echo "📁 Организация документации:"
	@echo "  make docs-organize        - Организовать все MD файлы"
	@echo "  make docs-archive         - Архивировать старые файлы (>30 дней)"
	@echo "  make docs-cleanup         - Очистить временные файлы (>7 дней)"
	@echo ""

check-types: ## Проверить использование 'any' и 'unknown' типов во всем проекте
	@./scripts/find-any-types.sh

continue-types: ## Показать прогресс и следующий шаг для исправления типов
	@./scripts/continue-typescript-fixes.sh

find-any: ## Найти 'any' и 'unknown' в конкретной директории (использование: make find-any DIR=libs/integrations/core)
	@if [ -z "$(DIR)" ]; then \
		echo "❌ Ошибка: укажите директорию (DIR=path)"; \
		echo "Пример: make find-any DIR=libs/integrations/core"; \
		exit 1; \
	fi
	@./scripts/find-any-types.sh $(DIR)

fix-types-progress: ## Показать статистику исправления типов
	@echo "📊 Статистика исправления TypeScript типов"
	@echo ""
	@echo "✅ Завершенные модули:"
	@grep "✅" .specify/specs/005-development-process/TODO_TYPESCRIPT_TYPES_FIXES.md | head -10 || echo "  (нет завершенных)"
	@echo ""
	@echo "🟡 Модули в работе:"
	@grep "🟡" .specify/specs/005-development-process/TODO_TYPESCRIPT_TYPES_FIXES.md | head -10 || echo "  (нет в работе)"
	@echo ""
	@echo "📈 Общая статистика:"
	@TOTAL_ANY=$$(grep -r ":\s*any\b\|:\s*any\[|any\s*[<,)]|as\s+any" libs apps --include="*.ts" --exclude="*.spec.ts" --exclude="*.test.ts" 2>/dev/null | wc -l | tr -d ' '); \
	TOTAL_UNKNOWN=$$(grep -r ":\s*unknown\b\|:\s*unknown\[|unknown\s*[<,)]|as\s+unknown|Record<string,\s*unknown>" libs apps --include="*.ts" --exclude="*.spec.ts" --exclude="*.test.ts" 2>/dev/null | wc -l | tr -d ' '); \
	TOTAL=$$((TOTAL_ANY + TOTAL_UNKNOWN)); \
	echo "   Всего использований 'any': $$TOTAL_ANY"; \
	echo "   Всего использований 'unknown': $$TOTAL_UNKNOWN"; \
	echo "   Всего использований 'any' и 'unknown': $$TOTAL"
	@echo ""
	@echo "💡 Для продолжения работы запустите: make continue-types"

monitor-start: ## Запустить монитор автоматического продолжения в фоне
	@./scripts/auto-continue-monitor.sh > /dev/null 2>&1 &
	@echo "✅ Монитор запущен в фоне"
	@echo "   Для проверки статуса: make monitor-status"
	@echo "   Для остановки: make monitor-stop"

monitor-stop: ## Остановить монитор автоматического продолжения
	@if [ -f .cursor/auto-continue.lock ]; then \
		PID=$$(cat .cursor/auto-continue.lock 2>/dev/null || echo ""); \
		if [ -n "$$PID" ] && ps -p $$PID > /dev/null 2>&1; then \
			kill $$PID 2>/dev/null || true; \
			echo "✅ Монитор остановлен (PID: $$PID)"; \
		else \
			echo "ℹ️  Монитор не запущен"; \
		fi; \
		rm -f .cursor/auto-continue.lock; \
	else \
		echo "ℹ️  Монитор не запущен"; \
	fi

monitor-status: ## Показать статус монитора
	@if [ -f .cursor/auto-continue.lock ]; then \
		PID=$$(cat .cursor/auto-continue.lock 2>/dev/null || echo ""); \
		if [ -n "$$PID" ] && ps -p $$PID > /dev/null 2>&1; then \
			echo "✅ Монитор запущен (PID: $$PID)"; \
			if [ -f .cursor/last-check.txt ]; then \
				echo "   Последняя проверка: $$(cat .cursor/last-check.txt)"; \
			fi; \
		else \
			echo "❌ Монитор не запущен (lock файл существует, но процесс не найден)"; \
			rm -f .cursor/auto-continue.lock; \
		fi; \
	else \
		echo "❌ Монитор не запущен"; \
	fi
	@if [ -f .cursor/auto-continue.txt ]; then \
		echo ""; \
		echo "📄 Инструкции для продолжения:"; \
		cat .cursor/auto-continue.txt | head -20; \
	fi

auto-continue: ## Показать инструкции для автоматического продолжения
	@./scripts/auto-continue.sh

auto-continue-exec: ## Автоматически создать команду для продолжения работы
	@./scripts/auto-continue-exec.sh

watch-continue: ## Запустить watch-режим с автоматическим показом команды (требует inotify-tools)
	@.cursor/auto-continue-watch.sh

copy-continue: ## Создать команду и скопировать в буфер обмена (Linux)
	@./scripts/auto-continue-exec.sh > /dev/null 2>&1 && \
	if command -v xclip > /dev/null 2>&1; then \
		cat .cursor/trigger-continue.txt | grep "продолжай" | head -1 | sed 's/## Команда для выполнения в Cursor://' | xargs | xclip -selection clipboard && \
		echo "✅ Команда скопирована в буфер обмена!"; \
	elif command -v xsel > /dev/null 2>&1; then \
		cat .cursor/trigger-continue.txt | grep "продолжай" | head -1 | sed 's/## Команда для выполнения в Cursor://' | xargs | xsel --clipboard && \
		echo "✅ Команда скопирована в буфер обмена!"; \
	else \
		echo "❌ xclip или xsel не установлены. Установите: sudo apt-get install xclip"; \
		cat .cursor/trigger-continue.txt | grep "продолжай" | head -1; \
	fi

send-continue: ## Автоматически отправить "продолжай" в чат Cursor (использует auto-continue.sh)
	@./scripts/auto-continue.sh

auto-send: ## Полный цикл: создать команду + автоматически отправить в Cursor
	@./scripts/auto-continue-exec.sh > /dev/null 2>&1 && \
	./scripts/auto-continue.sh

auto-continue-on-complete: ## Автоматически продолжить работу после завершения задачи
	@.cursor/auto-continue-on-complete.sh

devtools-continue: ## Показать DevTools скрипт для копирования (самый надежный способ)
	@echo "📋 DevTools скрипт для автоматической отправки 'продолжай':"
	@echo ""
	@echo "1. Откройте DevTools: Ctrl+Shift+I"
	@echo "2. Вставьте и выполните этот код:"
	@echo ""
	@cat /home/ivan/soft/cursor-auto-continue/devtools-mini.js
	@echo ""
	@echo ""
	@echo "💡 Или используйте полную версию:"
	@echo "   cat /home/ivan/soft/cursor-auto-continue/devtools-script.js"

## MCP Servers Management
mcp-start: ## Запустить все MCP серверы (Ollama, Workix, TypeScript)
	@./scripts/mcp-servers.sh start

mcp-stop: ## Остановить все MCP серверы
	@./scripts/mcp-servers.sh stop

mcp-status: ## Проверить статус всех MCP серверов
	@./scripts/mcp-servers.sh status

mcp-build: ## Собрать Workix MCP сервер
	@./scripts/mcp-servers.sh build

mcp-pull: ## Скачать все Ollama модели
	@./scripts/mcp-servers.sh pull

mcp-config: ## Показать текущую конфигурацию MCP серверов
	@./scripts/mcp-servers.sh config

## Documentation Organization
docs-organize: ## Организовать все MD файлы по правильной структуре
	@chmod +x scripts/organize-docs.sh
	@./scripts/organize-docs.sh

docs-archive: ## Архивировать старые MD файлы (>30 дней)
	@chmod +x scripts/archive-docs.sh
	@./scripts/archive-docs.sh

docs-cleanup: ## Очистить временные MD файлы (>7 дней)
	@chmod +x scripts/cleanup-docs.sh
	@./scripts/cleanup-docs.sh
