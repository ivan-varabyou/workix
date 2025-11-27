import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-toggle',
  standalone: true,
  template: '<div class="toggle">{{ content() }}</div>',
  styles: ['.toggle { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('toggle');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Toggle',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'toggle demo' } };
