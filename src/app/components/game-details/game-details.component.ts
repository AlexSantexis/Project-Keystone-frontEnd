import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, map, switchMap, of, BehaviorSubject } from 'rxjs';
import { ProductService } from '../../shared/services/ProductService';
import { Product } from '../../shared/models/product.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-game-details',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './game-details.component.html',
  styleUrl: './game-details.component.css',
})
export class GameDetailsComponent {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  game$: Observable<Product | undefined> = of(undefined);

  ngOnInit() {
    this.game$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const gamename = params.get('gamename');
        return gamename ? this.loadGameDetails(gamename) : of(undefined);
      })
    );
  }

  private loadGameDetails(gamename: string): Observable<Product | undefined> {
    return this.productService
      .getProductWithDetails()
      .pipe(
        map((products) =>
          products.find((p) => this.createSlug(p.name) === gamename)
        )
      );
  }

  private createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }
}
