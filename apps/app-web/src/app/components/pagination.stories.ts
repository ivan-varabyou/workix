import { Component, computed, input, output } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <nav class="pagination">
      <button [disabled]="currentPage() === 1" (click)="onPrevious()">← Previous</button>
      @for (page of pages(); track page) {
      <button [class.active]="page === currentPage()" (click)="onPageChange(page)">
        {{ page }}
      </button>
      }
      <button [disabled]="currentPage() === totalPages()" (click)="onNext()">Next →</button>
    </nav>
  `,
  styles: [
    `
      .pagination {
        display: flex;
        gap: 4px;
      }
      button {
        padding: 8px 12px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
      }
      button:hover:not(:disabled) {
        background: #f0f0f0;
      }
      button.active {
        background: #007bff;
        color: white;
        border-color: #007bff;
      }
      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class PaginationComponent {
  currentPage = input<number>(1);
  totalPages = input<number>(10);
  onChange = output<number>();

  pages = computed(() => {
    const start = Math.max(1, this.currentPage() - 2);
    const end = Math.min(this.totalPages(), this.currentPage() + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  onPrevious(): void {
    if (this.currentPage() > 1) this.onChange.emit(this.currentPage() - 1);
  }
  onNext(): void {
    if (this.currentPage() < this.totalPages()) this.onChange.emit(this.currentPage() + 1);
  }
  onPageChange(page: number) {
    this.onChange.emit(page);
  }
}

type Story = StoryObj<PaginationComponent>;
const meta: Meta<PaginationComponent> = {
  title: 'Components/Pagination',
  component: PaginationComponent,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = { args: { currentPage: 1, totalPages: 10 } };
export const Middle: Story = { args: { currentPage: 5, totalPages: 10 } };
export const Last: Story = { args: { currentPage: 10, totalPages: 10 } };
