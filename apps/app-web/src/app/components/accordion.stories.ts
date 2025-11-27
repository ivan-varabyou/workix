import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-accordion',
  standalone: true,
  template: '<div class="accordion">{{ content() }}</div>',
  styles: ['.accordion { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('accordion');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Accordion',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'accordion demo' } };
