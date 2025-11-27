import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: '<div class="empty-state">{{ label() }}</div>',
  styles: ['.empty-state { padding: 12px; border-radius: 4px; }'],
})
export class EMPTYSTATEComponent {
  label = input<string>('empty-state Component');
}

type Story = StoryObj<EMPTYSTATEComponent>;
const meta: Meta<EMPTYSTATEComponent> = {
  title: 'Components/EMPTYSTATE',
  component: EMPTYSTATEComponent,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { label: 'empty-state Example' } };
