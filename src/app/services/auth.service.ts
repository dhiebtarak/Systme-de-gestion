import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private adminCredentials = {
    username: 'admin',
    password: 'admin123'
  };

  login(username: string, password: string): boolean {
    if (username === this.adminCredentials.username && password === this.adminCredentials.password) {
      this.isAuthenticatedSubject.next(true);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('isAuthenticated');
  }

  checkAuthStatus(): void {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    this.isAuthenticatedSubject.next(isAuth);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}