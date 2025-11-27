import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast toast-{{ type() }}">
      <div class="toast-content">
        <strong>{{ title() }}</strong>
        <p>{{ message() }}</p>
      </div>
      <button class="toast-close">×</button>
    </div>
  `,
  styles: [
    `
      .toast {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-radius: 4px;
        margin-bottom: 8px;
        color: white;
      }
      .toast-success {
        background: #28a745;
      }
      .toast-error {
        background: #dc3545;
      }
      .toast-warning {
        background: #ffc107;
        color: black;
      }
      .toast-info {
        background: #17a2b8;
      }
      .toast-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 20px;
        cursor: pointer;
      }
    `,
  ],
})
export class ToastComponent {
  title = input<string>('Success');
  message = input<string>('Operation completed');
  type = input<string>('success');
}

type Story = StoryObj<ToastComponent>;
const meta: Meta<ToastComponent> = {
  title: 'Components/Toast',
  component: ToastComponent,
  tags: ['autodocs'],
};
export default meta;

export const Success: Story = {
  args: {
    title: 'Success',
    message: 'Operation completed successfully',
    type: 'success',
  },
};
export const Error: Story = {
  args: { title: 'Error', message: 'Something went wrong', type: 'error' },
};
export const Warning: Story = {
  args: {
    title: 'Warning',
    message: 'Please check your input',
    type: 'warning',
  },
};
export const Info: Story = {
  args: { title: 'Info', message: 'New update available', type: 'info' },
};
