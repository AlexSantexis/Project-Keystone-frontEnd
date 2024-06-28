import { Component, Inject, inject } from '@angular/core';
import { Product } from '../../shared/models/product.model';
import { ProductService } from '../../shared/services/ProductService';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { SearchService } from '../../shared/services/SearchService';
import { Subscription, switchMap } from 'rxjs';
import { WishlistService } from '../../shared/services/WishlistService';
import { BasketService } from '../../shared/services/BasketService';
import { AddToBasketDTO } from '../../shared/models/Basket.model';

@Component({
  selector: 'app-main-body',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './main-body.component.html',
  styleUrl: './main-body.component.css',
})
export class MainBodyComponent {
  products: Product[] = [];
  defaultProducts: Product[] = [];
  productService = inject(ProductService);
  searchService = inject(SearchService);
  wishlistService = inject(WishlistService);
  basketService = inject(BasketService);
  displayCount = 9;
  searchTerm: string = '';

  ngOnInit(): void {
    this.loadProducts();
    this.setDisplayCount();
    window.addEventListener('resize', () => this.setDisplayCount());
    this.searchService.searchTerm$.subscribe((term) => {
      this.searchTerm = term;
      this.searchProducts(term);
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

  searchProducts(term: string) {
    if (term) {
      this.productService.searchProductsByName(term).subscribe({
        next: (products) => {
          this.products = products;
          console.log('Search results:', products);
        },
        error: (error) => {
          console.error('Error searching products', error);
        },
      });
    } else {
      this.products = this.defaultProducts;
    }
  }

  loadProducts() {
    this.productService.getProductWithDetails(1, 20).subscribe({
      next: (products) => {
        this.defaultProducts = products;
        console.log('Products loaded successfully', products);
      },
      error: (error) => {
        console.error('Error loading products', error);
      },
    });
  }

  addToWishlist(productId: number): void {
    this.wishlistService.addToWishlist(productId).subscribe({
      next: () => {
        console.log('Item added to wishlist successfully');
      },
      error: (error) => {
        console.error('Error adding item to wishlist', error);
      },
    });
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

  createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }
}
