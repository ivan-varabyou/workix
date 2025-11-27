import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import type { IntegrationProvider } from '@workix/shared/frontend/core';
import {
  ConfirmDialogConfig,
  DataTableAction,
  DataTableColumn,
  DataTableConfig,
  DataTableRow,
  FormDialogConfig,
  FormDialogField,
  WorkixButtonComponent,
  WorkixCardComponent,
  WorkixConfirmDialogComponent,
  WorkixDataTableComponent,
  WorkixFormDialogComponent,
} from '@workix/shared/frontend/ui';

import { ProviderCredentialsComponent } from '../../components/provider-credentials/provider-credentials.component';
import { IntegrationService } from '../../services/integration.service';

type IntegrationCapability = 'ANALYTICS' | 'UPLOAD' | 'MESSAGING' | 'CONTENT' | 'COMMENTS' | 'LIVE';

function isIntegrationProvider(
  value: DataTableRow | null | undefined
): value is DataTableRow & IntegrationProvider {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const hasId = 'id' in value;
  const hasName = 'name' in value;
  if (!hasId || !hasName) {
    return false;
  }
  const idValue = (value as { id?: string | number | boolean | Date | null | undefined }).id;
  const nameValue = (value as { name?: string | number | boolean | Date | null | undefined }).name;
  return typeof idValue === 'string' && typeof nameValue === 'string';
}

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [
    CommonModule,
    WorkixDataTableComponent,
    WorkixButtonComponent,
    WorkixCardComponent,
    WorkixFormDialogComponent,
    WorkixConfirmDialogComponent,
    ProviderCredentialsComponent,
  ],
  templateUrl: './integrations.component.html',
  styleUrl: './integrations.component.scss',
})
export class IntegrationsComponent implements OnInit {
  providers = signal<IntegrationProvider[]>([]);
  isLoading = signal<boolean>(false);
  searchTerm = signal<string>('');
  currentPage = signal<number>(0);
  currentPageSize = signal<number>(10);
  totalProviders = signal<number>(0);
  selectedProvider = signal<IntegrationProvider | null>(null);
  showCredentials = signal<boolean>(false);

  // Dialog states
  showAddProviderDialog = signal<boolean>(false);
  showDeleteDialog = signal<boolean>(false);
  selectedProviderForDelete = signal<IntegrationProvider | null>(null);
  addProviderDialogLoading = signal<boolean>(false);
  deleteDialogLoading = signal<boolean>(false);

  availableCapabilities: IntegrationCapability[] = [
    'ANALYTICS',
    'UPLOAD',
    'MESSAGING',
    'CONTENT',
    'COMMENTS',
    'LIVE',
  ];
  selectedCapabilities = signal<Set<string>>(new Set());

  // Computed: Build data table config
  dataTableConfig = computed<DataTableConfig>(() => {
    const columns: DataTableColumn[] = [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        format: (_value, row) => {
          const provider = isIntegrationProvider(row) ? row : null;
          return provider?.displayName || provider?.name || String(_value || '');
        },
      },
      { key: 'description', label: 'Description', sortable: false },
      {
        key: 'capabilities',
        label: 'Capabilities',
        sortable: false,
        format: (_value, row) => {
          const provider = isIntegrationProvider(row) ? row : null;
          return (provider?.capabilities || []).join(', ');
        },
      },
      {
        key: 'health',
        label: 'Health',
        sortable: true,
        format: (value) => String(value || 'UNKNOWN'),
      },
    ];

    const actions: DataTableAction[] = [
      {
        label: 'View',
        icon: 'visibility',
        color: 'primary',
        action: (row) => {
          const provider = isIntegrationProvider(row) ? row : null;
          if (provider && provider.id) {
            this.viewProvider(String(provider.id));
          }
        },
      },
      {
        label: 'Edit',
        icon: 'edit',
        color: 'primary',
        action: (row) => {
          const provider = isIntegrationProvider(row) ? row : null;
          if (provider) {
            this.editProvider(provider);
          }
        },
      },
      {
        label: 'Manage Credentials',
        icon: 'key',
        color: 'primary',
        action: (row) => {
          const provider = isIntegrationProvider(row) ? row : null;
          if (provider && provider.id) {
            this.manageCredentials(String(provider.id));
          }
        },
      },
      {
        label: 'Delete',
        icon: 'delete',
        color: 'warn',
        action: (row) => {
          const provider = isIntegrationProvider(row) ? row : null;
          if (provider && provider.id) {
            this.deleteProvider(String(provider.id));
          }
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

  constructor(private integrationService: IntegrationService) {}

  ngOnInit(): void {
    this.loadProviders();
  }

  loadProviders(): void {
    this.isLoading.set(true);
    this.integrationService.listProviders().subscribe({
      next: (data) => {
        this.providers.set(data || []);
        this.totalProviders.set(data?.length || 0);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load providers:', error);
        this.isLoading.set(false);
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    // TODO: Implement server-side search if needed
    this.loadProviders();
  }

  onPageChange(page: number, pageSize: number): void {
    this.currentPage.set(page);
    this.currentPageSize.set(pageSize);
    // TODO: Implement server-side pagination if needed
    this.loadProviders();
  }

  onSortChange(sortKey: string, sortDirection: 'asc' | 'desc'): void {
    // TODO: Implement server-side sorting if needed
    const sorted = [...this.providers()].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortKey];
      const bVal = (b as unknown as Record<string, unknown>)[sortKey];
      if (sortDirection === 'asc') {
        return (aVal as string | number) > (bVal as string | number) ? 1 : -1;
      } else {
        return (aVal as string | number) < (bVal as string | number) ? 1 : -1;
      }
    });
    this.providers.set(sorted);
  }

  onActionClick(action: DataTableAction, row: DataTableRow): void {
    action.action(row);
  }

  getHealthClass(healthStatus: string): string {
    if (!healthStatus) return 'UNKNOWN';
    return healthStatus.toLowerCase();
  }

  viewProvider(id: string): void {
    // Navigate to provider detail page or show details in dialog
    const provider = this.providers().find((p) => p.id === id);
    if (provider) {
      // For now, just show provider info in console
      // TODO: Create provider detail dialog or page
      console.log('View provider:', provider);
    }
  }

  manageCredentials(providerId: string): void {
    const provider = this.providers().find((p) => p.id === providerId);
    if (provider) {
      this.selectedProvider.set(provider);
      this.showCredentials.set(true);
    }
  }

  // Computed: Build add provider dialog config
  addProviderDialogConfig = computed<FormDialogConfig>(() => {
    const fields: FormDialogField[] = [
      { name: 'name', label: 'Name', type: 'text', required: true },
      {
        name: 'displayName',
        label: 'Display Name',
        type: 'text',
        required: true,
      },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { name: 'baseApiUrl', label: 'Base API URL', type: 'text' },
    ];

    return {
      title: 'Add Provider',
      fields,
      submitLabel: 'Save',
      cancelLabel: 'Cancel',
      mode: 'create',
    };
  });

  // Computed: Build delete dialog config
  deleteDialogConfig = computed<ConfirmDialogConfig>(() => {
    const provider = this.selectedProviderForDelete();
    return {
      title: 'Delete Provider',
      message: provider
        ? `Are you sure you want to delete provider "${
            provider.displayName || provider.name
          }"? This action cannot be undone.`
        : '',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      confirmVariant: 'danger',
      cancelVariant: 'secondary',
    };
  });

  openAddProviderDialog(): void {
    this.selectedCapabilities.set(new Set());
    this.showAddProviderDialog.set(true);
  }

  editProvider(provider: IntegrationProvider): void {
    // TODO: Implement edit provider dialog
    console.log('Edit provider:', provider);
  }

  deleteProvider(id: string): void {
    const provider = this.providers().find((p) => p.id === id);
    if (provider) {
      this.selectedProviderForDelete.set(provider);
      this.showDeleteDialog.set(true);
    }
  }

  onAddProviderDialogSubmit(data: Record<string, unknown>): void {
    this.addProviderDialogLoading.set(true);
    const capabilities: IntegrationCapability[] = Array.from(
      this.selectedCapabilities()
    ) as IntegrationCapability[];

    const payload = {
      name: String(data.name),
      displayName: String(data.displayName),
      description: data.description ? String(data.description) : '',
      baseApiUrl: data.baseApiUrl ? String(data.baseApiUrl) : '',
      capabilities: capabilities,
    };

    this.integrationService.createProvider(payload).subscribe({
      next: () => {
        this.addProviderDialogLoading.set(false);
        this.showAddProviderDialog.set(false);
        this.selectedCapabilities.set(new Set());
        this.loadProviders();
      },
      error: (error) => {
        console.error('Failed to add provider:', error);
        this.addProviderDialogLoading.set(false);
      },
    });
  }

  onAddProviderDialogCancel(): void {
    this.showAddProviderDialog.set(false);
    this.selectedCapabilities.set(new Set());
  }

  onDeleteDialogConfirm(): void {
    const provider = this.selectedProviderForDelete();
    if (!provider) return;

    this.deleteDialogLoading.set(true);
    this.integrationService.deleteProvider(provider.id).subscribe({
      next: () => {
        this.deleteDialogLoading.set(false);
        this.showDeleteDialog.set(false);
        this.selectedProviderForDelete.set(null);
        this.loadProviders();
      },
      error: (error) => {
        console.error('Failed to delete provider:', error);
        this.deleteDialogLoading.set(false);
      },
    });
  }

  onDeleteDialogCancel(): void {
    this.showDeleteDialog.set(false);
    this.selectedProviderForDelete.set(null);
  }
}
