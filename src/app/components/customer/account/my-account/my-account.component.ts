import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../../shared/services/UserService';
import { LoggedInUser, User } from '../../../../shared/models/user';
import { AddressService } from '../../../../shared/services/AddressService';
import { Address } from '../../../../shared/models/address.mode';
import { MatIconModule } from '@angular/material/icon';
import { MessageService } from '../../../../shared/services/MessageService';
import { MessageComponent } from '../../../message/message-component.component';
import { catchError, of, tap } from 'rxjs';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [RouterLink, MatIconModule, MessageComponent],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.css',
})
export class MyAccountComponent {
  userService = inject(UserService);
  addressService = inject(AddressService);
  router = inject(Router);
  user: User | null = null;
  address: Address | null = null;
  messageService: MessageService = inject(MessageService);

  ngOnInit() {
    this.loadAddress();
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => {
        console.error('Error fetching current user', err);
      },
    });
  }

  deleteAddress() {
    this.addressService
      .removeAddress()
      .pipe(
        tap(() => {
          this.address = null;
          this.messageService.setMessage({
            type: 'success',
            text: 'Address deleted successfully',
          });
        }),
        catchError((error) => {
          console.error('Error deleting address:', error);
          this.messageService.setMessage({
            type: 'error',
            text:
              error.error?.message ||
              'Failed to delete address. Please try again.',
          });
          return of(null);
        })
      )
      .subscribe();
  }

  loadAddress() {
    this.addressService
      .getAddress()
      .pipe(
        tap((address: Address) => {
          this.address = address;
        }),
        catchError((error) => {
          if (error.status === 404) {
            // Address not found, set address to null
            this.address = null;
          } else {
            console.error('Error loading address:', error);
          }
          return of(null);
        })
      )
      .subscribe();
  }

  logout() {
    this.userService.logoutUser();
    this.router.navigate(['']);
  }

  deleteAccount() {
    const email = this.userService.user()?.Email;
    if (email) {
      const confirmation = confirm(
        'Are you sure you want to delete your account? This cannot be undone.'
      );
      if (confirmation) {
        this.userService.deleteUser(email).subscribe({
          next: (response) => {
            console.log('User deleted', response.msg);
            this.userService.logoutUser();
            console.log('Navigating to home page');
            this.router.navigate(['']);
          },
          error: (err) => {
            console.error('User deletion error', err);
          },
        });
      }
    }
  }
}
