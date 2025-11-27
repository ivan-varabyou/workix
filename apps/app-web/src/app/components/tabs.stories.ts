import { Component, input, signal } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

@Component({
  selector: 'app-tabs',
  standalone: true,
  template: `
    <div class="tabs">
      <div class="tabs-header">
        @for (tab of tabs(); track tab; let i = $index) {
        <button [class.active]="activeTab() === i" (click)="activeTab.set(i)">
          {{ tab }}
        </button>
        }
      </div>
      <div class="tabs-content">
        <p>Content for {{ tabs()[activeTab()] }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .tabs {
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .tabs-header {
        display: flex;
        border-bottom: 1px solid #ddd;
      }
      button {
        padding: 12px 16px;
        background: none;
        border: none;
        cursor: pointer;
        border-bottom: 2px solid transparent;
      }
      button.active {
        border-bottom-color: #007bff;
        color: #007bff;
      }
      .tabs-content {
        padding: 16px;
      }
    `,
  ],
})
export class TabsComponent {
  tabs = input<string[]>(['Tab 1', 'Tab 2', 'Tab 3']);
  activeTab = signal(0);
}

type Story = StoryObj<TabsComponent>;
const meta: Meta<TabsComponent> = {
  title: 'Components/Tabs',
  component: TabsComponent,
  tags: ['autodocs'],
};
export default meta;

export const Default: Story = {
  args: { tabs: ['Overview', 'Details', 'Settings'] },
};
