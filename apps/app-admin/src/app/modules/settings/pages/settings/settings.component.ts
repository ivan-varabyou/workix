import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { SettingsPageConfig, WorkixSettingsPageComponent } from '@workix/shared/frontend/ui';

import {
  EmailSettings,
  GeneralSettings,
  SecuritySettings,
  Settings,
} from '../../interfaces/settings.interface';
import { SettingsService } from '../../services/settings.service';
// FormFieldValue type definition
type FormFieldValue = string | number | boolean | Date | null | undefined;

// Helper to convert Settings to FormFieldValue format
function convertSettingsToFormData(settings: Settings): Record<string, FormFieldValue> {
  const result: Record<string, FormFieldValue> = {};
  if (settings.general) {
    Object.entries(settings.general).forEach(([key, value]) => {
      const formValue: FormFieldValue =
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value instanceof Date ||
        value === null ||
        value === undefined
          ? value
          : String(value);
      result[`general.${key}`] = formValue;
    });
  }
  if (settings.security) {
    Object.entries(settings.security).forEach(([key, value]) => {
      const formValue: FormFieldValue =
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value instanceof Date ||
        value === null ||
        value === undefined
          ? value
          : String(value);
      result[`security.${key}`] = formValue;
    });
  }
  if (settings.email) {
    Object.entries(settings.email).forEach(([key, value]) => {
      const formValue: FormFieldValue =
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value instanceof Date ||
        value === null ||
        value === undefined
          ? value
          : String(value);
      result[`email.${key}`] = formValue;
    });
  }
  return result;
}

// Type guards
function isGeneralSettings(value: unknown): value is GeneralSettings {
  if (!value || typeof value !== 'object' || value === null) return false;
  if (Array.isArray(value)) return false;
  const siteNameDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
    value,
    'siteName'
  );
  return typeof siteNameDesc?.value === 'string';
}

function isSecuritySettings(value: unknown): value is SecuritySettings {
  if (!value || typeof value !== 'object' || value === null) return false;
  if (Array.isArray(value)) return false;
  return true; // SecuritySettings has optional fields
}

function isEmailSettings(value: unknown): value is EmailSettings {
  if (!value || typeof value !== 'object' || value === null) return false;
  if (Array.isArray(value)) return false;
  const smtpHostDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
    value,
    'smtpHost'
  );
  return typeof smtpHostDesc?.value === 'string';
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, WorkixSettingsPageComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  settings = signal<Settings | null>(null);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Computed: Build settings config from loaded settings
  settingsConfig = computed<SettingsPageConfig>(() => {
    const settings = this.settings();
    const config: SettingsPageConfig = {
      title: 'System Settings',
      tabs: [
        {
          label: 'General',
          icon: 'settings',
          content: 'form',
          fields: [
            {
              name: 'appName',
              label: 'App Name',
              type: 'text',
              required: true,
              defaultValue: settings?.general?.siteName || '',
              errorMessages: { required: 'App name is required' },
            },
            {
              name: 'appUrl',
              label: 'App URL',
              type: 'text',
              required: true,
              placeholder: 'https://example.com',
              defaultValue: '',
              errorMessages: { required: 'App URL is required' },
            },
            {
              name: 'timezone',
              label: 'Timezone',
              type: 'select',
              required: true,
              options: [
                { label: 'UTC', value: 'UTC' },
                { label: 'EST', value: 'EST' },
                { label: 'PST', value: 'PST' },
              ],
              defaultValue: settings?.general?.timezone || 'UTC',
            },
            {
              name: 'language',
              label: 'Language',
              type: 'select',
              required: true,
              options: [
                { label: 'English', value: 'en' },
                { label: 'Russian', value: 'ru' },
              ],
              defaultValue: settings?.general?.language || 'en',
            },
            {
              name: 'maintenanceMode',
              label: 'Maintenance Mode',
              type: 'checkbox',
              defaultValue: settings?.system?.maintenanceMode || false,
            },
          ],
        },
        {
          label: 'Security',
          icon: 'security',
          content: 'form',
          fields: [
            {
              name: 'requireTwoFactor',
              label: 'Require Two-Factor Authentication',
              type: 'checkbox',
              defaultValue: settings?.security?.twoFactorEnabled || false,
            },
            {
              name: 'sessionTimeout',
              label: 'Session Timeout (seconds)',
              type: 'number',
              defaultValue: settings?.security?.sessionTimeout || 3600,
            },
            {
              name: 'passwordExpiryDays',
              label: 'Password Expiry (days)',
              type: 'number',
              defaultValue: 90,
            },
            {
              name: 'maxLoginAttempts',
              label: 'Max Login Attempts',
              type: 'number',
              defaultValue: settings?.security?.loginAttemptsLimit || 5,
            },
            {
              name: 'enableApiKeys',
              label: 'Enable API Keys',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'allowPublicRegistration',
              label: 'Allow Public Registration',
              type: 'checkbox',
              defaultValue: settings?.system?.allowRegistration || false,
            },
          ],
        },
        {
          label: 'Email',
          icon: 'email',
          content: 'form',
          fields: [
            {
              name: 'smtpHost',
              label: 'SMTP Host',
              type: 'text',
              required: true,
              defaultValue: settings?.email?.smtpHost || '',
              errorMessages: { required: 'SMTP host is required' },
            },
            {
              name: 'smtpPort',
              label: 'SMTP Port',
              type: 'number',
              required: true,
              defaultValue: settings?.email?.smtpPort || 587,
              errorMessages: { required: 'SMTP port is required' },
            },
            {
              name: 'smtpUser',
              label: 'SMTP User',
              type: 'text',
              required: true,
              defaultValue: settings?.email?.smtpUser || '',
              errorMessages: { required: 'SMTP user is required' },
            },
            {
              name: 'smtpPassword',
              label: 'SMTP Password',
              type: 'password',
              required: true,
              defaultValue: settings?.email?.smtpPassword || '',
              errorMessages: { required: 'SMTP password is required' },
            },
            {
              name: 'fromEmail',
              label: 'From Email',
              type: 'email',
              required: true,
              defaultValue: settings?.email?.fromEmail || '',
              errorMessages: {
                required: 'From email is required',
                email: 'Invalid email format',
              },
            },
            {
              name: 'fromName',
              label: 'From Name',
              type: 'text',
              required: true,
              defaultValue: settings?.email?.fromName || '',
              errorMessages: { required: 'From name is required' },
            },
            {
              name: 'enableSSL',
              label: 'Enable SSL',
              type: 'checkbox',
              defaultValue: settings?.email?.smtpSecure || true,
            },
          ],
        },
      ],
      showSaveButton: true,
      showCancelButton: true,
      saveLabel: 'Save Settings',
      cancelLabel: 'Cancel',
      initialData: settings ? convertSettingsToFormData(settings) : {},
    };
    return config;
  });

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading.set(true);
    this.settingsService.getSettings().subscribe({
      next: (data) => {
        this.settings.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading settings:', error);
        this.errorMessage.set('Failed to load settings');
        this.isLoading.set(false);
      },
    });
  }

  onSave(allFormData: Record<string, unknown>): void {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    // Save each tab's data
    const savePromises: Promise<Settings>[] = [];

    const generalData = allFormData['General'];
    if (isGeneralSettings(generalData)) {
      savePromises.push(
        this.settingsService
          .updateGeneralSettings(generalData)
          .toPromise()
          .then((result) => {
            if (result) return result;
            const emptySettings: Settings = {};
            return emptySettings;
          })
      );
    }

    const securityData = allFormData['Security'];
    if (isSecuritySettings(securityData)) {
      savePromises.push(
        this.settingsService
          .updateSecuritySettings(securityData)
          .toPromise()
          .then((result) => {
            if (result) return result;
            const emptySettings: Settings = {};
            return emptySettings;
          })
      );
    }

    const emailData = allFormData['Email'];
    if (isEmailSettings(emailData)) {
      savePromises.push(
        this.settingsService
          .updateEmailSettings(emailData)
          .toPromise()
          .then((result) => {
            if (result) return result;
            const emptySettings: Settings = {};
            return emptySettings;
          })
      );
    }
  }
}
