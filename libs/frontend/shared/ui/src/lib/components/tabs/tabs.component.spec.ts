import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { WorkixTabsComponent } from './tabs.component';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';

describe('WorkixTabsComponent', () => {
  let component: WorkixTabsComponent;
  let fixture: ComponentFixture<WorkixTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkixTabsComponent, CommonModule, TabsModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkixTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should have default activeIndex as 0', () => {
      expect(component.activeIndex()).toBe(0);
    });

    it('should have default scrollable as false', () => {
      expect(component.scrollable()).toBe(false);
    });

    it('should accept activeIndex input', () => {
      fixture.componentRef.setInput('activeIndex', 2);
      expect(component.activeIndex()).toBe(2);
    });
  });

  describe('Events', () => {
    it('should emit activeIndexChange on tab change', () => {
      let emittedValue: number | undefined;
      component.activeIndexChange.subscribe((value) => {
        emittedValue = value;
      });

      component.onTabChange({ index: 1 });
      expect(emittedValue).toBe(1);
    });
  });
});
