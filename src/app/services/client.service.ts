import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Client, Order } from '../models/client.model';

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
          paymentStatus: 'payée',
          deliveryStatus: 'livrée',
          partialAmount: 0
        },
        {
          id: 2,
          clientId: 1,
          date: '2025-01-15',
          type: 'Tissu',
          price: 200,
          paymentStatus: 'non payée',
          deliveryStatus: 'en attente',
          partialAmount: 0
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
          paymentStatus: 'en attente',
          deliveryStatus: 'en attente',
          partialAmount: 0
        }
      ]
    }
  ];

  private clientsSubject = new BehaviorSubject<Client[]>(this.clients);
  clients$ = this.clientsSubject.asObservable();

  getClients(): Client[] {
    return this.clients;
  }

  deleteClient(id: number): void {
    this.clients = this.clients.filter(client => client.id !== id);
    this.clientsSubject.next(this.clients);
  }

  deleteOrder(clientId: number, orderId: number): void {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      client.orders = client.orders.filter(order => order.id !== orderId);
      this.clientsSubject.next(this.clients);
    }
  }

  addOrder(clientId: number, type: string, options?: { price?: number; paymentStatus?: string; deliveryStatus?: string }): void {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      const newOrder: Order = {
        id: Date.now(),
        clientId,
        date: '2025-09-11', // Date actuelle
        type,
        price: options?.price ?? (type === 'Robes' ? 500 : type === 'Tissu' ? 200 : 0),
        paymentStatus: (options?.paymentStatus as 'en attente' | 'payée' | 'non payée' | 'payée partiellement') ?? 'en attente',
        deliveryStatus: (options?.deliveryStatus as 'en attente' | 'livrée' | 'non livrée') ?? 'en attente',
        partialAmount: 0
      };
      client.orders.push(newOrder);
      this.clientsSubject.next(this.clients);
    }
  }

  addClient(name: string, phone: string): void {
    const newClient: Client = {
      id: Date.now(),
      name,
      phone,
      orders: []
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

  updateOrderStatus(clientId: number, orderId: number, field: 'paymentStatus' | 'deliveryStatus', status: string): void {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      const order = client.orders.find(o => o.id === orderId);
      if (order) {
        (order as any)[field] = status;
        this.clientsSubject.next(this.clients);
      }
    }
  }

  updateOrderPartialPayment(clientId: number, orderId: number, partialAmount: number): void {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      const order = client.orders.find(o => o.id === orderId);
      if (order) {
        order.partialAmount = partialAmount;
        this.clientsSubject.next(this.clients);
      }
    }
  }

  markOrdersAsPaid(clientId: number, orderIds: number[]): void {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      client.orders.forEach(order => {
        if (orderIds.includes(order.id)) {
          order.paymentStatus = 'payée';
        }
      });
      this.clientsSubject.next(this.clients);
    }
  }

  calculateTotals(orders: Order[]): { total: number; paid: number; remaining: number } {
    const total = orders.reduce((sum, order) => sum + order.price, 0);
    const paid = orders.reduce((sum, order) => {
      if (order.paymentStatus === 'payée') {
        return sum + order.price;
      } else if (order.paymentStatus === 'payée partiellement') {
        return sum + (order.partialAmount || 0);
      }
      return sum;
    }, 0);
    const remaining = total - paid;
    
    return { total, paid, remaining };
  }
}