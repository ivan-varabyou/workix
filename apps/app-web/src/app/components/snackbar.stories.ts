import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  template: '<div class="snackbar">{{ content() }}</div>',
  styles: ['.snackbar { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('snackbar');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Snackbar',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'snackbar demo' } };
