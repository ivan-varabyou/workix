// GCP module configuration interface

export interface GCPModuleConfig {
  projectId?: string;
  region?: string;
  credentials?: string;
  [key: string]: string | number | boolean | undefined;
}
