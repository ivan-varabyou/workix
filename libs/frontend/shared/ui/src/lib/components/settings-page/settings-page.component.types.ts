/**
 * Types for SettingsPage component
 */

import { Type } from '@angular/core';
import { ValidatorFn } from '@angular/forms';

import { FormFieldOption, FormFieldValue } from '../../interfaces/form.interface';

export interface SettingsTab {
  id?: string;
  label: string;
  icon?: string;
  component?: Type<unknown>; // Angular component type - must remain unknown
  fields?: SettingsField[];
  content?: 'form' | 'custom';
  customContent?: Record<string, unknown>;
}

export interface SettingsField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'tel'
    | 'number'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'toggle';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  validators?: ValidatorFn[];
  errorMessages?: Record<string, string>;
  options?: FormFieldOption[];
  rows?: number;
  hint?: string;
  defaultValue?: FormFieldValue;
}

export interface SettingsPageConfig {
  title: string;
  tabs: SettingsTab[];
  showSaveButton?: boolean;
  saveLabel?: string;
  showCancelButton?: boolean;
  cancelLabel?: string;
  initialData?: Record<string, FormFieldValue>;
}
