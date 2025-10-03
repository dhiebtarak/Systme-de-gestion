import { Component, OnInit, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { Client, Order, Payment, ProductCatalog } from '../../models/client.model';
import { ClientDetailsComponent } from '../client-details/client-details.component';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ClientDetailsComponent],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']  
})
export class ClientDashboardComponent implements OnInit {
  clients: Client[] = [];
  productCatalog: ProductCatalog[] = [];
  showAddForm = false;
  newClient: Partial<Client> = { name: '', phone: '' };
  editingClient: Client | null = null;
  editForm: Partial<Client> = { name: '', phone: '' };
  selectedClient: Client | null = null;
  loading = false;
  errorMessage : string | null = null;
  clientBalances: { [key: number]: number } = {}; // Store balances per client ID


  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadProductCatalog();
  }
  loadProductCatalog(): void {
    this.loading = true;
    this.errorMessage = null;
    this.clientService.getProductCatalog().subscribe({
      next: (products) => {
        this.productCatalog = products.map((prod:any) => ({
          id: prod.product_id,
          name: prod.name,
          price: prod.price
        }));
        this.loading = false;
        console.log('Product catalog loaded:', this.productCatalog);
      },
      error: (error) => {
        console.error('Error loading product catalog:', error);
        this.errorMessage = 'Erreur lors du chargement du catalogue de produits. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }

  loadClients(): void {
    this.loading = true;
    this.errorMessage = null;
    this.clientService.getClients().subscribe({
      next: (response) => {
        this.clients = response.map((client:any) => ({
          id: client.client_id,
          name: client.name,
          phone: client.phone,
          orders: client.orders || [],
          payments: client.payments || []
        }));
        
        
        // Load balances for all clients after loading
      this.clients.forEach(client => this.loadClientBalance(client.id));
      console.log('Clients loaded:', response);
      this.clients.forEach(client => this.loadClientOrderLength(client.id)); // Load balances
      this.loading = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.errorMessage = 'Erreur lors du chargement des clients. Veuillez réessayer plus tard.';
        this.loading = false;
      }

  });
  }
  trackByClientId: TrackByFunction<Client> = (index: number , client: Client) => client.id;

  addClient(): void {
    if (this.newClient.name && this.newClient.phone) {
      this.clientService.createClient(this.newClient.phone, this.newClient.name).subscribe({
        next: (client) => {
          this.clients.push({ ...client, orders: [], payments: [] });
          this.loadClientBalance(client.id); // Load balance for new client
          this.loadClients();
          this.cancelAdd();
        },
        error: (error) => {
          console.error('Error adding client:', error);
          alert('Erreur lors de l\'ajout du client. Veuillez réessayer.');
        }
      });
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
      this.clientService.updateClient(this.editingClient.id, this.editForm.phone, this.editForm.name).subscribe({
        next: (updatedClient) => {
          const index = this.clients.findIndex(c => c.id === this.editingClient!.id);
          if (index !== -1) {
            this.clients[index] = { ...updatedClient, orders: this.clients[index].orders, payments: this.clients[index].payments };
            this.loadClientBalance(updatedClient.id); // Update balance
            this.loadClients();
          }
          this.cancelEdit();
        },
        error: (error) => {
          console.error('Error updating client:', error);
          alert('Erreur lors de la mise à jour du client. Veuillez réessayer.');
        }
      });
    } else {
      alert('Veuillez remplir tous les champs.');
    }
  }

  cancelEdit(): void {
    this.editingClient = null;
    this.editForm = { name: '', phone: '' };
  }

  openClientDetails(client: Client): void {
    this.selectedClient = client;
  }

  closeClientDetails(): void {
    this.selectedClient = null;
  }
  loadClientOrderLength(clientId: number): void {
    this.clientService.getOrdersById(clientId).subscribe({
      next: (orders: Order[]) => {
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
          client.orders = orders;
          console.log(`Orders for client ${clientId}:`, orders);
        }
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }
  loadClientBalance(clientId: number): void {
    this.clientService.getClientBalance(clientId).subscribe({
      next: (responses: any) => {
        this.clientBalances[clientId] = responses.get_client_balance;
        console.log(`Balance for client ${clientId}: ${this.clientBalances[clientId]}`);
      },
      error: (error) => {
        console.error('Error calculating balance:', error);
        this.clientBalances[clientId] = 0; // Fallback value
      }
    });
  }
  deleteClient(id: number): void {
    console.log(`Attempting to delete client with ID: ${id}`);
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => {
          this.loadClients();
        },
        error: (error) => {
          console.error('Error deleting client:', error);
          alert('Erreur lors de la suppression du client. Veuillez réessayer.');
        }
  });
  }
}

  onOrderAdded(): void {
    this.loadClients();
  }
  onPaymentAdded(): void {
    this.loadClients();
  }
  onClientUpdated(): void {
    this.loadClients();
  }
}