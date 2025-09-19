import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Employee, WorkHour } from '../models/employee.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:5001/api/V1/employees'; // Example API URL

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http
      .get<{ status: number; message: string; data: Employee[] }>(`${this.apiUrl}`)
      .pipe(
        map(response => response.data)
      );
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  createEmployee(phone: string, name: string, hourlyRate: number): Observable<Employee> {
    return this.http.post<Employee>(`${this.apiUrl}`, { phone, name, hour_price: hourlyRate });
  }

  updateEmployee(id: number, phone: string, name: string, hourlyRate: number): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, { phone, name, hour_price : hourlyRate });
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getWorkHours(employeeId: number): Observable<{ hours: WorkHour[]; totalHours: number }> {
    return this.http.get<{ hours: WorkHour[]; totalHours: number }>(`${this.apiUrl}/${employeeId}/work-hours`);
  }

  addWorkHour(employeeId: number, workDate: string, workedHours: number): Observable<WorkHour> {
    return this.http.post<WorkHour>(`${this.apiUrl}/${employeeId}/work-hours`, { work_date: workDate ,worked_hours : workedHours });
  }

  updateWorkHour(workId: number, workedHours: number): Observable<WorkHour> {
    return this.http.put<WorkHour>(`${this.apiUrl}/work-hours/${workId}`, { worked_hours:workedHours });
  }

  deleteWorkHour(workId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/work-hours/${workId}`);
  }

  calculateMonthlySalary(employee: Employee, month: number, year: number): number {
    if (!employee.workHours || employee.workHours.length === 0) {
      return 0; // no work hours, so salary = 0
    }
  
    const hours = employee.workHours.reduce((sum, wh) => {
      const date = new Date(wh.date);
      return date.getMonth() === month && date.getFullYear() === year ? sum + wh.hours : sum;
    }, 0);
  
    return hours * employee.hourlyRate;
  }
  
}