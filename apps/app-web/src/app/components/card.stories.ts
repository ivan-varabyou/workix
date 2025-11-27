import { Component, input } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="card" [class.card-elevated]="elevated()">
      @if (image()) {
      <img [src]="image()" [alt]="title()" />
      }
      <div class="card-body">
        @if (title()) {
        <h3>{{ title() }}</h3>
        } @if (description()) {
        <p>{{ description() }}</p>
        }
        <ng-content></ng-content>
      </div>
      @if (footer()) {
      <div class="card-footer">{{ footer() }}</div>
      }
    </div>
  `,
  styles: [
    `
      .card {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        background: white;
        transition: all 0.2s;
      }
      .card-elevated {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      img {
        width: 100%;
        height: 200px;
        object-fit: cover;
      }
      .card-body {
        padding: 16px;
      }
      h3 {
        margin: 0 0 8px;
        font-size: 18px;
      }
      p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
      .card-footer {
        padding: 12px 16px;
        background: #f9f9f9;
        border-top: 1px solid #e0e0e0;
      }
    `,
  ],
})
export class CardComponent {
  title = input<string>('');
  description = input<string>('');
  image = input<string>('');
  footer = input<string>('');
  elevated = input<boolean>(false);
}

type Story = StoryObj<CardComponent>;
const meta: Meta<CardComponent> = {
  title: 'Components/Card',
  component: CardComponent,
  tags: ['autodocs'],
};
export default meta;

export const Basic: Story = {
  args: { title: 'Card Title', description: 'This is a basic card component' },
};
export const WithImage: Story = {
  args: {
    title: 'Featured',
    image: 'https://via.placeholder.com/300x200',
    description: 'Card with image',
  },
};
export const Elevated: Story = {
  args: { title: 'Elevated Card', elevated: true, description: 'With shadow' },
};
export const WithFooter: Story = {
  args: {
    title: 'Card',
    footer: 'Footer content',
    description: 'Description here',
  },
};
