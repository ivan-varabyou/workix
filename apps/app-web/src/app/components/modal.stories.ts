import { Component, input, output, signal } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ title() }}</h2>
          <button (click)="close()">×</button>
        </div>
        <div class="modal-body">{{ message() }}</div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="close()">Cancel</button>
          <button class="btn-primary" (click)="confirm()">Confirm</button>
        </div>
      </div>
    </div>
    }
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .modal-content {
        background: white;
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;
      }
      .modal-header h2 {
        margin: 0;
      }
      .modal-body {
        padding: 16px;
      }
      .modal-footer {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        padding: 16px;
      }
      button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .btn-primary {
        background: #007bff;
        color: white;
      }
      .btn-secondary {
        background: #6c757d;
        color: white;
      }
    `,
  ],
})
export class ModalComponent {
  title = input<string>('Modal');
  message = input<string>('Are you sure?');
  isOpen = signal(true);
  onConfirm = output<void>();

  close(): void {
    this.isOpen.set(false);
  }
  confirm(): void {
    this.onConfirm.emit();
    this.close();
  }
}

type Story = StoryObj<ModalComponent>;
const meta: Meta<ModalComponent> = {
  title: 'Components/Modal',
  component: ModalComponent,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = {
  args: { title: 'Confirm Action', message: 'Do you want to proceed?' },
};
export const Warning: Story = {
  args: { title: 'Warning', message: 'This action cannot be undone' },
};
