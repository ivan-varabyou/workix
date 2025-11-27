import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: '<div class="skeleton">{{ label() }}</div>',
  styles: ['.skeleton { padding: 12px; border-radius: 4px; }'],
})
export class SKELETONComponent {
  label = input<string>('skeleton Component');
}

type Story = StoryObj<SKELETONComponent>;
const meta: Meta<SKELETONComponent> = {
  title: 'Components/SKELETON',
  component: SKELETONComponent,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { label: 'skeleton Example' } };
