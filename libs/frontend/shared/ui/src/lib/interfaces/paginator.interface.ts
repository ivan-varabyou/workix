// Paginator component interfaces

export interface PageEvent {
  pageIndex: number;
  pageSize: number;
  length: number;
}

export interface PaginatorChangeEvent {
  pageIndex: number;
  pageSize: number;
}
