import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProfileCurrencyModule } from '@shared/modules/profile-currency/profile-currency.module';
import { ProfileFormModalModule } from '@shared/modules/profile-form-modal/profile-form-modal.module';

import { ListRoutingModule } from './list-routing.module';
import { ListComponent } from './list.component';

@NgModule({
  declarations: [
    ListComponent,
  ],
  imports: [
    CommonModule,
    ListRoutingModule,
    ProfileFormModalModule,
    FontAwesomeModule,
    ProfileCurrencyModule,
  ],
})
export class ListModule {
}
