import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  template: '<div class="sidebar">{{ content() }}</div>',
  styles: ['.sidebar { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('sidebar');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Sidebar',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'sidebar demo' } };
