export interface Product {
  productId: number;
  name: string;
  description?: string;
  price: number;
  imgUrl?: string;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
  genres: Genre[];
}

export interface Category {
  categoryId: number;
  name: string;
}

export interface Genre {
  genreId: number;
  name: string;
}

export interface ProductCategory {
  categoryId: number;
  name: string;
}

export interface OrderDetail {
  orderId: number;
  quantity: number;
}

export interface BasketItem {
  basketItemId: number;
  quantity: number;
}

export interface ProductGenre {
  genreId: number;
  name: string;
}
