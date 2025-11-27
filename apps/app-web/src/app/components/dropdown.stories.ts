import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  template: '<div class="dropdown">{{ label() }}</div>',
  styles: ['.dropdown { padding: 12px; border-radius: 4px; }'],
})
export class DROPDOWNComponent {
  label = input<string>('dropdown Component');
}

type Story = StoryObj<DROPDOWNComponent>;
const meta: Meta<DROPDOWNComponent> = {
  title: 'Components/DROPDOWN',
  component: DROPDOWNComponent,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { label: 'dropdown Example' } };
