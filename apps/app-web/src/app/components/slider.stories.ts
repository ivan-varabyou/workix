import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-slider',
  standalone: true,
  template: '<div class="slider">{{ content() }}</div>',
  styles: ['.slider { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('slider');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Slider',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'slider demo' } };
