/**
 * Types for ClientLayoutComponent
 */

export interface ClientLayoutUserMenuItem {
  label: string;
  icon: string;
  routerLink?: string;
  action?: () => void;
}

export interface ClientLayoutUserMenu {
  items: ClientLayoutUserMenuItem[];
  profileRoute?: string; // Deprecated: use items instead
  settingsRoute?: string; // Deprecated: use items instead
  onLogout?: () => void; // Deprecated: use items instead
}
