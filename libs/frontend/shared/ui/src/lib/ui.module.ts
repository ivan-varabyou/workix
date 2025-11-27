/**
 * UI Module
 *
 * Главный модуль для UI компонентов.
 * Инициализирует провайдеры и регистрирует адаптеры.
 */

import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { registerUIProviderAdapter } from './config/ui-provider.config';
import {
  CURRENT_UI_PROVIDER,
  CURRENT_UI_VERSION,
  UIProvider,
  UIVersion,
} from './config/ui-version.config';
import { PrimeNGAdapterV1 } from './providers/v1/primeng/primeng-adapter';

/**
 * UI Module
 */
@NgModule({
  imports: [CommonModule],
  exports: [CommonModule],
})
export class WorkixUIModule {
  static forRoot(provider?: UIProvider, version?: UIVersion): ModuleWithProviders<WorkixUIModule> {
    // Регистрируем адаптеры провайдеров
    const primengAdapter = new PrimeNGAdapterV1();
    registerUIProviderAdapter(primengAdapter);

    return {
      ngModule: WorkixUIModule,
      providers: [
        {
          provide: 'UI_CONFIG',
          useValue: {
            provider: provider || CURRENT_UI_PROVIDER,
            version: version || CURRENT_UI_VERSION,
          },
        },
      ],
    };
  }
}
