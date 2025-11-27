/**
 * UI Provider Configuration
 *
 * Абстракция для UI провайдеров (Material, PrimeNG, Custom).
 * Позволяет легко переключаться между UI библиотеками.
 */

import { NgModule, Type } from '@angular/core';

import { getUIConfig, UIProvider, UIVersion } from './ui-version.config';

/**
 * Интерфейс для адаптера UI провайдера
 */
export interface UIProviderAdapter {
  name: UIProvider;
  version: UIVersion;
  getComponentModule(componentName: string): Type<NgModule>;
  getComponentClass(componentName: string): Type<unknown>;
}

/**
 * Регистр адаптеров UI провайдеров
 */
const providerAdapters = new Map<string, UIProviderAdapter>();

/**
 * Зарегистрировать адаптер UI провайдера
 */
export function registerUIProviderAdapter(adapter: UIProviderAdapter): void {
  const key = `${adapter.name}-${adapter.version}`;
  providerAdapters.set(key, adapter);
}

/**
 * Получить адаптер UI провайдера
 */
export function getUIProviderAdapter(
  provider?: UIProvider,
  version?: UIVersion
): UIProviderAdapter | null {
  const config = getUIConfig();
  const providerName = provider || config.provider;
  const uiVersion = version || config.version;
  const key = `${providerName}-${uiVersion}`;

  return providerAdapters.get(key) || null;
}

/**
 * Получить модуль компонента для текущего провайдера
 */
export function getComponentModule(componentName: string): Type<NgModule> {
  const adapter = getUIProviderAdapter();
  if (!adapter) {
    throw new Error(
      `UI Provider adapter not found. Please register an adapter for ${getUIConfig().provider}`
    );
  }
  return adapter.getComponentModule(componentName);
}

/**
 * Получить класс компонента для текущего провайдера
 */
export function getComponentClass(componentName: string): Type<unknown> {
  const adapter = getUIProviderAdapter();
  if (!adapter) {
    throw new Error(
      `UI Provider adapter not found. Please register an adapter for ${getUIConfig().provider}`
    );
  }
  return adapter.getComponentClass(componentName);
}
