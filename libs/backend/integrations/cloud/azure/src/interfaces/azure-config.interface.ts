// Azure config interface

export interface AzureConfig {
  subscriptionId?: string;
  resourceGroup?: string;
  region?: string;
  [key: string]: string | number | boolean | undefined;
}
