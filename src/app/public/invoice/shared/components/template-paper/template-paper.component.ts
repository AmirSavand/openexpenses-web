import { Component, Input } from '@angular/core';
import { Invoice } from 'src/shared/interfaces/invoice';

@Component({
  selector: 'app-template-paper',
  templateUrl: './template-paper.component.html',
  styleUrls: ['./template-paper.component.scss'],
})
export class TemplatePaperComponent {
  @Input() invoice: Invoice;
}
