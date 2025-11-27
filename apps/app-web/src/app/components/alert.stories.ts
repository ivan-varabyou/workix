import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-alert',
  standalone: true,
  template: '<div class="alert">{{ label() }}</div>',
  styles: ['.alert { padding: 12px; border-radius: 4px; }'],
})
export class ALERTComponent {
  label = input<string>('alert Component');
}

type Story = StoryObj<ALERTComponent>;
const meta: Meta<ALERTComponent> = {
  title: 'Components/ALERT',
  component: ALERTComponent,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { label: 'alert Example' } };
