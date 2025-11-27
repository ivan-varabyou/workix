import type { Meta, StoryObj } from '@storybook/angular';

import { WorkixAuthFormComponent } from './auth-form.component';
import { AuthFormConfig } from './auth-form.component.types';

const meta: Meta<WorkixAuthFormComponent> = {
  title: 'Components/AuthForm',
  component: WorkixAuthFormComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<WorkixAuthFormComponent>;

const loginConfig: AuthFormConfig = {
  title: 'Sign In',
  subtitle: 'Welcome back to Workix',
  fields: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      errorMessages: {
        required: 'Email is required',
        email: 'Please enter a valid email',
      },
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      errorMessages: {
        required: 'Password is required',
        minlength: 'Password must be at least 8 characters',
      },
    },
  ],
  submitLabel: 'Sign In',
  submitIcon: 'login',
  showRememberMe: true,
  showForgotPassword: true,
  forgotPasswordLink: '/auth/forgot-password',
  showSocialLogin: true,
  socialLoginLabel: 'Sign in with Google',
  socialLoginIcon: 'google',
  showSignupLink: true,
  signupLinkRoute: '/auth/register',
};

const registerConfig: AuthFormConfig = {
  title: 'Create Account',
  subtitle: 'Join Workix today',
  fields: [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true },
  ],
  submitLabel: 'Create Account',
  showSocialLogin: true,
  showLoginLink: true,
  loginLinkRoute: '/auth/login',
};

export const Login: Story = {
  args: {
    config: loginConfig,
    mode: 'login',
    isLoading: false,
  },
};

export const Register: Story = {
  args: {
    config: registerConfig,
    mode: 'register',
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    config: loginConfig,
    mode: 'login',
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    config: loginConfig,
    mode: 'login',
    isLoading: false,
    errorMessage: 'Invalid email or password',
  },
};
