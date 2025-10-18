import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClientService } from './client.service';
import { Client, Product, ProductCatalog } from '../models/client.model';
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

  getClientsBalanceOwed() : Observable<number> {
    return this.http.get<{ status: number; message: string; data: number }>(`${this.apiUrl}/clients_balance_owed`)
      .pipe(
        map(response => response.data));
  }
  getProducts(): Observable<Product[]> {
    return this.http
      .get<{ status: number; message: string; data: Product[] }>(`http://localhost:5001/api/V1/products`)
      .pipe(map(response => response.data));
  }

  getDashboardStats(): Observable<{
    totalClients: number;
    deliveredThisMonth: number;
  }> {
    return combineLatest([
      this.clientService.getClients(),
      this.getProducts()
    ]).pipe(
      map(([clients, products]) => {
        const totalClients = clients.length;
        const deliveredThisMonth = (products || []).filter((p: Product) => {
          const date = new Date(p.production_date);
          const now = new Date();
          return p.status === 'livree' &&
                 date.getMonth() === now.getMonth() &&
                 date.getFullYear() === now.getFullYear();
        }).length;

        return {
          totalClients,
          deliveredThisMonth
        };
      })
    );
  }
}