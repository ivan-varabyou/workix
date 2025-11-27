// Push notification interfaces

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationOptions {
  userId: string;
  title: string;
  body: string;
  icon?: string | undefined;
  badge?: string | undefined;
  image?: string | undefined;
  url?: string | undefined;
  tag?: string | undefined;
  requireInteraction?: boolean | undefined;
  silent?: boolean | undefined;
  data?: Record<string, unknown> | undefined;
}

export interface PushSendResponse {
  success: boolean;
  sent: number;
  failed: number;
  errors?: Array<{ subscription: string; error: string }>;
}

export interface PushSubscriptionRecord {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}
