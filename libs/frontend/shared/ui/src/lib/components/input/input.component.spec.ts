import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkixInputComponent } from './input.component';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';

describe('WorkixInputComponent', () => {
  let component: WorkixInputComponent;
  let fixture: ComponentFixture<WorkixInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkixInputComponent, CommonModule, FormsModule, InputTextModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkixInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should have default value as empty string', () => {
      expect(component.value()).toBe('');
    });

    it('should have default placeholder as empty string', () => {
      expect(component.placeholder()).toBe('');
    });

    it('should have default disabled as false', () => {
      expect(component.disabled()).toBe(false);
    });

    it('should have default readonly as false', () => {
      expect(component.readonly()).toBe(false);
    });
  });

  describe('ControlValueAccessor', () => {
    it('should implement ControlValueAccessor', () => {
      expect(component.writeValue).toBeDefined();
      expect(component.registerOnChange).toBeDefined();
      expect(component.registerOnTouched).toBeDefined();
    });
  });
});
