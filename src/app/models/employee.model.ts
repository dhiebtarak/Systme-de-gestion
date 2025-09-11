export interface WorkHour {
  id: number;
  date: Date;
  hours: number;
  selected?: boolean;
}

export interface Employee {
  id: number;
  name: string;
  phone: string;
  hourlyRate: number;
  workHours: WorkHour[];
}