// File upload interfaces

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  // eslint-disable-next-line no-restricted-syntax -- Buffer is required for file uploads in Node.js backend
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

export interface BatchUploadResult {
  userId: string;
  success: boolean;
  avatarUrl?: string;
  error?: string;
}
