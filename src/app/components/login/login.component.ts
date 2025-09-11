import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>🌹 Système de Gestion</h1>
          <p>Connexion Administrateur</p>
        </div>
        
        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="form-group">
            <label for="username">👤 Nom d'utilisateur</label>
            <input 
              type="text" 
              id="username"
              [(ngModel)]="credentials.username" 
              name="username"
              class="form-input"
              placeholder="Entrez votre nom d'utilisateur"
              required>
          </div>
          
          <div class="form-group">
            <label for="password">🔒 Mot de passe</label>
            <input 
              type="password" 
              id="password"
              [(ngModel)]="credentials.password" 
              name="password"
              class="form-input"
              placeholder="Entrez votre mot de passe"
              required>
          </div>
          
          <button type="submit" class="login-btn">
            Se connecter
          </button>
          
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </form>
        
        <div class="login-info">
          <p><strong>Identifiants par défaut :</strong></p>
          <p>Utilisateur: admin</p>
          <p>Mot de passe: admin123</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 50%, #e91e63 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(233, 30, 99, 0.3);
      width: 100%;
      max-width: 400px;
      text-align: center;
    }

    .login-header h1 {
      color: #e91e63;
      font-size: 2.5rem;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .login-header p {
      color: #ad1457;
      font-size: 1.2rem;
      margin-bottom: 30px;
    }

    .login-form {
      text-align: left;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #880e4f;
      font-weight: 600;
      font-size: 1rem;
    }

    .form-input {
      width: 100%;
      padding: 15px;
      border: 2px solid #f8bbd9;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: #fce4ec;
    }

    .form-input:focus {
      outline: none;
      border-color: #e91e63;
      background: white;
      box-shadow: 0 0 10px rgba(233, 30, 99, 0.2);
    }

    .login-btn {
      width: 100%;
      background: linear-gradient(135deg, #e91e63, #ad1457);
      color: white;
      border: none;
      padding: 15px;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 10px;
    }

    .login-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(233, 30, 99, 0.3);
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 10px;
      border-radius: 8px;
      margin-top: 15px;
      border: 1px solid #ef9a9a;
      text-align: center;
    }

    .login-info {
      margin-top: 30px;
      padding: 20px;
      background: #fce4ec;
      border-radius: 10px;
      border: 1px solid #f8bbd9;
    }

    .login-info p {
      margin: 5px 0;
      color: #880e4f;
      font-size: 0.9rem;
    }

    .login-info p:first-child {
      font-weight: 600;
      margin-bottom: 10px;
    }
  `]
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };
  
  errorMessage = '';

  constructor(private authService: AuthService) {}

  onLogin(): void {
    const success = this.authService.login(this.credentials.username, this.credentials.password);
    
    if (!success) {
      this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
    }
  }
}