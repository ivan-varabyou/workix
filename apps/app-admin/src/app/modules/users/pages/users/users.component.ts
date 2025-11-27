import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { User } from '@workix/shared/frontend/core';
import {
  ConfirmDialogConfig,
  DataTableAction,
  DataTableColumn,
  DataTableConfig,
  FormDialogConfig,
  FormDialogField,
  WorkixButtonComponent,
  WorkixConfirmDialogComponent,
  WorkixDataTableComponent,
  WorkixFormDialogComponent,
} from '@workix/shared/frontend/ui';

import { UserService } from '../../services/user.service';

// Type guard for User
function isUser(value: unknown): value is User {
  if (!value || typeof value !== 'object' || value === null) return false;
  if (Array.isArray(value)) return false;
  const idDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(value, 'id');
  const emailDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(value, 'email');
  return typeof idDesc?.value === 'string' && typeof emailDesc?.value === 'string';
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    WorkixDataTableComponent,
    WorkixButtonComponent,
    WorkixFormDialogComponent,
    WorkixConfirmDialogComponent,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  router = inject(Router);
  // Signals
  users = signal<User[]>([]);
  isLoading = signal<boolean>(false);
  searchTerm = signal<string>('');
  currentPage = signal<number>(0);
  currentPageSize = signal<number>(10);
  totalUsers = signal<number>(0);

  // Dialog states
  showEditDialog = signal<boolean>(false);
  showDeleteDialog = signal<boolean>(false);
  selectedUser = signal<User | null>(null);
  editDialogLoading = signal<boolean>(false);
  deleteDialogLoading = signal<boolean>(false);

  // Computed: Build data table config
  dataTableConfig = computed<DataTableConfig>(() => {
    const columns: DataTableColumn[] = [
      {
        key: 'id',
        label: 'ID',
        sortable: true,
        type: 'text',
        format: (value) => {
          if (!value || typeof value !== 'string') return '';
          return value.slice(0, 8);
        },
      },
      { key: 'email', label: 'Email', sortable: true, type: 'text' },
      { key: 'firstName', label: 'First Name', sortable: true, type: 'text' },
      { key: 'lastName', label: 'Last Name', sortable: true, type: 'text' },
      { key: 'role', label: 'Role', sortable: true, type: 'text' },
      {
        key: 'isActive',
        label: 'Status',
        sortable: true,
        type: 'boolean',
        format: (value) => (value ? 'Active' : 'Inactive'),
      },
      {
        key: 'createdAt',
        label: 'Created At',
        sortable: true,
        type: 'date',
        format: (value) => {
          if (!value) return '';
          try {
            const dateValue =
              typeof value === 'string' ? new Date(value) : value instanceof Date ? value : null;
            return dateValue ? dateValue.toLocaleDateString() : '';
          } catch {
            return '';
          }
        },
      },
    ];

    const actions: DataTableAction[] = [
      {
        label: 'View',
        icon: 'visibility',
        color: 'primary',
        action: (row) => {
          if (!row || !isUser(row)) return;
          this.viewUser(row.id);
        },
      },
      {
        label: 'Edit',
        icon: 'edit',
        color: 'primary',
        action: (row) => {
          if (!row || !isUser(row)) return;
          this.editUser(row);
        },
      },
      {
        label: 'Delete',
        icon: 'delete',
        color: 'warn',
        action: (row) => {
          if (!row || !isUser(row)) return;
          this.deleteUser(row);
        },
      },
    ];

    return {
      title: 'User Management',
      columns,
      actions,
      pageSize: this.currentPageSize(),
      pageSizeOptions: [5, 10, 25, 100],
      showPagination: true,
      showSearch: true,
      searchPlaceholder: 'Search users...',
    };
  });

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    const skip = this.currentPage() * this.currentPageSize();
    const take = this.currentPageSize();

    this.userService.getUsers(skip, take, this.searchTerm()).subscribe({
      next: (response) => {
        this.users.set(response.data || []);
        this.totalUsers.set(response.total || 0);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading.set(false);
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(0);
    this.loadUsers();
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.currentPage.set(event.pageIndex);
    this.currentPageSize.set(event.pageSize);
    this.loadUsers();
  }

  onSortChange(_event: { column: string; direction: 'asc' | 'desc' }): void {
    // Handle sorting if needed
    this.loadUsers();
  }

  onActionClick(_event: { action: string; row: User }): void {
    // Actions are handled directly in the config
  }

  viewUser(userId: string): void {
    this.router.navigate(['/users', userId]);
  }

  // Computed: Build edit dialog config
  editDialogConfig = computed<FormDialogConfig>(() => {
    const user = this.selectedUser();
    if (!user) {
      return {
        title: 'Edit User',
        fields: [],
      };
    }

    const fields: FormDialogField[] = [
      { name: 'firstName', label: 'First Name', type: 'text', required: true },
      { name: 'lastName', label: 'Last Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        required: true,
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
          { label: 'Guest', value: 'guest' },
        ],
      },
      { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'bio', label: 'Bio', type: 'textarea', rows: 4 },
    ];

    return {
      title: 'Edit User',
      fields,
      submitLabel: 'Save',
      cancelLabel: 'Cancel',
      mode: 'edit',
      initialData: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || '',
        phone: user.phone || '',
        bio: user.bio || '',
      },
    };
  });

  // Computed: Build delete dialog config
  deleteDialogConfig = computed<ConfirmDialogConfig>(() => {
    const user = this.selectedUser();
    return {
      title: 'Delete User',
      message: user
        ? `Are you sure you want to delete user "${user.email}"? This action cannot be undone.`
        : '',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      confirmVariant: 'danger',
      cancelVariant: 'secondary',
    };
  });

  editUser(user: User): void {
    this.selectedUser.set(user);
    this.showEditDialog.set(true);
  }

  deleteUser(user: User): void {
    this.selectedUser.set(user);
    this.showDeleteDialog.set(true);
  }

  onEditDialogSubmit(data: Record<string, unknown>): void {
    const user = this.selectedUser();
    if (!user) return;

    this.editDialogLoading.set(true);
    this.userService.updateUser(user.id, data).subscribe({
      next: () => {
        this.editDialogLoading.set(false);
        this.showEditDialog.set(false);
        this.selectedUser.set(null);
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.editDialogLoading.set(false);
      },
    });
  }

  onEditDialogCancel(): void {
    this.showEditDialog.set(false);
    this.selectedUser.set(null);
  }

  onDeleteDialogConfirm(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.deleteDialogLoading.set(true);
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.deleteDialogLoading.set(false);
        this.showDeleteDialog.set(false);
        this.selectedUser.set(null);
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.deleteDialogLoading.set(false);
      },
    });
  }

  onDeleteDialogCancel(): void {
    this.showDeleteDialog.set(false);
    this.selectedUser.set(null);
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive
      ? this.userService.deactivateUser(user.id)
      : this.userService.activateUser(user.id);

    action.subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
      },
    });
  }

  exportUsers(format: 'csv' | 'json'): void {
    this.userService.exportUsers(format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting users:', error);
      },
    });
  }
}
