/**
 * A/B Testing DTO Interfaces
 * Правильные типы для DTO без использования any
 */

import { EventMetadata } from '@workix/utilities/ab-testing';

/**
 * DTO для отслеживания события A/B теста
 */
export interface TrackEventDto {
  variantId: string;
  event: 'view' | 'conversion';
  metadata?: EventMetadata;
}
