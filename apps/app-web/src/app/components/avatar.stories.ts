import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: '<div class="avatar">{{ label() }}</div>',
  styles: ['.avatar { padding: 12px; border-radius: 4px; }'],
})
export class AVATARComponent {
  label = input<string>('avatar Component');
}

type Story = StoryObj<AVATARComponent>;
const meta: Meta<AVATARComponent> = {
  title: 'Components/AVATAR',
  component: AVATARComponent,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { label: 'avatar Example' } };
