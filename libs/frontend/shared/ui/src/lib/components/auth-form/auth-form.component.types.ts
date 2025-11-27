/**
 * Types for AuthForm component
 */

import { ValidatorFn } from '@angular/forms';

export interface AuthFormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'number';
  placeholder?: string;
  required?: boolean;
  validators?: ValidatorFn[];
  errorMessages?: Record<string, string>;
}

export interface AuthFormConfig {
  title: string;
  subtitle?: string;
  fields: AuthFormField[];
  submitLabel: string;
  submitIcon?: string;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  forgotPasswordLink?: string;
  showSocialLogin?: boolean;
  socialLoginLabel?: string;
  socialLoginIcon?: string;
  showSignupLink?: boolean;
  signupLinkLabel?: string;
  signupLinkRoute?: string;
  showLoginLink?: boolean;
  loginLinkLabel?: string;
  loginLinkRoute?: string;
}

export type AuthFormMode = 'login' | 'register' | 'forgot-password' | 'reset-password';
