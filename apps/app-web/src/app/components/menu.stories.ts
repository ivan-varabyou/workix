import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-menu',
  standalone: true,
  template: '<div class="menu">{{ content() }}</div>',
  styles: ['.menu { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('menu');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Menu',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'menu demo' } };
