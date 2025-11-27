import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  SettingsField,
  SettingsPageConfig,
  SettingsTab,
  WorkixButtonComponent,
  WorkixCardComponent,
  WorkixIconComponent,
  WorkixSettingsPageComponent,
  WorkixSpinnerComponent,
} from '@workix/shared/frontend/ui';

import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WorkixCardComponent,
    WorkixButtonComponent,
    WorkixIconComponent,
    WorkixSpinnerComponent,
    WorkixSettingsPageComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // Signals
  isLoading = signal(false);
  isSaving = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Computed: Build settings config
  settingsConfig = computed<SettingsPageConfig>(() => {
    const personalFields: SettingsField[] = [
      { name: 'firstName', label: 'First Name', type: 'text', required: true },
      { name: 'lastName', label: 'Last Name', type: 'text', required: true },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        disabled: true,
      },
      { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'bio', label: 'Bio', type: 'textarea', rows: 4 },
    ];

    const securityFields: SettingsField[] = [
      {
        name: 'currentPassword',
        label: 'Current Password',
        type: 'password',
        required: true,
      },
      {
        name: 'newPassword',
        label: 'New Password',
        type: 'password',
        required: true,
      },
      {
        name: 'confirmPassword',
        label: 'Confirm Password',
        type: 'password',
        required: true,
      },
    ];

    const tabs: SettingsTab[] = [
      {
        id: 'personal',
        label: 'Personal Information',
        icon: 'person',
        fields: personalFields,
      },
      {
        id: 'security',
        label: 'Security',
        icon: 'lock',
        fields: securityFields,
      },
    ];

    return {
      title: 'Profile Settings',
      tabs,
    };
  });

  // Forms (kept for backward compatibility, but will use settingsConfig)
  personalForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: [{ value: '', disabled: true }],
    phone: [''],
    bio: [''],
  });

  securityForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    const user = this.authService.getCurrentUser();

    if (user) {
      this.personalForm.patchValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
    }

    this.isLoading.set(false);
  }

  savePersonal(): void {
    if (this.personalForm.invalid) return;

    this.isSaving.set(true);
    // API call would go here
    setTimeout(() => {
      this.isSaving.set(false);
      this.successMessage.set('Profile updated successfully');
      setTimeout(() => this.successMessage.set(null), 3000);
    }, 500);
  }

  savePassword(): void {
    if (this.securityForm.invalid) return;

    this.isSaving.set(true);
    // API call would go here
  }
}
