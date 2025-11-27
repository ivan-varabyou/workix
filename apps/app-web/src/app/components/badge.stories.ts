import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span class="badge badge-{{ variant() }} badge-{{ size() }}">{{ text() }}</span>`,
  styles: [
    `
      .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }
      .badge-primary {
        background: #007bff;
        color: white;
      }
      .badge-success {
        background: #28a745;
        color: white;
      }
      .badge-danger {
        background: #dc3545;
        color: white;
      }
      .badge-warning {
        background: #ffc107;
        color: black;
      }
      .badge-info {
        background: #17a2b8;
        color: white;
      }
      .badge-sm {
        padding: 2px 6px;
      }
      .badge-lg {
        padding: 6px 12px;
        font-size: 14px;
      }
    `,
  ],
})
export class BadgeComponent {
  text = input<string>('Badge');
  variant = input<string>('primary');
  size = input<string>('md');
}

type Story = StoryObj<BadgeComponent>;
const meta: Meta<BadgeComponent> = {
  title: 'Components/Badge',
  component: BadgeComponent,
  tags: ['autodocs'],
};
export default meta;

export const Primary: Story = { args: { text: 'Primary', variant: 'primary' } };
export const Success: Story = { args: { text: 'Success', variant: 'success' } };
export const Danger: Story = { args: { text: 'Danger', variant: 'danger' } };
export const Small: Story = { args: { text: 'Small', size: 'sm' } };
export const Large: Story = { args: { text: 'Large', size: 'lg' } };
