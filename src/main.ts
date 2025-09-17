import { Component, signal, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AuthService } from './app/services/auth.service';
import { LoginComponent } from './app/components/login/login.component';
import { DashboardComponent } from './app/components/dashboard/dashboard.component';
import { EmployeeDashboardComponent } from './app/components/employee-dashboard/employee-dashboard.component';
import { ClientDashboardComponent } from './app/components/client-dashboard/client-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent, DashboardComponent, EmployeeDashboardComponent, ClientDashboardComponent],
  template: `
    <div class="app-container" *ngIf="!isAuthenticated">
      <app-login></app-login>
    </div>

    <div class="app-container" *ngIf="isAuthenticated">
      <header class="app-header">
        <div class="header-content">
          <img src="src/app/logo.jpg" alt="Logo de la marque" class="logo">
          <h1 class="app-title">🌹 Système de Gestion d'atelier de robes</h1>
          <button class="logout-btn" (click)="logout()">
            🚪 Déconnexion
          </button>
        </div>
        <nav class="nav-tabs">
          <button 
            class="nav-tab" 
            [class.active]="activeTab() === 'dashboard'"
            (click)="setActiveTab('dashboard')">
            📊 Tableau de Bord
          </button>
          <button 
            class="nav-tab" 
            [class.active]="activeTab() === 'employees'"
            (click)="setActiveTab('employees')">
            👥 Employés
          </button>
          <button 
            class="nav-tab" 
            [class.active]="activeTab() === 'clients'"
            (click)="setActiveTab('clients')">
            👰 Clients
          </button>
        </nav>
      </header>

      <main class="main-content">
        <app-dashboard *ngIf="activeTab() === 'dashboard'"></app-dashboard>
        <app-employee-dashboard *ngIf="activeTab() === 'employees'"></app-employee-dashboard>
        <app-client-dashboard *ngIf="activeTab() === 'clients'"></app-client-dashboard>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 50%, #e91e63 100%);
      background-attachment: fixed;
    }

    .app-header {
      background: rgba(254, 254, 254, 0.95);
      backdrop-filter: blur(15px);
      box-shadow: 0 4px 20px rgba(233, 30, 99, 0.2);
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .logo {
      height: 60px;
      width: auto;
      margin-right: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(233, 30, 99, 0.2);
    }

    .app-title {
      text-align: center;
      margin: 0;
      color: #880e4f;
      font-size: clamp(1.8rem, 4vw, 2.5rem);
      font-weight: 700;
      flex: 1;
    }

    .logout-btn {
      background: linear-gradient(135deg, #e91e63, #ad1457);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(233, 30, 99, 0.3);
    }

    .logout-btn:hover {
      background: linear-gradient(135deg, #ad1457, #880e4f);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(233, 30, 99, 0.4);
    }

    .nav-tabs {
      display: flex;
      justify-content: center;
      gap: 8px;
      background: rgba(252, 228, 236, 0.3);
      backdrop-filter: blur(10px);
      border-radius: 50px;
      padding: 8px;
      box-shadow: 0 2px 15px rgba(233, 30, 99, 0.1);
    }

    .nav-tab {
      background: #fce4ec;
      border: none;
      padding: 12px 24px;
      border-radius: 50px;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: 600;
      transition: all 0.3s ease;
      color: #880e4f;
      border: 2px solid transparent;
    }

    .nav-tab:hover {
      background: #f8bbd9;
      transform: translateY(-2px);
      border-color: #e91e63;
      color: #880e4f;
      box-shadow: 0 4px 15px rgba(233, 30, 99, 0.2);
    }

    .nav-tab.active {
      background: linear-gradient(135deg, #e91e63, #ad1457);
      color: white;
      box-shadow: 0 4px 15px rgba(233, 30, 99, 0.4);
      border-color: #ad1457;
    }

    .nav-tab.active:hover {
      background: linear-gradient(135deg, #ad1457, #880e4f);
    }

    .main-content {
      padding: 20px 0;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 15px;
      }
      
      .app-title {
        font-size: 1.8rem;
      }
      
      .logo {
        height: 50px;
        margin-right: 0;
      }
      
      .nav-tabs {
        flex-direction: column;
        align-items: center;
        border-radius: 16px;
        padding: 12px;
      }
      
      .nav-tab {
        width: min(250px, 90vw);
        text-align: center;
      }
    }

    @media (max-width: 480px) {
      .app-header {
        padding: 16px;
      }

      .nav-tab {
        width: 100%;
        padding: 10px 16px;
      }

      .logout-btn {
        padding: 10px 16px;
        font-size: 0.9rem;
      }
    }
  `]
})
export class App implements OnInit {
  activeTab = signal<'dashboard' | 'employees' | 'clients'>('dashboard');
  isAuthenticated = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.checkAuthStatus();
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
  }

  setActiveTab(tab: 'dashboard' | 'employees' | 'clients'): void {
    this.activeTab.set(tab);
  }

  logout(): void {
    this.authService.logout();
    this.activeTab.set('dashboard');
  }
}

bootstrapApplication(App);