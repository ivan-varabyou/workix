import { Injectable } from '@angular/core';

export interface SnackbarConfig {
  message: string;
  action?: string;
  duration?: number;
  horizontalPosition?: 'start' | 'center' | 'end' | 'left' | 'right';
  verticalPosition?: 'top' | 'bottom';
  panelClass?: string | string[];
}

/**
 * Workix Snackbar Service
 *
 * Abstracted wrapper around PrimeNG Snackbar service.
 * Supports PrimeNG provider.
 *
 * Usage:
 * ```typescript
 * constructor(private snackbar: WorkixSnackbarService) {}
 *
 * showMessage() {
 *   this.snackbar.open('Message', 'Action', { duration: 3000 });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class WorkixSnackbarService {
  open(message: string, action?: string, config?: Partial<SnackbarConfig>): void {
    // Use PrimeNG or custom implementation
    console.log('PrimeNG/Custom Snackbar:', message, action, config);
    // Show custom snackbar
    this.showCustomSnackbar(message, action, config);
  }

  private showCustomSnackbar(
    message: string,
    action?: string,
    config?: Partial<SnackbarConfig>
  ): void {
    // Create and show custom snackbar element
    const snackbar = document.createElement('div');
    snackbar.className = 'workix-snackbar';
    snackbar.textContent = message;
    snackbar.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #323232;
      color: white;
      padding: 14px 24px;
      border-radius: 4px;
      box-shadow: 0 3px 5px rgba(0,0,0,0.2);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    if (action) {
      const actionButton = document.createElement('button');
      actionButton.textContent = action;
      actionButton.style.cssText = `
        background: transparent;
        border: none;
        color: #ff4081;
        cursor: pointer;
        font-weight: 500;
        padding: 0;
        margin-left: 8px;
      `;
      actionButton.onclick = () => {
        document.body.removeChild(snackbar);
      };
      snackbar.appendChild(actionButton);
    }

    document.body.appendChild(snackbar);

    const duration = config?.duration || 3000;
    setTimeout(() => {
      if (document.body.contains(snackbar)) {
        document.body.removeChild(snackbar);
      }
    }, duration);
  }
}
