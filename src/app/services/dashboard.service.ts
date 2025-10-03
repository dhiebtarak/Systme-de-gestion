import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClientService } from './client.service';
import { Client, ProductCatalog } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private clientService: ClientService) {}

  getDashboardStats(): Observable<{
    totalRevenue: number;
    totalClients: number;
    pendingOrders: number;
    pendingAmount: number;
    deliveredThisMonth: number;
  }> {
    return combineLatest([
      this.clientService.getClients(),
      this.clientService.getProductCatalog()
    ]).pipe(
      map(([clients, productCatalog]) => {
        const totalClients = clients.length;
        const orders = clients.flatMap(client => client.orders || []);
        const payments = clients.flatMap(client => client.payments || []);
        const totalRevenue = orders.reduce((sum, order) => {
          const product = productCatalog.find(p => p.id === order.productId);
          return product ? sum + (product.price * order.quantity) : sum;
        }, 0);
        const pendingOrders = orders.filter(o => o.status === 'non livree').length;
        const pendingAmount = totalRevenue - payments.reduce((sum, p) => sum + p.amount, 0);
        const deliveredThisMonth = orders.filter(o => {
          const date = new Date(o.production_date);
          const now = new Date();
          return o.status === 'livree' && 
                 date.getMonth() === now.getMonth() && 
                 date.getFullYear() === now.getFullYear();
        }).length;

        return {
          totalRevenue,
          totalClients,
          pendingOrders,
          pendingAmount: Math.max(0, pendingAmount),
          deliveredThisMonth
        };
      })
    );
  }
}