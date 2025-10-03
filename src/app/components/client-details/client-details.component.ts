import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Client, Order, Payment, ProductCatalog } from '../../models/client.model';
import { ClientService } from '../../services/client.service';
import { Subscription } from 'rxjs';

// Extended interfaces to include editing state
interface EditableOrder extends Order {
  isEditing?: boolean;
  editData?: {
    productName: string;
    productPrice: number;
    quantity: number;
    production_date: string;
    status: 'livree' | 'non livree';
  };
  originalData?: {
    productName: string;
    productPrice: number;
    quantity: number;
    production_date: string;
    status: 'livree' | 'non livree';
  };
}

interface EditablePayment extends Payment {
  isEditing?: boolean;
  editData?: {
    payment_date: string;
    amount: number;
  };
  originalData?: {
    payment_date: string;
    amount: number;
  };
}

// Extended client interface
interface EditableClient extends Omit<Client, 'orders' | 'payments'> {
  orders: EditableOrder[];
  payments: EditablePayment[];
}

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.css']
})
export class ClientDetailsComponent implements OnInit, OnDestroy {
  @Input() client!: EditableClient;
  @Input() productCatalog: ProductCatalog[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() orderAdded = new EventEmitter<void>();

  totals = { total: 0, paid: 0, remaining: 0 };
  allOrdersSelected = false;
  allPaymentsSelected = false;

  newOrder: Partial<Order> = { productId: 0, quantity: 1, production_date: new Date().toISOString().split('T')[0], status: 'non livree' };
  newPayment: Partial<Payment> = { payment_date: new Date().toISOString().split('T')[0], amount: 0 };

  showCustomOrderForm = false;
  customOrder: { productName: string; price: number; quantity: number; status: 'livree' | 'non livree' } = { productName: '', price: 0, quantity: 1, status: 'non livree' };

  private refreshSubscription?: Subscription;

  constructor(private clientService: ClientService, private cdr: ChangeDetectorRef) {}

  trackByOrderId: TrackByFunction<EditableOrder> = (index, order) => order.id;
  trackByPaymentId: TrackByFunction<EditablePayment> = (index, payment) => payment.id;

  // Modified to properly refresh data
  loadOrdersAndPayments(): void {
    if (!this.client?.id) {
      console.error('No client ID available');
      return;
    }
    console.log('Loading orders and payments for client ID:', this.client.id);
  
    this.clientService.getOrdersById(this.client.id).subscribe({
      next: (response: any) => {
        console.log('Raw API response:', response);
        const orderArray = response?.data ?? response ?? [];
        this.client.orders = orderArray.map((ords: any) => ({
          id: ords.id,
          clientId: ords.client_id,
          productId: ords.product_id,
          quantity: ords.quantity,
          production_date: ords.production_date,
          status: ords.status,
          productName: ords.product_name || ords.productName || 'Produit inconnu',
          productPrice: parseFloat(ords.product_price || ords.productPrice || '0') || 0,
          selected: false,
          isEditing: false
        }));
        console.log('Orders loaded:', this.client.orders);
        console.log('status:', this.client.orders.map(o => o.status));
        console.log(`Loaded ${this.client.orders.length} orders for client ${this.client.id}`);
        this.updateTotals();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(`Error loading orders for client ${this.client.id}:`, error);
        this.client.orders = [];
        this.updateTotals();
      }
    });
  
    this.clientService.getPaymentsById(this.client.id).subscribe({
      next: (response: any) => {
        console.log('Raw payments API response:', response);
        const paymentsArray = response?.data ?? response ?? [];
        this.client.payments = paymentsArray.map((payment: any) => ({
          id: payment.id,
          clientId: payment.client_id,
          payment_date: payment.payment_date,
          amount: parseFloat(payment.amount?.toString() || '0') || 0,
          selected: false,
          isEditing: false
        }));
        console.log('Payments loaded:', this.client.payments);
        this.updateTotals();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(`Error loading payments for client ${this.client.id}:`, error);
        this.client.payments = [];
        this.updateTotals();
      }
    });
  }

  ngOnInit(): void {
    if (!this.client) {
      console.error('Client input is required');
      return;
    }
    if (!this.client.orders) {
      this.client.orders = [];
    }
    if (!this.client.payments) {
      this.client.payments = [];
    }
    this.loadOrdersAndPayments();
    this.updateTotals();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  refreshData(): void {
    this.loadOrdersAndPayments();
    this.updateTotals();
    this.cdr.detectChanges();
  }

  // ---------------- Order Edit Methods ----------------
  startEditOrder(order: EditableOrder): void {
    order.originalData = {
      productName: order.productName || '',
      productPrice: order.productPrice,
      quantity: order.quantity,
      production_date: order.production_date,
      status: order.status
    };

    order.editData = {
      productName: order.productName || '',
      productPrice: order.productPrice,
      quantity: order.quantity,
      production_date: order.production_date,
      status: order.status
    };

    order.isEditing = true;
  }

  updateOrder(order: EditableOrder): void {
    if (!order.id || !order.editData) return;

    if (!order.editData.productName || order.editData.productPrice <= 0 || order.editData.quantity <= 0) {
      alert('Veuillez entrer des valeurs valides pour tous les champs.');
      return;
    }

    this.clientService.updateOrder(
      order.id,
      order.editData.productName,
      order.editData.productPrice,
      order.editData.quantity,
      order.editData.production_date,
      order.editData.status
    ).subscribe({
      next: () => {
        order.productName = order.editData!.productName;
        order.productPrice = order.editData!.productPrice;
        order.quantity = order.editData!.quantity;
        order.production_date = order.editData!.production_date;
        order.status = order.editData!.status;

        order.isEditing = false;
        order.editData = undefined;
        order.originalData = undefined;

        this.updateTotals();
        this.orderAdded.emit();
        console.log('Commande mise à jour avec succès');
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de la commande:', err);
        alert('Erreur lors de la mise à jour de la commande');
      }
    });
  }

  cancelEditOrder(order: EditableOrder): void {
    if (order.originalData) {
      order.productName = order.originalData.productName;
      order.productPrice = order.originalData.productPrice;
      order.quantity = order.originalData.quantity;
      order.production_date = order.originalData.production_date;
      order.status = order.originalData.status;
    }

    order.isEditing = false;
    order.editData = undefined;
    order.originalData = undefined;
  }

  // ---------------- Payment Edit Methods ----------------
  startEditPayment(payment: EditablePayment): void {
    payment.originalData = {
      payment_date: payment.payment_date,
      amount: payment.amount
    };

    payment.editData = {
      payment_date: payment.payment_date,
      amount: payment.amount
    };

    payment.isEditing = true;
  }

  updatePayment(payment: EditablePayment): void {
    if (!payment.id || !payment.editData) return;

    if (!payment.editData.payment_date || payment.editData.amount <= 0) {
      alert('Veuillez entrer une date valide et un montant positif.');
      return;
    }

    this.clientService.updatePayment(
      payment.id,
      payment.editData.payment_date,
      payment.editData.amount
    ).subscribe({
      next: () => {
        payment.payment_date = payment.editData!.payment_date;
        payment.amount = payment.editData!.amount;

        payment.isEditing = false;
        payment.editData = undefined;
        payment.originalData = undefined;

        this.updateTotals();
        this.orderAdded.emit();
        console.log('Paiement mis à jour avec succès');
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du paiement:', err);
        alert('Erreur lors de la mise à jour du paiement');
      }
    });
  }

  cancelEditPayment(payment: EditablePayment): void {
    if (payment.originalData) {
      payment.payment_date = payment.originalData.payment_date;
      payment.amount = payment.originalData.amount;
    }

    payment.isEditing = false;
    payment.editData = undefined;
    payment.originalData = undefined;
  }

  // ---------------- Existing Orders Methods ----------------
  addPredefinedOrder(type: string): void {
    const product = this.productCatalog.find(p => p.name === type);
    if (!product) {
      alert('Produit non trouvé.');
      return;
    }
    this.clientService.createOrder(
      this.client.id,
      product.name,
      product.price,
      1,
      new Date().toISOString().split('T')[0],
      'non livree'
    ).subscribe({
      next: () => {
        this.orderAdded.emit();
        this.refreshData();
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout de la commande:', err);
        alert('Erreur lors de l\'ajout de la commande');
      }
    });
  }

  addOrder(): void {
    if (!this.newOrder.productId || !this.newOrder.quantity || this.newOrder.quantity <= 0) {
      alert('Veuillez choisir un produit et une quantité valide.');
      return;
    }

    this.clientService.createOrder(
      this.client.id,
      this.newOrder.productName || "Produit inconnu",
      this.newOrder.productId!,
      this.newOrder.quantity!,
      this.newOrder.production_date!,
      this.newOrder.status as 'livree' | 'non livree'
    ).subscribe({
      next: () => {
        this.orderAdded.emit();
        this.resetNewOrder();
        this.refreshData();
      },
      error: (err) => {
        console.error('Erreur lors de la création de la commande:', err);
        alert('Erreur lors de la création de la commande');
      }
    });
  }

  updateOrderStatus(order: EditableOrder): void {
    if (!order.id) return;

    this.clientService.updateOrder(
      order.id,
      order.productName || "Produit inconnu",
      order.productPrice,
      order.quantity,
      order.production_date,
      order.status
    ).subscribe({
      next: () => {
        this.refreshData();
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du statut de la commande:', err);
        alert('Erreur lors de la mise à jour du statut');
      }
    });
  }

  deleteOrder(orderId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      this.clientService.deleteOrder(orderId).subscribe({
        next: () => {
          this.orderAdded.emit();
          this.refreshData();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la commande:', err);
          alert('Erreur lors de la suppression de la commande');
        }
      });
    }
  }

  deleteSelectedItems(type: 'orders' | 'payments'): void {
    const items = type === 'orders' ? this.client.orders : this.client.payments;
    const selectedItems = items?.filter(item => item.selected) || [];

    if (selectedItems.length === 0) {
      alert('Aucun élément sélectionné.');
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer les ${selectedItems.length} éléments sélectionnés ?`)) {
      const deleteObservables = selectedItems.map(item => 
        type === 'orders' ? this.clientService.deleteOrder(item.id) : this.clientService.deletePayment(item.id)
      );

      import('rxjs').then(rxjs => {
        rxjs.forkJoin(deleteObservables).subscribe({
          next: () => {
            this.orderAdded.emit();
            this.allOrdersSelected = false;
            this.allPaymentsSelected = false;
            this.refreshData();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression des éléments:', err);
            alert('Erreur lors de la suppression des éléments');
          }
        });
      });
    }
  }

  // ---------------- Payments Methods ----------------
  addPayment(): void {
    if (!this.newPayment.payment_date || !this.newPayment.amount || this.newPayment.amount <= 0) {
      alert('Veuillez entrer une date valide et un montant positif.');
      return;
    }

    this.clientService.createPayment(
      this.client.id,
      this.newPayment.payment_date!,
      this.newPayment.amount!
    ).subscribe({
      next: () => {
        this.orderAdded.emit();
        this.resetNewPayment();
        this.refreshData();
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout du paiement:', err);
        alert('Erreur lors de l\'ajout du paiement');
      }
    });
  }

  deletePayment(paymentId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      this.clientService.deletePayment(paymentId).subscribe({
        next: () => {
          this.orderAdded.emit();
          this.refreshData();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du paiement:', err);
          alert('Erreur lors de la suppression du paiement');
        }
      });
    }
  }

  // ---------------- Custom Orders ----------------
  addCustomOrder(): void {
    if (!this.customOrder.productName || !this.customOrder.price || this.customOrder.price <= 0) {
      alert('Veuillez entrer un type de commande et un prix valide.');
      return;
    }

    this.clientService.createOrder(
      this.client.id,
      this.customOrder.productName,
      this.customOrder.price,
      this.customOrder.quantity,
      new Date().toISOString().split('T')[0],
      this.customOrder.status
    ).subscribe({
      next: () => {
        this.orderAdded.emit();
        this.closeCustomOrderForm();
        this.refreshData();
      },
      error: (err) => {
        console.error('Erreur lors de la création de la commande personnalisée:', err);
        alert('Erreur lors de la création de la commande personnalisée');
      }
    });
  }

  // ---------------- Print Methods ----------------
  printSelectedOrders(): void {
    const selectedOrders = this.client.orders?.filter(order => order.selected) || [];
    if (selectedOrders.length === 0) {
      alert('Aucune commande sélectionnée pour impression.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez les paramètres de votre navigateur.');
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Impression des Commandes - ${this.client.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Commandes de ${this.client.name}</h1>
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Prix Unitaire</th>
                <th>Quantité</th>
                <th>Date</th>
                <th>Prix Total</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${selectedOrders.map(order => `
                <tr>
                  <td>${order.productName || this.getProductName(order.productId)}</td>
                  <td>${order.productPrice || this.getProductPrice(order.productId)} DT</td>
                  <td>${order.quantity}</td>
                  <td>${this.formatDate(order.production_date)}</td>
                  <td>${(order.productPrice || this.getProductPrice(order.productId)) * order.quantity} DT</td>
                  <td>${order.status === 'livree' ? 'Livrée' : 'Non livrée'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p class="total">Total: ${selectedOrders.reduce((sum, order) => sum + (order.productPrice || this.getProductPrice(order.productId)) * order.quantity, 0)} DT</p>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  printSelectedPayments(): void {
    const selectedPayments = this.client.payments?.filter(payment => payment.selected) || [];
    if (selectedPayments.length === 0) {
      alert('Aucun paiement sélectionné pour impression.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez les paramètres de votre navigateur.');
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Impression des Paiements - ${this.client.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Paiements de ${this.client.name}</h1>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              ${selectedPayments.map(payment => `
                <tr>
                  <td>${this.formatDate(payment.payment_date)}</td>
                  <td>${payment.amount} DT</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p class="total">Total Payé: ${selectedPayments.reduce((sum, payment) => sum + payment.amount, 0)} DT</p>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  // ---------------- Helper methods ----------------
  resetNewOrder(): void {
    this.newOrder = { productId: 0, quantity: 1, production_date: new Date().toISOString().split('T')[0], status: 'non livree' };
  }

  resetNewPayment(): void {
    this.newPayment = { payment_date: new Date().toISOString().split('T')[0], amount: 0 };
  }

  closeCustomOrderForm(): void {
    this.showCustomOrderForm = false;
    this.customOrder = { productName: '', quantity: 1, price: 0, status: 'non livree' };
  }

  calculateTotals(orders: EditableOrder[], payments: EditablePayment[]): { total: number; paid: number; remaining: number } {
    const total = orders.reduce((sum, order) => sum + order.productPrice * order.quantity, 0);
    const paid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remaining = Math.max(0, total - paid);
    return { total, paid, remaining };
  }

  updateTotals(): void {
    this.totals = this.calculateTotals(this.client.orders || [], this.client.payments || []);
    this.cdr.markForCheck();
  }

  updateSelectionsAndTotals(): void {
    this.allOrdersSelected = this.client.orders?.every(order => order.selected) || false;
    this.allPaymentsSelected = this.client.payments?.every(payment => payment.selected) || false;
    this.updateTotals();
  }

  hasSelectedPayments(): boolean {
    return this.client.payments?.some(payment => payment.selected) || false;
  }

  hasSelectedOrders(): boolean {
    return this.client.orders?.some(order => order.selected) || false;
  }

  toggleSelectAllPayments(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.allPaymentsSelected = checked;
    if (this.client.payments) {
      this.client.payments.forEach(payment => payment.selected = checked);
    }
    this.updateTotals();
  }

  toggleSelectAllOrders(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.allOrdersSelected = checked;
    if (this.client.orders) {
      this.client.orders.forEach(order => order.selected = checked);
    }
    this.updateTotals();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  getProductName(productId: number): string {
    return this.productCatalog.find(p => p.id === productId)?.name || 'Produit inconnu';
  }

  getProductPrice(productId: number): number {
    return this.productCatalog.find(p => p.id === productId)?.price || 0;
  }
  
  onClose(): void {
    this.close.emit();
  }
}