import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-notification',
  standalone: true,
  template: '<div class="notification">{{ content() }}</div>',
  styles: ['.notification { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('notification');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Notification',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'notification demo' } };
