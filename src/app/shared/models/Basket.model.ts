import { Product } from './product.model';

export interface Basket {
  basketId: number;
  userId: string;
  items: BasketItem[];
}

export interface BasketItem {
  basketItemId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  imgUrl: string;
}

export interface AddToBasketDTO {
  productId: number;
  quantity: number;
}

export interface UpdateBasketItemDTO {
  basketItemId: number;
  quantity: number;
}
