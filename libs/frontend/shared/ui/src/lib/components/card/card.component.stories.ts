import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { CardModule } from 'primeng/card';

import { WorkixCardComponent } from './card.component';

const meta: Meta<WorkixCardComponent> = {
  title: 'Shared/UI/Card',
  component: WorkixCardComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, CardModule],
    }),
  ],
  argTypes: {
    title: {
      control: 'text',
      description: 'Card title',
    },
    subtitle: {
      control: 'text',
      description: 'Card subtitle',
    },
    styleClass: {
      control: 'text',
      description: 'Custom CSS class',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixCardComponent>;

export const Basic: Story = {
  args: {
    title: 'Card Title',
    subtitle: 'Card Subtitle',
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-card [title]="title" [subtitle]="subtitle">
        <p>This is the card content. You can put any content here.</p>
      </workix-card>
    `,
  }),
};

export const WithTitleOnly: Story = {
  args: {
    title: 'Card with Title Only',
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-card [title]="title">
        <p>Card content without subtitle.</p>
      </workix-card>
    `,
  }),
};

export const WithoutTitle: Story = {
  render: () => ({
    template: `
      <workix-card>
        <p>Card content without title or subtitle.</p>
      </workix-card>
    `,
  }),
};

export const WithCustomClass: Story = {
  args: {
    title: 'Custom Styled Card',
    styleClass: 'custom-card',
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-card [title]="title" [styleClass]="styleClass">
        <p>This card has a custom CSS class applied.</p>
      </workix-card>
    `,
  }),
};

export const WithRichContent: Story = {
  args: {
    title: 'Rich Content Card',
    subtitle: 'Multiple elements example',
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-card [title]="title" [subtitle]="subtitle">
        <h3>Section Header</h3>
        <p>This card contains multiple elements:</p>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
          <li>List item 3</li>
        </ul>
        <p>And more content here.</p>
      </workix-card>
    `,
  }),
};
