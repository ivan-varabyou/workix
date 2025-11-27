// API Client interfaces

/**
 * Request body type - can be object, FormData, or string
 */
export type RequestBody = Record<string, unknown> | FormData | string | Blob | ArrayBuffer;
