import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-divider',
  standalone: true,
  template: '<div class="divider">{{ label() }}</div>',
  styles: ['.divider { padding: 12px; border-radius: 4px; }'],
})
export class DIVIDERComponent {
  label = input<string>('divider Component');
}

type Story = StoryObj<DIVIDERComponent>;
const meta: Meta<DIVIDERComponent> = {
  title: 'Components/DIVIDER',
  component: DIVIDERComponent,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { label: 'divider Example' } };
