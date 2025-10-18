import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClientService } from './client.service';
import { Client, ProductCatalog } from '../models/client.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:5001/api/V1/dashboard';
  constructor(private http: HttpClient, private clientService: ClientService) {}
  // Dashboard Statistics
  getDashbordTotalRevenue(): Observable<number> {
    return this.http.get<{ status: number; message: string; data: number }>(`${this.apiUrl}/total_revenue`)
      .pipe(
        map(response => response.data));
  }

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