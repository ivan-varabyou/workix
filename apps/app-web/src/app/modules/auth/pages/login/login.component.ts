import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthFormConfig, AuthFormField, WorkixAuthFormComponent } from '@workix/shared/frontend/ui';

import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, WorkixAuthFormComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  // Signals
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Computed: Build auth form config
  authFormConfig = computed<AuthFormConfig>(() => ({
    title: 'Sign In',
    subtitle: 'Welcome back to Workix',
    fields: [
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
    ] as AuthFormField[],
    submitLabel: 'Sign In',
    showRememberMe: true,
    showForgotPassword: true,
    forgotPasswordLink: '/auth/forgot-password',
    showSocialLogin: true,
    socialLoginLabel: 'Sign in with Google',
    showSignupLink: true,
    signupLinkLabel: "Don't have an account? Sign up",
    signupLinkRoute: '/auth/register',
  }));

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(formData: Record<string, any>): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = formData;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Login failed. Please try again.');
      },
    });
  }

  onSocialLogin(provider: string): void {
    // TODO: Implement social login
    console.log('Social login:', provider);
  }
}
