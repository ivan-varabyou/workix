import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { Permission, Role } from '@workix/shared/frontend/core';
import {
  DetailViewAction,
  DetailViewConfig,
  DetailViewField,
  WorkixCardComponent,
  WorkixDetailViewComponent,
  WorkixIconComponent,
  WorkixListComponent,
  WorkixListItemComponent,
} from '@workix/shared/frontend/ui';

import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [
    CommonModule,
    WorkixDetailViewComponent,
    WorkixCardComponent,
    WorkixListComponent,
    WorkixListItemComponent,
    WorkixIconComponent,
  ],
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.scss'],
})
export class RoleDetailComponent implements OnInit {
  // Signals
  role = signal<Role | null>(null);
  permissions = signal<Permission[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // Computed: Build detail config
  detailConfig = computed<DetailViewConfig>(() => {
    const role = this.role();
    if (!role) {
      return {
        title: 'Role Details',
        fields: [],
        showBackButton: true,
      };
    }

    const fields: DetailViewField[] = [
      { label: 'Role ID', value: role.id, format: 'text' },
      {
        label: 'Description',
        value: role.description || 'N/A',
        format: 'text',
        fullWidth: true,
      },
      {
        label: 'Permissions',
        value: this.permissions().length,
        format: 'custom',
        customFormatter: () => `${this.permissions().length} permissions`,
      },
    ];

    const actions: DetailViewAction[] = [
      {
        label: 'Edit',
        icon: 'edit',
        variant: 'primary',
        onClick: () => this.editRole(),
      },
      {
        label: 'Delete',
        icon: 'delete',
        variant: 'danger',
        onClick: () => this.deleteRole(),
      },
    ];

    return {
      title: role.name,
      fields,
      actions,
      showBackButton: true,
      backRoute: '/roles',
    };
  });

  constructor(
    private roleService: RoleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.loadRole(params['id']);
      }
    });
  }

  loadRole(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.roleService.getRoleById(id).subscribe({
      next: (data) => {
        this.role.set(data);
        this.loadPermissions(id);
      },
      error: (error) => {
        console.error('Error loading role:', error);
        this.errorMessage.set('Failed to load role');
        this.isLoading.set(false);
        this.router.navigate(['/roles']);
      },
    });
  }

  loadPermissions(roleId: string): void {
    this.roleService.getRolePermissions(roleId).subscribe({
      next: (data) => {
        this.permissions.set(data || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.isLoading.set(false);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/roles']);
  }

  onActionClick(_event: { action: string; data?: Record<string, unknown> }): void {
    // Actions are handled directly in the config
  }

  editRole(): void {
    const role = this.role();
    if (role) {
      // TODO: Use WorkixFormDialogComponent instead of MatDialog
      console.log('Edit role:', role);
    }
  }

  deleteRole(): void {
    const role = this.role();
    if (!role) return;
    // TODO: Implement delete role functionality
    console.log('Delete role:', role);
  }
}
