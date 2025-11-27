import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AppComponent } from './app.component';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let themeService: any;
  let authService: any;

  beforeEach(async () => {
    themeService = {
      isDarkMode: jest.fn().mockReturnValue(false),
      setDarkMode: jest.fn(),
    };

    authService = {
      getCurrentUser: jest.fn().mockReturnValue(null),
      logout: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent, CommonModule, RouterOutlet],
      providers: [
        { provide: ThemeService, useValue: themeService },
        { provide: AuthService, useValue: authService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default title', () => {
    expect(component.title()).toBe('Workix');
  });

  it('should toggle dark mode', () => {
    const initialMode = component.isDarkMode();
    component.toggleDarkMode();
    expect(component.isDarkMode()).toBe(!initialMode);
    expect(themeService.setDarkMode).toHaveBeenCalledWith(!initialMode);
  });

  it('should compute theme icon correctly', () => {
    expect(component.themeIcon()).toBe('dark_mode');
    component.toggleDarkMode();
    expect(component.themeIcon()).toBe('light_mode');
  });
});
