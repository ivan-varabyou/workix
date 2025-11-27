import nx from '@nx/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/*.e2e-spec.ts',
      '**/*.e2e-test.ts',
      '**/*.stories.ts',
      '**/*.stories.tsx',
      '**/vitest.config.*',
      '**/jest.config.*',
      '**/.storybook/**',
      '**/scripts/**',
      '**/*.dev.ts',
      '**/*.dev.tsx',
      '**/dev/**',
      '**/register-paths.js',
      '**/*.js',
      // Исключаем конфигурационные файлы из линтинга (проблемы с tsconfig)
      '**/vite.config.ts',
      '**/vite.config.js',
      '**/webpack.config.js',
      '**/test-setup.ts',
      '**/jest.setup.ts',
      // Временно исключаем ai-core из-за проблем с tsconfig parsing
      'libs/ai/ai-core/src/**/*.ts',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // Backend apps могут импортировать из infrastructure, domain, shared и libs
            // Это правило должно быть ПЕРЕД общим правилом для type:app
            {
              sourceTag: 'scope:backend',
              onlyDependOnLibsWithTags: [
                'scope:infrastructure',
                'scope:domain',
                'scope:shared',
                'type:lib'
              ],
            },
            // Apps могут импортировать только из libs (любых)
            // Это общее правило применяется только если нет более специфичного правила выше
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['type:lib'],
            },
            // Domain libs могут импортировать только из infrastructure и shared
            {
              sourceTag: 'scope:domain',
              onlyDependOnLibsWithTags: [
                'scope:infrastructure',
                'scope:shared',
                'type:lib',
              ],
            },
            // Infrastructure libs могут импортировать только из shared
            {
              sourceTag: 'scope:infrastructure',
              onlyDependOnLibsWithTags: ['scope:shared', 'type:lib'],
            },
            // Integrations могут импортировать из infrastructure, shared и domain
            {
              sourceTag: 'scope:integrations',
              onlyDependOnLibsWithTags: [
                'scope:infrastructure',
                'scope:shared',
                'scope:domain',
                'type:lib',
              ],
            },
            // Shared libs могут импортировать только из других shared libs
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared', 'type:lib'],
            },
            // Utilities могут импортировать из shared и infrastructure
            {
              sourceTag: 'scope:utilities',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'scope:infrastructure',
                'type:lib',
              ],
            },
            // AI libs могут импортировать из shared и infrastructure
            {
              sourceTag: 'scope:ai',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'scope:infrastructure',
                'type:lib',
              ],
            },
            // Общее правило: все могут зависеть от libs
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  // Правила для apps/ - только контроллеры и модули
  {
    files: ['apps/**/*.ts', 'apps/**/*.tsx'],
    ignores: [
      'apps/**/*.spec.ts',
      'apps/**/*.test.ts',
      'apps/**/*.e2e-spec.ts',
      'apps/**/*.e2e-test.ts',
      'apps/**/main.ts',
      'apps/**/prisma.service.ts',
      'apps/**/bootstrap.ts',
    ],
    rules: {
      // Apps не должны содержать бизнес-логику - только контроллеры
      '@typescript-eslint/no-explicit-any': 'error',
      // Запрещаем создание services в apps (должны быть в libs)
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ClassDeclaration[superClass.name="Injectable"]',
          message: 'Services should be in libs/, not in apps/. Move to appropriate libs/domain/* or libs/shared/* library.',
        },
      ],
    },
  },
  // Правила для libs/ - вся бизнес-логика
  {
    files: ['libs/**/*.ts', 'libs/**/*.tsx'],
    ignores: [
      'libs/**/*.spec.ts',
      'libs/**/*.test.ts',
      'libs/**/*.e2e-spec.ts',
      'libs/**/*.e2e-test.ts',
      'libs/**/*.stories.ts',
      'libs/**/*.stories.tsx',
    ],
    rules: {
      // Строгие правила для libs - вся бизнес-логика здесь
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': ['error', {
        allowExpressions: false,
        allowTypedFunctionExpressions: false,
        allowHigherOrderFunctions: false,
        allowDirectConstAssertionInArrowFunctions: false,
      }],
      '@typescript-eslint/typedef': ['error', {
        arrayDestructuring: true,
        arrowParameter: true,
        memberVariableDeclaration: true,
        objectDestructuring: true,
        parameter: true,
        propertyDeclaration: true,
        variableDeclaration: true,
        variableDeclarationIgnoreFunction: false,
      }],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    ignores: ['**/scripts/**'],
    languageOptions: {
      parser: (await import('@typescript-eslint/parser')).default,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname || process.cwd(),
      },
    },
    plugins: {
      'unused-imports': unusedImports,
      'import': importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    // Override or add rules here
    rules: {
      // Ошибка на неиспользуемые импорты
      'no-unused-vars': 'off', // Отключаем базовое правило, используем TypeScript версию
      '@typescript-eslint/no-unused-vars': 'off', // Отключаем, используем unused-imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Error on explicit any - запрещаем any
      '@typescript-eslint/no-explicit-any': 'error',
      // Error on implicit any и небезопасные операции (as unknown, as any)
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      // Запрещаем type assertions (as, as unknown, as any) и definite assignment assertion (!)
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-assertions': ['error', {
        assertionStyle: 'never', // Запрещаем все type assertions: as, as unknown, as any
      }],
      // Запрещаем использование satisfies (альтернатива as, но тоже type assertion)
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSAsExpression',
          message: 'Type assertions (as) are forbidden. Use type guards or proper typing instead.',
        },
        {
          selector: 'TSSatisfiesExpression',
          message: 'Type satisfies are forbidden. Use type guards or proper typing instead.',
        },
      ],
      // Требуем явные return типы
      '@typescript-eslint/explicit-function-return-type': ['error', {
        allowExpressions: false,
        allowTypedFunctionExpressions: false,
        allowHigherOrderFunctions: false,
        allowDirectConstAssertionInArrowFunctions: false,
      }],
      // Требуем явные типы для переменных (запрет хардкодных inline типов)
      // Исключение: строковые литералы и примитивы могут быть без явной аннотации
      '@typescript-eslint/typedef': ['error', {
        arrayDestructuring: true,
        arrowParameter: true,
        memberVariableDeclaration: true,
        objectDestructuring: true,
        parameter: true,
        propertyDeclaration: true,
        variableDeclaration: true,
        variableDeclarationIgnoreFunction: false,
      }],
      // Запрещаем inferrable types - требуем явные типы (выносить в интерфейсы)
      // Исключение: строковые литералы и примитивы могут быть без явной аннотации
      '@typescript-eslint/no-inferrable-types': 'off', // Отключаем, т.к. конфликтует с typedef
      // Запрещаем использование object literal types - требуем интерфейсы
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      // Запрещаем inline object types в return types и параметрах - требуем выносить в интерфейсы
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            // Запрещаем inline object types в Promise
            'Promise<{[key: string]: any}>': {
              message: 'Use interface instead of inline object type. Extract to a separate interface file.',
              fixWith: 'Extract to interface',
            },
          },
        },
      ],
      // Allow empty functions (warn instead of error)
      '@typescript-eslint/no-empty-function': 'warn',
      // Allow @ts-ignore (but prefer @ts-expect-error)
      '@typescript-eslint/ban-ts-comment': 'warn',
      // Автоматическая сортировка импортов
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      // Проверка импортов
      'import/no-unresolved': 'off', // Отключаем, т.к. TypeScript сам проверяет
      'import/order': 'off', // Используем simple-import-sort
      'import/no-duplicates': 'error',
      'import/no-unused-modules': 'off', // Может быть медленным
    },
  },
  // Strict rules for production code (test files, stories, dev files are already ignored above)
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
    ],
    ignores: [
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/*.e2e-spec.ts',
      '**/*.e2e-test.ts',
      '**/*.stories.ts',
      '**/*.stories.tsx',
      '**/*.dev.ts',
      '**/*.dev.tsx',
      '**/vitest.config.*',
      '**/jest.config.*',
      '**/.storybook/**',
      '**/scripts/**',
      '**/dev/**',
      // Исключаем Node.js специфичные файлы из правил WebAssembly
          '**/main.ts',
          '**/prisma.service.ts',
          '**/bootstrap.ts',
          // Исключаем guards из правил WebAssembly (используют TextEncoder для совместимости)
          '**/guards/**',
          // Исключаем конфигурационные файлы из правил WebAssembly (используют ConfigService)
          '**/config/**',
          '**/*.config.ts',
        ],
    rules: {
      // Запрещаем any явно
      '@typescript-eslint/no-explicit-any': 'error',
      // Запрещаем небезопасные операции (as unknown, as any)
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      // Запрещаем type assertions (as, as unknown, as any) и definite assignment assertion (!)
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-assertions': ['error', {
        assertionStyle: 'never',
      }],
      // Требуем явные return типы
      '@typescript-eslint/explicit-function-return-type': ['error', {
        allowExpressions: false,
        allowTypedFunctionExpressions: false,
        allowHigherOrderFunctions: false,
        allowDirectConstAssertionInArrowFunctions: false,
      }],
      // Требуем явные типы для переменных (запрет хардкодных inline типов - выносить в интерфейсы)
      '@typescript-eslint/typedef': ['error', {
        arrayDestructuring: true,
        arrowParameter: true,
        memberVariableDeclaration: true,
        objectDestructuring: true,
        parameter: true,
        propertyDeclaration: true,
        variableDeclaration: true,
        variableDeclarationIgnoreFunction: false,
      }],
      // Запрещаем использование object literal types - требуем интерфейсы вместо type
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      // Запрещаем inline object types в return types и параметрах - требуем выносить в интерфейсы
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            // Запрещаем inline object types в Promise
            'Promise<{[key: string]: any}>': {
              message: 'Use interface instead of inline object type. Extract to a separate interface file.',
              fixWith: 'Extract to interface',
            },
          },
        },
      ],
      // Запрещаем использование type aliases с импортами - только интерфейсы без импортов
      '@typescript-eslint/no-type-alias': [
        'error',
        {
          allowAliases: 'never',
          allowCallbacks: 'never',
          allowConditionalTypes: 'never',
          allowConstructors: 'never',
          allowLiterals: 'never',
          allowMappedTypes: 'never',
          allowTupleTypes: 'never',
        },
      ],
      // WebAssembly совместимость: запрещаем Node.js специфичные типы и API
      // Исключения: main.ts, prisma.service.ts и другие файлы, специфичные для Node.js окружения
      'no-restricted-globals': [
        'error',
        {
          name: 'Buffer',
          message: 'Buffer is Node.js specific. Use ArrayBuffer or Uint8Array for WebAssembly compatibility.',
        },
        {
          name: 'process',
          message: 'process is Node.js specific. Use environment variables or configuration objects for WebAssembly compatibility.',
        },
        {
          name: 'require',
          message: 'require is Node.js specific. Use ES6 import/export for WebAssembly compatibility.',
        },
        {
          name: '__dirname',
          message: '__dirname is Node.js specific. Use import.meta.url or configuration for WebAssembly compatibility.',
        },
        {
          name: '__filename',
          message: '__filename is Node.js specific. Use import.meta.url or configuration for WebAssembly compatibility.',
        },
        {
          name: 'global',
          message: 'global is Node.js specific. Use globalThis for WebAssembly compatibility.',
        },
        {
          name: 'module',
          message: 'module is Node.js specific. Use ES6 modules for WebAssembly compatibility.',
        },
        {
          name: 'exports',
          message: 'exports is Node.js specific. Use ES6 export for WebAssembly compatibility.',
        },
      ],
      // Запрещаем использование Node.js специфичных типов
      // Исключения: main.ts, prisma.service.ts и другие файлы, специфичные для Node.js окружения
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSTypeReference[typeName.name="Buffer"]',
          message: 'Buffer is Node.js specific. Use ArrayBuffer or Uint8Array for WebAssembly compatibility.',
        },
        {
          selector: 'TSTypeReference[typeName.name="NodeJS"]',
          message: 'NodeJS types are Node.js specific. Use standard types for WebAssembly compatibility.',
        },
        {
          selector: 'CallExpression[callee.name="require"]',
          message: 'require() is Node.js specific. Use ES6 import/export for WebAssembly compatibility.',
        },
        {
          selector: 'MemberExpression[object.name="process"]',
          message: 'process is Node.js specific. Use environment variables or configuration objects for WebAssembly compatibility.',
        },
        {
          selector: 'MemberExpression[object.name="Buffer"]',
          message: 'Buffer is Node.js specific. Use ArrayBuffer or Uint8Array for WebAssembly compatibility.',
        },
        {
          selector: 'NewExpression[callee.name="Buffer"]',
          message: 'Buffer is Node.js specific. Use ArrayBuffer or Uint8Array for WebAssembly compatibility.',
        },
      ],
      // Требуем явные типы для всех переменных (WebAssembly совместимость)
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      // Запрещаем использование типов, которые не могут быть сериализованы
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            // Запрещаем inline object types в Promise
            'Promise<{[key: string]: any}>': {
              message: 'Use interface instead of inline object type. Extract to a separate interface file.',
              fixWith: 'Extract to interface',
            },
            // Запрещаем использование Function типа (не сериализуется)
            Function: {
              message: 'Function type is not serializable. Use explicit function signatures or interfaces for WebAssembly compatibility.',
            },
            // Запрещаем использование Object типа (слишком общий)
            Object: {
              message: 'Object type is too generic. Use specific interfaces for WebAssembly compatibility.',
            },
          },
        },
      ],
    },
  },
];
