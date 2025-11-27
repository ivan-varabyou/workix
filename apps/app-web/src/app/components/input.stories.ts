import { Component, input, output } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-input',
  standalone: true,
  template: `
    <div class="input-group">
      @if (label()) {
      <label>{{ label() }}</label>
      }
      <input
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [readonly]="readonly()"
        [value]="value()"
        (input)="onChange($event)"
      />
      @if (error()) {
      <span class="error">{{ error() }}</span>
      } @if (hint()) {
      <span class="hint">{{ hint() }}</span>
      }
    </div>
  `,
  styles: [
    `
      .input-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      label {
        font-weight: 600;
        font-size: 14px;
      }
      input {
        padding: 8px 12px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
        transition: all 0.2s;
      }
      input:focus {
        border-color: #007bff;
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
      }
      input:disabled {
        background: #f5f5f5;
        cursor: not-allowed;
      }
      .error {
        color: #dc3545;
        font-size: 12px;
      }
      .hint {
        color: #6c757d;
        font-size: 12px;
      }
    `,
  ],
})
export class InputComponent {
  label = input<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  error = input<string>('');
  hint = input<string>('');
  value = input<string>('');
  onChangeValue = output<string>();

  onChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.onChangeValue.emit(value);
  }
}

type Story = StoryObj<InputComponent>;
const meta: Meta<InputComponent> = {
  title: 'Components/Input',
  component: InputComponent,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = {
  args: { label: 'Email', placeholder: 'Enter email', type: 'email' },
};
export const Password: Story = {
  args: { label: 'Password', type: 'password', placeholder: 'Enter password' },
};
export const WithHint: Story = {
  args: { label: 'Username', hint: 'Min 3 characters' },
};
export const WithError: Story = {
  args: { label: 'Email', error: 'Invalid email format', value: 'invalid' },
};
export const Disabled: Story = {
  args: { label: 'Name', disabled: true, value: 'John Doe' },
};
