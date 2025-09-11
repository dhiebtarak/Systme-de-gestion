import { Injectable } from '@angular/core';
import { EmployeeService } from './employee.service';
import { ClientService } from './client.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private employeeService: EmployeeService,
    private clientService: ClientService
  ) {}

  getDashboardStats() {
    const employees = this.employeeService.getEmployees();
    const clients = this.clientService.getClients();
    
    // Calcul du chiffre d'affaires total
    const totalRevenue = clients.reduce((total, client) => {
      return total + client.orders
        .filter(order => order.paymentStatus === 'payée')
        .reduce((sum, order) => sum + order.price, 0);
    }, 0);

    // Calcul des commandes en attente
    const pendingOrders = clients.reduce((total, client) => {
      return total + client.orders.filter(order => order.paymentStatus !== 'payée').length;
    }, 0);

    // Calcul du montant en attente
    const pendingAmount = clients.reduce((total, client) => {
      return total + client.orders
        .filter(order => order.paymentStatus !== 'payée')
        .reduce((sum, order) => sum + order.price, 0);
    }, 0);

    // Calcul des salaires mensuels totaux
    const now = new Date();
    const totalSalaries = employees.reduce((total, employee) => {
      return total + this.employeeService.calculateMonthlySalary(employee, now.getMonth(), now.getFullYear());
    }, 0);

    // Commandes livrées ce mois
    const deliveredThisMonth = clients.reduce((total, client) => {
      return total + client.orders.filter(order => {
        const orderDate = new Date(order.date);
        return order.deliveryStatus === 'livrée' && 
               orderDate.getMonth() === now.getMonth() && 
               orderDate.getFullYear() === now.getFullYear();
      }).length;
    }, 0);

    return {
      totalRevenue,
      totalClients: clients.length,
      totalEmployees: employees.length,
      pendingOrders,
      pendingAmount,
      totalSalaries,
      deliveredThisMonth,
      netProfit: totalRevenue - totalSalaries
    };
  }
}