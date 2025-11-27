import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Push Subscription Keys DTO
 * Contains cryptographic keys required for Web Push encryption
 */
export class PushSubscriptionKeysDto {
  @ApiProperty({
    description: 'P256DH public key used for encrypting push messages. This is a base64url-encoded public key from the client.',
    example: 'BElGCiBpYSAxLjAgdGhpcyBpcyBub3QgYSByZWFsIHB1YmxpYyBrZXkuLi4=',
    type: String,
  })
  @IsString()
  p256dh!: string;

  @ApiProperty({
    description: 'Authentication secret used for encrypting push messages. This is a base64url-encoded secret key from the client.',
    example: 'k3vYCHhjamFzc2NyaXB0aW9uIGtleSBmb3IgdGhpcyBzdWJzY3JpcHRpb24=',
    type: String,
  })
  @IsString()
  auth!: string;
}

/**
 * Push Subscription DTO
 * Represents a complete Web Push subscription object containing endpoint and encryption keys
 */
export class PushSubscriptionDto {
  @ApiProperty({
    description: 'Web Push endpoint URL where push notifications will be sent. This is the unique URL provided by the push service (e.g., FCM, VAPID).',
    example: 'https://fcm.googleapis.com/fcm/send/dGhpcyBpcyBhIHNhbXBsZSBlbmRwb2ludCBVUkw=',
    type: String,
  })
  @IsString()
  endpoint!: string;

  @ApiProperty({
    description: 'Push subscription encryption keys required for secure message delivery',
    type: () => PushSubscriptionKeysDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  keys!: PushSubscriptionKeysDto;
}

/**
 * Register Push Subscription Request DTO
 * Request body for registering a new push notification subscription
 */
export class RegisterPushSubscriptionDto {
  @ApiProperty({
    description: 'Complete push subscription object containing endpoint URL and encryption keys. This is typically obtained from the browser\'s Push API (navigator.serviceWorker.ready.then(registration => registration.pushManager.subscribe(...)))',
    type: () => PushSubscriptionDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => PushSubscriptionDto)
  subscription!: PushSubscriptionDto;
}

/**
 * Register Push Subscription Response DTO
 * Response returned after successfully registering a push subscription
 */
export class RegisterPushSubscriptionResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the registered push subscription. This ID can be used to manage or delete the subscription later.',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  id!: string;

  @ApiProperty({
    description: 'Success message confirming that the push subscription has been registered successfully',
    example: 'Push subscription registered successfully',
    type: String,
  })
  message!: string;
}
