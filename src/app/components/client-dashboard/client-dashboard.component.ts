import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { Client, Order, Payment } from '../../models/client.model';
import { ClientDetailsComponent } from '../client-details/client-details.component';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ClientDetailsComponent],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h2>👰 Gestion des Clients </h2>
        <button class="add-btn" (click)="showAddForm = !showAddForm">
          ➕ Ajouter Client
        </button>
      </div>
      
      <div class="add-form" *ngIf="showAddForm">
        <h3>Ajouter un Nouveau Client</h3>
        <div class="form-row">
          <input type="text" [(ngModel)]="newClient.name" placeholder="Nom complet" class="form-input">
          <input type="tel" [(ngModel)]="newClient.phone" placeholder="Téléphone" class="form-input">
          <button class="save-btn" (click)="addClient()">💾 Enregistrer</button>
          <button class="cancel-btn" (click)="cancelAdd()">❌ Annuler</button>
        </div>
      </div>

      <div class="table-container">
        <table class="clients-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Commandes</th>
              <th>Total Dû</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let client of clients" class="client-row">
              <td>
                <button class="name-button" (click)="openClientDetails(client)">
                  {{ client.name }}
                </button>
              </td>
              <td>{{ client.phone }}</td>
              <td class="orders-count">{{ client.orders.length }}</td>
              <td class="total-amount">{{ calculateTotalDue(client) }} DT</td>
              <td>
                <button class="edit-btn" (click)="editClient(client)">
                  ✏️ Modifier
                </button>
                <button class="delete-btn" (click)="deleteClient(client.id)">
                  🗑️ Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de modification -->
      <div class="modal-overlay" *ngIf="editingClient" (click)="cancelEdit()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>✏️ Modifier Client</h3>
            <button class="close-btn" (click)="cancelEdit()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nom:</label>
              <input type="text" [(ngModel)]="editForm.name" class="form-input">
            </div>
            <div class="form-group">
              <label>Téléphone:</label>
              <input type="tel" [(ngModel)]="editForm.phone" class="form-input">
            </div>
            <div class="modal-actions">
              <button class="save-btn" (click)="saveClient()">💾 Enregistrer</button>
              <button class="cancel-btn" (click)="cancelEdit()">❌ Annuler</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-client-details
      *ngIf="selectedClient"
      [client]="selectedClient"
      (close)="closeClientDetails()"
      (orderAdded)="onOrderAdded()">
    </app-client-details>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .header h2 {
      color: #880e4f;
      font-size: 2rem;
      margin: 0;
    }

    .add-btn {
      background: linear-gradient(135deg, #4caf50, #388e3c);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .add-btn:hover {
      background: linear-gradient(135deg, #388e3c, #2e7d32);
      transform: translateY(-2px);
    }

    .add-form {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 15px rgba(233, 30, 99, 0.15);
    }

    .add-form h3 {
      color: #880e4f;
      margin-bottom: 15px;
    }

    .form-row {
      display: flex;
      gap: 15px;
      align-items: center;
      flex-wrap: wrap;
    }

    .form-input {
      padding: 10px;
      border: 2px solid #f8bbd9;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
      background: white;
      min-width: 200px;
    }

    .form-input:focus {
      outline: none;
      border-color: #e91e63;
    }

    .save-btn {
      background: linear-gradient(135deg, #4caf50, #388e3c);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .save-btn:hover {
      background: linear-gradient(135deg, #388e3c, #2e7d32);
    }

    .cancel-btn {
      background: linear-gradient(135deg, #f44336, #d32f2f);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .cancel-btn:hover {
      background: linear-gradient(135deg, #d32f2f, #b71c1c);
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #fce4ec;
      background: linear-gradient(135deg, #e91e63, #ad1457);
      color: white;
      border-radius: 12px 12px 0 0;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 5px;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .modal-body {
      padding: 20px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
      color: #880e4f;
    }

    .form-group .form-input {
      width: 100%;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(233, 30, 99, 0.15);
      overflow: hidden;
    }

    .clients-table {
      width: 100%;
      border-collapse: collapse;
    }

    .clients-table th {
      background: linear-gradient(135deg, #e91e63, #ad1457);
      color: white;
      padding: 15px;
      text-align: center;
      font-weight: 600;
    }

    .client-row {
      border-bottom: 1px solid #fce4ec;
      transition: background-color 0.2s;
    }

    .client-row:hover {
      background-color: #fce4ec;
    }

    .client-row td {
      padding: 15px;
      text-align: center;
    }

    .name-button {
      background: none;
      border: none;
      color: #e91e63;
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
      text-decoration: underline;
      transition: color 0.2s;
    }

    .name-button:hover {
      color: #c2185b;
    }

    .orders-count {
      font-weight: 600;
      color: #c2185b;
    }

    .total-amount {
      font-weight: 600;
      color: #880e4f;
      font-size: 1.1rem;
    }

    .edit-btn {
      background: linear-gradient(135deg, #ff9800, #f57c00);
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      margin-right: 5px;
      transition: all 0.3s ease;
    }

    .edit-btn:hover {
      background: linear-gradient(135deg, #f57c00, #ef6c00);
      transform: translateY(-1px);
    }

    .delete-btn {
      background: linear-gradient(135deg, #f44336, #d32f2f);
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.3s ease;
    }

    .delete-btn:hover {
      background: linear-gradient(135deg, #d32f2f, #b71c1c);
      transform: translateY(-1px);
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }
      
      .form-row {
        flex-direction: column;
      }
      
      .form-input {
        width: 100%;
      }
      
      .clients-table {
        font-size: 0.9rem;
      }
      
      .clients-table th,
      .clients-table td {
        padding: 10px 5px;
      }
    }
  `]
})
export class ClientDashboardComponent implements OnInit {
  clients: Client[] = [];
  selectedClient: Client | null = null;
  showAddForm = false;
  editingClient: Client | null = null;
  
  newClient = {
    name: '',
    phone: ''
  };
  
  editForm = {
    name: '',
    phone: ''
  };

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clients = this.clientService.getClients();
  }

  addClient(): void {
    if (this.newClient.name && this.newClient.phone) {
      this.clientService.addClient(this.newClient.name, this.newClient.phone);
      this.cancelAdd();
      this.loadClients();
    } else {
      alert('Veuillez remplir tous les champs.');
    }
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.newClient = { name: '', phone: '' };
  }

  editClient(client: Client): void {
    this.editingClient = client;
    this.editForm = {
      name: client.name,
      phone: client.phone
    };
  }

  saveClient(): void {
    if (this.editingClient && this.editForm.name && this.editForm.phone) {
      this.clientService.updateClient(
        this.editingClient.id,
        this.editForm.name,
        this.editForm.phone
      );
      this.cancelEdit();
      this.loadClients();
    } else {
      alert('Veuillez remplir tous les champs.');
    }
  }

  cancelEdit(): void {
    this.editingClient = null;
    this.editForm = { name: '', phone: '' };
  }

  calculateTotalDue(client: Client): number {
    const totalOrders = client.orders.reduce((sum, order) => sum + order.price, 0);
    const totalPaid = client.payments.reduce((sum, payment) => sum + payment.amount, 0);
    return totalOrders - totalPaid;
  }

  openClientDetails(client: Client): void {
    this.selectedClient = client;
  }

  closeClientDetails(): void {
    this.selectedClient = null;
  }

  deleteClient(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      this.clientService.deleteClient(id);
      this.loadClients();
    }
  }

  onOrderAdded(): void {
    this.loadClients();
  }
}