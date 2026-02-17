import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService, AppointmentDto, AppointmentViewModel } from '../../../core/services/appointment.service';
import { PatientService, PatientViewModel } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';

export interface Appointment {
    id: number;
    encryptedId: string;
    patientId: number;
    patientName: string;
    patientImage?: string;
    dateTime: Date;
    reason: string;
    status: string;
    type: string;
    notes?: string;
    contact: string;
}

@Component({
    selector: 'app-appointment',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './appointment.component.html',
    styles: []
})
export class AppointmentComponent implements OnInit {
    private appointmentService = inject(AppointmentService);
    private patientService = inject(PatientService);
    private authService = inject(AuthService);

    currentView: 'list' | 'create' | 'view' = 'list';
    searchTerm = '';
    selectedDate: string = new Date().toISOString().split('T')[0]; // Default to today
    selectedAppointment: Appointment | null = null;
    appointments: Appointment[] = [];
    filteredAppointments: Appointment[] = [];

    // Form Model
    newAppointment: Partial<Appointment> = {
        status: 'Scheduled',
        type: 'New Visit',
        dateTime: new Date()
    };

    patientSearchTerm = '';
    foundPatient: PatientViewModel | null = null;
    isSearching = false;

    ngOnInit() {
        this.loadAppointments();
    }

    loadAppointments() {
        const doctorId = this.authService.user()?.doctorId;
        if (!doctorId) {
            console.warn('DoctorId not found in user profile');
            return;
        }

        this.appointmentService.getAppointmentsByDate(doctorId.toString(), this.selectedDate).subscribe({
            next: (res: any) => {
                const data = res.data || [];
                this.appointments = data.map((a: AppointmentViewModel) => ({
                    id: 0,
                    encryptedId: a.encryptedId,
                    patientId: a.patientId,
                    patientName: a.patientName,
                    patientImage: a.patientImage || 'https://i.pravatar.cc/150?u=' + a.patientId,
                    dateTime: new Date(a.dateTime),
                    reason: a.reason || '',
                    status: a.status,
                    type: a.type,
                    contact: a.patientPhone,
                    notes: a.notes
                }));
                this.filterAppointments();
            },
            error: (err: any) => console.error('Error loading appointments:', err)
        });
    }

    filterAppointments() {
        let filtered = this.appointments;

        // Filter by Date
        if (this.selectedDate) {
            const dateStr = new Date(this.selectedDate).toDateString();
            filtered = filtered.filter(a => new Date(a.dateTime).toDateString() === dateStr);
        }

        // Filter by Search Term
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(a =>
                a.patientName.toLowerCase().includes(term) ||
                a.contact.includes(term)
            );
        }

        this.filteredAppointments = filtered.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    }

    // Views
    showList() {
        this.currentView = 'list';
        this.selectedAppointment = null;
        this.newAppointment = { status: 'Scheduled', type: 'New Visit', dateTime: new Date() };
        this.resetSearch();
    }

    showCreate() {
        this.currentView = 'create';
        const initialDate = this.selectedDate ? new Date(this.selectedDate) : new Date();
        initialDate.setMinutes(0, 0, 0);
        initialDate.setHours(initialDate.getHours() + 1);

        this.newAppointment = {
            status: 'Scheduled',
            type: 'New Visit',
            dateTime: initialDate
        };
        this.resetSearch();
    }

    showDetails(appointment: Appointment) {
        this.selectedAppointment = appointment;
        this.currentView = 'view';
    }

    // Patient Search Logic
    searchPatient() {
        if (!this.patientSearchTerm) return;

        this.isSearching = true;
        this.patientService.getByPhone(this.patientSearchTerm).subscribe({
            next: (res: any) => {
                const found = res.data;
                if (found) {
                    this.foundPatient = found;
                    this.newAppointment.patientName = found.name;
                    this.newAppointment.contact = found.phone;
                    this.newAppointment.patientId = Number(found.id || 0); // Need numeric ID
                    this.newAppointment.patientImage = found.image;
                } else {
                    this.foundPatient = null;
                    this.newAppointment.contact = this.patientSearchTerm;
                }
                this.isSearching = false;
            },
            error: (err: any) => {
                console.error('Error searching patient:', err);
                this.isSearching = false;
            }
        });
    }

    useFoundPatient() {
        if (this.foundPatient) {
            this.newAppointment.patientName = this.foundPatient.name;
            this.newAppointment.contact = this.foundPatient.phone;
            // ... set other fields
        }
    }

    resetSearch() {
        this.patientSearchTerm = '';
        this.foundPatient = null;
        this.isSearching = false;
    }

    // Actions
    createAppointment() {
        if (!this.newAppointment.patientName || !this.newAppointment.dateTime) return;

        const doctorId = this.authService.user()?.doctorId;
        if (!doctorId) {
            console.error('DoctorId not found in user profile');
            return;
        }

        // If patient doesn't exist, we might need to create it first, 
        // but for now let's assume patientId is available or we just create for existing.
        // In a real app, if patientId is null, we'd call patientService.createPatient first.

        const dto: AppointmentDto = {
            patientId: this.newAppointment.patientId || 0,
            doctorId: doctorId,
            dateTime: this.newAppointment.dateTime,
            reason: this.newAppointment.reason,
            status: this.newAppointment.status || 'Scheduled',
            type: this.newAppointment.type || 'New Visit',
            notes: this.newAppointment.notes
        };

        this.appointmentService.createAppointment(dto).subscribe({
            next: () => {
                this.loadAppointments();
                this.showList();
            },
            error: (err: any) => console.error('Error creating appointment:', err)
        });
    }

    updateStatus(status: any) {
        if (this.selectedAppointment && this.selectedAppointment.encryptedId) {
            this.appointmentService.updateStatus(this.selectedAppointment.encryptedId, status).subscribe({
                next: () => {
                    this.selectedAppointment!.status = status;
                    this.loadAppointments();
                },
                error: (err: any) => console.error('Error updating status:', err)
            });
        }
    }

    // Helper for Date Input (datetime-local format: YYYY-MM-DDTHH:mm)
    get dateTimeValue(): string {
        if (!this.newAppointment.dateTime) return '';
        const d = new Date(this.newAppointment.dateTime);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    }

    set dateTimeValue(v: string) {
        this.newAppointment.dateTime = new Date(v);
    }
}
