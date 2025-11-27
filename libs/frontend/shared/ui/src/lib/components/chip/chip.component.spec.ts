import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { WorkixChipComponent } from './chip.component';
import { ChipModule } from 'primeng/chip';
import { CommonModule } from '@angular/common';

describe('WorkixChipComponent', () => {
  let component: WorkixChipComponent;
  let fixture: ComponentFixture<WorkixChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkixChipComponent, CommonModule, ChipModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkixChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should have default label as empty string', () => {
      expect(component.label()).toBe('');
    });

    it('should have default removable as false', () => {
      expect(component.removable()).toBe(false);
    });

    it('should accept label input', () => {
      fixture.componentRef.setInput('label', 'Test Chip');
      fixture.detectChanges();
      expect(component.label()).toBe('Test Chip');
    });

    it('should accept removable input', () => {
      fixture.componentRef.setInput('removable', true);
      fixture.detectChanges();
      expect(component.removable()).toBe(true);
    });
  });

  describe('Events', () => {
    it('should emit onRemove when handleRemove is called', () => {
      let removed = false;
      component.onRemove.subscribe(() => {
        removed = true;
      });

      component.handleRemove();
      expect(removed).toBe(true);
    });
  });
});
