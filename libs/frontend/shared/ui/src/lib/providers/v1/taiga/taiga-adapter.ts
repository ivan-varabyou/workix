/**
 * Taiga UI Adapter for UI v1
 *
 * Adapter for Taiga UI library version v1
 */

import { NgModule, Type } from '@angular/core';
// Taiga UI imports
// Note: These imports will be available after installing @taiga-ui packages
// import { TuiButtonModule } from '@taiga-ui/core';
// import { TuiCardModule } from '@taiga-ui/core';
// import { TuiInputModule } from '@taiga-ui/kit';
// import { TuiSelectModule } from '@taiga-ui/kit';
// import { TuiTableModule } from '@taiga-ui/kit';
// import { TuiDialogModule } from '@taiga-ui/kit';
// import { TuiTabsModule } from '@taiga-ui/kit';
// import { TuiTextareaModule } from '@taiga-ui/kit';
// import { TuiChipModule } from '@taiga-ui/kit';
// import { TuiLoaderModule } from '@taiga-ui/core';
// import { TuiTooltipModule } from '@taiga-ui/core';

import { UIProviderAdapter } from '../../../config/ui-provider.config';
import { UIProvider, UIVersion } from '../../../config/ui-version.config';

/**
 * Taiga UI Adapter v1
 */
export class TaigaAdapterV1 implements UIProviderAdapter {
  name: UIProvider = UIProvider.TAIGA;
  version: UIVersion = UIVersion.V1;

  private componentModules: Map<string, Type<NgModule>> = new Map([
    // TODO: Uncomment after installing @taiga-ui packages
    // ['button', TuiButtonModule],
    // ['card', TuiCardModule],
    // ['input', TuiInputModule],
    // ['select', TuiSelectModule],
    // ['table', TuiTableModule],
    // ['modal', TuiDialogModule],
    // ['dialog', TuiDialogModule],
    // ['tabs', TuiTabsModule],
    // ['textarea', TuiTextareaModule],
    // ['chip', TuiChipModule],
    // ['spinner', TuiLoaderModule],
    // ['tooltip', TuiTooltipModule],
  ]);

  getComponentModule(componentName: string): Type<NgModule> {
    const module: Type<NgModule> | undefined = this.componentModules.get(
      componentName.toLowerCase()
    );
    if (!module) {
      throw new Error(`Taiga UI v1: Component module '${componentName}' not found. Please install @taiga-ui packages and uncomment imports.`);
    }
    return module;
  }

  getComponentClass(componentName: string): Type<unknown> {
    // For Taiga UI, we use modules
    return this.getComponentModule(componentName) as Type<unknown>;
  }
}
