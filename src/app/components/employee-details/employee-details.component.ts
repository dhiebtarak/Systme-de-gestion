import { Component, EventEmitter, Input, Output, OnInit, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.css']
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
  expectedHoursForMonth: number | null = null;
  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadWorkHours();
  }

  loadWorkHours(): void {
    if (!this.employee?.id) return;
  
    // 1️⃣ Load actual worked hours
    this.employeeService.getWorkHours(this.employee.id).pipe(
      map((response: any) => {
        const hoursArray = response?.data?.hours ?? [];
        return hoursArray.map((wh: any) => ({
          id: wh.id,
          employeeId: wh.employee_id,
          date: new Date(wh.work_date),
          hours: Number(wh.worked_hours) || 0,
          selected: wh.selected ?? false
        }));
      })
    ).subscribe({
      next: (workHours) => this.workHours = workHours,
      error: (error) => {
        console.error('Error loading work hours:', error);
        alert('Erreur lors du chargement des heures de travail.');
        this.workHours = [];
      }
    });
  
    // 2️⃣ Fetch expected hours for monthly employees
    if (this.employee?.employeeType === 'monthly') {
      this.employeeService
        .getExpectedHours(new Date().getFullYear(), new Date().getMonth() + 1)
        .subscribe({
          next: (response: any) => {
            // Extract the actual numeric value
            const expected = response?.expectedHours ?? 0;
            console.log('Expected hours for the month:', expected);
            this.expectedHoursForMonth = expected;
  
            // Calculate and format hourly rate precisely
            if (this.employee && expected > 0) {
              const rate = this.employee.monthlySalary / expected;
  
              // Convert to numeric(10,2) equivalent
              this.employee.hourlyRate = Number(rate.toFixed(2));
  
              console.log(
                'Calculated hourly rate:',
                this.employee.hourlyRate.toFixed(2) + ' DT'
              );
            }
          },
          error: (error) => {
            console.error('Error fetching expected hours:', error);
            this.expectedHoursForMonth = null;
          },
        });
    }
  }
  

  trackByMonth: TrackByFunction<MonthlyData> = (_, monthData) => monthData.month;
  trackByWorkHour: TrackByFunction<WorkHour> = (_, workHour) => workHour.id;

  addWorkHour(): void {
    if (!this.employee?.id || !this.newWorkHour.date) {
      alert('Veuillez entrer une date valide.');
      return;
    }

    const hours = Number(this.newWorkHour.hours);
    if (isNaN(hours) || hours <= 0) {
      alert('Veuillez entrer un nombre d\'heures positif.');
      return;
    }

    this.employeeService.addWorkHour(this.employee.id, this.newWorkHour.date, hours)
      .subscribe({
        next: () => {
          this.newWorkHour = { date: new Date().toISOString().split('T')[0], hours: 0 };
          this.workHourAdded.emit();
          this.loadWorkHours();
        },
        error: (error) => {
          console.error('Error adding work hour:', error);
          alert(error?.error?.message || 'Erreur lors de l\'ajout des heures de travail.');
        }
      });
  }

  deleteSelectedHours(): void {
    if (!this.employee?.id) return;
    const selectedIds = this.workHours.filter(wh => wh.selected).map(wh => wh.id);
    if (!selectedIds.length) return alert('Veuillez sélectionner des heures à supprimer.');

    if (confirm(`Supprimer ${selectedIds.length} entrée(s) d'heures ?`)) {
      const deleteRequests: Observable<void>[] = selectedIds.map(id => this.employeeService.deleteWorkHour(id));
      Promise.all(deleteRequests.map(obs => obs.toPromise())).then(() => {
        this.workHourAdded.emit();
        this.loadWorkHours();
      }).catch(error => {
        console.error('Error deleting work hours:', error);
        alert('Erreur lors de la suppression des heures.');
      });
    }
  }

  hasSelectedHours(): boolean {
    return this.workHours.some(wh => wh.selected);
  }

  getMonthlyData(): MonthlyData[] {
    const monthlyData: { [key: string]: WorkHour[] } = {};
    this.workHours.forEach(wh => {
      const date = new Date(wh.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) monthlyData[key] = [];
      monthlyData[key].push(wh);
    });

    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    return Object.keys(monthlyData).sort((a, b) => b.localeCompare(a)).map(key => {
      const workHours = monthlyData[key].sort((a, b) => +new Date(b.date) - +new Date(a.date));
      const totalHours = workHours.reduce((sum, wh) => sum + wh.hours, 0);
      const totalAmount = totalHours * (this.employee?.hourlyRate || 0);
      const [year, month] = key.split('-');
      return {
        month: key,
        monthName: `${monthNames[+month - 1]} ${year}`,
        workHours,
        totalHours,
        totalAmount
      };
    });
  }

  toggleSelectAllMonth(month: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.workHours.forEach(wh => {
      const date = new Date(wh.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (key === month) wh.selected = checked;
    });
    this.workHours = [...this.workHours];
  }

  isMonthFullySelected(month: string): boolean {
    const monthWorkHours = this.workHours.filter(wh => {
      const date = new Date(wh.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return key === month;
    });
    return monthWorkHours.length > 0 && monthWorkHours.every(wh => wh.selected);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  updateSelection(): void { this.workHours = [...this.workHours]; // Trigger change detection }
  }
  getCurrentMonthHours(): number {
    const now = new Date();
    return this.workHours
      .filter(wh => {
        const d = new Date(wh.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, wh) => sum + wh.hours, 0);
  }

  getCurrentMonthSalary(): number {
    return this.getCurrentMonthHours() * (this.employee?.hourlyRate || 0);
  }
  
  printSummary(): void {
    const printContent = `
      <h2>Historique des Heures - ${this.employee?.name}</h2>
      ${this.getMonthlyData().map(m => `
        <h3>${m.monthName}</h3>
        <table border="1" cellspacing="0" cellpadding="5">
          <thead><tr><th>Date</th><th>Heures</th><th>Montant</th></tr></thead>
          <tbody>${m.workHours.map(wh =>
            `<tr><td>${this.formatDate(wh.date)}</td><td>${wh.hours}h</td><td>${wh.hours * (this.employee?.hourlyRate || 0)} DT</td></tr>`
          ).join('')}</tbody>
          <tfoot><tr><td><strong>Total</strong></td><td><strong>${m.totalHours}h</strong></td><td><strong>${m.totalAmount} DT</strong></td></tr></tfoot>
        </table>
      `).join('')}
      <p><strong>Total Heures ce Mois : ${this.getCurrentMonthHours()}h</strong></p>
      <p><strong>Salaire Mensuel : ${this.getCurrentMonthSalary()} DT</strong></p>
    `;
    const win = window.open('', '', 'width=800,height=600');
    if (win) {
      win.document.write(`<html><head><title>Historique</title></head><body>${printContent}</body></html>`);
      win.document.close();
      win.print();
    }
  }
}
