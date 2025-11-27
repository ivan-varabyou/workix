import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { I18nService } from './services/i18n.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [I18nService],
  exports: [I18nService],
})
export class I18nModule {}
