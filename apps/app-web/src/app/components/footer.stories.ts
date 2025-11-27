import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: '<div class="footer">{{ content() }}</div>',
  styles: ['.footer { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('footer');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Footer',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'footer demo' } };
