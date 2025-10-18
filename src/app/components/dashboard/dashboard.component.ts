import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // Add HttpClientModule
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalRevenue: number = 0; // Temporary value, should come from service
  clientsBalanceOwed: number = 0; // Temporary value, should come from service
  stats: {
    totalClients: number;
    deliveredThisMonth: number;
  } = {
    totalClients: 0,
    deliveredThisMonth: 0
  };
  trend: number = 12; // Temporary value, should come from service
  error: string | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.dashboardService.getDashbordTotalRevenue().subscribe({
      next: (data: number) => {
        this.totalRevenue = data;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement du revenu total:', err);
      }
    });
    this.dashboardService.getClientsBalanceOwed().subscribe({
      next: (data: number) => {
        this.clientsBalanceOwed = data;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement du solde dû des clients:', err);
      }
    });
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.error = null;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques:', err);
        this.error = 'Impossible de charger les statistiques. Veuillez réessayer.';
      }
    });
  }

  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR');
  }

  getCurrentTime(): string {
    return new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateProgress(value: number, max: number): string {
    const percentage = Math.min((value / max) * 100, 100);
    return `${percentage}%`;
  }
}