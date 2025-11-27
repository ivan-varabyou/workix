// eslint-disable-next-line @nx/enforce-module-boundaries
import { createVitestConfig } from '../../../shared/backend/vitest.config.base';

export default createVitestConfig({
  root: __dirname,
  coverageDirectory: '../../../../coverage/libs/integrations/cloud/gcp',
});
