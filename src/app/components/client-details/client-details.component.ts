import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client, Order, Payment } from '../../models/client.model';
import { ClientService } from '../../services/client.service';
import { Subscription } from 'rxjs';

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

        <div class="payment-section">
          <h4>📝 Enregistrer un Paiement</h4>
          <div class="form-group">
            <label>Date Paiement:</label>
            <input type="date" [(ngModel)]="newPayment.date" class="form-input">
          </div>
          <div class="form-group">
            <label>Montant Payé (DT):</label>
            <input type="number" step="0.01" [(ngModel)]="newPayment.amount" placeholder="Ex: 100" class="form-input">
          </div>
          <button class="add-payment-btn" (click)="addPayment()">💸 Ajouter Paiement</button>
        </div>

        <div class="payment-history">
          <h4>📋 Historique des Paiements</h4>
          <div class="action-buttons">
            <button class="delete-btn" (click)="deleteSelectedItems('payments')" 
                    [disabled]="!hasSelectedPayments()">🗑️ Supprimer Sélectionnés</button>
            <button class="print-btn" (click)="printSelectedPayments()" 
                    [disabled]="!hasSelectedPayments()">🖨️ Imprimer Paiements Sélectionnés</button>
          </div>
          <div class="payment-table-container">
            <table class="payment-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" (change)="toggleSelectAllPayments($event)" 
                           [checked]="allPaymentsSelected">
                  </th>
                  <th>Date</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let payment of client.payments; trackBy: trackByPaymentId">
                  <td>
                    <input type="checkbox" [(ngModel)]="payment.selected" 
                           (change)="updateSelectionsAndTotals()">
                  </td>
                  <td>{{ formatDate(payment.date) }}</td>
                  <td>{{ payment.amount }} DT</td>
                </tr>
              </tbody>
            </table>
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
          <div class="action-buttons">
            <button class="delete-btn" (click)="deleteSelectedItems('orders')" 
                    [disabled]="!hasSelectedOrders()">🗑️ Supprimer Sélectionnés</button>
            <button class="print-btn" (click)="printSelectedOrders()" 
                    [disabled]="!hasSelectedOrders()">🖨️ Imprimer Commandes Sélectionnées</button>
          </div>
          <div class="orders-table-container">
            <table class="orders-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" (change)="toggleSelectAllOrders($event)" 
                           [checked]="allOrdersSelected">
                  </th>
                  <th>Nom</th>
                  <th>Date</th>
                  <th>Prix</th>
                  <th>Statut Livraison</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of client.orders; trackBy: trackByOrderId" class="order-row">
                  <td>
                    <input type="checkbox" [(ngModel)]="order.selected" 
                           (change)="updateSelectionsAndTotals()">
                  </td>
                  <td class="order-type">{{ order.type || 'Commande sans nom' }}</td>
                  <td>{{ formatDate(order.date) }}</td>
                  <td class="price">{{ order.price }} DT</td>
                  <td>
                    <select [(ngModel)]="order.deliveryStatus" 
                            (change)="updateOrderStatus(order)"
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
      z-index: 2000;
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

    .payment-section {
      padding: 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #ecf0f1;
    }

    .payment-section h4 {
      margin: 0 0 15px 0;
      color: #e91e63;
    }

    .payment-history {
      padding: 20px;
      border-bottom: 1px solid #ecf0f1;
    }

    .payment-history h4 {
      margin: 0 0 15px 0;
      color: #e91e63;
    }

    .action-buttons {
      padding: 10px 20px;
      display: flex;
      gap: 15px;
      justify-content: flex-end;
    }

    .payment-table-container {
      max-height: 150px;
      overflow-y: auto;
      border: 1px solid #ecf0f1;
      border-radius: 8px;
    }

    .payment-table {
      width: 100%;
      border-collapse: collapse;
    }

    .payment-table th, .payment-table td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ecf0f1;
    }

    .payment-table th {
      background: #34495e;
      color: white;
    }

    .add-payment-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background-color 0.2s;
    }

    .add-payment-btn:hover {
      background: #2980b9;
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

    .status-select.delivery {
      padding: 6px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.85rem;
      width: 100%;
      max-width: 120px;
      background: #e8f4fd;
    }

    .delete-btn {
      background: #f44336;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background-color 0.2s;
    }

    .delete-btn:hover:not(:disabled) {
      background: #d32f2f;
    }

    .delete-btn:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }

    .print-btn {
      background: #9b59b6;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
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
export class ClientDetailsComponent implements OnInit, OnDestroy {
  @Input() client!: Client;
  @Output() close = new EventEmitter<void>();
  @Output() orderAdded = new EventEmitter<void>();

  totals = { total: 0, paid: 0, remaining: 0 };
  allOrdersSelected = false;
  allPaymentsSelected = false;
  showCustomOrderForm = false;
  customOrder = {
    type: '',
    price: 0,
    deliveryStatus: 'en attente' as 'en attente' | 'livrée' | 'non livrée'
  };
  newPayment: Partial<Payment> = { date: new Date().toISOString().split('T')[0], amount: 0 };
  private clientSubscription!: Subscription;

  constructor(private clientService: ClientService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeSelections();
    this.updateTotals();
    this.clientSubscription = this.clientService.clients$.subscribe(clients => {
      const updatedClient = clients.find(c => c.id === this.client.id);
      if (updatedClient) {
        this.client = { 
          ...updatedClient, 
          orders: [...(updatedClient.orders || [])], 
          payments: [...(updatedClient.payments || [])] 
        };
        console.log(`Updated client orders: ${JSON.stringify(this.client.orders.map(o => ({ id: o.id, type: o.type })))}`); // Debug log
        this.initializeSelections();
        this.updateTotals();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.clientSubscription) {
      this.clientSubscription.unsubscribe();
    }
  }

  trackByOrderId: TrackByFunction<Order> = (index: number, order: Order): number => order.id;
  trackByPaymentId: TrackByFunction<Payment> = (index: number, payment: Payment): number => payment.id;

  private initializeSelections(): void {
    this.client.orders = (this.client.orders || []).map(order => ({
      ...order,
      type: order.type || 'Commande sans nom', // Fallback for empty type
      selected: order.selected ?? false
    }));
    this.client.payments = (this.client.payments || []).map(payment => ({
      ...payment,
      selected: payment.selected ?? false
    }));
    this.checkAllSelected();
    this.cdr.detectChanges();
  }

  onClose(): void {
    this.close.emit();
  }

  addOrder(type: string): void {
    console.log(`Adding order of type: ${type} for client ID: ${this.client.id}`); // Debug log
    this.clientService.addOrder(this.client.id, type);
    this.orderAdded.emit();
    this.initializeSelections();
    this.updateTotals();
  }

  addCustomOrder(): void {
    if (!this.customOrder.type.trim() || this.customOrder.price <= 0) {
      alert('Veuillez remplir le type et un prix valide.');
      return;
    }
    console.log(`Adding custom order: ${JSON.stringify(this.customOrder)}`); // Debug log
    this.clientService.addOrder(this.client.id, this.customOrder.type.trim(), {
      price: this.customOrder.price,
      deliveryStatus: this.customOrder.deliveryStatus
    });
    this.closeCustomOrderForm();
    this.orderAdded.emit();
    this.initializeSelections();
    this.updateTotals();
  }

  closeCustomOrderForm(): void {
    this.showCustomOrderForm = false;
    this.customOrder = {
      type: '',
      price: 0,
      deliveryStatus: 'en attente'
    };
  }

  updateOrderStatus(order: Order): void {
    console.log(`Updating order status: ID ${order.id}, Type ${order.type}, Status ${order.deliveryStatus}`); // Debug log
    this.clientService.updateOrderStatus(this.client.id, order.id, 'deliveryStatus', order.deliveryStatus);
    this.updateTotals();
  }

  updateTotals(): void {
    this.totals = this.clientService.calculateTotals(this.client.orders || [], this.client.payments || []);
    this.checkAllSelected();
    console.log(`Updated totals: ${JSON.stringify(this.totals)}`); // Debug log
    console.log(`Current orders: ${JSON.stringify(this.client.orders.map(o => ({ id: o.id, type: o.type })))}`); // Debug log
    this.cdr.detectChanges();
  }

  addPayment(): void {
    if (!this.newPayment.date || this.newPayment.amount === undefined || this.newPayment.amount <= 0) {
      alert('Veuillez entrer une date valide et un montant positif.');
      return;
    }
    console.log(`Adding payment: Date ${this.newPayment.date}, Amount ${this.newPayment.amount}`); // Debug log
    this.clientService.addPayment(this.client.id, this.newPayment.date, this.newPayment.amount);
    this.newPayment = { date: new Date().toISOString().split('T')[0], amount: 0 };
    this.orderAdded.emit();
    this.initializeSelections();
    this.updateTotals();
  }

  deleteSelectedItems(type: 'orders' | 'payments'): void {
    if (type === 'orders') {
      const selectedOrderIds = this.client.orders.filter(order => order.selected).map(order => order.id);
      if (selectedOrderIds.length === 0) {
        alert('Veuillez sélectionner au moins une commande à supprimer.');
        return;
      }
      console.log(`Deleting orders: ${selectedOrderIds}`); // Debug log
      if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedOrderIds.length} commande(s) ?`)) {
        selectedOrderIds.forEach(id => this.clientService.deleteOrder(this.client.id, id));
        this.orderAdded.emit();
        this.initializeSelections();
        this.updateTotals();
      }
    } else if (type === 'payments') {
      const selectedPaymentIds = this.client.payments.filter(payment => payment.selected).map(payment => payment.id);
      if (selectedPaymentIds.length === 0) {
        alert('Veuillez sélectionner au moins un paiement à supprimer.');
        return;
      }
      console.log(`Deleting payments: ${selectedPaymentIds}`); // Debug log
      if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedPaymentIds.length} paiement(s) ?`)) {
        selectedPaymentIds.forEach(id => this.clientService.deletePayment(this.client.id, id));
        this.orderAdded.emit();
        this.initializeSelections();
        this.updateTotals();
      }
    }
  }

  toggleSelectAllOrders(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.client.orders = this.client.orders.map(order => ({ ...order, selected: checked }));
    this.allOrdersSelected = checked;
    console.log(`Toggle all orders: ${checked}, Orders: ${JSON.stringify(this.client.orders.map(o => ({ id: o.id, type: o.type })))}`); // Debug log
    this.updateTotals();
  }

  toggleSelectAllPayments(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.client.payments = this.client.payments.map(payment => ({ ...payment, selected: checked }));
    this.allPaymentsSelected = checked;
    console.log(`Toggle all payments: ${checked}`); // Debug log
    this.updateTotals();
  }

  updateSelectionsAndTotals(): void {
    this.checkAllSelected();
    this.updateTotals();
  }

  checkAllSelected(): void {
    this.allOrdersSelected = this.client.orders.length > 0 && this.client.orders.every(order => order.selected === true);
    this.allPaymentsSelected = this.client.payments.length > 0 && this.client.payments.every(payment => payment.selected === true);
  }

  hasSelectedOrders(): boolean {
    const hasSelected = this.client.orders.some(order => order.selected && order.deliveryStatus === 'livrée');
    console.log(`Has selected orders: ${hasSelected}`); // Debug log
    return hasSelected;
  }

  hasSelectedPayments(): boolean {
    const hasSelected = this.client.payments.some(payment => payment.selected);
    console.log(`Has selected payments: ${hasSelected}`); // Debug log
    return hasSelected;
  }

  printSelectedOrders(): void {
    const selectedOrders = this.client.orders.filter(order => order.selected && order.deliveryStatus === 'livrée');
    if (selectedOrders.length === 0) {
      alert('Veuillez sélectionner au moins une commande livrée à imprimer.');
      return;
    }
    console.log('Selected orders for printing:', selectedOrders.map(o => ({ id: o.id, type: o.type }))); // Debug log
    try {
      this.generateInvoice(selectedOrders);
      alert('Factures imprimées avec succès !');
      this.initializeSelections();
      this.updateTotals();
    } catch (error) {
      alert('Erreur lors de l\'impression des factures. Vérifiez les paramètres de blocage des pop-ups.');
      console.error('Print error:', error);
    }
  }

  printSelectedPayments(): void {
    const selectedPayments = this.client.payments.filter(payment => payment.selected);
    if (selectedPayments.length === 0) {
      alert('Veuillez sélectionner au moins un paiement à imprimer.');
      return;
    }
    console.log('Selected payments for printing:', selectedPayments); // Debug log
    try {
      this.generatePaymentReceipt(selectedPayments);
      alert('Reçus de paiement imprimés avec succès !');
      this.initializeSelections();
      this.updateTotals();
    } catch (error) {
      alert('Erreur lors de l\'impression des reçus. Vérifiez les paramètres de blocage des pop-ups.');
      console.error('Print error:', error);
    }
  }

  private generateInvoice(orders: Order[]): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez les paramètres de blocage des pop-ups.');
    }
    const invoiceContent = this.createInvoiceHTML(orders);
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  private generatePaymentReceipt(payments: Payment[]): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez les paramètres de blocage des pop-ups.');
    }
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reçu de Paiement - ${this.client.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .client-info { margin-bottom: 20px; }
          .payments-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .payments-table th, .payments-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .payments-table th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; font-size: 1.2em; }
          .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REÇU DE PAIEMENT</h1>
          <p>Date: ${currentDate}</p>
        </div>
        <div class="client-info">
          <h3>Client: ${this.client.name}</h3>
          <p>Téléphone: ${this.client.phone}</p>
        </div>
        <table class="payments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            ${payments.map(payment => `
              <tr>
                <td>${this.formatDate(payment.date)}</td>
                <td>${payment.amount} DT</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          <p>Total Payé: ${totalPaid} DT</p>
        </div>
        <div class="footer">
          <p>Merci pour votre paiement !</p>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.focus();
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
              <th>Statut Livraison</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                <td>${order.type || 'Commande sans nom'}</td>
                <td>${this.formatDate(order.date)}</td>
                <td>${order.price} DT</td>
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