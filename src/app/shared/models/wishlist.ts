export interface WishlistItem {
  productId: number;
  name: string;
  description: string;
  price: number;
  imgUrl: string;
  addedAt: string;
}

export interface Wishlist {
  wishlistId: number;
  userId: string;
  items: WishlistItem[];
}
