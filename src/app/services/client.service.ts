import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Client, Order, Payment } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private clients: Client[] = [
    {
      id: 1,
      name: 'Leila Mansouri',
      phone: '+216 22 345 678',
      orders: [
        {
          id: 1,
          clientId: 1,
          date: '2025-01-10',
          type: 'Robes',
          price: 500,
          deliveryStatus: 'livrée',
          selected: false  // Initialisé explicitement
        },
        {
          id: 2,
          clientId: 1,
          date: '2025-01-15',
          type: 'Tissu',
          price: 200,
          deliveryStatus: 'en attente',
          selected: false  // Initialisé explicitement
        }
      ],
      payments: [
        {
          id: 1,
          clientId: 1,
          date: '2025-01-10',
          amount: 500,
          selected: false  // Initialisé explicitement
        }
      ]
    },
    {
      id: 2,
      name: 'tarak dhieb',
      phone: '29590495',
      orders: [
        {
          id: 3,
          clientId: 2,
          date: '2025-01-12',
          type: 'Robes',
          price: 500,
          deliveryStatus: 'en attente',
          selected: false  // Initialisé explicitement
        }
      ],
      payments: []
    }
  ];

  private clientsSubject = new BehaviorSubject<Client[]>(this.clients);
  clients$ = this.clientsSubject.asObservable();

  getClients(): Client[] {
    return this.clients.map(client => ({
      ...client,
      orders: client.orders || [],
      payments: client.payments || []
    }));
  }

  deleteClient(id: number): void {
    this.clients = this.clients.filter(client => client.id !== id);
    this.clientsSubject.next(this.clients);
  }

  deleteOrder(clientId: number, orderId: number): void {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      client.orders = client.orders.filter(order => order.id !== orderId);
      this.clientsSubject.next(this.clients);  // Notifier les changements
    }
  }

  addOrder(clientId: number, type: string, options?: { price?: number; deliveryStatus?: string }): void {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      const newOrder: Order = {
        id: Date.now(),
        clientId,
        date: new Date().toISOString().split('T')[0],
        type,
        price: options?.price ?? (type === 'Robes' ? 500 : type === 'Tissu' ? 200 : 0),
        deliveryStatus: (options?.deliveryStatus as 'en attente' | 'livrée' | 'non livrée') ?? 'en attente',
        selected: false  // Initialiser selected
      };
      client.orders.push(newOrder);
      this.clientsSubject.next(this.clients);  // Notifier les changements
    }
  }

  addClient(name: string, phone: string): void {
    const newClient: Client = {
      id: Date.now(),
      name,
      phone,
      orders: [],
      payments: []
    };
    this.clients.push(newClient);
    this.clientsSubject.next(this.clients);
  }

  updateClient(id: number, name: string, phone: string): void {
    const client = this.clients.find(c => c.id === id);
    if (client) {
      client.name = name;
      client.phone = phone;
      this.clientsSubject.next(this.clients);
    }
  }

  updateOrderStatus(clientId: number, orderId: number, field: 'deliveryStatus', status: string): void {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      const order = client.orders.find(o => o.id === orderId);
      if (order) {
        order[field] = status as 'en attente' | 'livrée' | 'non livrée';
        this.clientsSubject.next(this.clients);  // Notifier les changements
      }
    }
  }

  addPayment(clientId: number, date: string, amount: number): void {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      client.payments = client.payments || [];
      const id = client.payments.length > 0 ? Math.max(...client.payments.map(p => p.id)) + 1 : 1;
      const newPayment: Payment = {
        id,
        clientId,
        date,
        amount,
        selected: false  // Initialiser selected
      };
      client.payments.push(newPayment);
      this.clientsSubject.next(this.clients);  // Notifier les changements
    }
  }

  deletePayment(clientId: number, paymentId: number): void {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      client.payments = client.payments.filter(p => p.id !== paymentId);
      this.clientsSubject.next(this.clients);  // Notifier les changements
    }
  }

  calculateTotals(orders: Order[], payments: Payment[]): { total: number; paid: number; remaining: number } {
    const total = orders.reduce((sum, order) => sum + order.price, 0);
    const paid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remaining = Math.max(0, total - paid);  // Plafonner à 0 pour éviter les négatifs
    return { total, paid, remaining };
  }
}