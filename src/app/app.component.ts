import { Component, OnInit } from '@angular/core';
import { SidebarView } from '@app/shared/enums/sidebar-view';
import { Navigation } from '@app/shared/interfaces/navigation';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons/faCalendarAlt';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp';
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons/faSignOutAlt';
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons/faTachometerAlt';
import { faTags } from '@fortawesome/free-solid-svg-icons/faTags';
import { faWallet } from '@fortawesome/free-solid-svg-icons/faWallet';
import { Color } from '@shared/classes/color';
import { Profile } from '@shared/interfaces/profile';
import { User } from '@shared/interfaces/user';
import { Wallet } from '@shared/interfaces/wallet';
import { ApiService } from '@shared/services/api.service';
import { AuthService } from '@shared/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  readonly sidebarView = SidebarView;
  readonly style = Color.style;

  readonly faView: IconDefinition = faChevronDown;
  readonly faBack: IconDefinition = faChevronUp;
  readonly faSignOut: IconDefinition = faSignOutAlt;
  readonly faSettings: IconDefinition = faCog;

  /**
   * Authenticated user data
   */
  user: User;

  /**
   * List of profiles
   */
  profiles: Profile[];

  /**
   * List of wallets
   */
  wallets: Wallet[];

  /**
   * Navigation list
   */
  navigation: Navigation[] = [
    {
      text: 'Dashboard',
      icon: faTachometerAlt,
      link: '/',
      color: 'primary',
    },
    {
      text: 'Wallets',
      icon: faWallet,
      link: '/wallet',
      color: 'info',
    },
    {
      text: 'Events',
      icon: faCalendarAlt,
      link: '/event',
      color: 'warning',
    },
    {
      text: 'Categories',
      icon: faTags,
      link: '/category',
      color: 'success',
    },
  ];

  /**
   * What other view that sidebar is showing
   */
  sidebarViewSelected: SidebarView = SidebarView.MAIN;

  constructor(public auth: AuthService,
              private api: ApiService) {
  }

  ngOnInit() {
    /**
     * Watch authentication and user data
     */
    AuthService.user.subscribe((data: User): void => {
      this.user = data;
    });
    /**
     * Get profiles
     */
    this.api.profile.list().subscribe((data: Profile[]): void => {
      this.profiles = data;
    });
    /**
     * Get wallets
     */
    this.api.wallet.list().subscribe((data: Wallet[]): void => {
      this.wallets = data;
    });
  }

  /**
   * Go to user sidebar view or get out of it
   */
  toggleUserView() {
    if (this.sidebarViewSelected === SidebarView.USER) {
      this.sidebarViewSelected = SidebarView.MAIN;
    } else {
      this.sidebarViewSelected = SidebarView.USER;
    }
  }
}
