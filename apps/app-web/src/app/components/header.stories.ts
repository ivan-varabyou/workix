import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-header',
  standalone: true,
  template: '<div class="header">{{ content() }}</div>',
  styles: ['.header { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('header');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Header',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'header demo' } };
