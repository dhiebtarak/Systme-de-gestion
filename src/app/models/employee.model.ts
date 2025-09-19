export interface WorkHour {
  id: number;
  date: Date;         // Maps to work_date
  hours: number;      // Maps to worked_hours
  selected?: boolean; // Optional field for UI purposes
}

export interface Employee {
  id: number;         // Maps to employee_id
  name: string;       // Maps to name
  phone: string;      // Maps to phone
  hourlyRate: number; // Maps to hour_price
  workHours: WorkHour[];
}