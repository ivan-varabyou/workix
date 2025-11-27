/**
 * PubSub Event Types
 */

/**
 * PubSub Event
 */
export interface PubSubEvent {
  channel: string;
  event: string;
  data: unknown;
  timestamp: number;
}

/**
 * PubSub Event Handler
 */
export type PubSubEventHandler = (event: PubSubEvent) => Promise<void> | void;
