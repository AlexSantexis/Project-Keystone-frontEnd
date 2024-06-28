import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/UserService';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.user()) {
    if (
      state.url.includes('/account/login') ||
      state.url.includes('/account/register')
    ) {
      return router.createUrlTree(['/customer/account']);
    }
    if (state.url.includes('/admin-dashboard') && !userService.isAdmin()) {
      return router.createUrlTree(['/']);
    }
    return true;
  }
  if (state.url.includes('/customer')) {
    return router.createUrlTree(['/account/login']);
  }
  return true;
};
