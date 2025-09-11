import { Injectable } from '@angular/core';
import { Employee, WorkHour } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employees: Employee[] = [];
  private nextWorkHourId: number = 1;

  getEmployees(): Employee[] {
    return this.employees;
  }

  addEmployee(name: string, phone: string, hourlyRate: number): void {
    const id = this.employees.length + 1;
    this.employees.push({ id, name, phone, hourlyRate, workHours: [] });
  }

  updateEmployee(id: number, name: string, phone: string, hourlyRate: number): void {
    const employee = this.employees.find(e => e.id === id);
    if (employee) {
      employee.name = name;
      employee.phone = phone;
      employee.hourlyRate = hourlyRate;
    }
  }

  deleteEmployee(id: number): void {
    this.employees = this.employees.filter(e => e.id !== id);
  }

  getWorkHours(employeeId: number): WorkHour[] {
    const employee = this.employees.find(e => e.id === employeeId);
    return employee ? employee.workHours : [];
  }

  addWorkHour(employeeId: number, date: string, hours: number): void {
    const employee = this.employees.find(e => e.id === employeeId);
    if (employee && hours > 0) {
      employee.workHours.push({
        id: this.nextWorkHourId++,
        date: new Date(date),
        hours,
        selected: false
      });
    }
  }

  deleteWorkHours(employeeId: number, workHourIds: number[]): void {
    const employee = this.employees.find(e => e.id === employeeId);
    if (employee) {
      employee.workHours = employee.workHours.filter(wh => !workHourIds.includes(wh.id));
    }
  }

  calculateMonthlySalary(employee: Employee, month: number, year: number): number {
    const hours = employee.workHours.reduce((sum, wh) => {
      const date = new Date(wh.date);
      return date.getMonth() === month && date.getFullYear() === year ? sum + wh.hours : sum;
    }, 0);
    return hours * employee.hourlyRate;
  }
}