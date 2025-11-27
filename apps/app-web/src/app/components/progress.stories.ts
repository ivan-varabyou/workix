import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-progress',
  standalone: true,
  template: `
    <div class="progress">
      <div class="progress-bar" [style.width.%]="value()"></div>
    </div>
    <p class="progress-text">{{ value() }}%</p>
  `,
  styles: [
    `
      .progress {
        height: 8px;
        background: #e9ecef;
        border-radius: 4px;
        overflow: hidden;
      }
      .progress-bar {
        height: 100%;
        background: #007bff;
        transition: width 0.3s;
      }
      .progress-text {
        margin: 8px 0 0;
        font-size: 12px;
      }
    `,
  ],
})
export class ProgressComponent {
  value = input<number>(50);
}

type Story = StoryObj<ProgressComponent>;
const meta: Meta<ProgressComponent> = {
  title: 'Components/Progress',
  component: ProgressComponent,
  tags: ['autodocs'],
};
export default meta;

export const Quarter: Story = { args: { value: 25 } };
export const Half: Story = { args: { value: 50 } };
export const Full: Story = { args: { value: 100 } };
