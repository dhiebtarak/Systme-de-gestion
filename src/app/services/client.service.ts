import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Client, Order, Payment, ProductCatalog } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:5001/api/V1/clients';
  constructor(private http: HttpClient) {}

  // Clients Management
  getClients(): Observable<Client[]> {
    return this.http
      .get<{ status: number; message: string; data: Client[] }>(`${this.apiUrl}`)
      .pipe(map(response => response.data));
  }

  getClientById(clientId: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${clientId}`);
  }

  createClient(phone: string, name: string): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}`, { phone, name });
  }

  updateClient(id: number, phone: string, name: string): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, { phone, name });
  }

  deleteClient(id: number): Observable<void> {
    console.log(`Deleting client with ID: ${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Orders Management
  getOrdersById(clientId: number): Observable<Order[]> {
    return this.http
    .get<{ status: number; message: string; data: Order[]}>(`${this.apiUrl}/${clientId}/orders`)
    .pipe(      
      map(response => response.data),
    );

  }

  

  createOrder(clientId: number, product_name: string, product_price: number,quantity: number, production_date: string, status: 'livree' | 'non livree'): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${clientId}/orders`, { product_name, quantity, product_price,  production_date, status });
  }

  updateOrder(orderId: number,product_name: string ,product_price : number,  quantity: number, production_date: string, status: 'livree' | 'non livree' ): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/orders/${orderId}`, { product_name, quantity, product_price, production_date, status });
  }

  deleteOrder(orderId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/orders/${orderId}`);
  }

  // Payments Management
  getPaymentsById(clientId: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${clientId}/payments`);
  }

  createPayment(clientId: number, payment_date: string, amount: number): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${clientId}/payments`, { payment_date, amount });
  }

  updatePayment(paymentId: number, payment_date: string, amount: number): Observable<Payment> {
    return this.http.put<Payment>(`${this.apiUrl}/payments/${paymentId}`, { payment_date, amount });
  }

  deletePayment(paymentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/payments/${paymentId}`);
  }

// get balance of a client
getClientBalance(clientId: number): Observable<number> {
  return this.http.get<{ status: number; message: string; data: number }>(`${this.apiUrl}/${clientId}/balance`)
    .pipe(
      map(response => response.data) // Extract the balance from the response
    );
}

  // Product Catalog
  getProductCatalog(): Observable<ProductCatalog[]> {
    return this.http
    .get<{ status: number; message: string; data: ProductCatalog[]}>(`http://localhost:5001/api/V1/productcatalog`)
    .pipe(map(response => response.data)
  );
  }
}