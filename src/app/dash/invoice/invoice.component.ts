import { Component } from '@angular/core';
import { InvoiceTemplate } from '@shared/interfaces/invoice-template';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
})
export class InvoiceComponent {

  /**
   * All available templates for invoices go here. Make sure to
   * read and follow rules in `src/app/public/invoice/shared/components/README.md`.
   */
  static readonly TEMPLATES: InvoiceTemplate[] = [
    {
      name: 'Soft',
      version: '1.0',
      authors: ['Amir Savand'],
    },
    {
      name: 'Paper',
      version: '1.0',
      authors: ['Amer Ansari'],
    },
  ];
}
