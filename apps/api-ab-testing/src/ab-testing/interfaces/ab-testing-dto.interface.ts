/**
 * A/B Testing DTO Interfaces
 * Правильные типы для DTO без использования any
 */

import { EventMetadata } from '@workix/backend/domain/ab-testing';

/**
 * DTO для отслеживания события A/B теста
 */
export interface TrackEventDto {
  variantId: string;
  event: 'view' | 'conversion';
  metadata?: EventMetadata;
}
