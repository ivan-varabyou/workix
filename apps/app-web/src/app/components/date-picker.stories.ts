import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  template: '<div class="date-picker">{{ content() }}</div>',
  styles: ['.date-picker { padding: 8px; }'],
})
export class ComponentWithStories {
  content = input<string>('date-picker');
}

type Story = StoryObj<ComponentWithStories>;
const meta: Meta<ComponentWithStories> = {
  title: 'Components/Date Picker',
  component: ComponentWithStories,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { content: 'date-picker demo' } };
