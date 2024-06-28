import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../../shared/models/product.model';
import { ProductService } from '../../shared/services/ProductService';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-game-section',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './game-section.component.html',
  styleUrl: './game-section.component.css',
})
export class GameSectionComponent {
  sectionType: string | null = '';
  products: Product[] = [];
  displayCount = 9;
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private resizeListener: (() => void) | null = null;
  private subscription: Subscription | null = null;
  selectedGenre?: string;
  selectedOrder: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.sectionType = params.get('type');
      this.loadProducts();
      this.setDisplayCount();
      window.addEventListener('resize', () => this.setDisplayCount());
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  loadProducts() {
    if (this.sectionType) {
      const categoryId = this.getCategoryId(this.sectionType);
      this.productService.getProductsByCategory(categoryId, 1, 20).subscribe({
        next: (products) => {
          this.products = products;
          console.log('Products loaded successfully', products);
        },
        error: (error) => {
          console.error('Error loading products', error);
        },
      });
    }
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

  private getCategoryId(type: string): number {
    switch (type.toLowerCase()) {
      case 'pc':
        return 1;
      case 'psn':
        return 2;
      case 'xbox':
        return 3;
      case 'nintendo':
        return 4;
      default:
        return 0;
    }
  }

  createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }

  onSortOrderChange(order: 'asc' | 'desc') {
    this.selectedOrder = order;
    if (this.sectionType) {
      const categoryName = this.sectionType.toLowerCase();
      this.applyFilters(categoryName);
    }
  }

  onGenreChange(genre: string) {
    this.selectedGenre = genre;
    if (this.sectionType) {
      const categoryName = this.sectionType.toLowerCase();
      this.applyFilters(categoryName);
    }
  }
  applyFilters(categoryName: string) {
    this.productService
      .filterAndSortProducts(
        this.selectedOrder,
        1,
        this.displayCount,
        this.selectedGenre,
        categoryName
      )
      .subscribe({
        next: (products) => {
          this.products = products;
          console.log(`Products loaded successfully`, products);
        },
        error: (error) => {
          console.error('Error loading products', error);
        },
      });
  }
}
