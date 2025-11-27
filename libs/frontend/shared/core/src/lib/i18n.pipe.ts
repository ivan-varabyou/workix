import { inject, Pipe, PipeTransform } from '@angular/core';

import { I18nService, TranslationParams } from './i18n.service';

@Pipe({
  name: 'translate',
  standalone: true,
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: string, params?: TranslationParams): string {
    return this.i18n.translate(key, params);
  }
}
