import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-badge-list',
  standalone: true,
  template: '<div class="badge-list">{{ content() }}</div>',
  styles: ['.badge-list { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('badge-list');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Badge List',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'badge-list demo' } };
