import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  template: '<div class="breadcrumb">{{ label() }}</div>',
  styles: ['.breadcrumb { padding: 12px; border-radius: 4px; }'],
})
export class BREADCRUMBComponent {
  label = input<string>('breadcrumb Component');
}

type Story = StoryObj<BREADCRUMBComponent>;
const meta: Meta<BREADCRUMBComponent> = {
  title: 'Components/BREADCRUMB',
  component: BREADCRUMBComponent,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { label: 'breadcrumb Example' } };
