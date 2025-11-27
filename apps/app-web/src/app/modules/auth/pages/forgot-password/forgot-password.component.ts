import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthFormConfig, WorkixAuthFormComponent } from '@workix/shared/frontend/ui';

import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, WorkixAuthFormComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  // Signals
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Computed: Build auth form config
  authFormConfig = computed<AuthFormConfig>(() => ({
    title: 'Reset Password',
    subtitle: 'Enter your email to receive a password reset link',
    fields: [
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'Enter your email',
        required: true,
        validators: [],
      },
    ],
    submitLabel: 'Send Reset Link',
    showSocialLogin: false,
    showSignupLink: true,
    signupLinkRoute: '/auth/register',
    showRememberMe: false,
    showForgotPassword: false,
  }));

  constructor(private authService: AuthService) {}

  onSubmit(formData: Record<string, any>): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.forgotPassword(formData.email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Password reset link has been sent to your email');
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Failed to send reset link');
      },
    });
  }

  onSocialLogin(_provider: string): void {
    // Not used in forgot password
  }
}
