import { Module } from '@nestjs/common';
// TODO: Fix NotificationsModule import - temporarily disabled
// import { NotificationsModule } from '@workix/infrastructure/notifications';
import { PrismaModule } from '@workix/infrastructure/prisma';

// Gradually enabling security services one by one
// Gradually enabling security services one by one
// Step 1: InjectionDetectorService (no dependencies)
import { InjectionDetectorService } from './services/injection-detector.service';
// Step 2: IpBlockingService (depends on Prisma)
import { IpBlockingService } from './services/ip-blocking.service';
// Step 3: AccountSecurityService (depends on Prisma)
import { AccountSecurityService } from './services/account-security.service';
// Step 4: ThreatDetectionService (depends on other services) - ❌ ОТКЛЮЧЕН
// import { ThreatDetectionService } from './services/threat-detection.service';
// Step 5: SecurityThreatMiddleware (depends on ThreatDetectionService) - ❌ ОТКЛЮЧЕН
// import { SecurityThreatMiddleware } from './middleware/security-threat.middleware';
// Step 6: GeolocationService (depends on Prisma) - ❌ ОТКЛЮЧЕН
// import { GeolocationService } from './services/geolocation.service';
// Step 7: SecurityCodeService (depends on Prisma and other services)
import { SecurityCodeService } from './services/security-code.service';
// Step 8: DataCleanupService and DataCleanupSchedulerService - ❌ ОТКЛЮЧЕН
// import { DataCleanupService } from './services/data-cleanup.service';
// import { DataCleanupSchedulerService } from './services/data-cleanup-scheduler.service';

/**
 * Security Module
 * Provides security threat detection and response services
 * Temporarily disabled to identify issues
 */
@Module({
  imports: [PrismaModule], // NotificationsModule temporarily disabled
  providers: [
    // Enabling gradually to find the problematic service
    // Step 1: InjectionDetectorService (no dependencies) ✅
    InjectionDetectorService,
    // Step 2: IpBlockingService (depends on Prisma) ✅
    IpBlockingService,
    // Step 3: AccountSecurityService (depends on Prisma) - ✅ РАБОТАЕТ
    AccountSecurityService,
    // Step 4: ThreatDetectionService (depends on Step 1, 2, 3) - ❌ ПРОБЛЕМНЫЙ
    // ОШИБКА: Сервис не запускается - требуется диагностика зависимостей
    // ThreatDetectionService,
    // Step 5: SecurityThreatMiddleware (depends on ThreatDetectionService) - ТЕСТИРУЮ
    // ПРИМЕЧАНИЕ: Зависит от ThreatDetectionService (Step 4), который проблемный
    // SecurityThreatMiddleware,
    // Step 6: GeolocationService (depends on Prisma) - ❌ ПРОБЛЕМНЫЙ
    // ОШИБКА: Сервис не запускается - требуется диагностика
    // GeolocationService,
    // Step 7: SecurityCodeService (depends on Prisma and other services) - ⚠️ ВКЛЮЧЕН ДЛЯ AuthSecurityController
    // ПРИМЕЧАНИЕ: Включен для работы AuthSecurityController, но может быть проблемным
    SecurityCodeService,
    // Step 8: DataCleanupService and DataCleanupSchedulerService - ❌ ПРОБЛЕМНЫЙ
    // ОШИБКА: Сервис не запускается - требуется диагностика
    // DataCleanupService,
    // DataCleanupSchedulerService,
  ],
  exports: [
    // Enabling gradually
    // Step 1: InjectionDetectorService ✅
    InjectionDetectorService,
    // Step 2: IpBlockingService ✅
    IpBlockingService,
    // Step 3: AccountSecurityService - ✅ РАБОТАЕТ
    AccountSecurityService,
    // Step 4: ThreatDetectionService - ❌ ПРОБЛЕМНЫЙ
    // ОШИБКА: Сервис не запускается - требуется диагностика зависимостей
    // ThreatDetectionService,
    // Step 5: SecurityThreatMiddleware
    // SecurityThreatMiddleware,
    // Step 6: GeolocationService - ❌ ПРОБЛЕМНЫЙ
    // ОШИБКА: Сервис не запускается - требуется диагностика
    // GeolocationService,
    // Step 7: SecurityCodeService - ⚠️ ВКЛЮЧЕН ДЛЯ AuthSecurityController
    // ПРИМЕЧАНИЕ: Включен для работы AuthSecurityController, но может быть проблемным
    SecurityCodeService,
    // Step 8: DataCleanupService - ❌ ПРОБЛЕМНЫЙ
    // ОШИБКА: Сервис не запускается - требуется диагностика
    // DataCleanupService,
  ],
})
export class SecurityModule {}
