import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  public stats = signal({
    todayAppointments: 12,
    totalPatients: 1540,
    totalPrescriptions: 3240,
    pendingReports: 5
  });

  public recentPrescriptions = signal([
    { id: 101, patientName: 'John Doe', age: 45, date: '2026-01-22', status: 'Completed' },
    { id: 102, patientName: 'Sarah Smith', age: 32, date: '2026-01-22', status: 'Pending' },
    { id: 103, patientName: 'Mike Johnson', age: 28, date: '2026-01-21', status: 'Completed' },
    { id: 104, patientName: 'Sarah Smith', age: 32, date: '2026-01-22', status: 'Pending' },
  ]);

  public upcomingAppointments = signal([
    { patientName: 'Emma Watson', time: '02:30 PM', type: 'Follow-up' },
    { patientName: 'Robert Brown', time: '03:15 PM', type: 'New Patient' },
    { patientName: 'Alice Freeman', time: '04:00 PM', type: 'Consultation' },
  ]);

  constructor() { }

  ngOnInit(): void {
    // In a real app, you'd fetch this from a service
  }
}
