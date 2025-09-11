import { Component, Input, Output, EventEmitter, OnInit, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client, Order } from '../../models/client.model';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>📋 Historique des Commandes - {{ client.name }}</h3>
          <button class="close-btn" (click)="onClose()">✕</button>
        </div>

        <div class="totals-section">
          <div class="total-item">
            <span>💰 Prix Total:</span>
            <span class="value">{{ totals.total }} DT</span>
          </div>
          <div class="total-item">
            <span>✅ Prix Payé:</span>
            <span class="value paid">{{ totals.paid }} DT</span>
          </div>
          <div class="total-item remaining">
            <span>⏳ Reste à Payer:</span>
            <span class="value">{{ totals.remaining }} DT</span>
          </div>
        </div>

        <div class="add-order-section">
          <button class="add-order-btn" (click)="addOrder('Robes')">
            ➕ Ajouter Robe (500 DT)
          </button>
          <button class="add-order-btn tissu" (click)="addOrder('Tissu')">
            ➕ Ajouter Tissu (200 DT)
          </button>
          <button class="add-order-btn custom" (click)="showCustomOrderForm = true">
            ➕ Ajouter Autre
          </button>
        </div>

        <!-- Pop-up pour commande personnalisée -->
        <div class="modal-overlay custom-order-modal" *ngIf="showCustomOrderForm" (click)="closeCustomOrderForm()">
          <div class="modal-content custom-order-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>➕ Nouvelle Commande Personnalisée</h3>
              <button class="close-btn" (click)="closeCustomOrderForm()">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Type de commande:</label>
                <input type="text" [(ngModel)]="customOrder.type" placeholder="Ex: Veste" class="form-input">
              </div>
              <div class="form-group">
                <label>Prix (DT):</label>
                <input type="number" [(ngModel)]="customOrder.price" placeholder="Ex: 300" class="form-input">
              </div>
              <div class="form-group">
                <label>Statut Paiement:</label>
                <select [(ngModel)]="customOrder.paymentStatus" class="form-input">
                  <option value="en attente">En attente</option>
                  <option value="payée">Payée</option>
                  <option value="non payée">Non payée</option>
                  <option value="payée partiellement">Payée partiellement</option>
                </select>
              </div>
              <div class="form-group">
                <label>Statut Livraison:</label>
                <select [(ngModel)]="customOrder.deliveryStatus" class="form-input">
                  <option value="en attente">En attente</option>
                  <option value="livrée">Livrée</option>
                  <option value="non livrée">Non livrée</option>
                </select>
              </div>
              <div class="modal-actions">
                <button class="save-btn" (click)="addCustomOrder()">💾 Enregistrer</button>
                <button class="cancel-btn" (click)="closeCustomOrderForm()">❌ Annuler</button>
              </div>
            </div>
          </div>
        </div>

        <div class="orders-history">
          <div class="orders-table-container">
            <table class="orders-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" (change)="toggleSelectAll($event)" 
                           [checked]="allSelected">
                  </th>
                  <th>Nom</th>
                  <th>Date</th>
                  <th>Prix</th>
                  <th>Statut Paiement</th>
                  <th>Statut Livraison</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of client.orders; trackBy: trackByOrderId" class="order-row">
                  <td>
                    <input type="checkbox" [(ngModel)]="order.selected" 
                           (change)="updateTotals()">
                  </td>
                  <td class="order-type">{{ order.type }}</td>
                  <td>{{ formatDate(order.date) }}</td>
                  <td class="price">{{ order.price }} DT</td>
                  <td>
                    <select [(ngModel)]="order.paymentStatus" 
                            (change)="updateOrderStatus(order, 'paymentStatus')"
                            class="status-select payment">
                      <option value="en attente">En attente</option>
                      <option value="payée">Payée</option>
                      <option value="non payée">Non payée</option>
                      <option value="payée partiellement">Payée partiellement</option>
                    </select>
                  </td>
                  <td>
                    <select [(ngModel)]="order.deliveryStatus" 
                            (change)="updateOrderStatus(order, 'deliveryStatus')"
                            class="status-select delivery">
                      <option value="en attente">En attente</option>
                      <option value="livrée">Livrée</option>
                      <option value="non livrée">Non livrée</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="print-section">
            <button class="print-btn" (click)="printSelectedOrders()" 
                    [disabled]="!hasSelectedOrders()">
              🖨️ Imprimer les Factures Sélectionnées
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
      width: 95%;
      max-width: 1000px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .custom-order-modal {
      z-index: 2000; /* Plus haut pour superposition */
    }

    .custom-order-content {
      max-width: 500px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #ecf0f1;
      background: #e91e63;
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

    .totals-section {
      padding: 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #ecf0f1;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .total-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      font-weight: 600;
    }

    .total-item.remaining {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
    }

    .total-item .value {
      font-size: 1.2rem;
      color: #27ae60;
    }

    .total-item .value.paid {
      color: #3498db;
    }

    .add-order-section {
      padding: 20px;
      display: flex;
      gap: 15px;
      justify-content: center;
      border-bottom: 1px solid #ecf0f1;
    }

    .add-order-btn {
      background: #27ae60;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: background-color 0.2s;
    }

    .add-order-btn:hover {
      background: #229954;
    }

    .add-order-btn.tissu {
      background: #3498db;
    }

    .add-order-btn.tissu:hover {
      background: #2980b9;
    }

    .add-order-btn.custom {
      background: #9b59b6;
    }

    .add-order-btn.custom:hover {
      background: #8e44ad;
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

    .form-input {
      width: 100%;
      padding: 10px;
      border: 2px solid #f8bbd9;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
      background: white;
    }

    .form-input:focus {
      outline: none;
      border-color: #e91e63;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
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

    .orders-history {
      padding: 20px;
    }

    .orders-table-container {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #ecf0f1;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .orders-table {
      width: 100%;
      border-collapse: collapse;
    }

    .orders-table th {
      background: #34495e;
      color: white;
      padding: 12px;
      text-align: left;
      position: sticky;
      top: 0;
      font-size: 0.9rem;
    }

    .order-row {
      border-bottom: 1px solid #ecf0f1;
    }

    .order-row:hover {
      background: #f8f9fa;
    }

    .order-row td {
      padding: 12px;
      font-size: 0.9rem;
    }

    .order-type {
      font-weight: 600;
      color: #e91e63;
    }

    .price {
      font-weight: 600;
      color: #27ae60;
    }

    .status-select {
      padding: 6px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.85rem;
      width: 100%;
      max-width: 120px;
    }

    .status-select.payment {
      background: #e8f5e8;
    }

    .status-select.delivery {
      background: #e8f4fd;
    }

    .print-section {
      text-align: center;
      padding: 20px 0;
    }

    .print-btn {
      background: #9b59b6;
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: 600;
      transition: background-color 0.2s;
    }

    .print-btn:hover:not(:disabled) {
      background: #8e44ad;
    }

    .print-btn:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }
  `]
})
export class ClientDetailsComponent implements OnInit {
  @Input() client!: Client;
  @Output() close = new EventEmitter<void>();
  @Output() orderAdded = new EventEmitter<void>();

  totals = { total: 0, paid: 0, remaining: 0 };
  allSelected = false;
  showCustomOrderForm = false;
  customOrder = {
    type: '',
    price: 0,
    paymentStatus: 'en attente' as 'en attente' | 'payée' | 'non payée' | 'payée partiellement',
    deliveryStatus: 'en attente' as 'en attente' | 'livrée' | 'non livrée'
  };

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.initializeSelections();
    this.updateTotals();
  }

  // TrackBy pour optimiser *ngFor
  trackByOrderId: TrackByFunction<Order> = (index: number, order: Order): any => order.id;

  private initializeSelections(): void {
    if (!this.client?.orders) return;
    this.client.orders.forEach(order => {
      if (order.selected === undefined) {
        order.selected = false;
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  addOrder(type: string): void {
    this.clientService.addOrder(this.client.id, type);
    this.orderAdded.emit();
    this.updateTotals();
  }

  addCustomOrder(): void {
    if (!this.client || !this.customOrder.type.trim() || this.customOrder.price <= 0) {
      alert('Veuillez remplir le type et un prix valide.');
      return;
    }
    this.clientService.addOrder(this.client.id, this.customOrder.type, {
      price: this.customOrder.price,
      paymentStatus: this.customOrder.paymentStatus,
      deliveryStatus: this.customOrder.deliveryStatus
    });
    this.closeCustomOrderForm();
    this.orderAdded.emit();
    this.updateTotals();
  }

  closeCustomOrderForm(): void {
    this.showCustomOrderForm = false;
    this.customOrder = {
      type: '',
      price: 0,
      paymentStatus: 'en attente',
      deliveryStatus: 'en attente'
    };
  }

  updateOrderStatus(order: Order, field: 'paymentStatus' | 'deliveryStatus'): void {
    this.clientService.updateOrderStatus(this.client.id, order.id, field, order[field] as string);
    this.updateTotals();
  }

  updateTotals(): void {
    this.totals = this.clientService.calculateTotals(this.client.orders);
    this.checkAllSelected();
  }

  deleteOrder(orderId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      this.clientService.deleteOrder(this.client.id, orderId);
      this.updateTotals();
      this.orderAdded.emit();
    }
  }

  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    this.client.orders.forEach(order => order.selected = checked);
    this.allSelected = checked;
  }

  checkAllSelected(): void {
    this.allSelected = this.client.orders.length > 0 && 
                      this.client.orders.every(order => order.selected);
  }

  hasSelectedOrders(): boolean {
    return this.client.orders.some(order => order.selected);
  }

  printSelectedOrders(): void {
    const selectedOrders = this.client.orders.filter(order => order.selected);
    
    if (selectedOrders.length === 0) {
      alert('Veuillez sélectionner au moins une commande à imprimer.');
      return;
    }

    try {
      this.generateInvoice(selectedOrders);
      
      // Marquer les commandes sélectionnées comme payées
      const selectedOrderIds = selectedOrders.map(order => order.id);
      this.clientService.markOrdersAsPaid(this.client.id, selectedOrderIds);
      
      // Désélectionner toutes les commandes
      this.client.orders.forEach(order => order.selected = false);
      this.allSelected = false;
      
      this.updateTotals();
      this.orderAdded.emit();
      
      alert('Factures imprimées avec succès ! Les commandes ont été marquées comme payées.');
    } catch (error) {
      alert('Erreur lors de l\'impression des factures. Veuillez réessayer.');
      console.error('Erreur d\'impression:', error);
    }
  }

  private generateInvoice(orders: Order[]): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Impossible d\'ouvrir la fenêtre d\'impression');
    }

    const invoiceContent = this.createInvoiceHTML(orders);
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.print();
  }

  private createInvoiceHTML(orders: Order[]): string {
    const total = orders.reduce((sum, order) => sum + order.price, 0);
    const currentDate = new Date().toLocaleDateString('fr-FR');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture - ${this.client.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .client-info { margin-bottom: 20px; }
          .orders-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .orders-table th, .orders-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .orders-table th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; font-size: 1.2em; }
          .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FACTURE</h1>
          <p>Date: ${currentDate}</p>
        </div>
        
        <div class="client-info">
          <h3>Client: ${this.client.name}</h3>
          <p>Téléphone: ${this.client.phone}</p>
        </div>
        
        <table class="orders-table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Date</th>
              <th>Prix</th>
              <th>Statut Paiement</th>
              <th>Statut Livraison</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                <td>${order.type}</td>
                <td>${this.formatDate(order.date)}</td>
                <td>${order.price} DT</td>
                <td>${order.paymentStatus}</td>
                <td>${order.deliveryStatus}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          <p>Total: ${total} DT</p>
        </div>
        
        <div class="footer">
          <p>Merci pour votre confiance !</p>
        </div>
      </body>
      </html>
    `;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }
}