import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SettingsComponent } from './pages/settings/settings.component';
import { SettingsRoutingModule } from './settings-routing.module';

// Note: GeneralSettingsComponent, SecuritySettingsComponent, EmailSettingsComponent
// are no longer needed as they are replaced by WorkixSettingsPageComponent

@NgModule({
  declarations: [],
  imports: [CommonModule, SettingsRoutingModule, SettingsComponent],
})
export class SettingsModule {}
