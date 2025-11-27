import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-stat',
  standalone: true,
  template: '<div class="stat">{{ label() }}</div>',
  styles: ['.stat { padding: 12px; border-radius: 4px; }'],
})
export class STATComponent {
  label = input<string>('stat Component');
}

type Story = StoryObj<STATComponent>;
const meta: Meta<STATComponent> = {
  title: 'Components/STAT',
  component: STATComponent,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { label: 'stat Example' } };
