import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  template: '<div class="color-picker">{{ content() }}</div>',
  styles: ['.color-picker { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('color-picker');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Color Picker',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'color-picker demo' } };
