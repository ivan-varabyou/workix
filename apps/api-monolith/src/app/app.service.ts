import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getWelcome() {
    return {
      message: 'Welcome to Workix Monolith API',
      version: '1.0.0',
      description: 'Enterprise Pipeline Automation Platform',
      documentation: '/api/docs',
      health: '/api/health',
    };
  }
}
