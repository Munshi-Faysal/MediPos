import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { PatientService } from '../../../core/services/patient.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  private prescriptionService = inject(PrescriptionService);
  private patientService = inject(PatientService);
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);

  public stats = signal({
    todayAppointments: 0,
    totalPatients: 0,
    totalPrescriptions: 0,
    pendingTasks: 0
  });

  public currentUser = this.authService.user;

  public recentPrescriptions = signal<any[]>([]);

  public upcomingAppointments = signal<any[]>([]);

  constructor() { }

  ngOnInit(): void {
    this.initialLoad();
  }

  initialLoad(): void {
    this.loadRecentPrescriptions();
    this.loadDashboardStats();
    this.loadTodayAppointments();
  }

  loadDashboardStats(): void {
    // 1. Total Patients
    this.patientService.getAllPatients().subscribe({
      next: (res: any) => {
        const patients = res || []; // Service handles .data mapping usually? Check service.
        // Based on previous interaction with PatientService, getAllPatients returns res.data via pipe map
        // But let's be safe.
        const count = Array.isArray(patients) ? patients.length : (patients.data?.length || 0);
        this.stats.update(s => ({ ...s, totalPatients: count }));
      },
      error: (err) => console.error('Failed to load patients count', err)
    });

    // 2. Pending Tasks (Pending/Scheduled appointments)
    this.appointmentService.getAppointmentsByCurrentDoctor().subscribe({
      next: (res: any) => {
        const appointments = res.data || [];
        const pendingCount = appointments.filter((a: any) => a.status === 'Pending' || a.status === 'Scheduled').length;
        this.stats.update(s => ({ ...s, pendingTasks: pendingCount }));
      },
      error: (err) => console.error('Failed to load pending appointments', err)
    });
  }

  loadTodayAppointments(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    this.appointmentService.getAppointmentsByCurrentDoctorAndDate(todayStr).subscribe({
      next: (res: any) => {
        const appointments = res.data || []; // Appointment service returns raw response usually
        this.stats.update(s => ({ ...s, todayAppointments: appointments.length }));

        // Helper to format time
        const formatTime = (dateStr: string) => {
          const d = new Date(dateStr);
          return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };

        // Map to upcoming schedule (filtering for future times if desired, or just all today)
        const mapped = appointments.map((a: any) => ({
          patientName: a.patientName,
          time: formatTime(a.dateTime),
          type: a.type || 'Visit'
        }));
        this.upcomingAppointments.set(mapped);
      },
      error: (err) => console.error('Failed to load today appointments', err)
    });
  }

  loadRecentPrescriptions(): void {
    // Fetch real prescriptions from API
    // Using current doctor context (handled by backend or auth service)
    // Assuming backend returns list of prescription view models
    this.prescriptionService.getPrescriptions().subscribe({
      next: (res: any) => {
        // Handle ApiResponse wrapper or direct array
        const allPrescriptions = Array.isArray(res) ? res : (res.data || []);

        // Sort by date descending and take top 5
        const sorted = allPrescriptions.sort((a: any, b: any) =>
          new Date(b.prescriptionDate).getTime() - new Date(a.prescriptionDate).getTime()
        ).slice(0, 5);

        // Map to view model expected by template
        const mapped = sorted.map((p: any) => ({
          id: p.prescriptionEncryptedId,
          patientName: p.patientName || 'Unknown',
          age: p.patientAge || 0,
          date: p.prescriptionDate,
          status: 'Completed' // Prescriptions are usually 'Completed' if they exist, or map from p.status if available
        }));

        this.recentPrescriptions.set(mapped);

        // Update stats count
        this.stats.update(s => ({ ...s, totalPrescriptions: allPrescriptions.length }));
      },
      error: (err) => console.error('Failed to load recent prescriptions', err)
    });
  }
}
