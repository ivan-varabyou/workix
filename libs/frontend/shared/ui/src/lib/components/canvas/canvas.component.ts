import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { WorkixCardComponent } from '../card/card.component';
import { WorkixIconComponent } from '../icon/icon.component';
import { CanvasConfig, CanvasStep } from './canvas.component.types';

/**
 * Workix Canvas Component
 *
 * Specific component for visual pipeline canvas with drag-and-drop.
 * Uses shared UI components for consistency.
 *
 * Usage:
 * ```html
 * <workix-canvas
 *   [steps]="steps()"
 *   [config]="canvasConfig"
 *   (stepClick)="onStepClick($event)"
 *   (stepMove)="onStepMove($event)"
 * />
 * ```
 */
@Component({
  selector: 'workix-canvas',
  standalone: true,
  imports: [CommonModule, WorkixCardComponent, WorkixIconComponent],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class WorkixCanvasComponent implements AfterViewInit {
  // Required inputs
  steps = input<CanvasStep[]>([]);

  // Optional inputs
  config = input<CanvasConfig>({
    showConnections: true,
    showGrid: true,
    gridSize: 20,
    stepSize: { width: 120, height: 80 },
  });

  // Outputs
  stepClick = output<CanvasStep>();
  stepMove = output<{ step: CanvasStep; position: { x: number; y: number } }>();

  // View references
  canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  containerRef = viewChild<ElementRef<HTMLDivElement>>('container');

  // Internal state
  selectedStep = signal<CanvasStep | null>(null);
  draggedStep = signal<CanvasStep | null>(null);
  dragOffset = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  ngAfterViewInit(): void {
    const canvasEl = this.canvasRef()?.nativeElement;
    const containerEl = this.containerRef()?.nativeElement;

    if (canvasEl && containerEl) {
      this.canvas = canvasEl;
      this.ctx = canvasEl.getContext('2d');

      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());

      // Draw initial connections
      effect(() => {
        this.drawConnections();
      });
    }
  }

  private resizeCanvas(): void {
    if (!this.canvas || !this.containerRef()) return;

    const container = this.containerRef()!.nativeElement;
    this.canvas.width = container.offsetWidth;
    this.canvas.height = container.offsetHeight;
    this.drawConnections();
  }

  private drawConnections(): void {
    if (!this.ctx || !this.canvas || !this.config().showConnections) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = '#2196f3';
    this.ctx.lineWidth = 2;

    const steps = this.steps();
    const stepSize = this.config().stepSize || { width: 120, height: 80 };

    for (let i = 0; i < steps.length - 1; i++) {
      const current = steps[i];
      const next = steps[i + 1];

      if (current === undefined || next === undefined) {
        continue;
      }

      const x1 = current.position.x + stepSize.width / 2;
      const y1 = current.position.y + stepSize.height;
      const x2 = next.position.x + stepSize.width / 2;
      const y2 = next.position.y;

      // Draw curved line
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      const controlY = (y1 + y2) / 2;
      this.ctx.bezierCurveTo(x1, controlY, x2, controlY, x2, y2);
      this.ctx.stroke();

      // Draw arrow head
      const angle = Math.atan2(y2 - controlY, x2 - x1);
      const arrowSize = 10;
      this.ctx.beginPath();
      this.ctx.moveTo(x2, y2);
      this.ctx.lineTo(
        x2 - arrowSize * Math.cos(angle - Math.PI / 6),
        y2 - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      this.ctx.lineTo(
        x2 - arrowSize * Math.cos(angle + Math.PI / 6),
        y2 - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      this.ctx.closePath();
      this.ctx.fill();
    }
  }

  getStepIcon(type: string): string {
    const iconMap: Record<string, string> = {
      http: 'language',
      database: 'storage',
      transform: 'transform',
      conditional: 'branch',
      loop: 'repeat',
      script: 'code',
      email: 'email',
      webhook: 'cloud_queue',
      delay: 'schedule',
    };
    return iconMap[type] || 'settings';
  }

  selectStep(step: CanvasStep): void {
    this.selectedStep.set(step);
    this.stepClick.emit(step);
  }

  isSelected(step: CanvasStep): boolean {
    return this.selectedStep()?.id === step.id;
  }

  startDrag(event: MouseEvent, step: CanvasStep): void {
    this.draggedStep.set(step);
    this.dragOffset.set({
      x: event.clientX - step.position.x,
      y: event.clientY - step.position.y,
    });

    const onMouseMove = (moveEvent: MouseEvent) => {
      const draggedStep = this.draggedStep();
      if (draggedStep) {
        draggedStep.position.x = moveEvent.clientX - this.dragOffset().x;
        draggedStep.position.y = moveEvent.clientY - this.dragOffset().y;
        this.drawConnections();
      }
    };

    const onMouseUp = () => {
      this.draggedStep.set(null);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}
