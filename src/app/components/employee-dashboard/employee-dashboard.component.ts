import { Component, OnInit, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';
import { EmployeeDetailsComponent } from '../employee-details/employee-details.component';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeeDetailsComponent],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h2>👥 Gestion des Employés</h2>
        <button class="add-btn" (click)="showAddForm = !showAddForm">
          ➕ Ajouter Employé
        </button>
      </div>
      
      <div class="add-form" *ngIf="showAddForm">
        <h3>Ajouter un Nouvel Employé</h3>
        <div class="form-row">
          <input type="text" [(ngModel)]="newEmployee.name" placeholder="Nom complet" class="form-input">
          <input type="tel" [(ngModel)]="newEmployee.phone" placeholder="Téléphone" class="form-input">
          <input type="number" [(ngModel)]="newEmployee.hourlyRate" placeholder="Taux horaire (DT)" class="form-input">
          <button class="save-btn" (click)="addEmployee()">💾 Enregistrer</button>
          <button class="cancel-btn" (click)="cancelAdd()">❌ Annuler</button>
        </div>
      </div>

      <div class="table-container">
        <table class="employees-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Taux Horaire</th>
              <th>Salaire Mensuel</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="loading"> <td colspan="5">Chargement des employés...</td> </tr>
            <tr *ngIf="!loading && employees.length === 0"> <td colspan="5">Aucun employé trouvé.</td> </tr>
            <tr *ngFor="let employee of employees; trackBy: trackByEmployeeId" class="employee-row">
              <td>
                <button class="name-button" (click)="openEmployeeDetails(employee); $event.stopPropagation()">
                  {{ employee.name }}
                </button>
              </td>
              <td>{{ employee.phone }}</td>
              <td class="hourly-rate">{{ employee.hourlyRate }} DT/h</td>
              <td class="salary">{{ calculateCurrentMonthlySalary(employee) }} DT</td>
              <td>
                <button class="edit-btn" (click)="editEmployee(employee); $event.stopPropagation()">
                  ✏️ Modifier
                </button>
                <button class="delete-btn" (click)="deleteEmployee(employee.id); $event.stopPropagation()">
                  🗑️ Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
      </div>

      <!-- Modal de modification -->
      <div class="modal-overlay" *ngIf="editingEmployee" (click)="cancelEdit()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>✏️ Modifier Employé</h3>
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
            <div class="form-group">
              <label>Taux Horaire (DT):</label>
              <input type="number" [(ngModel)]="editForm.hourlyRate" class="form-input">
            </div>
            <div class="modal-actions">
              <button class="save-btn" (click)="saveEmployee(); $event.stopPropagation()">💾 Enregistrer</button>
              <button class="cancel-btn" (click)="cancelEdit(); $event.stopPropagation()">❌ Annuler</button>
            </div>
          </div>
        </div>
      </div>

      <app-employee-details
        *ngIf="selectedEmployee"
        [employee]="selectedEmployee"
        (close)="closeEmployeeDetails()"
        (workHourAdded)="onWorkHourAdded()">
      </app-employee-details>
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
      min-width: 150px;
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

    .employees-table {
      width: 100%;
      border-collapse: collapse;
    }

    .employees-table th {
      background: linear-gradient(135deg, #e91e63, #ad1457);
      color: white;
      padding: 15px;
      text-align: center;
      font-weight: 600;
    }

    .employee-row {
      transition: background-color 0.2s;
    }

    .employee-row:hover {
      background-color: #fce4ec;
    }

    .employee-row td {
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
      color: #ad1457;
    }

    .hourly-rate {
      font-weight: 600;
      color: #9c27b0;
    }

    .salary {
      font-weight: 600;
      color: #c2185b;
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

    .error-message {
      color: red;
      margin-top: 10px;
      text-align: center;
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
      
      .employees-table {
        font-size: 0.9rem;
      }
      
      .employees-table th,
      .employees-table td {
        padding: 10px 5px;
      }
    }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  employees: Employee[] = [];
  selectedEmployee: Employee | null = null;
  showAddForm = false;
  editingEmployee: Employee | null = null;
  loading = false;
  errorMessage: string | null = null;

  newEmployee = {
    name: '',
    phone: '',
    hourlyRate: 0
  };

  editForm = {
    name: '',
    phone: '',
    hourlyRate: 0
  };

  private monthlySalaryCache = new Map<number, number>();

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.errorMessage = null;
    this.employeeService.getEmployees().subscribe({
      next: (response) => {
        this.employees = response.map((emp: any) => ({
          id: emp.employee_id,                  // map backend -> frontend
          name: emp.name,
          phone: emp.phone,
          hourlyRate: emp.hour_price, // convert string to number
          workHours: emp.workHours || []
        }));
        console.log('Employees loaded:', response); // Debug
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.errorMessage = 'Erreur lors du chargement des employés. Vérifiez le serveur.';
        this.loading = false;
      }
    });
  }

  trackByEmployeeId: TrackByFunction<Employee> = (index: number, employee: Employee): number => employee.id;

  addEmployee(): void {
    if (this.newEmployee.name && this.newEmployee.phone && this.newEmployee.hourlyRate > 0) {
      this.employeeService.createEmployee(
        this.newEmployee.phone,
        this.newEmployee.name,
        this.newEmployee.hourlyRate
      ).subscribe({
        next: () => {
          this.cancelAdd();
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Error adding employee:', error);
          alert('Erreur lors de l\'ajout de l\'employé.');
        }
      });
    } else {
      alert('Veuillez remplir tous les champs correctement.');
    }
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.newEmployee = { name: '', phone: '', hourlyRate: 0 };
  }

  editEmployee(employee: Employee): void {
    if (!employee) return;
    this.editingEmployee = { ...employee };
    this.editForm = {
      name: employee.name,
      phone: employee.phone,
      hourlyRate: employee.hourlyRate
    };
  }

  saveEmployee(): void {
    if (this.editingEmployee && this.editForm.name && this.editForm.phone && this.editForm.hourlyRate > 0) {
      this.employeeService.updateEmployee(
        this.editingEmployee.id,
        this.editForm.phone,
        this.editForm.name,
        this.editForm.hourlyRate
      ).subscribe({
        next: () => {
          this.cancelEdit();
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Error updating employee:', error);
          alert('Erreur lors de la mise à jour de l\'employé.');
        }
      });
    } else {
      alert('Veuillez remplir tous les champs correctement.');
    }
  }

  cancelEdit(): void {
    this.editingEmployee = null;
    this.editForm = { name: '', phone: '', hourlyRate: 0 };
  }

  calculateCurrentMonthlySalary(employee: Employee): number {
    if (!employee) return 0;
    if (this.monthlySalaryCache.has(employee.id)) {
      return this.monthlySalaryCache.get(employee.id)!;
    }
    const now = new Date();
    const salary = this.employeeService.calculateMonthlySalary(employee, now.getMonth(), now.getFullYear());
    this.monthlySalaryCache.set(employee.id, salary);
    return salary;
  }

  openEmployeeDetails(employee: Employee): void {
    if (!employee) return;
    console.log('Ouverture détails pour:', employee.name);
    this.selectedEmployee = { ...employee };
  }

  closeEmployeeDetails(): void {
    this.selectedEmployee = null;
    this.monthlySalaryCache.clear();
  }

  deleteEmployee(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          alert('Erreur lors de la suppression de l\'employé.');
        }
      });
    }
  }

  onWorkHourAdded(): void {
    this.loadEmployees();
    this.monthlySalaryCache.clear();
  }
}