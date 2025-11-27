import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { User } from '@workix/shared/frontend/core';
import {
  DetailViewAction,
  DetailViewConfig,
  DetailViewField,
  WorkixDetailViewComponent,
} from '@workix/shared/frontend/ui';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, WorkixDetailViewComponent],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit {
  // Signals
  user = signal<User | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Computed: Build detail config
  detailConfig = computed<DetailViewConfig>(() => {
    const user = this.user();
    if (!user) {
      return {
        title: 'User Details',
        fields: [],
        showBackButton: true,
      };
    }

    const fields: DetailViewField[] = [
      { label: 'Email', value: user.email, format: 'text' },
      { label: 'Role', value: user.role, format: 'text' },
      {
        label: 'Status',
        value: user.isActive ? 'Active' : 'Inactive',
        format: 'text',
      },
      { label: 'Phone', value: user.phone || 'N/A', format: 'text' },
      {
        label: 'Bio',
        value: user.bio || 'N/A',
        format: 'text',
        fullWidth: true,
      },
      { label: 'Created At', value: user.createdAt, format: 'date' },
      { label: 'Updated At', value: user.updatedAt, format: 'date' },
    ];

    const actions: DetailViewAction[] = [
      {
        label: 'Edit',
        icon: 'edit',
        variant: 'primary',
        onClick: () => this.editUser(),
      },
      {
        label: 'Delete',
        icon: 'delete',
        variant: 'danger',
        onClick: () => this.deleteUser(),
      },
    ];

    return {
      title: `${user.firstName} ${user.lastName}`,
      fields,
      actions,
      showBackButton: true,
      backRoute: '/users',
    };
  });

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.loadUser(params['id']);
      }
    });
  }

  loadUser(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService.getUserById(id).subscribe({
      next: (data) => {
        this.user.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.errorMessage.set('Failed to load user');
        this.isLoading.set(false);
        this.router.navigate(['/users']);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/users']);
  }

  onActionClick(_event: { action: string; data?: Record<string, unknown> }): void {
    // Actions are handled directly in the config
  }

  editUser(): void {
    const user = this.user();
    if (user) {
      // TODO: Use WorkixFormDialogComponent instead of MatDialog
      // this.router.navigate(['/users', user.id, 'edit']);
      console.log('Edit user:', user);
    }
  }

  deleteUser(): void {
    const user = this.user();
    if (!user) return;
    // TODO: Implement delete user functionality
    console.log('Delete user:', user);
  }
}
