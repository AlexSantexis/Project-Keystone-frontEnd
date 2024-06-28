import { Component, inject } from '@angular/core';
import { Wishlist } from '../../../shared/models/wishlist';
import { WishlistService } from '../../../shared/services/WishlistService';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AddToBasketDTO } from '../../../shared/models/Basket.model';
import { BasketService } from '../../../shared/services/BasketService';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent {
  wishlist: Wishlist | null = null;
  wishlistService = inject(WishlistService);
  route = inject(ActivatedRoute);
  displayCount = 9;
  basketService = inject(BasketService);

  ngOnInit(): void {
    this.loadWishlist();
    this.setDisplayCount();
    window.addEventListener('resize', () => this.setDisplayCount());
  }

  loadWishlist(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (wishlist) => {
        this.wishlist = wishlist;
        console.log('Wishlist loaded successfully', wishlist);
      },
      error: (error) => {
        console.error('Error loading wishlist', error);
      },
    });
  }

  addToBasket(productId: number): void {
    const addToBasketDto: AddToBasketDTO = {
      productId: productId,
      quantity: 1,
    };

    this.basketService.addToBasket(addToBasketDto).subscribe({
      next: (updatedBasket) => {
        console.log('Item added to basket successfully', updatedBasket);
        // You can add additional logic here, such as showing a notification
      },
      error: (error) => {
        console.error('Error adding item to basket', error);
        // Handle the error, maybe show an error message to the user
      },
    });
  }

  removeFromWishlist(productId: number): void {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        console.log('Item removed from wishlist successfully');
        this.loadWishlist(); // Refresh wishlist
      },
      error: (error) => {
        console.error('Error removing item from wishlist', error);
      },
    });
  }

  createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }

  setDisplayCount() {
    if (window.innerWidth >= 1200) {
      this.displayCount = 20; // XL screens
    } else if (window.innerWidth >= 992) {
      this.displayCount = 16; // Large screens
    } else if (window.innerWidth >= 768) {
      this.displayCount = 12; // Medium screens
    } else {
      this.displayCount = 8; // Small screens (mobile)
    }
  }
}
