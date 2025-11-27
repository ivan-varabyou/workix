# 📚 Примеры использования новых библиотек

**Дата**: 2025-11-27

---

## 🎯 entities/backend/user

### Использование в backend приложениях

```typescript
import { UserEntity } from '@workix/entities/backend/user';
import type { IUser } from '@workix/domain/users';

// Создание entity из IUser
const userData: IUser = {
  id: '1',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  twoFactorEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const userEntity = new UserEntity(userData);

// Использование методов
console.log(userEntity.getFullName()); // "John Doe"
console.log(userEntity.hasTwoFactorEnabled()); // true
console.log(userEntity.hasAvatar()); // false
console.log(userEntity.toJSON()); // IUser
```

---

## 🎨 entities/frontend/user

### Использование в frontend приложениях (Angular/React)

```typescript
import { User } from '@workix/entities/frontend/user';

// Создание модели из API response
const userData = {
  id: '1',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  twoFactorEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const user = new User(userData);

// Использование UI-методов
console.log(user.getDisplayName()); // "John Doe"
console.log(user.getInitials()); // "JD"
console.log(user.getAvatarUrl()); // URL или placeholder
console.log(user.getLastLoginDisplay()); // "Today" / "Yesterday" / "2 days ago"
```

### Angular компонент пример

```typescript
import { Component, Input } from '@angular/core';
import { User } from '@workix/entities/frontend/user';

@Component({
  selector: 'app-user-card',
  template: `
    <div class="user-card">
      <img [src]="user.getAvatarUrl()" [alt]="user.getDisplayName()">
      <h3>{{ user.getDisplayName() }}</h3>
      <p>{{ user.email }}</p>
      <span *ngIf="user.isTwoFactorEnabled()">2FA Enabled</span>
      <small>Last login: {{ user.getLastLoginDisplay() }}</small>
    </div>
  `,
})
export class UserCardComponent {
  @Input() user!: User;
}
```

---

## 🔐 features/backend/auth

### Использование в backend приложениях

```typescript
import { AuthFeatureService } from '@workix/features/backend/auth';
import { AuthService } from '@workix/domain/auth';

// В модуле
@Module({
  providers: [
    AuthService, // domain service
    AuthFeatureService, // feature service (обертка)
  ],
})
export class AuthModule {}

// В контроллере
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authFeatureService: AuthFeatureService
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // Можно добавить feature-specific логику
    return this.authFeatureService.login(loginDto);
  }
}
```

**Примечание**: В большинстве случаев используйте `@workix/domain/auth` напрямую. `AuthFeatureService` полезен, когда нужна дополнительная логика поверх domain service.

---

## 🎨 features/frontend/auth

### Использование в frontend приложениях

```typescript
import { AuthService } from '@workix/features/frontend/auth';

// В Angular сервисе
@Injectable({
  providedIn: 'root',
})
export class AppAuthService extends AuthService {
  async login(email: string, password: string): Promise<void> {
    // Реализация с HttpClient
    const response = await this.http.post('/api/auth/login', {
      email,
      password,
    }).toPromise();

    this.state = {
      isAuthenticated: true,
      user: response.user,
      token: response.accessToken,
    };
  }
}
```

---

## 🔄 Сравнение: domain/ vs entities/ vs features/

### domain/auth - Основная бизнес-логика
```typescript
// ✅ Используйте для основной логики
import { AuthService } from '@workix/domain/auth';
```

### entities/backend/user - Чистая entity
```typescript
// ⚠️ Используйте если нужна чистая entity без зависимостей
import { UserEntity } from '@workix/entities/backend/user';
```

### features/backend/auth - Feature обертка
```typescript
// ⚠️ Используйте если нужна дополнительная логика поверх domain
import { AuthFeatureService } from '@workix/features/backend/auth';
```

---

## 📋 Рекомендации

1. **Начните с domain/** - основная бизнес-логика
2. **Используйте entities/** - если нужны чистые модели
3. **Используйте features/** - если нужны обертки или UI компоненты
4. **Используйте shared/** - для общих компонентов

---

## ✅ Примеры тестов

Все библиотеки имеют unit тесты:
- `libs/entities/backend/user/src/user.entity.spec.ts`
- `libs/entities/frontend/user/src/user.model.spec.ts`
- `libs/features/backend/auth/src/auth-feature.service.spec.ts`

Запуск тестов:
```bash
nx test entities-backend-user
nx test entities-frontend-user
nx test features-backend-auth
```
