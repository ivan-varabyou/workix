# Taiga UI Migration Guide

## Overview

This document describes the migration from PrimeNG to Taiga UI in the Workix platform.

## Status

✅ **Adapter Created**: Taiga UI adapter structure is ready
⏳ **Packages Installation**: Need to install @taiga-ui packages
⏳ **Components Migration**: Need to update component implementations

## Installation

### 1. Install Taiga UI Packages

```bash
npm install @taiga-ui/core @taiga-ui/kit @taiga-ui/icons
```

### 2. Update Taiga Adapter

After installing packages, uncomment the imports in:
- `libs/shared/frontend/ui/src/lib/providers/v1/taiga/taiga-adapter.ts`

### 3. Configure Taiga UI

Set environment variable or update default configuration:

```typescript
// In ui-version.config.ts, default is already set to TAIGA
export const CURRENT_UI_PROVIDER: UIProvider = UIProvider.TAIGA;
```

Or via environment variable:
```bash
UI_PROVIDER=taiga
```

## Component Mapping

| PrimeNG Component | Taiga UI Component | Module |
|-------------------|-------------------|--------|
| ButtonModule | TuiButtonModule | @taiga-ui/core |
| CardModule | TuiCardModule | @taiga-ui/core |
| InputTextModule | TuiInputModule | @taiga-ui/kit |
| SelectModule | TuiSelectModule | @taiga-ui/kit |
| TableModule | TuiTableModule | @taiga-ui/kit |
| DialogModule | TuiDialogModule | @taiga-ui/kit |
| TabsModule | TuiTabsModule | @taiga-ui/kit |
| TextareaModule | TuiTextareaModule | @taiga-ui/kit |
| ChipModule | TuiChipModule | @taiga-ui/kit |
| ProgressSpinnerModule | TuiLoaderModule | @taiga-ui/core |
| TooltipModule | TuiTooltipModule | @taiga-ui/core |

## Migration Steps

1. **Install packages** (see above)
2. **Uncomment imports** in `taiga-adapter.ts`
3. **Update component templates** to use Taiga UI syntax
4. **Test all components** in both apps (app-web, app-admin)
5. **Update styles** if needed

## Notes

- The UI abstraction layer allows switching between providers without changing app code
- All components in `libs/shared/frontend/ui` use the adapter pattern
- Components should work with both PrimeNG and Taiga UI after migration

## Resources

- [Taiga UI Documentation](https://taiga-ui.dev/)
- [Taiga UI GitHub](https://github.com/taiga-family/taiga-ui)
