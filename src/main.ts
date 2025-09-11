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
          <h1>🌹 Système de Gestion de robes </h1>
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
    }

    .app-header {
      background: white;
      box-shadow: 0 4px 20px rgba(233, 30, 99, 0.2);
      padding: 20px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .header-content h1 {
      text-align: center;
      margin: 0;
      color: #880e4f;
      font-size: 2.5rem;
      font-weight: 700;
      flex: 1;
    }

    .logout-btn {
      background: linear-gradient(135deg, #f44336, #d32f2f);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .logout-btn:hover {
      background: linear-gradient(135deg, #d32f2f, #b71c1c);
      transform: translateY(-2px);
    }

    .nav-tabs {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .nav-tab {
      background: #fce4ec;
      border: none;
      padding: 12px 24px;
      border-radius: 25px;
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
    }

    .nav-tab.active {
      background: linear-gradient(135deg, #e91e63, #ad1457);
      color: white;
      box-shadow: 0 4px 15px rgba(233, 30, 99, 0.4);
      border-color: #ad1457;
    }

    .main-content {
      padding: 20px 0;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 15px;
      }
      
      .header-content h1 {
        font-size: 2rem;
      }
      
      .nav-tabs {
        flex-direction: column;
        align-items: center;
      }
      
      .nav-tab {
        width: 200px;
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
