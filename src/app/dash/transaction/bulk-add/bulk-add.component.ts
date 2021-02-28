import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons/faCheckCircle';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons/faCircleNotch';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { format, formatISO, parseISO } from 'date-fns';
import { Utils } from 'src/shared/classes/utils';
import { ExpenseKind } from 'src/shared/enums/kind';
import { Category } from 'src/shared/interfaces/category';
import { Event } from 'src/shared/interfaces/event';
import { Profile } from 'src/shared/interfaces/profile';
import { ReactiveFormData } from 'src/shared/interfaces/reactive-form-data';
import { Transaction } from 'src/shared/interfaces/transaction';
import { Wallet } from 'src/shared/interfaces/wallet';
import { ApiService } from 'src/shared/services/api.service';
import { ProfileService } from 'src/shared/services/profile.service';

@Component({
  selector: 'app-bulk-add',
  templateUrl: './bulk-add.component.html',
  styleUrls: ['./bulk-add.component.scss'],
})
export class BulkAddComponent implements OnInit {

  readonly faAdd: IconDefinition = faPlus;
  readonly faDelete: IconDefinition = faTrash;
  readonly faSuccess: IconDefinition = faCheckCircle;
  readonly faLoading: IconDefinition = faCircleNotch;
  readonly faBreadcrumbArrow: IconDefinition = faChevronRight;

  readonly expenseKind = ExpenseKind;

  wallets: Wallet[];
  events: Event[];
  categories: Category[];
  categoryGroups: Record<ExpenseKind, Category[]> = {
    [ExpenseKind.INCOME]: [],
    [ExpenseKind.EXPENSE]: [],
    [ExpenseKind.TRANSFER]: [],
  };

  forms: ReactiveFormData[] = [
    this.getForm(),
    this.getForm(),
    this.getForm(),
  ];

  currency: string;

  constructor(private api: ApiService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    /**
     * Watch profile to get currency for UI.
     */
    ProfileService.profile.subscribe((value: Profile): void => {
      this.currency = value.currency;
    });
    /**
     * Load wallets for selection.
     */
    this.api.wallet.list().subscribe((data: Wallet[]): void => {
      this.wallets = data;
      // Set default values.
      this.forms.forEach((form: ReactiveFormData): void => form.form.patchValue({ wallet: this.wallets[0].id }));
    });
    /**
     * Load categories for selection.
     */
    this.api.category.list().subscribe((data: Category[]): void => {
      this.categories = data;
      /**
       * Group categories by their kind.
       */
      for (const category of this.categories) {
        this.categoryGroups[category.kind].push(category);
      }
      /**
       * Set default values.
       */
      this.forms.forEach((form: ReactiveFormData): void => form.form.patchValue({
        category: this.categoryGroups[ExpenseKind.EXPENSE][0].id,
      }));
    });
    /**
     * Load events for selection.
     */
    this.api.event.list().subscribe((data: Event[]): void => {
      this.events = data;
    });
  }

  /**
   * @returns Reactive form data for a new transaction form.
   */
  getForm(): ReactiveFormData {
    let wallet: number;
    if (this.wallets) {
      wallet = this.wallets[0].id;
    }
    let category: number;
    if (this.categories) {
      category = this.categoryGroups[ExpenseKind.EXPENSE][0].id;
    }
    return {
      error: {},
      form: this.formBuilder.group({
        // Logical input, it won't be part of the payload.
        kind: [ExpenseKind.EXPENSE],
        wallet: [wallet, Validators.required],
        category: [category, Validators.required],
        into: [null],
        event: [null],
        amount: [null, Validators.compose([Validators.required, Validators.min(0)])],
        time: [format(new Date(), Utils.HTML_DATETIME_FORMAT), Validators.required],
      }),
    };
  }

  removeForm(form: ReactiveFormData): void {
    Utils.removeChild(this.forms, form);
    if (!this.forms.length) {
      this.forms.push(this.getForm());
    }
  }

  /**
   * Loop through all forms, submit them. The ones that
   * succeed, store ID for link, show success message,
   * do not submit them again and for the ones that fail,
   * show error.
   */
  submit(): void {
    for (const form of this.forms) {
      if (form.success || form.loading || !Utils.validateForms([form])) {
        continue;
      }
      /**
       * Let's do a custom validation here. If it's a transfer
       * and into wallet should be valid.
       */
      if (form.form.get('kind').value === ExpenseKind.TRANSFER && !form.form.get('into').value) {
        form.error.into = ['You must select a wallet to transfer into.'];
        continue;
      }
      form.loading = true;
      const payload = form.form.value;
      payload.time = formatISO(parseISO(payload.time), { representation: 'complete' }),
        delete payload.kind;
      this.api.transaction.create(payload).subscribe((data: Transaction): void => {
        form.id = data.id;
        form.success = true;
        form.loading = false;
        form.form.disable();
      }, (error: HttpErrorResponse): void => {
        Utils.handleError(form, error);
      });
    }
  }
}
