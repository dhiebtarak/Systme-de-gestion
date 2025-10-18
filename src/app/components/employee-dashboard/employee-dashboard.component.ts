import { Component, OnInit, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';
import { EmployeeDetailsComponent } from '../employee-details/employee-details.component';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeeDetailsComponent],  // Keep if used in template
  templateUrl: 'employee-dashboard.component.html',
  styleUrls: ['employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  employees: Employee[] = [];
  selectedEmployee: Employee | null = null;
  showAddForm = false;
  editingEmployee: Employee | null = null;
  loading = false;
  errorMessage: string | null = null;

  newEmployee: Partial<Employee> = {
    name: '',
    phone: '',
    employeeType: "monthly",
    hourlyRate: 0,
    monthlySalary: 0
  };

  editForm: Partial<Employee> = {
    name: '',
    phone: '',
    employeeType: "monthly",
    hourlyRate: 0,
    monthlySalary: 0
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
        const employeesArray = response;
    
        this.employees = employeesArray.map((emp: any) => ({
          id: emp.employee_id ?? emp.id,
          name: emp.name,
          phone: emp.phone,
          employeeType: emp.employee_type ?? emp.employeeType,
          hourlyRate: emp.hour_price ?? emp.hourlyRate ?? 0,
          monthlySalary: emp.monthly_salary ?? emp.monthlySalary ?? 0,
          workHours: emp.workHours || []
        }));
    
        console.log('Loaded employees:', this.employees);
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
    if (this.isValidEmployee(this.newEmployee)) {
      this.employeeService.createEmployee({
        ...this.newEmployee,
        hourlyRate: this.newEmployee.employeeType === 'hourly' ? this.newEmployee.hourlyRate : null,
        monthlySalary: this.newEmployee.employeeType === 'monthly' ? this.newEmployee.monthlySalary : null
      } as Employee).subscribe({
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

  private isValidEmployee(emp: Partial<Employee>): boolean {
    return !!(
      emp.name?.trim() &&
      emp.phone?.trim() &&
      emp.employeeType &&
      ((emp.employeeType === 'hourly' && emp.hourlyRate && emp.hourlyRate > 0) ||
       (emp.employeeType === 'monthly' && emp.monthlySalary && emp.monthlySalary > 0))
    );
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.newEmployee = { name: '', phone: '', employeeType: "monthly", hourlyRate: 0, monthlySalary: 0 };
  }

  editEmployee(employee: Employee): void {
    if (!employee) return;
    this.editingEmployee = { ...employee };
    this.editForm = {
      name: employee.name,
      phone: employee.phone,
      employeeType: employee.employeeType,
      hourlyRate: employee.hourlyRate || 0,
      monthlySalary: employee.monthlySalary || 0
    };
  }

  saveEmployee(): void {
    if (this.editingEmployee && this.isValidEmployee(this.editForm)) {
      this.employeeService.updateEmployee({
        id: this.editingEmployee.id,
        ...this.editForm,
        hourlyRate: this.editForm.employeeType === 'hourly' ? this.editForm.hourlyRate : null,
        monthlySalary: this.editForm.employeeType === 'monthly' ? this.editForm.monthlySalary : null
      } as Employee).subscribe({
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
    this.editForm = { name: '', phone: '', employeeType: 'monthly', hourlyRate: 0, monthlySalary: 0 };
  }

  getEmployeeTypeLabel(employeeType: string): string {
    if (employeeType === 'monthly') return 'Mensuel';
    else if (employeeType === 'hourly') return 'Horaire';
    return 'Type inconnu';
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