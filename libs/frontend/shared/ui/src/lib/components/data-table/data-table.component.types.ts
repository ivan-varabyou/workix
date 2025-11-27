/**
 * Types for DataTableComponent
 */

export interface DataTableRow {
  [key: string]: string | number | boolean | Date | null | undefined;
}

export type DataTableCellValue = string | number | boolean | Date | null | undefined;

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  format?: (value: DataTableCellValue, row?: DataTableRow) => string;
}

export interface DataTableAction {
  label: string;
  icon: string;
  color?: 'primary' | 'accent' | 'warn';
  action: (row: DataTableRow) => void;
}

export interface DataTableConfig {
  title?: string;
  columns: DataTableColumn[];
  actions?: DataTableAction[];
  pageSize?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
}
