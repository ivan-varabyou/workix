import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `<div class="spinner spinner-{{ size() }}"></div>`,
  styles: [
    `
      .spinner {
        display: inline-block;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      .spinner-sm {
        width: 20px;
        height: 20px;
      }
      .spinner-md {
        width: 40px;
        height: 40px;
      }
      .spinner-lg {
        width: 60px;
        height: 60px;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class SpinnerComponent {
  size = input<string>('md');
}

type Story = StoryObj<SpinnerComponent>;
const meta: Meta<SpinnerComponent> = {
  title: 'Components/Spinner',
  component: SpinnerComponent,
  tags: ['autodocs'],
};
export default meta;

export const Small: Story = { args: { size: 'sm' } };
export const Medium: Story = { args: { size: 'md' } };
export const Large: Story = { args: { size: 'lg' } };
