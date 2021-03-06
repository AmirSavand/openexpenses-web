import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Api } from '@shared/classes/api';
import { Profile } from '@shared/interfaces/profile';
import { Wallet } from '@shared/interfaces/wallet';
import { WalletFormModalComponent } from '@shared/modules/wallet-form-modal/wallet-form-modal.component';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {

  profile: Profile;

  wallets: Wallet[];

  constructor(private route: ActivatedRoute,
              private router: Router,
              private modalService: BsModalService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe((data: Params): void => {
      if (data.id === 'add') {
        this.router.navigate(['/dash', 'profile', 'list']);
      }
      Api.profile.retrieve(data.id).subscribe((profile: Profile): void => {
        this.profile = profile;
      });
      Api.wallet.list({ profile: data.id }).subscribe((wallets: Wallet[]): void => {
        this.wallets = wallets;
        if (!wallets.length) {
          this.modalService.show(WalletFormModalComponent);
        }
      });
    });
  }
}
