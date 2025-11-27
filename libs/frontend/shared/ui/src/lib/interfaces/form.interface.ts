// Form interfaces for UI components

import { ValidatorFn } from '@angular/forms';

export interface FormFieldValidator {
  validator: ValidatorFn;
  message?: string;
}

export type FormFieldValue = string | number | boolean | Date | null | undefined;

export interface FormFieldOption {
  label: string;
  value: FormFieldValue;
}
