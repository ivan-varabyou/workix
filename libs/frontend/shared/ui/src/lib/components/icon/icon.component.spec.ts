import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkixIconComponent } from './icon.component';
import { CommonModule } from '@angular/common';

describe('WorkixIconComponent', () => {
  let component: WorkixIconComponent;
  let fixture: ComponentFixture<WorkixIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkixIconComponent, CommonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkixIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should have default name as empty string', () => {
      expect(component.name()).toBe('');
    });

    it('should have default size as md', () => {
      expect(component.size()).toBe('md');
    });

    it('should accept name input', () => {
      fixture.componentRef.setInput('name', 'home');
      fixture.detectChanges();
      expect(component.name()).toBe('home');
    });

    it('should accept size input', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(component.size()).toBe('lg');
    });
  });

  describe('Computed properties', () => {
    it('should compute size correctly', () => {
      expect(component.sizeComputed()).toBe('24px');

      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(component.sizeComputed()).toBe('16px');

      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(component.sizeComputed()).toBe('32px');
    });
  });
});
