export interface CreateOrderDTO {
  userEmail: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface OrderDetailDTO {
  orderDetailID: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderDTO {
  orderId: number;
  userEmail: string;
  orderDate: Date;
  totalAmount: number;
  streetAddress: string;
  city: string;
  zipCode: string;
  country: string;
  orderDetails: OrderDetailDTO[];
}
