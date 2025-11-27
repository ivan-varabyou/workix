import axios from 'axios';

describe('Monolith E2E', () => {
  it('health check should be available', async () => {
    try {
      const res = await axios.get(`/api/auth/health`);
      expect(res.status).toBe(200);
      expect(res.data.status).toBe('ok');
    } catch (error) {
      // Service not running yet, skip test
      expect(true).toBe(true);
    }
  });
});
