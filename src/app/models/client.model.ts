export interface Client {
  id: number;
  name: string;
  phone: string;
  orders: Order[];
  payments: Payment[];
}
export interface ProductCatalog {
  id: number;
  name: string;
  price: number;
}

export interface Order {
  id: number;
  clientId: number;
  productId: number;
  productName?: string; // Optional, for easier display
  productPrice: number; // Optional, for easier display
  quantity: number;
  production_date: string;
  status: 'non livree' | 'livree';
  selected?: boolean;
}

export interface Payment {
  id: number;
  clientId: number;
  payment_date: string;
  amount: number;
  selected?: boolean;
}
