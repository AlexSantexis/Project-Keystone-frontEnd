import { Component, inject, OnInit, Signal } from '@angular/core';
import { CurrencyPipe, DatePipe, CommonModule } from '@angular/common';
import { OrderService } from '../../../shared/services/OrderService';
import { UserService } from '../../../shared/services/UserService';
import { switchMap, catchError, EMPTY } from 'rxjs';
import { OrderDTO } from '../../../shared/models/order.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from '../../../shared/models/user';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent {
  selectedTitle = 'MY ORDERS';
  private orderService = inject(OrderService);
  private userService = inject(UserService);

  user: Signal<User | null | undefined>;
  orders: Signal<OrderDTO[] | null | undefined>;

  constructor() {
    this.user = toSignal(this.userService.getCurrentUser(), {
      initialValue: null,
    });

    this.orders = toSignal(
      this.userService.getCurrentUser().pipe(
        switchMap((user) => {
          if (user && user.email) {
            return this.orderService.getOrdersByUserEmail(user.email);
          }
          return EMPTY;
        }),
        catchError((error) => {
          console.error('Error fetching orders', error);
          return EMPTY;
        })
      ),
      { initialValue: null }
    );
  }

  private refreshOrders() {
    const currentUser = this.user();
    if (currentUser && currentUser.email) {
      this.orderService.getOrdersByUserEmail(currentUser.email).subscribe({
        next: (orders) => {
          console.log('Orders refreshed', orders);
        },
        error: (error) => {
          console.error('Error refreshing orders', error);
        },
      });
    }
  }
}
