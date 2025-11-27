/**
 * Types for AdminLayoutComponent
 */

export interface AdminLayoutMenuItem {
  label: string;
  icon: string;
  routerLink?: string;
  route?: string; // Deprecated: use routerLink instead
  action?: () => void;
}

export interface AdminLayoutUserMenuItem {
  label: string;
  icon: string;
  routerLink?: string;
  action?: () => void;
}

export interface AdminLayoutUserMenu {
  items: AdminLayoutUserMenuItem[];
  profileRoute?: string; // Deprecated: use items instead
  settingsRoute?: string; // Deprecated: use items instead
  onLogout?: () => void; // Deprecated: use items instead
}
