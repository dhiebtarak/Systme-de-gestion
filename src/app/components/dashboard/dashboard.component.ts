import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container fade-in">
      <div class="dashboard-header">
        <div class="header-content">
          <h2 class="gradient-text">Tableau de Bord</h2>
          <p class="subtitle">Vue d'ensemble de votre activité business</p>
        </div>
        <div class="header-decoration"></div>
      </div>
      
      <div class="stats-overview">
        <div class="overview-summary">
          <div class="summary-item">
            <span class="summary-label">Performance Globale</span>
            <div class="summary-indicator excellent"></div>
          </div>
          <div class="summary-item">
            <span class="summary-label">Tendance du Mois</span>
            <span class="summary-trend">↗️ +12%</span>
          </div>
        </div>
      </div>
      
      <div class="stats-grid stagger">
        <div class="stat-card revenue glass-effect hover-lift">
          <div class="card-background"></div>
          <div class="stat-header">
            <div class="stat-icon revenue-icon">💰</div>
            <div class="stat-badge">Total</div>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ formatNumber(stats.totalRevenue) }} <span class="currency">DT</span></h3>
            <p class="stat-label">Chiffre d'Affaires</p>
            <div class="stat-progress">
              <div class="progress-bar" style="width: 85%"></div>
            </div>
          </div>
        </div>
        
        <div class="stat-card clients glass-effect hover-lift">
          <div class="card-background"></div>
          <div class="stat-header">
            <div class="stat-icon clients-icon">👰</div>
            <div class="stat-badge">Actifs</div>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.totalClients }}</h3>
            <p class="stat-label">Clients Total</p>
            <div class="stat-progress">
              <div class="progress-bar" style="width: 70%"></div>
            </div>
          </div>
        </div>
        
        <div class="stat-card pending glass-effect hover-lift">
          <div class="card-background"></div>
          <div class="stat-header">
            <div class="stat-icon pending-icon">⏳</div>
            <div class="stat-badge">En cours</div>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.pendingOrders }}</h3>
            <p class="stat-label">Commandes en Attente</p>
            <div class="stat-progress">
              <div class="progress-bar" style="width: 45%"></div>
            </div>
          </div>
        </div>
        
        <div class="stat-card pending-amount glass-effect hover-lift">
          <div class="card-background"></div>
          <div class="stat-header">
            <div class="stat-icon amount-icon">💸</div>
            <div class="stat-badge">Attente</div>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ formatNumber(stats.pendingAmount) }} <span class="currency">DT</span></h3>
            <p class="stat-label">Montant en Attente</p>
            <div class="stat-progress">
              <div class="progress-bar" style="width: 60%"></div>
            </div>
          </div>
        </div>
        
        <div class="stat-card delivered glass-effect hover-lift">
          <div class="card-background"></div>
          <div class="stat-header">
            <div class="stat-icon delivered-icon">📦</div>
            <div class="stat-badge">Ce mois</div>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.deliveredThisMonth }}</h3>
            <p class="stat-label">Livrées ce Mois</p>
            <div class="stat-progress">
              <div class="progress-bar" style="width: 90%"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-footer">
        <div class="footer-info">
          <span class="last-update">Dernière mise à jour : {{ getCurrentTime() }}</span>
          <div class="status-indicator">
            <div class="status-dot active"></div>
            <span>Système opérationnel</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      min-height: 100vh;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 50px;
      position: relative;
    }

    .header-content {
      position: relative;
      z-index: 2;
    }

    .gradient-text {
      background: linear-gradient(135deg, #8b4d3b, #6b2c1a);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: clamp(2rem, 5vw, 3.5rem);
      margin-bottom: 12px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .subtitle {
      color: #6b2c1a;
      font-size: 1.3rem;
      font-weight: 500;
      opacity: 0.9;
    }

    .header-decoration {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(139, 77, 59, 0.1) 0%, transparent 70%);
      border-radius: 50%;
      z-index: 1;
    }

    .stats-overview {
      background: rgba(244, 241, 236, 0.4);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 30px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .overview-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .summary-label {
      font-weight: 600;
      color: #2c1810;
    }

    .summary-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #4caf50;
      box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
    }

    .summary-trend {
      font-weight: 700;
      color: #4caf50;
      font-size: 1.1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: rgba(244, 241, 236, 0.8);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 28px;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.3);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .card-background {
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100px;
      opacity: 0.05;
      transform: translate(20px, -20px);
      transition: all 0.3s ease;
    }

    .stat-card:hover .card-background {
      transform: translate(10px, -10px) scale(1.1);
      opacity: 0.1;
    }

    .stat-card.revenue .card-background {
      background: radial-gradient(circle, #4caf50 30%, transparent 70%);
    }

    .stat-card.clients .card-background {
      background: radial-gradient(circle, #8b4d3b 30%, transparent 70%);
    }

    .stat-card.pending .card-background {
      background: radial-gradient(circle, #ff9800 30%, transparent 70%);
    }

    .stat-card.pending-amount .card-background {
      background: radial-gradient(circle, #f44336 30%, transparent 70%);
    }

    .stat-card.delivered .card-background {
      background: radial-gradient(circle, #8bc34a 30%, transparent 70%);
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .stat-icon {
      font-size: 2.5rem;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    }

    .stat-badge {
      background: rgba(139, 77, 59, 0.1);
      color: #6b2c1a;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-content {
      position: relative;
      z-index: 2;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 800;
      color: #2c1810;
      margin-bottom: 8px;
      line-height: 1;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .currency {
      font-size: 1.2rem;
      font-weight: 600;
      color: #6b2c1a;
      opacity: 0.8;
    }

    .stat-label {
      color: #6b2c1a;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-progress {
      width: 100%;
      height: 6px;
      background: rgba(139, 77, 59, 0.1);
      border-radius: 10px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #8b4d3b, #6b2c1a);
      border-radius: 10px;
      transition: width 1s ease-in-out;
      box-shadow: 0 0 10px rgba(139, 77, 59, 0.3);
    }

    .dashboard-footer {
      background: rgba(244, 241, 236, 0.3);
      backdrop-filter: blur(15px);
      border-radius: 15px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .footer-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .last-update {
      color: #6b2c1a;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4caf50;
      font-weight: 600;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4caf50;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Animations */
    .fade-in {
      animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .stagger > * {
      opacity: 0;
      animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .stagger > *:nth-child(1) { animation-delay: 0.1s; }
    .stagger > *:nth-child(2) { animation-delay: 0.2s; }
    .stagger > *:nth-child(3) { animation-delay: 0.3s; }
    .stagger > *:nth-child(4) { animation-delay: 0.4s; }
    .stagger > *:nth-child(5) { animation-delay: 0.5s; }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(40px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .hover-lift:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(139, 77, 59, 0.2);
    }

    .glass-effect {
      box-shadow: 0 8px 32px rgba(139, 77, 59, 0.15);
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .stat-card {
        padding: 24px;
      }

      .stat-number {
        font-size: 2rem;
      }

      .overview-summary {
        flex-direction: column;
        align-items: flex-start;
      }

      .footer-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }

    @media (max-width: 480px) {
      .stat-number {
        font-size: 1.8rem;
      }

      .stat-card {
        padding: 20px;
      }

      .gradient-text {
        font-size: 2rem;
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
}