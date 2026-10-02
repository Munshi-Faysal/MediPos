import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  AppointmentDto,
  AppointmentService,
  AppointmentViewModel
} from '../../../core/services/appointment.service';
import {
  PatientDto,
  PatientService,
  PatientViewModel
} from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { confirmAppAction } from '../../../core/utils/app-alert';

import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

export interface Appointment {
  id: number;
  encryptedId: string;
  patientId: number;
  patientEncryptedId?: string;
  patientName: string;
  patientImage?: string;
  dateTime: Date;
  reason: string;
  status: string;
  type: string;
  notes?: string;
  contact: string;
  prescriptionEncryptedId?: string;
}

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './appointment.component.html',
  styles: []
})
export class AppointmentComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly patientService = inject(PatientService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  currentView: 'list' | 'create' | 'view' = 'list';
  searchTerm = '';
  selectedDate = this.formatLocalDate(new Date());
  selectedAppointment: Appointment | null = null;
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  newAppointment: Partial<Appointment> = this.emptyAppointment();

  patientSearchTerm = '';
  patientSearchResults: PatientViewModel[] = [];
  foundPatient: PatientViewModel | null = null;
  patientSearchMessage = '';

  isEditing = false;
  isLoading = false;
  isSearching = false;
  isSaving = false;
  isUpdatingStatus = false;
  errorMessage = '';
  formError = '';

  pageSize = 20;
  currentPage = 1;

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  get paginatedAppointments(): Appointment[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAppointments.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAppointments.length / this.pageSize));
  }

  get resultStart(): number {
    return this.filteredAppointments.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get resultEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredAppointments.length);
  }

  get dateTimeMin(): string {
    const minimum = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000);
    return minimum.toISOString().slice(0, 16);
  }

  loadAppointments(): void {
    if (!this.selectedDate) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.appointmentService.getAppointmentsByCurrentDoctorAndDate(this.selectedDate).subscribe({
      next: (response: any) => {
        this.appointments = (response?.data || []).map((appointment: AppointmentViewModel) =>
          this.mapAppointment(appointment));
        this.filterAppointments(false);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading appointments:', error);
        this.appointments = [];
        this.filteredAppointments = [];
        this.errorMessage = 'Appointments could not be loaded. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onDateChange(): void {
    this.currentPage = 1;
    this.loadAppointments();
  }

  filterAppointments(resetPage = true): void {
    const term = this.searchTerm.trim().toLowerCase();
    const filtered = !term
      ? [...this.appointments]
      : this.appointments.filter(appointment =>
          appointment.patientName.toLowerCase().includes(term) ||
          appointment.contact.toLowerCase().includes(term) ||
          appointment.reason.toLowerCase().includes(term)
        );

    this.filteredAppointments = filtered.sort((first, second) =>
      first.dateTime.getTime() - second.dateTime.getTime());
    if (resetPage) this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  showList(): void {
    this.currentView = 'list';
    this.selectedAppointment = null;
    this.newAppointment = this.emptyAppointment();
    this.isEditing = false;
    this.formError = '';
    this.resetPatientSearch();
  }

  showCreate(): void {
    this.currentView = 'create';
    this.isEditing = false;
    this.formError = '';
    this.newAppointment = this.emptyAppointment(this.getInitialAppointmentDate());
    this.resetPatientSearch();
  }

  showEdit(appointment: Appointment): void {
    if (appointment.status !== 'Scheduled') return;

    this.currentView = 'create';
    this.isEditing = true;
    this.formError = '';
    this.newAppointment = { ...appointment };
    this.patientSearchTerm = appointment.contact;
    this.foundPatient = {
      id: appointment.patientId,
      encryptedId: appointment.patientEncryptedId || '',
      isActive: true,
      name: appointment.patientName,
      age: 0,
      gender: '',
      phone: appointment.contact,
      image: appointment.patientImage
    };
    this.patientSearchResults = [];
    this.patientSearchMessage = '';
  }

  showDetails(appointment: Appointment): void {
    this.selectedAppointment = appointment;
    this.currentView = 'view';
    this.errorMessage = '';
  }

  searchPatient(): void {
    const term = this.patientSearchTerm.trim();
    if (!term || this.isSearching) {
      this.patientSearchMessage = term ? '' : 'Enter a patient name or mobile number.';
      return;
    }

    this.isSearching = true;
    this.foundPatient = null;
    this.patientSearchResults = [];
    this.patientSearchMessage = '';
    this.patientService.searchPatients(term, 10).subscribe({
      next: (patients) => {
        this.patientSearchResults = patients || [];
        const exactPhoneMatch = this.patientSearchResults.find(patient => patient.phone.trim() === term);
        if (exactPhoneMatch) this.selectPatient(exactPhoneMatch);
        else if (this.patientSearchResults.length === 0) {
          this.patientSearchMessage = 'No patient found. Enter name and contact below to register a new patient.';
          this.newAppointment.contact = term;
        }
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Error searching patient:', error);
        this.patientSearchMessage = 'Patient search failed. Please try again.';
        this.isSearching = false;
      }
    });
  }

  selectPatient(patient: PatientViewModel): void {
    this.foundPatient = patient;
    this.patientSearchTerm = patient.phone;
    this.newAppointment.patientId = patient.id;
    this.newAppointment.patientEncryptedId = patient.encryptedId;
    this.newAppointment.patientName = patient.name;
    this.newAppointment.contact = patient.phone;
    this.newAppointment.patientImage = patient.image;
    this.patientSearchResults = [];
    this.patientSearchMessage = '';
  }

  clearSelectedPatient(): void {
    this.foundPatient = null;
    this.patientSearchResults = [];
    this.newAppointment.patientId = undefined;
    this.newAppointment.patientEncryptedId = undefined;
  }

  saveAppointment(): void {
    if (this.isSaving || !this.validateAppointment()) return;

    if (this.newAppointment.patientId) {
      this.persistAppointment(this.newAppointment.patientId);
      return;
    }

    this.isSaving = true;
    const patient: PatientDto = {
      name: this.newAppointment.patientName!.trim(),
      phone: this.newAppointment.contact!.trim(),
      age: 0,
      gender: 'Other',
      email: '',
      bloodGroup: '',
      address: ''
    };

    this.patientService.createPatient(patient).subscribe({
      next: (createdPatient: PatientViewModel) => {
        if (!createdPatient?.id) {
          this.handleSaveError(null, 'Patient was created but its ID was not returned.');
          return;
        }
        this.newAppointment.patientId = createdPatient.id;
        this.newAppointment.patientEncryptedId = createdPatient.encryptedId;
        this.persistAppointment(createdPatient.id, true);
      },
      error: (error) => this.handleSaveError(error, 'The patient could not be registered.')
    });
  }

  async updateStatus(status: 'Completed' | 'Cancelled' | 'No Show'): Promise<void> {
    const appointment = this.selectedAppointment;
    if (!appointment?.encryptedId || this.isUpdatingStatus) return;

    const confirmed = await confirmAppAction({
      title: `${status} appointment?`,
      text: `This will change ${appointment.patientName}'s appointment status to ${status}.`,
      confirmButtonText: `Yes, mark ${status}`,
      confirmButtonColor: status === 'Completed' ? '#16a34a' : '#dc2626'
    });
    if (!confirmed) return;

    this.isUpdatingStatus = true;
    this.appointmentService.updateStatus(appointment.encryptedId, status).subscribe({
      next: () => {
        appointment.status = status;
        const listAppointment = this.appointments.find(item => item.encryptedId === appointment.encryptedId);
        if (listAppointment) listAppointment.status = status;
        this.filterAppointments(false);
        this.isUpdatingStatus = false;
        this.notification.success('Success', `Appointment marked as ${status}.`);
      },
      error: (error) => {
        console.error('Error updating appointment status:', error);
        this.isUpdatingStatus = false;
        this.notification.error('Error', 'Appointment status could not be updated.');
      }
    });
  }

  openPrescription(appointment: Appointment): void {
    if (appointment.prescriptionEncryptedId) {
      void this.router.navigate(['/doctor/prescriptions', appointment.prescriptionEncryptedId]);
      return;
    }

    void this.router.navigate(['/doctor/prescriptions/new'], {
      queryParams: { appointmentId: appointment.encryptedId }
    });
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('') || 'P';
  }

  get dateTimeValue(): string {
    if (!this.newAppointment.dateTime) return '';
    const date = new Date(this.newAppointment.dateTime);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }

  set dateTimeValue(value: string) {
    this.newAppointment.dateTime = value ? new Date(value) : undefined;
  }

  private persistAppointment(patientId: number, patientAlreadySaving = false): void {
    this.isSaving = true;
    const dto: AppointmentDto = {
      encryptedId: this.isEditing ? this.newAppointment.encryptedId : undefined,
      patientId,
      doctorId: Number(this.authService.user()?.doctorId || 0),
      dateTime: this.newAppointment.dateTime!,
      reason: this.newAppointment.reason?.trim(),
      status: this.newAppointment.status || 'Scheduled',
      type: this.newAppointment.type || 'New Visit',
      notes: this.newAppointment.notes?.trim()
    };
    const request = this.isEditing
      ? this.appointmentService.updateAppointment(dto)
      : this.appointmentService.createAppointment(dto);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.selectedDate = this.formatLocalDate(new Date(dto.dateTime));
        this.notification.success(
          'Success',
          this.isEditing ? 'Appointment updated successfully.' : 'Appointment scheduled successfully.'
        );
        this.showList();
        this.loadAppointments();
      },
      error: (error) => this.handleSaveError(
        error,
        patientAlreadySaving
          ? 'Patient was registered, but the appointment could not be scheduled.'
          : this.isEditing
            ? 'Appointment could not be updated.'
            : 'Appointment could not be scheduled.'
      )
    });
  }

  private validateAppointment(): boolean {
    if (!this.newAppointment.patientName?.trim()) {
      this.formError = 'Patient name is required.';
      return false;
    }
    if (!this.newAppointment.contact?.trim()) {
      this.formError = 'Patient contact number is required.';
      return false;
    }
    if (!this.newAppointment.dateTime || Number.isNaN(new Date(this.newAppointment.dateTime).getTime())) {
      this.formError = 'Select a valid appointment date and time.';
      return false;
    }
    if (new Date(this.newAppointment.dateTime).getTime() < Date.now() - 60_000) {
      this.formError = 'Appointment date and time cannot be in the past.';
      return false;
    }
    this.formError = '';
    return true;
  }

  private handleSaveError(error: any, fallback: string): void {
    console.error(fallback, error);
    this.isSaving = false;
    this.formError = error?.error?.message || fallback;
    this.notification.error('Error', this.formError);
  }

  private mapAppointment(appointment: AppointmentViewModel): Appointment {
    return {
      id: appointment.id,
      encryptedId: appointment.encryptedId,
      patientId: appointment.patientId,
      patientEncryptedId: appointment.patientEncryptedId,
      patientName: appointment.patientName,
      patientImage: appointment.patientImage || undefined,
      dateTime: new Date(appointment.dateTime),
      reason: appointment.reason || '',
      status: appointment.status,
      type: appointment.type,
      contact: appointment.patientPhone,
      notes: appointment.notes,
      prescriptionEncryptedId: appointment.prescriptionEncryptedId
    };
  }

  private emptyAppointment(dateTime = new Date()): Partial<Appointment> {
    return { status: 'Scheduled', type: 'New Visit', dateTime };
  }

  private resetPatientSearch(): void {
    this.patientSearchTerm = '';
    this.foundPatient = null;
    this.patientSearchResults = [];
    this.patientSearchMessage = '';
    this.isSearching = false;
  }

  private getInitialAppointmentDate(): Date {
    const now = new Date();
    const selectedDay = new Date(`${this.selectedDate}T09:00:00`);
    if (this.formatLocalDate(now) === this.selectedDate) {
      now.setMinutes(0, 0, 0);
      now.setHours(now.getHours() + 1);
      return now;
    }
    return selectedDay;
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
