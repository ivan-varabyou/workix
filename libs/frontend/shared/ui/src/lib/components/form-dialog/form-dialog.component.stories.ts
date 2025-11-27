import type { Meta, StoryObj } from '@storybook/angular';

import { WorkixFormDialogComponent } from './form-dialog.component';
import { FormDialogConfig } from './form-dialog.component.types';

const meta: Meta<WorkixFormDialogComponent> = {
  title: 'Components/FormDialog',
  component: WorkixFormDialogComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<WorkixFormDialogComponent>;

const userEditConfig: FormDialogConfig = {
  title: 'Edit User',
  subtitle: 'Update user information',
  fields: [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      errorMessages: { required: 'First name is required' },
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      errorMessages: { required: 'Last name is required' },
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      errorMessages: { required: 'Email is required', email: 'Please enter a valid email' },
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'User', value: 'user' },
      ],
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'tel',
    },
    {
      name: 'bio',
      label: 'Bio',
      type: 'textarea',
      rows: 4,
    },
  ],
  submitLabel: 'Save',
  cancelLabel: 'Cancel',
  mode: 'edit',
  initialData: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'admin',
  },
};

export const Default: Story = {
  args: {
    visible: true,
    config: userEditConfig,
    isLoading: false,
  },
};

export const CreateMode: Story = {
  args: {
    visible: true,
    config: {
      ...userEditConfig,
      title: 'Create User',
      mode: 'create',
      initialData: undefined,
    },
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    visible: true,
    config: userEditConfig,
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    visible: true,
    config: userEditConfig,
    isLoading: false,
    errorMessage: 'Failed to save user',
  },
};
