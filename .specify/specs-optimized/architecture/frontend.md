# Frontend Architecture

**Version**: 3.0

## Overview

Angular 20+ architecture with Signals, Zoneless change detection, and standalone components.

## Core Principles

### 1. Standalone Components

- **REQUIRED**: All components must be standalone
- **Pattern**: `@Component({ standalone: true, imports: [...] })`
- **Benefit**: Smaller bundle, faster tree-shaking

### 2. Zoneless Change Detection

- **REQUIRED**: No `NgZone` or `zone.js` overhead
- **Configuration**: `provideZoneChangeDetection({ eventCoalescing: true })`
- **Pattern**: OnPush change detection by default

### 3. Signal-Based State

- **REQUIRED**: Use Angular Signals for all state
- **Syntax**: `signal()`, `computed()`, `effect()`
- **NO**: RxJS subscriptions in components (use effects)

### 4. Modern Input/Output

```typescript
// NEW (Angular 20+):
name = input<string>();                    // Required input
optionalName = input<string | null>(null); // Optional with default
nameChange = output<string>();             // Output
```

### 5. New Control Flow

- **REQUIRED**: Use new syntax ONLY
- **NO**: `*ngIf`, `*ngFor`, `*ngSwitch`

```html
@if (isVisible()) {
  <p>Visible</p>
} @else {
  <p>Hidden</p>
}

@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

@switch (status()) {
  @case ('active') { <span>Active</span> }
  @default { <span>Unknown</span> }
}
```

### 6. Server-Side Rendering (SSR)

- **REQUIRED**: All apps must support SSR
- **Bootstrap**: Use `bootstrapApplication` with SSR config
- **Platform Detection**: Use `isPlatformBrowser()` for browser-only code

## UI Components Library

**Location**: `libs/shared/frontend/ui`

**Purpose**: Abstracted wrapper around PrimeNG for easy UI library replacement.

### Available Components

- **Basic**: Button, Card, Input, Select, Checkbox, Datepicker, Chip, Badge, Icon, Divider
- **Layout**: AdminLayout, ClientLayout, ResponsiveLayout, Sidenav, Toolbar, Menu
- **Forms**: FormField, FormDialog, AuthForm
- **Data Display**: Table, DataTable, List, Tabs, Expansion, DetailView
- **Feedback**: Modal, ConfirmDialog, Snackbar, Spinner, Tooltip
- **Business**: Dashboard, PipelineBuilder, StepEditor, Monitor, SettingsPage, NotificationList
- **Pagination**: Paginator, Sort

### Component Pattern

```typescript
@Component({
  selector: 'workix-button',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './button.component.html',
})
export class WorkixButtonComponent {
  label = input<string>('Click me');
  variant = input<'primary' | 'secondary'>('primary');
  onClick = output<void>();

  severity = computed(() => {
    return this.variant() === 'primary' ? 'primary' : 'secondary';
  });
}
```

### Storybook

- All components have Storybook stories
- Run: `nx storybook shared-frontend-ui`
- Port: 7400

## Design System

### Colors

- **Primary**: `#3f51b5` (light), `#1a237e` (dark)
- **Accent**: `#ff4081` (light), `#c60055` (dark)
- **Status**: Success `#4caf50`, Warning `#ff9800`, Error `#f44336`, Info `#2196f3`

### Typography

- **Font**: Roboto, Helvetica Neue, system fonts
- **Scale**: h1 (32px) → h6 (16px), body (16px), caption (12px)

### Spacing

- **Scale**: 4px base (0.25rem, 0.5rem, 1rem, 1.5rem, 2rem, 3rem)

## Internationalization (I18N)

**Service**: `@workix/shared/frontend/core` - `I18nService`

**Usage**:
```typescript
// In component
constructor(private i18n: I18nService) {}

getLabel(key: string): string {
  return this.i18n.translate(key);
}
```

**Template**:
```html
{{ 'common.save' | i18n }}
```

**Locales**: en, ru, ar

## Accessibility

- **WCAG AA**: Minimum contrast ratio 4.5:1
- **ARIA**: Proper labels and roles
- **Keyboard**: Full keyboard navigation
- **Screen Readers**: Semantic HTML

## Applications

### app-admin (Port 7300)

Admin dashboard for platform management.

**Features**:
- User management
- Pipeline administration
- System configuration
- Analytics & monitoring
- RBAC management

**Modules**: Dashboard, Users, Roles, Analytics, AuditLogs, Settings, Pipelines, Integrations

### app-web (Port 7301)

Client-facing web application.

**Features**:
- Visual pipeline editor
- Workflow execution
- Dashboard & monitoring
- User profile management
- Integration management

## Related

- [Libraries](../core/libraries.md)
- [Applications](../core/applications.md)
- [Development Process](../core/development.md)



