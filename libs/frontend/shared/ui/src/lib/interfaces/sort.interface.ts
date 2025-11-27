// Sort component interfaces

export interface SortEvent {
  active: string;
  direction: 'asc' | 'desc' | '';
}

export interface SortChangeEvent {
  active: string;
  direction: 'asc' | 'desc' | '';
}
