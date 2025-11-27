import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-switch',
  standalone: true,
  template: '<div class="switch">{{ label() }}</div>',
  styles: ['.switch { padding: 12px; border-radius: 4px; }'],
})
export class SWITCHComponent {
  label = input<string>('switch Component');
}

type Story = StoryObj<SWITCHComponent>;
const meta: Meta<SWITCHComponent> = {
  title: 'Components/SWITCH',
  component: SWITCHComponent,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { label: 'switch Example' } };
