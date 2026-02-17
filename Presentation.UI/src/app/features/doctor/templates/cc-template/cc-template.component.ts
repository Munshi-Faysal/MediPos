import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../core/services/notification.service';
import { ChiefComplaintService, ChiefComplaintViewModel, ChiefComplaintDto } from '../../../../core/services/chief-complaint.service';
import { PaginatedList } from '../../../../core/models';

@Component({
    selector: 'app-cc-template',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './cc-template.component.html',
    styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class CcTemplateComponent implements OnInit {
    private service = inject(ChiefComplaintService);
    private notification = inject(NotificationService);

    currentView: 'list' | 'editor' = 'list';

    // Data State
    complaints = signal<ChiefComplaintViewModel[]>([]);
    totalCount = signal<number>(0);
    currentPage = signal<number>(1);
    pageSize = signal<number>(10);
    isLoading = signal<boolean>(false);

    // Editor State
    editingComplaint: ChiefComplaintViewModel | null = null;
    complaintForm = {
        name: '',
        description: '',
        isActive: true
    };

    ngOnInit(): void {
        this.loadComplaints();
    }

    loadComplaints(): void {
        this.isLoading.set(true);
        this.service.getChiefComplaints({
            page: this.currentPage(),
            pageSize: this.pageSize()
        }).subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.complaints.set(response.data.itemList);
                    this.totalCount.set(response.data.totalItems);
                }
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error loading complaints', err);
                this.notification.error('Error', 'Failed to load complaints');
                this.isLoading.set(false);
            }
        });
    }

    showList() {
        this.currentView = 'list';
        this.resetForm();
    }

    createNew() {
        this.currentView = 'editor';
        this.resetForm();
    }

    editTemplate(complaint: ChiefComplaintViewModel) {
        this.currentView = 'editor';
        this.editingComplaint = complaint;
        this.complaintForm = {
            name: complaint.name,
            description: complaint.description || '',
            isActive: complaint.isActive
        };
    }

    deleteTemplate(id: number) {
        // Not implemented in backend yet, using toggle status usually or skipping delete.
        // Assuming we want to deactivate instead of delete based on service methods available.
        // But the previous mock had delete.
        // I will implement toggle status which acts as "soft delete" or "deactivate".
    }

    toggleStatus(complaint: ChiefComplaintViewModel): void {
        this.service.changeChiefComplaintActiveStatus(complaint.encryptedId).subscribe({
            next: (success) => {
                if (success) {
                    this.notification.success('Success', 'Status updated successfully');
                    this.loadComplaints();
                } else {
                    this.notification.error('Error', 'Failed to update status');
                }
            },
            error: (err) => {
                console.error('Error toggling status', err);
                this.notification.error('Error', 'An error occurred');
            }
        });
    }

    saveTemplate() {
        if (!this.complaintForm.name) {
            this.notification.warning('Wait', 'Please fill in the name');
            return;
        }

        const dto: ChiefComplaintDto = {
            encryptedId: this.editingComplaint?.encryptedId || null,
            name: this.complaintForm.name,
            description: this.complaintForm.description,
            isActive: this.complaintForm.isActive,
            displayOrder: 0 // Default
        };

        if (this.editingComplaint) {
            this.service.updateChiefComplaint(dto).subscribe({
                next: (success) => {
                    if (success) {
                        this.notification.success('Success', 'Updated successfully');
                        this.showList();
                        this.loadComplaints();
                    } else {
                        this.notification.error('Error', 'Failed to update');
                    }
                },
                error: (err) => {
                    console.error('Error updating', err);
                    this.notification.error('Error', 'An error occurred');
                }
            });
        } else {
            this.service.createChiefComplaint(dto).subscribe({
                next: (success) => {
                    if (success) {
                        this.notification.success('Success', 'Created successfully');
                        this.showList();
                        this.loadComplaints();
                    } else {
                        this.notification.error('Error', 'Failed to create');
                    }
                },
                error: (err) => {
                    console.error('Error creating', err);
                    this.notification.error('Error', 'An error occurred');
                }
            });
        }
    }

    resetForm() {
        this.editingComplaint = null;
        this.complaintForm = {
            name: '',
            description: '',
            isActive: true
        };
    }

    onPageChange(page: number): void {
        this.currentPage.set(page);
        this.loadComplaints();
    }
}
