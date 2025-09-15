export interface Client {
  id: number;
  name: string;
  phone: string;
  orders: Order[];
  payments: Payment[];
}

export interface Order {
  id: number;
  clientId: number;
  date: string;
  type: string;
  price: number;
  deliveryStatus: 'en attente' | 'livrée' | 'non livrée';
  selected?: boolean;
}

export interface Payment {
  id: number;
  clientId: number;
  date: string;
  amount: number;
  selected?: boolean;
}