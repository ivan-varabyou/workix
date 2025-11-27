import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppController } from './app.controller';
import { ProxyService } from './services/proxy.service';

describe('AppController - API Gateway Proxy', () => {
  let controller: AppController;
  let proxyService: ProxyService;

  beforeEach(() => {
    proxyService = {
      routeRequest: vi.fn().mockResolvedValue({ data: 'mocked' }),
    } as any;
    controller = new AppController(proxyService);
  });

  describe('Proxy methods exist', () => {
    it('should have proxyGet method', () => {
      expect(controller.proxyGet).toBeDefined();
    });

    it('should have proxyPost method', () => {
      expect(controller.proxyPost).toBeDefined();
    });

    it('should have proxyPut method', () => {
      expect(controller.proxyPut).toBeDefined();
    });

    it('should have proxyPatch method', () => {
      expect(controller.proxyPatch).toBeDefined();
    });

    it('should have proxyDelete method', () => {
      expect(controller.proxyDelete).toBeDefined();
    });
  });
});
