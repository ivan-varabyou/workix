import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { WorkixModalComponent } from './modal.component';

const meta: Meta<WorkixModalComponent> = {
  title: 'Shared/UI/Modal',
  component: WorkixModalComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, DialogModule, ButtonModule],
    }),
  ],
  argTypes: {
    visible: {
      control: 'boolean',
      description: 'Show/hide modal',
    },
    title: {
      control: 'text',
      description: 'Modal title',
    },
    message: {
      control: 'text',
      description: 'Modal message',
    },
    closable: {
      control: 'boolean',
      description: 'Show close button',
    },
    showFooter: {
      control: 'boolean',
      description: 'Show footer with buttons',
    },
    position: {
      control: 'select',
      options: [
        'center',
        'top',
        'bottom',
        'left',
        'right',
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
      ],
      description: 'Modal position',
    },
    onConfirm: {
      action: 'confirmed',
      description: 'Confirm event',
    },
    onCancelEvent: {
      action: 'cancelled',
      description: 'Cancel event',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixModalComponent>;

export const Basic: Story = {
  args: {
    visible: true,
    title: 'Basic Modal',
    message: 'This is a basic modal dialog.',
    closable: true,
    showFooter: true,
  },
  render: (args) => {
    const visible = signal(args.visible);
    return {
      props: { ...args, visible },
      template: `
        <workix-modal
          [visible]="visible()"
          [title]="title"
          [message]="message"
          [closable]="closable"
          [showFooter]="showFooter"
          (visibleChange)="visible.set($event)"
          (onConfirm)="onConfirm()"
          (onCancelEvent)="onCancelEvent()"
        >
          <p>{{ message }}</p>
        </workix-modal>
        <button (click)="visible.set(true)">Open Modal</button>
      `,
    };
  },
};

export const Confirmation: Story = {
  args: {
    visible: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    closable: true,
    showFooter: true,
    cancelLabel: 'Cancel',
    confirmLabel: 'Confirm',
  },
  render: (args) => {
    const visible = signal(args.visible);
    return {
      props: { ...args, visible },
      template: `
        <workix-modal
          [visible]="visible()"
          [title]="title"
          [message]="message"
          [closable]="closable"
          [showFooter]="showFooter"
          [cancelLabel]="cancelLabel"
          [confirmLabel]="confirmLabel"
          (visibleChange)="visible.set($event)"
          (onConfirm)="onConfirm()"
          (onCancelEvent)="onCancelEvent()"
        >
          <p>{{ message }}</p>
        </workix-modal>
        <button (click)="visible.set(true)">Open Confirmation</button>
      `,
    };
  },
};

export const WithoutFooter: Story = {
  args: {
    visible: true,
    title: 'Modal without Footer',
    message: 'This modal has no footer buttons.',
    closable: true,
    showFooter: false,
  },
  render: (args) => {
    const visible = signal(args.visible);
    return {
      props: { ...args, visible },
      template: `
        <workix-modal
          [visible]="visible()"
          [title]="title"
          [message]="message"
          [closable]="closable"
          [showFooter]="showFooter"
          (visibleChange)="visible.set($event)"
        >
          <p>{{ message }}</p>
        </workix-modal>
        <button (click)="visible.set(true)">Open Modal</button>
      `,
    };
  },
};

export const LargeContent: Story = {
  args: {
    visible: true,
    title: 'Modal with Large Content',
    closable: true,
    showFooter: true,
    width: '80vw',
    height: '80vh',
  },
  render: (args) => {
    const visible = signal(args.visible);
    return {
      props: { ...args, visible },
      template: `
        <workix-modal
          [visible]="visible()"
          [title]="title"
          [closable]="closable"
          [showFooter]="showFooter"
          [width]="width"
          [height]="height"
          (visibleChange)="visible.set($event)"
        >
          <h3>Section 1</h3>
          <p>This is a modal with large content. It can contain multiple sections and elements.</p>
          <h3>Section 2</h3>
          <p>More content here...</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </workix-modal>
        <button (click)="visible.set(true)">Open Large Modal</button>
      `,
    };
  },
};
