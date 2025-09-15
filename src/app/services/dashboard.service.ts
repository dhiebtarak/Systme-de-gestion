import { Injectable } from '@angular/core';
import { ClientService } from './client.service';
import { Client, Order } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private clientService: ClientService) {}

  getDashboardStats(): {
    totalRevenue: number;
    totalClients: number;
    pendingOrders: number;
    pendingAmount: number;
    deliveredThisMonth: number;
  } {
    const clients = this.clientService.getClients();
    
    const totalRevenue = clients
      .flatMap(client => client.orders || [])
      .reduce((sum, order) => sum + order.price, 0);

    const totalClients = clients.length;

    const pendingOrders = clients
      .flatMap(client => client.orders || [])
      .filter(order => order.deliveryStatus === 'en attente')
      .length;

    const pendingAmount = clients
      .flatMap(client => {
        const totalPaid = (client.payments || []).reduce((sum, payment) => sum + payment.amount, 0);
        const totalOrderPrice = (client.orders || []).reduce((sum, order) => sum + order.price, 0);
        return totalPaid < totalOrderPrice ? totalOrderPrice - totalPaid : 0;
      })
      .reduce((sum, amount) => sum + amount, 0);

    const deliveredThisMonth = clients
      .flatMap(client => client.orders || [])
      .filter(order => {
        const orderDate = new Date(order.date);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return (
          order.deliveryStatus === 'livrée' &&
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        );
      })
      .length;

    return {
      totalRevenue,
      totalClients,
      pendingOrders,
      pendingAmount,
      deliveredThisMonth
    };
  }
}