import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AddRoutingModule } from 'src/app/user/profile/add/add-routing.module';
import { AddComponent } from 'src/app/user/profile/add/add.component';

@NgModule({
  declarations: [
    AddComponent,
  ],
  imports: [
    CommonModule,
    AddRoutingModule,
    ReactiveFormsModule,
  ],
})
export class AddModule {
}
