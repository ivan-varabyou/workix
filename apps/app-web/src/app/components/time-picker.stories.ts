import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  template: '<div class="time-picker">{{ content() }}</div>',
  styles: ['.time-picker { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('time-picker');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Time Picker',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'time-picker demo' } };
