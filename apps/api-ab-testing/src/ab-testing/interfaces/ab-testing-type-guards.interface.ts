// Type guards for ABTest types
// Note: These are simple string validators since ABTestType and ABTestState
// are not yet defined in domain/ab-testing

const VALID_AB_TEST_TYPES: readonly string[] = [
  'marketer',
  'designer',
  'copywriter',
  'developer',
  'analyst',
  'custom',
];

export function isValidABTestType(value: string): boolean {
  return VALID_AB_TEST_TYPES.includes(value);
}

// Note: ABTestState enum values need to be defined
// For now, using string literal types
export function isValidABTestState(value: string): boolean {
  const validStates: readonly string[] = [
    'IDLE',
    'WORKING',
    'PAUSED',
    'FAILED',
    'COMPLETED',
  ];
  return validStates.includes(value);
}
