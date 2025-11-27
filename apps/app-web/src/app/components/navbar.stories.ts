import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: '<div class="navbar">{{ content() }}</div>',
  styles: ['.navbar { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('navbar');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Navbar',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'navbar demo' } };
