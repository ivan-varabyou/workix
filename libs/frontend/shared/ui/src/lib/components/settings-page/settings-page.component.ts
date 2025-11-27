import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { WorkixButtonComponent } from '../button/button.component';
import { WorkixCardComponent } from '../card/card.component';
import { WorkixCheckboxComponent } from '../checkbox/checkbox.component';
import { WorkixFormFieldComponent } from '../form-field/form-field.component';
import { WorkixInputComponent } from '../input/input.component';
import { WorkixSelectComponent } from '../select/select.component';
import { WorkixSpinnerComponent } from '../spinner/spinner.component';
import { WorkixTabsComponent } from '../tabs/tabs.component';
import { SettingsPageConfig } from './settings-page.component.types';

/**
 * Workix SettingsPage Component
 *
 * Generic component for settings pages with tabs and forms.
 * Replaces settings.component, general-settings, email-settings, etc.
 *
 * Usage:
 * ```html
 * <workix-settings-page
 *   [config]="settingsConfig"
 *   [isLoading]="isLoading()"
 *   [isSaving]="isSaving()"
 *   [errorMessage]="errorMessage()"
 *   (save)="onSave($event)"
 *   (cancel)="onCancel()"
 * />
 * ```
 */
@Component({
  selector: 'workix-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WorkixCardComponent,
    WorkixTabsComponent,
    WorkixFormFieldComponent,
    WorkixInputComponent,
    WorkixSelectComponent,
    WorkixCheckboxComponent,
    WorkixButtonComponent,
    WorkixSpinnerComponent,
  ],
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
})
export class WorkixSettingsPageComponent {
  // Required inputs
  config = input.required<SettingsPageConfig>();

  // Optional inputs
  isLoading = input<boolean>(false);
  isSaving = input<boolean>(false);
  errorMessage = input<string | null>(null);

  // Outputs
  save = output<Record<string, any>>();
  cancel = output<void>();
  tabChange = output<number>();

  // Internal state
  activeTab = signal<number>(0);
  private fb = new FormBuilder();
  forms = signal<Map<string, FormGroup>>(new Map());

  // Computed: Build forms from config
  buildForms = computed(() => {
    const config = this.config();
    const formsMap = new Map<string, FormGroup>();

    config.tabs.forEach((tab) => {
      if (tab.fields && tab.fields.length > 0) {
        const formGroup: Record<string, any> = {};

        tab.fields.forEach((field) => {
          const validators = field.validators || [];
          if (field.required) {
            validators.push(Validators.required);
          }
          if (field.type === 'email') {
            validators.push(Validators.email);
          }

          const defaultValue = config.initialData?.[field.name] || field.defaultValue || '';
          formGroup[field.name] = [defaultValue, validators];
        });

        formsMap.set(tab.label, this.fb.group(formGroup));
      }
    });

    return formsMap;
  });

  constructor() {
    // Initialize forms when config changes
    effect(() => {
      this.forms.set(this.buildForms());
    });
  }

  getForm(tabLabel: string): FormGroup | null {
    return this.forms().get(tabLabel) || null;
  }

  getFieldError(tabLabel: string, fieldName: string): string | null {
    const form = this.getForm(tabLabel);
    if (!form) return null;

    const field = form.get(fieldName);
    if (!field || !field.errors || !field.touched) return null;

    const config = this.config();
    const tab = config.tabs.find((t) => t.label === tabLabel);
    if (!tab?.fields) return null;

    const fieldConfig = tab.fields.find((f) => f.name === fieldName);
    if (!fieldConfig?.errorMessages) return null;

    const errors = field.errors;
    for (const errorKey in errors) {
      if (fieldConfig.errorMessages[errorKey]) {
        return fieldConfig.errorMessages[errorKey];
      }
    }

    return null;
  }

  onSave(): void {
    const config = this.config();
    const allFormData: Record<string, any> = {};

    config.tabs.forEach((tab) => {
      const form = this.getForm(tab.label);
      if (form && form.valid) {
        allFormData[tab.label] = form.value;
      }
    });

    this.save.emit(allFormData);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
    this.tabChange.emit(index);
  }
}
