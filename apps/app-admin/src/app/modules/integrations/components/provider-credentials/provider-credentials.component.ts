import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import type { CreateCredentialDto, IntegrationCredential } from '@workix/shared/frontend/core';
import {
  ConfirmDialogConfig,
  DataTableAction,
  DataTableColumn,
  DataTableConfig,
  FormDialogConfig,
  FormDialogField,
  WorkixButtonComponent,
  WorkixCardComponent,
  WorkixChipComponent,
  WorkixConfirmDialogComponent,
  WorkixDataTableComponent,
  WorkixFormDialogComponent,
  WorkixIconComponent,
  WorkixSpinnerComponent,
} from '@workix/shared/frontend/ui';

import { IntegrationService } from '../../services/integration.service';

// Type guard for IntegrationCredential
function isIntegrationCredential(value: unknown): value is IntegrationCredential {
  if (!value || typeof value !== 'object' || value === null) return false;
  if (Array.isArray(value)) return false;
  const idDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(value, 'id');
  const typeDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(value, 'type');
  return typeof idDesc?.value === 'string' && typeof typeDesc?.value === 'string';
}

@Component({
  selector: 'app-provider-credentials',
  standalone: true,
  imports: [
    CommonModule,
    WorkixDataTableComponent,
    WorkixButtonComponent,
    WorkixIconComponent,
    WorkixCardComponent,
    WorkixSpinnerComponent,
    WorkixChipComponent,
    WorkixFormDialogComponent,
    WorkixConfirmDialogComponent,
  ],
  templateUrl: './provider-credentials.component.html',
  styleUrl: './provider-credentials.component.scss',
})
export class ProviderCredentialsComponent implements OnInit {
  private integrationService = inject(IntegrationService);

  providerId = signal<string>('');
  providerName = signal<string>('');
  credentials = signal<IntegrationCredential[]>([]);
  isLoading = signal<boolean>(false);
  showAddCredentialDialog = signal<boolean>(false);
  showEditCredentialDialog = signal<boolean>(false);
  showDeleteCredentialDialog = signal<boolean>(false);
  selectedCredential = signal<IntegrationCredential | null>(null);
  addCredentialLoading = signal<boolean>(false);
  editCredentialLoading = signal<boolean>(false);
  deleteCredentialLoading = signal<boolean>(false);

  @Input() set providerIdInput(value: string) {
    if (value) {
      this.providerId.set(value);
      this.loadCredentials();
    }
  }

  @Input() set providerNameInput(value: string) {
    if (value) {
      this.providerName.set(value);
    }
  }

  ngOnInit(): void {
    // Load credentials if providerId is already set
    if (this.providerId()) {
      this.loadCredentials();
    }
  }

  setProvider(providerId: string, providerName: string): void {
    this.providerId.set(providerId);
    this.providerName.set(providerName);
    this.loadCredentials();
  }

  loadCredentials(): void {
    if (!this.providerId()) return;

    this.isLoading.set(true);
    this.integrationService.listCredentials(this.providerId()).subscribe({
      next: (data) => {
        this.credentials.set(data || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load credentials:', error);
        this.isLoading.set(false);
      },
    });
  }

  isExpired(expiresAt: string | Date): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }

  isExpiringSoon(expiresAt: string | Date, days = 7): boolean {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry > 0 && daysUntilExpiry <= days;
  }

  // Computed: Build data table config
  dataTableConfig = computed<DataTableConfig>(() => {
    const columns: DataTableColumn[] = [
      {
        key: 'type',
        label: 'Type',
        sortable: true,
        format: (value) => String(value).toUpperCase(),
      },
      { key: 'userId', label: 'User ID', sortable: true },
      {
        key: 'expiresAt',
        label: 'Expires At',
        sortable: true,
        format: (value, row) => {
          if (!value) return '-';
          const date: string = new Date(String(value)).toLocaleString();
          if (!row || !isIntegrationCredential(row)) return date;
          if (this.isExpired(String(value))) {
            return `${date} (Expired)`;
          } else if (this.isExpiringSoon(String(value))) {
            return `${date} (Expiring Soon)`;
          }
          return date;
        },
      },
      {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        format: (value) => {
          if (!value) return '-';
          try {
            return new Date(String(value)).toLocaleString();
          } catch {
            return String(value);
          }
        },
      },
    ];

    const actions: DataTableAction[] = [
      {
        label: 'Edit',
        icon: 'edit',
        color: 'primary',
        action: (row) => {
          if (!row || !isIntegrationCredential(row)) return;
          this.editCredential(row);
        },
      },
      {
        label: 'Delete',
        icon: 'delete',
        color: 'warn',
        action: (row) => {
          if (!row || !isIntegrationCredential(row)) return;
          if (row.id) {
            this.deleteCredential(row.id);
          }
        },
      },
    ];

    return {
      columns,
      actions,
      searchable: true,
      sortable: true,
    };
  });

  // Computed: Build add credential dialog config
  addCredentialDialogConfig = computed<FormDialogConfig>(() => {
    const fields: FormDialogField[] = [
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
          { label: 'API Key', value: 'api_key' },
          { label: 'OAuth Token', value: 'oauth_token' },
          { label: 'Basic Auth', value: 'basic_auth' },
        ],
      },
      { name: 'userId', label: 'User ID', type: 'text' },
      { name: 'expiresAt', label: 'Expires At', type: 'date' },
    ];

    return {
      title: 'Add Credential',
      fields,
      submitLabel: 'Add',
      cancelLabel: 'Cancel',
      mode: 'create',
    };
  });

  // Computed: Build edit credential dialog config
  editCredentialDialogConfig = computed<FormDialogConfig>(() => {
    const credential = this.selectedCredential();
    if (!credential) {
      return {
        title: 'Edit Credential',
        fields: [],
      };
    }

    const fields: FormDialogField[] = [
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
          { label: 'API Key', value: 'api_key' },
          { label: 'OAuth Token', value: 'oauth_token' },
          { label: 'Basic Auth', value: 'basic_auth' },
        ],
      },
      { name: 'userId', label: 'User ID', type: 'text' },
      { name: 'expiresAt', label: 'Expires At', type: 'date' },
    ];

    return {
      title: 'Edit Credential',
      fields,
      submitLabel: 'Save',
      cancelLabel: 'Cancel',
      mode: 'edit',
      initialData: {
        type: credential.type || '',
        userId: credential.userId || '',
        expiresAt: credential.expiresAt || '',
      },
    };
  });

  // Computed: Build delete credential dialog config
  deleteCredentialDialogConfig = computed<ConfirmDialogConfig>(() => {
    const credential = this.selectedCredential();
    return {
      title: 'Delete Credential',
      message: credential
        ? `Are you sure you want to delete this credential? This action cannot be undone.`
        : '',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      confirmVariant: 'danger',
      cancelVariant: 'secondary',
    };
  });

  openAddCredentialDialog(): void {
    this.showAddCredentialDialog.set(true);
  }

  onAddCredentialDialogSubmit(data: Record<string, unknown>): void {
    this.addCredentialLoading.set(true);
    const typeValue = String(data.type || '');
    const credentialType: 'OAUTH2' | 'API_KEY' | 'BASIC' =
      typeValue === 'oauth_token'
        ? 'OAUTH2'
        : typeValue === 'api_key'
        ? 'API_KEY'
        : typeValue === 'basic_auth'
        ? 'BASIC'
        : 'API_KEY';
    const credentialData: CreateCredentialDto = {
      type: credentialType,
      data: {
        userId: String(data.userId || ''),
      },
    };
    if (data.expiresAt !== undefined && data.expiresAt !== null) {
      credentialData.expiresAt = String(data.expiresAt);
    }
    this.integrationService.addCredential(this.providerId(), credentialData).subscribe({
      next: () => {
        this.addCredentialLoading.set(false);
        this.showAddCredentialDialog.set(false);
        this.loadCredentials();
      },
      error: (error) => {
        console.error('Failed to add credential:', error);
        this.addCredentialLoading.set(false);
      },
    });
  }

  onAddCredentialDialogCancel(): void {
    this.showAddCredentialDialog.set(false);
  }

  editCredential(credential: IntegrationCredential): void {
    this.selectedCredential.set(credential);
    this.showEditCredentialDialog.set(true);
  }

  onEditCredentialDialogSubmit(data: Record<string, unknown>): void {
    const credential = this.selectedCredential();
    if (!credential) return;

    this.editCredentialLoading.set(true);
    this.integrationService.updateCredential(credential.id, data).subscribe({
      next: () => {
        this.editCredentialLoading.set(false);
        this.showEditCredentialDialog.set(false);
        this.selectedCredential.set(null);
        this.loadCredentials();
      },
      error: (error) => {
        console.error('Failed to update credential:', error);
        this.editCredentialLoading.set(false);
      },
    });
  }

  onEditCredentialDialogCancel(): void {
    this.showEditCredentialDialog.set(false);
    this.selectedCredential.set(null);
  }

  deleteCredential(credentialId: string): void {
    const credential = this.credentials().find((c) => c.id === credentialId);
    if (credential) {
      this.selectedCredential.set(credential);
      this.showDeleteCredentialDialog.set(true);
    }
  }

  onDeleteCredentialDialogConfirm(): void {
    const credential = this.selectedCredential();
    if (!credential) return;

    this.deleteCredentialLoading.set(true);
    this.integrationService.deleteCredential(credential.id).subscribe({
      next: () => {
        this.deleteCredentialLoading.set(false);
        this.showDeleteCredentialDialog.set(false);
        this.selectedCredential.set(null);
        this.loadCredentials();
      },
      error: (error) => {
        console.error('Failed to delete credential:', error);
        this.deleteCredentialLoading.set(false);
      },
    });
  }

  onDeleteCredentialDialogCancel(): void {
    this.showDeleteCredentialDialog.set(false);
    this.selectedCredential.set(null);
  }

  rotateCredentials(): void {
    // TODO: Use WorkixConfirmDialogComponent instead of confirm
    if (confirm('Are you sure you want to rotate all credentials for this provider?')) {
      this.isLoading.set(true);
      this.integrationService.rotateCredentials(this.providerId()).subscribe({
        next: (result) => {
          console.log('Credentials rotated:', result);
          this.loadCredentials();
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to rotate credentials:', error);
          this.isLoading.set(false);
        },
      });
    }
  }
}
