import { Component, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { Basket, BasketItem } from '../../shared/models/Basket.model';
import { BasketService } from '../../shared/services/BasketService';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

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
    this.basketService.clearBasket().subscribe({
      next: () => {
        this.showThankYouMessage = true;
        setTimeout(() => {
          this.showThankYouMessage = false;
          this.router.navigate(['/']);
        }, 3000);
      },
      error: (error) => {
        console.error('Error during checkout:', error);
      },
    });
  }
}
