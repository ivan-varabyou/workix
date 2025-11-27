/**
 * Types for FormDialog component
 */

import { ValidatorFn } from '@angular/forms';

import { FormFieldOption, FormFieldValue } from '../../interfaces/form.interface';

export interface FormDialogField {
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
    | 'date';
  placeholder?: string;
  required?: boolean;
  validators?: ValidatorFn[];
  errorMessages?: Record<string, string>;
  options?: FormFieldOption[];
  rows?: number;
  hint?: string;
  defaultValue?: FormFieldValue;
}

export interface FormDialogConfig {
  title: string;
  subtitle?: string;
  fields: FormDialogField[];
  submitLabel?: string;
  cancelLabel?: string;
  width?: string;
  height?: string;
  mode?: 'create' | 'edit';
  initialData?: Record<string, FormFieldValue>;
}
