import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { WorkixButtonComponent } from '../button/button.component';
import { WorkixCardComponent } from '../card/card.component';
import { WorkixCheckboxComponent } from '../checkbox/checkbox.component';
import { WorkixDividerComponent } from '../divider/divider.component';
import { WorkixFormFieldComponent } from '../form-field/form-field.component';
import { WorkixInputComponent } from '../input/input.component';
import { AuthFormConfig, AuthFormMode } from './auth-form.component.types';

/**
 * Workix AuthForm Component
 *
 * Generic component for authentication forms (login, register, etc.).
 * Replaces login.component, register.component, etc.
 *
 * Usage:
 * ```html
 * <workix-auth-form
 *   [config]="authConfig"
 *   [mode]="'login'"
 *   [isLoading]="isLoading()"
 *   [errorMessage]="errorMessage()"
 *   (submit)="onSubmit($event)"
 * />
 * ```
 */
@Component({
  selector: 'workix-auth-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    WorkixCardComponent,
    WorkixButtonComponent,
    WorkixInputComponent,
    WorkixFormFieldComponent,
    WorkixCheckboxComponent,
    WorkixDividerComponent,
  ],
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
})
export class WorkixAuthFormComponent {
  // Required inputs
  config = input.required<AuthFormConfig>();
  mode = input<AuthFormMode>('login');

  // Optional inputs
  isLoading = input<boolean>(false);
  errorMessage = input<string | null>(null);

  // Outputs
  submit = output<Record<string, any>>();
  socialLogin = output<void>();

  // Form
  private fb = new FormBuilder();
  form = signal<FormGroup | null>(null);

  // Computed: Build form from config
  buildForm = computed(() => {
    const config = this.config();
    const formGroup: Record<string, any> = {};

    config.fields.forEach((field) => {
      const validators = field.validators || [];
      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.type === 'email') {
        validators.push(Validators.email);
      }
      if (field.type === 'password' && this.mode() === 'register') {
        validators.push(Validators.minLength(8));
      }

      formGroup[field.name] = ['', validators];
    });

    // Add remember me if needed
    if (config.showRememberMe) {
      formGroup['rememberMe'] = [false];
    }

    // Add agree terms if register
    if (this.mode() === 'register') {
      formGroup['agreeTerms'] = [false, Validators.requiredTrue];
    }

    return this.fb.group(formGroup);
  });

  // Computed: Check if agree terms field exists
  hasAgreeTermsField = computed(() => {
    return this.config().fields.some((f) => f.name === 'agreeTerms');
  });

  constructor() {
    // Initialize form when config changes
    effect(() => {
      this.form.set(this.buildForm());
    });
  }

  getFieldError(fieldName: string): string | null {
    const form = this.form();
    if (!form) return null;

    const field = form.get(fieldName);
    if (!field || !field.errors || !field.touched) return null;

    const config = this.config();
    const fieldConfig = config.fields.find((f) => f.name === fieldName);
    if (!fieldConfig?.errorMessages) return null;

    const errors = field.errors;
    for (const errorKey in errors) {
      if (fieldConfig.errorMessages[errorKey]) {
        return fieldConfig.errorMessages[errorKey];
      }
    }

    return null;
  }

  onSubmit(): void {
    const form = this.form();
    if (!form || form.invalid) return;

    this.submit.emit(form.value);
  }

  onSocialLogin(): void {
    this.socialLogin.emit();
  }
}
