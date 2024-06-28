import { Routes } from '@angular/router';
import { MainCarouselComponent } from './components/main-carousel/main-carousel.component';
import { GameSectionComponent } from './components/game-section/game-section.component';
import { authGuard } from './shared/auth-guards/auth.guard';
import { EditComponent } from './components/customer/account/edit/edit.component';
import { GameDetailsComponent } from './components/game-details/game-details.component';
import { PasswordChangeComponent } from './components/customer/account/password-change/password-change.component';
import { AddressComponent } from './components/customer/account/address/address.component';
import { AdminComponent } from './components/admin/admin.component';
import { CartComponent } from './components/cart/cart.component';

export const routes: Routes = [
  { path: '', component: MainCarouselComponent },
  { path: 'games/:type', component: GameSectionComponent },
  { path: 'admin-dashboard', component: AdminComponent },
  {path: 'cart',component:CartComponent},
  {
    path: 'account',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./components/customer/account/login/login.component').then(
            (m) => m.LoginComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./components/customer/account/create/create.component').then(
            (m) => m.CreateComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'edit',
        component: EditComponent,
      },
      {
        path: 'change-password',
        component: PasswordChangeComponent,
      },
      {
        path: 'manage-address',
        component: AddressComponent,
      },
    ],
  },
  {
    path: 'customer',
    canActivate: [authGuard],
    children: [
      {
        path: 'account',
        loadComponent: () =>
          import(
            '../app/components/customer/account/my-account/my-account.component'
          ).then((m) => m.MyAccountComponent),
      },
      {
        path: 'order',
        loadComponent: () =>
          import('../app/components/customer/orders/orders.component').then(
            (m) => m.OrdersComponent
          ),
      },
      {
        path: 'wishlist',
        loadComponent: () =>
          import('../app/components/customer/wishlist/wishlist.component').then(
            (m) => m.WishlistComponent
          ),
      },
    ],
  },
  { path: 'game/:gamename', component: GameDetailsComponent },
];
