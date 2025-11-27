import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-stepper',
  standalone: true,
  template: '<div class="stepper">{{ content() }}</div>',
  styles: ['.stepper { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('stepper');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Stepper',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'stepper demo' } };
