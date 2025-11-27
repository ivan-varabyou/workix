import { Meta, StoryObj } from '@storybook/angular';
import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  template: `
    <label class="checkbox">
      <input
        type="checkbox"
        [checked]="checked()"
        (change)="onToggle($event)"
        [disabled]="disabled()"
      />
      <span>{{ label() }}</span>
    </label>
  `,
  styles: [
    `
      .checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }
      input {
        cursor: pointer;
        width: 18px;
        height: 18px;
      }
      input:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    `,
  ],
})
export class CheckboxComponent {
  label = input<string>('Checkbox');
  checked = signal(false);
  disabled = input<boolean>(false);
  onChange = output<boolean>();

  onToggle(event: Event) {
    const newValue = (event.target as HTMLInputElement).checked;
    this.checked.set(newValue);
    this.onChange.emit(newValue);
  }
}

type Story = StoryObj<CheckboxComponent>;
const meta: Meta<CheckboxComponent> = {
  title: 'Components/Checkbox',
  component: CheckboxComponent,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { label: 'Accept terms' } };
export const Checked: Story = {
  args: { label: 'Remember me' },
};
export const Disabled: Story = {
  args: { label: 'Disabled checkbox', disabled: true },
};
