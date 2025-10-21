import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
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