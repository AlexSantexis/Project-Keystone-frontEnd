import { Component, inject } from '@angular/core';
import { Subscription, catchError, of, switchMap } from 'rxjs';
import { Basket, BasketItem } from '../../shared/models/Basket.model';
import { BasketService } from '../../shared/services/BasketService';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CreateOrderDTO } from '../../shared/models/order.model';
import { UserService } from '../../shared/services/UserService';
import { AddressService } from '../../shared/services/AddressService';
import { OrderService } from '../../shared/services/OrderService';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  basket: Basket | null = null;
  private basketSubscription: Subscription | null = null;
  totalPrice: number = 0;
  basketService = inject(BasketService);
  userService = inject(UserService);
  addressService = inject(AddressService);
  orderService = inject(OrderService);
  showThankYouMessage: boolean = false;
  router = inject(Router);

  ngOnInit(): void {
    this.basketSubscription = this.basketService.basket$.subscribe((basket) => {
      this.basket = basket;
      this.calculateTotal();
    });
  }

  ngOnDestroy(): void {
    this.basketSubscription?.unsubscribe();
  }

  calculateTotal(): void {
    this.totalPrice =
      this.basket?.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ) || 0;
  }

  updateQuantity(item: BasketItem, newQuantity: number): void {
    if (newQuantity > 0) {
      this.basketService
        .updateBasketItem({
          basketItemId: item.basketItemId,
          quantity: newQuantity,
        })
        .subscribe();
    }
  }

  removeItem(basketItemId: number): void {
    this.basketService.removeFromBasket(basketItemId).subscribe();
  }

  onCheckout(): void {
    this.createOrder();
  }

  private createOrder(): void {
    this.userService
      .getCurrentUser()
      .pipe(
        switchMap((user) => {
          if (!user) {
            throw new Error('User not logged in');
          }
          return this.addressService.getAddress().pipe(
            catchError((error: HttpErrorResponse) => {
              if (error.status === 404) {
                // Address not found, redirect to manage address page
                this.router.navigate(['/account/manage-address']);
                return of(null);
              }
              // For other errors, rethrow
              throw error;
            }),
            switchMap((address) => {
              if (!address) {
                return of(null);
              }
              return of({ user, address });
            })
          );
        })
      )
      .subscribe({
        next: (result) => {
          if (result && this.basket) {
            const { user, address } = result;
            const orderDTO: CreateOrderDTO = {
              userEmail: user.email,
              streetAddress: address.streetAddress,
              city: address.city,
              zipCode: address.zipCode,
              country: address.country,
            };

            this.orderService.createOrder(orderDTO).subscribe({
              next: (order) => {
                console.log('Order created successfully', order);
                this.basketService.clearBasket().subscribe({
                  next: () => {
                    this.showThankYouMessage = true;
                    setTimeout(() => {
                      this.showThankYouMessage = false;
                      this.router.navigate(['/']);
                    }, 3000);
                  },
                  error: (error) => {
                    console.error('Error clearing basket:', error);
                  },
                });
              },
              error: (error) => {
                console.error('Error creating order:', error);
              },
            });
          } else if (result === null) {
            // User was redirected to manage address, do nothing here
            console.log('User redirected to manage address');
          }
        },
        error: (error) => {
          if (error.message === 'User not logged in') {
            this.router.navigate(['/account/login']);
          } else {
            console.error('Error during checkout:', error);
            // Handle other errors (e.g., network issues, server errors)
          }
        },
      });
  }
}
