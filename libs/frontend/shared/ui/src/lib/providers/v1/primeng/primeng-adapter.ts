/**
 * PrimeNG Adapter for UI v1
 *
 * Адаптер для PrimeNG UI библиотеки версии v1
 */

import { NgModule, Type } from '@angular/core';
// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { UIProviderAdapter } from '../../../config/ui-provider.config';
import { UIProvider, UIVersion } from '../../../config/ui-version.config';

/**
 * PrimeNG Adapter v1
 */
export class PrimeNGAdapterV1 implements UIProviderAdapter {
  name: UIProvider = UIProvider.PRIMENG;
  version: UIVersion = UIVersion.V1;

  private componentModules: Map<string, Type<NgModule>> = new Map([
    ['button', ButtonModule],
    ['card', CardModule],
    ['input', InputTextModule],
    ['select', SelectModule],
    ['table', TableModule],
    ['modal', DialogModule],
    ['dialog', DialogModule],
    ['tabs', TabsModule],
    ['textarea', TextareaModule],
    ['chip', ChipModule],
    ['spinner', ProgressSpinnerModule],
    ['tooltip', TooltipModule],
  ]);

  getComponentModule(componentName: string): Type<NgModule> {
    const module: Type<NgModule> | undefined = this.componentModules.get(
      componentName.toLowerCase()
    );
    if (!module) {
      throw new Error(`PrimeNG v1: Component module '${componentName}' not found`);
    }
    return module;
  }

  getComponentClass(componentName: string): Type<unknown> {
    // Для PrimeNG классы компонентов обычно не экспортируются напрямую
    // Используем модули
    return this.getComponentModule(componentName) as Type<unknown>;
  }
}
