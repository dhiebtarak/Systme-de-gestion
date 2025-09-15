import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h2>📊 Tableau de Bord</h2>
        <p>Vue d'ensemble de votre activité</p>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card revenue">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>{{ stats.totalRevenue }} DT</h3>
            <p>Chiffre d'Affaires</p>
          </div>
        </div>
        
        <div class="stat-card clients">
          <div class="stat-icon">👰</div>
          <div class="stat-content">
            <h3>{{ stats.totalClients }}</h3>
            <p>Clients Total</p>
          </div>
        </div>
        
        <div class="stat-card pending">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3>{{ stats.pendingOrders }}</h3>
            <p>Commandes en Attente</p>
          </div>
        </div>
        
        <div class="stat-card pending-amount">
          <div class="stat-icon">💸</div>
          <div class="stat-content">
            <h3>{{ stats.pendingAmount }} DT</h3>
            <p>Montant en Attente</p>
          </div>
        </div>
        
        <div class="stat-card delivered">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <h3>{{ stats.deliveredThisMonth }}</h3>
            <p>Livrées ce Mois</p>
          </div>
        </div>
      </div>
      
      <div class="quick-actions">
        <h3>🚀 Actions Rapides</h3>
        <div class="actions-grid">
          <div class="action-card">
            <div class="action-icon">👰</div>
            <h4>Gestion Clients</h4>
            <p>Commandes et facturations</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .dashboard-header h2 {
      color: #880e4f;
      font-size: 2.5rem;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .dashboard-header p {
      color: #ad1457;
      font-size: 1.2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: white;
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 8px 25px rgba(233, 30, 99, 0.15);
      display: flex;
      align-items: center;
      gap: 20px;
      transition: all 0.3s ease;
      border-left: 5px solid;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(233, 30, 99, 0.25);
    }

    .stat-card.revenue { border-left-color: #4caf50; }
    .stat-card.clients { border-left-color: #e91e63; }
    .stat-card.pending { border-left-color: #ff9800; }
    .stat-card.pending-amount { border-left-color: #f44336; }
    .stat-card.delivered { border-left-color: #8bc34a; }

    .stat-icon {
      font-size: 3rem;
      opacity: 0.8;
    }

    .stat-content h3 {
      font-size: 2rem;
      font-weight: 700;
      color: #880e4f;
      margin-bottom: 5px;
    }

    .stat-content p {
      color: #ad1457;
      font-size: 1rem;
      font-weight: 500;
    }

    .quick-actions {
      background: white;
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 8px 25px rgba(233, 30, 99, 0.15);
    }

    .quick-actions h3 {
      color: #880e4f;
      font-size: 1.8rem;
      margin-bottom: 20px;
      text-align: center;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .action-card {
      background: linear-gradient(135deg, #fce4ec, #f8bbd9);
      border-radius: 12px;
      padding: 25px;
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
      border: 2px solid transparent;
    }

    .action-card:hover {
      transform: translateY(-3px);
      border-color: #e91e63;
      box-shadow: 0 10px 20px rgba(233, 30, 99, 0.2);
    }

    .action-icon {
      font-size: 3rem;
      margin-bottom: 15px;
    }

    .action-card h4 {
      color: #880e4f;
      font-size: 1.3rem;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .action-card p {
      color: #ad1457;
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: {
    totalRevenue: number;
    totalClients: number;
    pendingOrders: number;
    pendingAmount: number;
    deliveredThisMonth: number;
  } = {
    totalRevenue: 0,
    totalClients: 0,
    pendingOrders: 0,
    pendingAmount: 0,
    deliveredThisMonth: 0
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.stats = this.dashboardService.getDashboardStats();
  }
}