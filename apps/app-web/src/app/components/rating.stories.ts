import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-rating',
  standalone: true,
  template: '<div class="rating">{{ content() }}</div>',
  styles: ['.rating { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('rating');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Rating',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'rating demo' } };
