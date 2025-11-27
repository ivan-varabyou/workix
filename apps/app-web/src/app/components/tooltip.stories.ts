import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  template: '<div class="tooltip">{{ content() }}</div>',
  styles: ['.tooltip { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('tooltip');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Tooltip',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'tooltip demo' } };
