import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { SearchService } from '../../shared/services/SearchService';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { UserService } from '../../shared/services/UserService';
import { BasketService } from '../../shared/services/BasketService';
import { Basket, BasketItem } from '../../shared/models/Basket.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, RouterLink, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchService = inject(SearchService);
  searchControl = new FormControl('');
  userService = inject(UserService);
  basketService = inject(BasketService);
  basket: Basket | null = null;
  private basketSubscription: Subscription | null = null;
  totalPrice: number = 0;
  router = inject(Router);

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => this.searchService.setSearchTerm(term ?? ''));

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

  viewCart(): void {
    // Navigate to cart view
    this.router.navigate(['/cart']);
  }

  updateBasketItem(item: BasketItem, change: number): void {
    const updatedQuantity = item.quantity + change;
    if (updatedQuantity > 0) {
      this.basketService
        .updateBasketItem({
          basketItemId: item.basketItemId,
          quantity: updatedQuantity,
        })
        .subscribe({
          next: (updatedBasket) =>
            this.basketService.basketSubject.next(updatedBasket),
          error: (error) => console.error('Error updating basket item', error),
        });
    }
  }

  removeBasketItem(basketItemId: number): void {
    this.basketService.removeFromBasket(basketItemId).subscribe({
      next: (updatedBasket) =>
        this.basketService.basketSubject.next(updatedBasket),
      error: (error) => console.error('Error removing basket item', error),
    });
  }

  isLoggedIn(): boolean {
    return !!this.userService.user();
  }

  isAdmin(): boolean {
    return this.userService.isAdmin();
  }

  getAccountLink(): string {
    return this.isAdmin() ? '/admin-dashboard' : '/customer/account';
  }

  getAccountLinkText(): string {
    return this.isAdmin() ? 'ADMIN DASHBOARD' : 'MY ACCOUNT';
  }
}
