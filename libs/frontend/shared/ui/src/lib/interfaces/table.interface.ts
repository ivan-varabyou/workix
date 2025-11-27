// Table component interfaces

export interface TableRow {
  [key: string]: unknown;
}

export interface TableRowSelectEvent {
  data: TableRow;
  type: 'row' | 'checkbox';
  index: number;
}

export interface TableSelectionChangeEvent {
  selection: TableRow[];
}

export interface TableSortEvent {
  field: string;
  order: 1 | -1 | null;
}

export interface TableLazyLoadEvent {
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: 1 | -1 | null;
  filters?: Record<string, unknown>;
}
