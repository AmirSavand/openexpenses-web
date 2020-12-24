import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ImportRoutingModule } from './import-routing.module';
import { ImportComponent } from './import.component';


@NgModule({
  declarations: [ImportComponent],
  imports: [
    CommonModule,
    ImportRoutingModule,
    FontAwesomeModule,
    FormsModule,
  ],
})
export class ImportModule {
}
