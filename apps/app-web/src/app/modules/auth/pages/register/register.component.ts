import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthFormConfig, AuthFormField, WorkixAuthFormComponent } from '@workix/shared/frontend/ui';

import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, WorkixAuthFormComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Computed: Build auth form config
  authFormConfig = computed<AuthFormConfig>(() => ({
    title: 'Create Account',
    subtitle: 'Join Workix today',
    fields: [
      {
        name: 'firstName',
        label: 'First Name',
        type: 'text' as const,
        placeholder: 'Enter your first name',
        required: true,
        validators: [] as never[],
        errorMessages: {
          required: 'First name is required',
        },
      },
      {
        name: 'lastName',
        label: 'Last Name',
        type: 'text' as const,
        placeholder: 'Enter your last name',
        required: true,
        validators: [] as never[],
        errorMessages: {
          required: 'Last name is required',
        },
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email' as const,
        placeholder: 'Enter your email',
        required: true,
        validators: [] as never[],
        errorMessages: {
          required: 'Email is required',
          email: 'Please enter a valid email',
        },
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password' as const,
        placeholder: 'Enter your password',
        required: true,
        validators: [] as never[],
        errorMessages: {
          required: 'Password is required',
          minlength: 'Password must be at least 8 characters',
        },
      },
      {
        name: 'confirmPassword',
        label: 'Confirm Password',
        type: 'password' as const,
        placeholder: 'Confirm your password',
        required: true,
        validators: [] as never[],
        errorMessages: {
          required: 'Please confirm your password',
        },
      },
    ] as AuthFormField[],
    submitLabel: 'Create Account',
    showSocialLogin: true,
    socialLoginLabel: 'Sign up with Google',
    showLoginLink: true,
    loginLinkLabel: 'Already have an account? Sign in',
    loginLinkRoute: '/auth/login',
  }));

  onSubmit(formData: Record<string, any>): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password, firstName, lastName } = formData;

    this.authService.register(email, password, firstName, lastName).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Registration failed');
      },
    });
  }

  onSocialLogin(provider: string): void {
    // TODO: Implement social login
    console.log('Social login:', provider);
  }
}
