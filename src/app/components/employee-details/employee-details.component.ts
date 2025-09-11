import { Component, EventEmitter, Input, Output, OnInit, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';

interface WorkHour {
  id: number;
  date: Date;
  hours: number;
  selected?: boolean;
}

interface MonthlyData {
  month: string;
  monthName: string;
  workHours: WorkHour[];
  totalHours: number;
  totalAmount: number;
}

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="employee" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>📊 Historique des Heures - {{ employee.name }}</h3>
          <button class="close-btn" (click)="close.emit()">✕</button>
        </div>

        <div class="delete-hours-section" *ngIf="hasSelectedHours()">
          <button class="delete-selected-btn" (click)="deleteSelectedHours()">
            🗑️ Supprimer les Heures Sélectionnées
          </button>
        </div>

        <div class="add-hours-section">
          <h4>➕ Ajouter des Heures</h4>
          <div class="form-group">
            <label>Date:</label>
            <input type="date" [(ngModel)]="newWorkHour.date" class="form-input">
          </div>
          <div class="form-group">
            <label>Heures travaillées:</label>
            <input type="number" step="0.5" [(ngModel)]="newWorkHour.hours" 
                   placeholder="Ex: 8" class="form-input">
          </div>
          <button class="add-btn" (click)="addWorkHour()">Ajouter</button>
        </div>

        <div class="hours-history">
          <h4>📋 Historique des Heures</h4>
          
          <div *ngFor="let monthData of getMonthlyData(); trackBy: trackByMonth" class="month-section">
            <div class="month-header">
              <h5>📅 {{ monthData.monthName }}</h5>
              <div class="month-summary">
                <span>{{ monthData.totalHours }}h - {{ monthData.totalAmount }} DT</span>
              </div>
            </div>
            
            <div class="hours-table-container">
              <table class="hours-table">
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" (change)="toggleSelectAllMonth(monthData.month, $event)"
                             [checked]="isMonthFullySelected(monthData.month)">
                    </th>
                    <th>Date</th>
                    <th>Heures</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let workHour of monthData.workHours; trackBy: trackByWorkHour" class="hour-row">
                    <td>
                      <input type="checkbox" [(ngModel)]="workHour.selected" (change)="updateSelection()">
                    </td>
                    <td>{{ formatDate(workHour.date) }}</td>
                    <td>{{ workHour.hours }}h</td>
                    <td class="amount">{{ workHour.hours * (employee.hourlyRate || 0) }} DT</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <span>Total Heures ce Mois:</span>
              <span class="value">{{ getCurrentMonthHours() }}h</span>
            </div>
            <div class="summary-item total">
              <span>Salaire Mensuel:</span>
              <span class="value">{{ getCurrentMonthSalary() }} DT</span>
            </div>
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
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
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

    .delete-hours-section {
      padding: 15px 20px;
      background: #ffebee;
      border-bottom: 1px solid #ffcdd2;
      text-align: center;
    }

    .delete-selected-btn {
      background: linear-gradient(135deg, #f44336, #d32f2f);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .delete-selected-btn:hover {
      background: linear-gradient(135deg, #d32f2f, #b71c1c);
      transform: translateY(-2px);
    }

    .add-hours-section {
      padding: 20px;
      background: #fce4ec;
      border-bottom: 1px solid #f8bbd9;
    }

    .add-hours-section h4 {
      margin: 0 0 15px 0;
      color: #880e4f;
    }

    .form-group {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      gap: 15px;
    }

    .form-group label {
      min-width: 150px;
      font-weight: 600;
      color: #ad1457;
    }

    .form-input {
      flex: 1;
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

    .add-btn {
      background: linear-gradient(135deg, #4caf50, #388e3c);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: background-color 0.2s;
    }

    .add-btn:hover {
      background: linear-gradient(135deg, #388e3c, #2e7d32);
    }

    .hours-history {
      padding: 20px;
    }

    .hours-history h4 {
      margin: 0 0 20px 0;
      color: #880e4f;
    }

    .month-section {
      margin-bottom: 30px;
      border: 1px solid #f8bbd9;
      border-radius: 8px;
      overflow: hidden;
    }

    .month-header {
      background: linear-gradient(135deg, #fce4ec, #f8bbd9);
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f8bbd9;
    }

    .month-header h5 {
      margin: 0;
      color: #880e4f;
      font-size: 1.2rem;
    }

    .month-summary {
      font-weight: 600;
      color: #ad1457;
    }

    .hours-table-container {
      max-height: 300px;
      overflow-y: auto;
    }

    .hours-table {
      width: 100%;
      border-collapse: collapse;
    }

    .hours-table th {
      background: linear-gradient(135deg, #880e4f, #ad1457);
      color: white;
      padding: 12px;
      text-align: center;
      position: sticky;
      top: 0;
    }

    .hour-row {
      border-bottom: 1px solid #f8f9fa;
    }

    .hour-row:hover {
      background: #fce4ec;
    }

    .hour-row td {
      padding: 12px;
      text-align: center;
    }

    .amount {
      font-weight: 600;
      color: #c2185b;
    }

    .summary {
      background: #fce4ec;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #f8bbd9;
      margin-top: 20px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 1rem;
    }

    .summary-item.total {
      border-top: 2px solid #e91e63;
      padding-top: 10px;
      margin-top: 15px;
      font-weight: 600;
      font-size: 1.2rem;
    }

    .summary-item .value {
      color: #c2185b;
      font-weight: 600;
    }
  `]
})
export class EmployeeDetailsComponent implements OnInit {
  @Input() employee: Employee | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() workHourAdded = new EventEmitter<void>();

  newWorkHour = {
    date: new Date().toISOString().split('T')[0],
    hours: 0
  };

  workHours: WorkHour[] = [];

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadWorkHours();
  }

  loadWorkHours(): void {
    if (this.employee?.id) {
      this.workHours = this.employeeService.getWorkHours(this.employee.id).map((wh: WorkHour) => ({
        ...wh,
        date: new Date(wh.date),
        selected: wh.selected ?? false
      }));
    } else {
      this.workHours = [];
    }
  }

  trackByMonth: TrackByFunction<MonthlyData> = (index: number, monthData: MonthlyData) => monthData.month;

  trackByWorkHour: TrackByFunction<WorkHour> = (index: number, workHour: WorkHour) => workHour.id;

  addWorkHour(): void {
    if (!this.employee?.id || !this.newWorkHour.date || this.newWorkHour.hours <= 0) {
      alert('Veuillez entrer une date valide et un nombre d\'heures positif.');
      return;
    }
    this.employeeService.addWorkHour(this.employee.id, this.newWorkHour.date, this.newWorkHour.hours);
    this.newWorkHour = {
      date: new Date().toISOString().split('T')[0],
      hours: 0
    };
    this.workHourAdded.emit();
    this.loadWorkHours();
  }

  hasSelectedHours(): boolean {
    return this.workHours.some(wh => wh.selected);
  }

  deleteSelectedHours(): void {
    if (!this.employee?.id) {
      alert('Employé non valide.');
      return;
    }
    const selectedIds = this.workHours.filter(wh => wh.selected).map(wh => wh.id);
    if (selectedIds.length === 0) {
      alert('Veuillez sélectionner des heures à supprimer.');
      return;
    }
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} entrée(s) d'heures ?`)) {
      this.employeeService.deleteWorkHours(this.employee.id, selectedIds);
      this.workHourAdded.emit();
      this.loadWorkHours();
    }
  }

  getMonthlyData(): MonthlyData[] {
    const monthlyData: { [key: string]: WorkHour[] } = {};
    this.workHours.forEach(wh => {
      const date = new Date(wh.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = [];
      }
      monthlyData[monthKey].push(wh);
    });

    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    return Object.keys(monthlyData)
      .sort((a, b) => b.localeCompare(a))
      .map(monthKey => {
        const workHours = monthlyData[monthKey].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const totalHours = workHours.reduce((sum, wh) => sum + wh.hours, 0);
        const totalAmount = totalHours * (this.employee?.hourlyRate || 0);
        const [year, month] = monthKey.split('-');
        const monthName = `${monthNames[parseInt(month) - 1]} ${year}`;
        return { month: monthKey, monthName, workHours, totalHours, totalAmount };
      });
  }

  toggleSelectAllMonth(month: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.workHours.forEach(wh => {
      const whDate = new Date(wh.date);
      const whMonth = `${whDate.getFullYear()}-${String(whDate.getMonth() + 1).padStart(2, '0')}`;
      if (whMonth === month) {
        wh.selected = checked;
      }
    });
    this.workHours = [...this.workHours]; // Trigger change detection
  }

  isMonthFullySelected(month: string): boolean {
    const monthWorkHours = this.workHours.filter(wh => {
      const whDate = new Date(wh.date);
      const whMonth = `${whDate.getFullYear()}-${String(whDate.getMonth() + 1).padStart(2, '0')}`;
      return whMonth === month;
    });
    return monthWorkHours.length > 0 && monthWorkHours.every(wh => wh.selected);
  }

  updateSelection(): void {
    this.workHours = [...this.workHours]; // Trigger change detection
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR');
  }

  getCurrentMonthHours(): number {
    const now = new Date();
    return this.workHours
      .filter(wh => {
        const workDate = new Date(wh.date);
        return workDate.getMonth() === now.getMonth() && workDate.getFullYear() === now.getFullYear();
      })
      .reduce((total, wh) => total + wh.hours, 0);
  }

  getCurrentMonthSalary(): number {
    return this.getCurrentMonthHours() * (this.employee?.hourlyRate || 0);
  }
}