import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import type {
  CreateRoleDto,
  Permission,
  Role,
  RoleWithNew,
  UpdateRoleDto,
} from '@workix/shared/frontend/core';
import {
  ConfirmDialogConfig,
  DataTableAction,
  DataTableColumn,
  DataTableConfig,
  DataTableRow,
  FormDialogConfig,
  FormDialogField,
  WorkixButtonComponent,
  WorkixConfirmDialogComponent,
  WorkixDataTableComponent,
  WorkixFormDialogComponent,
} from '@workix/shared/frontend/ui';

import { RoleService } from '../../services/role.service';

// Type guard for Role
function isRole(value: unknown): value is Role {
  if (!value || typeof value !== 'object' || value === null) return false;
  if (Array.isArray(value)) return false;
  const idDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(value, 'id');
  const nameDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(value, 'name');
  return typeof idDesc?.value === 'string' && typeof nameDesc?.value === 'string';
}

// Helper to safely get property from object
function getProperty(obj: unknown, key: string): unknown {
  if (!obj || typeof obj !== 'object' || obj === null) return undefined;
  if (Array.isArray(obj)) return undefined;
  const desc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(obj, key);
  return desc?.value;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    WorkixDataTableComponent,
    WorkixButtonComponent,
    WorkixFormDialogComponent,
    WorkixConfirmDialogComponent,
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  // Signals
  roles = signal<Role[]>([]);
  isLoading = signal<boolean>(false);
  searchTerm = signal<string>('');
  currentPage = signal<number>(0);
  currentPageSize = signal<number>(10);
  totalRoles = signal<number>(0);

  // Dialog states
  showEditDialog = signal<boolean>(false);
  showDeleteDialog = signal<boolean>(false);
  selectedRole = signal<RoleWithNew | null>(null);
  allPermissions = signal<Permission[]>([]);
  selectedPermissions = signal<Set<string>>(new Set());
  editDialogLoading = signal<boolean>(false);
  deleteDialogLoading = signal<boolean>(false);

  // Computed: Build data table config
  dataTableConfig = computed<DataTableConfig>(() => {
    const columns: DataTableColumn[] = [
      {
        key: 'id',
        label: 'ID',
        sortable: true,
        format: (value) => String(value).slice(0, 8),
      },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'description', label: 'Description', sortable: false },
      {
        key: 'permissionCount',
        label: 'Permissions',
        sortable: true,
        format: (_value, row) => {
          if (!row || !isRole(row)) return '0';
          return String(row.permissions?.length || 0);
        },
      },
    ];

    const actions: DataTableAction[] = [
      {
        label: 'View',
        icon: 'visibility',
        color: 'primary',
        action: (row) => {
          if (!row || !isRole(row)) return;
          this.viewRole(row.id);
        },
      },
      {
        label: 'Edit',
        icon: 'edit',
        color: 'primary',
        action: (row) => {
          if (!row || !isRole(row)) return;
          this.editRole(row);
        },
      },
      {
        label: 'Delete',
        icon: 'delete',
        color: 'warn',
        action: (row) => {
          if (!row || !isRole(row)) return;
          this.deleteRole(row);
        },
      },
    ];

    return {
      columns,
      actions,
      searchable: true,
      sortable: true,
      pagination: {
        pageSize: this.currentPageSize(),
        pageSizeOptions: [5, 10, 25, 50],
      },
    };
  });

  constructor(private roleService: RoleService, private router: Router) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles(): void {
    this.isLoading.set(true);
    this.roleService.getRoles().subscribe({
      next: (data) => {
        this.roles.set(data || []);
        this.totalRoles.set(data?.length || 0);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.isLoading.set(false);
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    // TODO: Implement server-side search if needed
    this.loadRoles();
  }

  onPageChange(page: number, pageSize: number): void {
    this.currentPage.set(page);
    this.currentPageSize.set(pageSize);
    // TODO: Implement server-side pagination if needed
    this.loadRoles();
  }

  onSortChange(sortKey: string, sortDirection: 'asc' | 'desc'): void {
    // TODO: Implement server-side sorting if needed
    const sorted = [...this.roles()].sort((a, b) => {
      const aVal = getProperty(a, sortKey);
      const bVal = getProperty(b, sortKey);
      if (aVal === undefined || bVal === undefined) return 0;
      const aStr = String(aVal);
      const bStr = String(bVal);
      if (sortDirection === 'asc') {
        return aStr > bStr ? 1 : -1;
      } else {
        return aStr < bStr ? 1 : -1;
      }
    });
    this.roles.set(sorted);
  }

  onActionClick(action: DataTableAction, row: DataTableRow): void {
    action.action(row);
  }

  viewRole(roleId: string): void {
    this.router.navigate(['/roles', roleId]);
  }

  // Computed: Build edit dialog config
  editDialogConfig = computed<FormDialogConfig>(() => {
    const role = this.selectedRole();
    if (!role) {
      return {
        title: 'Edit Role',
        fields: [],
      };
    }

    const fields: FormDialogField[] = [
      { name: 'name', label: 'Name', type: 'text', required: true },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        rows: 3,
        required: true,
      },
    ];

    return {
      title: role.isNew ? 'Create Role' : 'Edit Role',
      fields,
      submitLabel: 'Save',
      cancelLabel: 'Cancel',
      mode: role.isNew ? 'create' : 'edit',
      initialData: {
        name: role.name || '',
        description: role.description || '',
      },
    };
  });

  // Computed: Build delete dialog config
  deleteDialogConfig = computed<ConfirmDialogConfig>(() => {
    const role = this.selectedRole();
    return {
      title: 'Delete Role',
      message: role
        ? `Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`
        : '',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      confirmVariant: 'danger',
      cancelVariant: 'secondary',
    };
  });

  loadPermissions(): void {
    this.roleService.getPermissions().subscribe({
      next: (data) => {
        this.allPermissions.set(data || []);
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
      },
    });
  }

  createRole(): void {
    const now = new Date();
    const newRole: RoleWithNew = {
      id: '',
      name: '',
      description: '',
      isNew: true,
      createdAt: now,
      updatedAt: now,
      level: 0,
      isActive: true,
      isSystem: false,
    };
    this.selectedRole.set(newRole);
    this.selectedPermissions.set(new Set());
    this.showEditDialog.set(true);
  }

  editRole(role: Role): void {
    this.selectedRole.set(role);
    const permissions: Set<string> = new Set<string>(
      (role.permissions || []).map((p: Permission) => String(p.id))
    );
    this.selectedPermissions.set(permissions);
    this.showEditDialog.set(true);
  }

  deleteRole(role: Role): void {
    this.selectedRole.set(role);
    this.showDeleteDialog.set(true);
  }

  onEditDialogSubmit(data: Record<string, unknown>): void {
    const role = this.selectedRole();
    if (!role) return;

    this.editDialogLoading.set(true);

    if (role.isNew) {
      const createData: CreateRoleDto = {
        name: String(data.name || ''),
      };
      if (data.description !== undefined && data.description !== null && data.description !== '') {
        createData.description = String(data.description);
      }
      this.roleService.createRole(createData).subscribe({
        next: (savedRole) => {
          // Assign permissions
          if (this.selectedPermissions().size > 0) {
            this.roleService
              .assignPermissionsToRole(savedRole.id, Array.from(this.selectedPermissions()))
              .subscribe({
                next: () => {
                  this.editDialogLoading.set(false);
                  this.showEditDialog.set(false);
                  this.selectedRole.set(null);
                  this.selectedPermissions.set(new Set());
                  this.loadRoles();
                },
                error: (error) => {
                  console.error('Error assigning permissions:', error);
                  this.editDialogLoading.set(false);
                },
              });
          } else {
            this.editDialogLoading.set(false);
            this.showEditDialog.set(false);
            this.selectedRole.set(null);
            this.selectedPermissions.set(new Set());
            this.loadRoles();
          }
        },
        error: (error) => {
          console.error('Error saving role:', error);
          this.editDialogLoading.set(false);
        },
      });
      return;
    }

    const updateData: UpdateRoleDto = {};
    if (data.name !== undefined && data.name !== null && data.name !== '') {
      updateData.name = String(data.name);
    }
    if (data.description !== undefined && data.description !== null && data.description !== '') {
      updateData.description = String(data.description);
    }
    this.roleService.updateRole(role.id, updateData).subscribe({
      next: (savedRole) => {
        // Assign permissions
        if (this.selectedPermissions().size > 0) {
          this.roleService
            .assignPermissionsToRole(savedRole.id, Array.from(this.selectedPermissions()))
            .subscribe({
              next: () => {
                this.editDialogLoading.set(false);
                this.showEditDialog.set(false);
                this.selectedRole.set(null);
                this.selectedPermissions.set(new Set());
                this.loadRoles();
              },
              error: (error) => {
                console.error('Error assigning permissions:', error);
                this.editDialogLoading.set(false);
              },
            });
        } else {
          this.editDialogLoading.set(false);
          this.showEditDialog.set(false);
          this.selectedRole.set(null);
          this.selectedPermissions.set(new Set());
          this.loadRoles();
        }
      },
      error: (error) => {
        console.error('Error saving role:', error);
        this.editDialogLoading.set(false);
      },
    });
  }

  onEditDialogCancel(): void {
    this.showEditDialog.set(false);
    this.selectedRole.set(null);
    this.selectedPermissions.set(new Set());
  }

  onDeleteDialogConfirm(): void {
    const role = this.selectedRole();
    if (!role) return;

    this.deleteDialogLoading.set(true);
    this.roleService.deleteRole(role.id).subscribe({
      next: () => {
        this.deleteDialogLoading.set(false);
        this.showDeleteDialog.set(false);
        this.selectedRole.set(null);
        this.loadRoles();
      },
      error: (error) => {
        console.error('Error deleting role:', error);
        this.deleteDialogLoading.set(false);
      },
    });
  }

  onDeleteDialogCancel(): void {
    this.showDeleteDialog.set(false);
    this.selectedRole.set(null);
  }
}
