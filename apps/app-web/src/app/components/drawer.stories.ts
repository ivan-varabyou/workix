import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-drawer',
  standalone: true,
  template: '<div class="drawer">{{ content() }}</div>',
  styles: ['.drawer { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('drawer');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Drawer',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'drawer demo' } };
