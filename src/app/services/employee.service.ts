import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Employee, WorkHour } from '../models/employee.model';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  // private apiUrl = 'http://localhost:5001/api/V1/employees'; // Example API URL
  private apiUrl = "https://backend-system-de-gestion.onrender.com/api/V1/employees";
  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http
      .get<{ status: number; message: string; data: any[] }>(`${this.apiUrl}`)
      .pipe(
        map(response => response.data.map((emp: any) => ({
          id: emp.employee_id,
          name: emp.name,
          phone: emp.phone,
          employeeType: emp.employee_type,
          hourlyRate: emp.hour_price || 0,
          monthlySalary: emp.monthly_salary || 0,
          workHours: [] // Work hours fetched separately if needed
        })))
      );
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: Partial<Employee>): Observable<Employee> {
    const payload = {
      phone: employee.phone,
      name: employee.name,
      employee_type: employee.employeeType,
      hour_price: employee.employeeType === 'hourly' ? employee.hourlyRate : null,
      monthly_salary: employee.employeeType === 'monthly' ? employee.monthlySalary : null
    };
    return this.http.post<Employee>(`${this.apiUrl}`, payload);
  }

  updateEmployee(employee: Partial<Employee>): Observable<Employee> {
    const payload = {
      phone: employee.phone,
      name: employee.name,
      employee_type: employee.employeeType,
      hour_price: employee.employeeType === 'hourly' ? employee.hourlyRate : null,
      monthly_salary: employee.employeeType === 'monthly' ? employee.monthlySalary : null
    };
    return this.http.put<Employee>(`${this.apiUrl}/${employee.id}`, payload);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getWorkHours(employeeId: number): Observable<{ hours: WorkHour[] }> {
    return this.http.get<{ hours: WorkHour[] }>(`${this.apiUrl}/${employeeId}/work-hours`);
  }

  addWorkHour(employeeId: number, workDate: string, workedHours: number): Observable<WorkHour> {
    return this.http.post<WorkHour>(`${this.apiUrl}/${employeeId}/work-hours`, { work_date: workDate, worked_hours: workedHours });
  }

  updateWorkHour(workId: number, workedHours: number): Observable<WorkHour> {
    return this.http.put<WorkHour>(`${this.apiUrl}/work-hours/${workId}`, { worked_hours: workedHours });
  }

  deleteWorkHour(workId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/work-hours/${workId}`);
  }

  // Get total worked hours for a specific month/year (assumes backend endpoint)
  getTotalWorkedHours(employeeId: number, year: number, month: number): Observable<number> {
    return this.http
      .get<{ status: number; message: string; data: number }>(`${this.apiUrl}/${employeeId}/work-hours/summary?year=${year}&month=${month}`)
      .pipe(map(response => response.data));
  }

  // Get expected hours for a given month/year
  getExpectedHours(year: number, month: number): Observable<number> {
    return this.http
      .get<{ status: number; message: string; data: number }>(`${this.apiUrl}/expected-hours/${year}/${month}`)
      .pipe(map(response => response.data));
  }

  // Updated to be async and handle both employee types
  calculateMonthlySalary(employee: Employee, month: number, year: number): Observable<number> {
    if (!employee.id) {
      return of(0);
    }

    return forkJoin({
      workedHours: this.getTotalWorkedHours(employee.id, year, month),
      expectedHours: this.getExpectedHours(year, month)
    }).pipe(
      switchMap(({ workedHours, expectedHours }) => {
        let salary = 0;
        if (employee.employeeType === 'hourly') {
          salary = workedHours * employee.hourlyRate;
        } else if (employee.employeeType === 'monthly') {
          if (expectedHours > 0) {
            const effectiveRate = employee.monthlySalary / expectedHours;
            salary = Math.min(workedHours * effectiveRate, employee.monthlySalary); // Cap at full salary
          }
        }
        return of(Math.round(salary * 100) / 100); // Round to 2 decimals
      }),
      catchError(error => {
        console.error('Error calculating salary:', error);
        return of(0);
      })
    );
  }
}