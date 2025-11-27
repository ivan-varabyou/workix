import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-tag',
  standalone: true,
  template: '<div class="tag">{{ label() }}</div>',
  styles: ['.tag { padding: 12px; border-radius: 4px; }'],
})
export class TAGComponent {
  label = input<string>('tag Component');
}

type Story = StoryObj<TAGComponent>;
const meta: Meta<TAGComponent> = {
  title: 'Components/TAG',
  component: TAGComponent,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { label: 'tag Example' } };
