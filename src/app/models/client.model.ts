export interface Order {
  id: number;
  clientId?: number; // Optionnel
  date: string;
  type: string;
  price: number;
  paymentStatus: 'en attente' | 'payée' | 'non payée' | 'payée partiellement';
  deliveryStatus: 'en attente' | 'livrée' | 'non livrée';
  partialAmount?: number;
  selected?: boolean;
}

export interface Client {
  id: number;
  name: string;
  phone: string;
  orders: Order[];
}