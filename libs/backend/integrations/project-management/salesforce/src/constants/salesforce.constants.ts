export const SALESFORCE_PROVIDER_ID = 'salesforce';
export const SALESFORCE_PROVIDER_NAME = 'Salesforce';

export const SALESFORCE_ERROR_MESSAGES = {
  INSTANCE_URL_REQUIRED: 'Instance URL is required',
  OBJECT_TYPE_REQUIRED: 'Object type is required',
  FIELDS_REQUIRED: 'Fields are required',
  FLOW_NAME_REQUIRED: 'Flow name is required',
  INTEGRATION_NOT_FOUND: 'Salesforce integration not found',
  INTEGRATION_CREATE_FAILED: 'Failed to create Salesforce integration',
  EXECUTE_FLOW_NOT_IMPLEMENTED: 'ExecuteFlow is not implemented',
  GET_ORG_STATS_NOT_IMPLEMENTED: 'GetOrgStats is not implemented',
} as const;

export const SALESFORCE_DEFAULT_VALUES = {
  API_VERSION: '59.0',
  EDITION: 'Professional',
  ORG_NAME: 'Workix Org',
} as const;
