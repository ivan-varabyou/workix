import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  template: '<div class="autocomplete">{{ content() }}</div>',
  styles: ['.autocomplete { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('autocomplete');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Autocomplete',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'autocomplete demo' } };
