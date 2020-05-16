import { Component, OnInit } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons/faLayerGroup';
import { Color } from '@shared/classes/color';
import { ExpenseKind } from '@shared/enums/kind';
import { Category } from '@shared/interfaces/category';
import { Profile } from '@shared/interfaces/profile';
import { Transaction } from '@shared/interfaces/transaction';
import { Wallet } from '@shared/interfaces/wallet';
import { ApiService } from '@shared/services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  readonly style = Color.style;
  readonly colorsReserved = Color.COLORS_RESERVED;
  readonly expenseKind = ExpenseKind;

  readonly faWallets: IconDefinition = faLayerGroup;

  profiles: Profile[];

  wallets: Wallet[];

  categories: Category[];

  transactions: Transaction[];

  transactionsGroups: Record<string, Transaction[]>;

  balanceChartResults: { name: string; value: number }[];
  categoryChartResults: { name: string; value: number }[];
  balanceChartColors: { name: string; value: string }[] = [];
  categoryChartColors: { name: string; value: string }[] = [];

  constructor(private api: ApiService) {
  }

  ngOnInit(): void {
    this.api.profile.list().subscribe((data: Profile[]): void => {
      this.profiles = data;
      this.balanceChartResults = [{
        name: 'Income',
        value: data[0].balance.income,
      }, {
        name: 'Expense',
        value: data[0].balance.expense,
      }];
      this.balanceChartColors = [{
        name: 'Income',
        value: '#3c40c6',
      }, {
        name: 'Expense',
        value: '#3c40c644',
      }];
    });
    this.api.wallet.list().subscribe((data: Wallet[]): void => {
      this.wallets = data;
    });
    this.api.category.list().subscribe((data: Category[]): void => {
      this.categories = data;
      this.categoryChartResults = [];
      for (const category of data) {
        this.categoryChartResults.push({
          name: category.name,
          value: category.transactions_total || 0,
        });
        this.categoryChartColors.push({
          name: category.name,
          value: category.color,
        });
      }
    });
    this.api.transaction.list().subscribe((data: Transaction[]): void => {
      this.transactions = data;
      this.setupTransactionsGroup();
    });
  }

  /**
   * Group transactions by date
   */
  setupTransactionsGroup() {
    this.transactionsGroups = {};
    for (const transaction of this.transactions) {
      const created: Date = new Date(transaction.created);
      const date: string = new Date(created.getFullYear(), created.getMonth(), created.getDate()).toString();
      if (!this.transactionsGroups[date]) {
        this.transactionsGroups[date] = [];
      }
      this.transactionsGroups[date].push(transaction);
    }
  }

  /**
   * @returns Wallet by ID
   */
  getWallet(id: number): Wallet {
    return this.wallets.find(item => item.id === id);
  }

  /**
   * @returns Category by ID
   */
  getCategory(id: number): Category {
    return this.categories.find(item => item.id === id);
  }
}
