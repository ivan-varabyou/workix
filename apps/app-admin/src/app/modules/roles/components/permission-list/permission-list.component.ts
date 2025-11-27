import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { Permission } from '@workix/shared/frontend/core';
import {
  WorkixCheckboxComponent,
  WorkixListComponent,
  WorkixListItemComponent,
} from '@workix/shared/frontend/ui';

@Component({
  selector: 'app-permission-list',
  standalone: true,
  imports: [CommonModule, WorkixListComponent, WorkixListItemComponent, WorkixCheckboxComponent],
  templateUrl: './permission-list.component.html',
  styleUrls: ['./permission-list.component.scss'],
})
export class PermissionListComponent {
  @Input() permissions: Permission[] = [];
  @Input() selectedPermissions: Set<string> = new Set();
  @Output() togglePermission = new EventEmitter<string>();

  onToggle(permissionId: string): void {
    this.togglePermission.emit(permissionId);
  }

  isSelected(permissionId: string): boolean {
    return this.selectedPermissions.has(permissionId);
  }
}
