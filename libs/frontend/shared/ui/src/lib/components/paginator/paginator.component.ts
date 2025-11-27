import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

export interface PageEvent {
  pageIndex: number;
  pageSize: number;
  length: number;
}

/**
 * Workix Paginator Component
 *
 * Abstracted wrapper around PrimeNG Paginator component.
 * Supports PrimeNG provider.
 *
 * Usage:
 * ```html
 * <workix-paginator
 *   [length]="100"
 *   [pageSize]="10"
 *   [pageIndex]="0"
 *   [pageSizeOptions]="[5, 10, 20]"
 *   (page)="onPageChange($event)"
 * />
 * ```
 */
@Component({
  selector: 'workix-paginator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
})
export class WorkixPaginatorComponent {
  // Required inputs
  length = input<number>(0);
  pageSize = input<number>(10);
  pageIndex = input<number>(0);

  // Optional inputs
  pageSizeOptions = input<number[]>([5, 10, 20, 50]);
  showFirstLastButtons = input<boolean>(true);
  class = input<string>('');

  // Outputs
  page = output<PageEvent>();

  // Computed
  paginatorClass = computed(() => {
    const baseClass = 'workix-paginator';
    const customClass = this.class();
    return [baseClass, customClass].filter(Boolean).join(' ');
  });

  pageInfo = computed(() => {
    const start = this.pageIndex() * this.pageSize() + 1;
    const end = Math.min((this.pageIndex() + 1) * this.pageSize(), this.length());
    return `${start}-${end} of ${this.length()}`;
  });

  totalPages = computed(() => Math.ceil(this.length() / this.pageSize()));

  isFirstPage = computed(() => this.pageIndex() === 0);
  isLastPage = computed(() => this.pageIndex() >= this.totalPages() - 1);

  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    const pageEvent: PageEvent = {
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      length: this.length(),
    };
    this.page.emit(pageEvent);
  }

  firstPage(): void {
    if (!this.isFirstPage()) {
      this.page.emit({
        pageIndex: 0,
        pageSize: this.pageSize(),
        length: this.length(),
      });
    }
  }

  previousPage(): void {}
}
