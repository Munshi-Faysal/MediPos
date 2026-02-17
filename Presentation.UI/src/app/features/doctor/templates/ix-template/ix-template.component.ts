import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../core/services/notification.service';
import { InvestigationService, InvestigationViewModel, InvestigationDto } from '../../../../core/services/investigation.service';

@Component({
    selector: 'app-ix-template',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ix-template.component.html',
    styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class IxTemplateComponent implements OnInit {
    private service = inject(InvestigationService);
    private notification = inject(NotificationService);

    currentView: 'list' | 'editor' = 'list';

    // Data State
    investigations = signal<InvestigationViewModel[]>([]);
    totalCount = signal<number>(0);
    currentPage = signal<number>(1);
    pageSize = signal<number>(10);
    isLoading = signal<boolean>(false);

    // Editor State
    editingInvestigation: InvestigationViewModel | null = null;
    investigationForm = {
        name: '',
        description: '',
        isActive: true
    };

    ngOnInit(): void {
        this.loadInvestigations();
    }

    loadInvestigations(): void {
        this.isLoading.set(true);
        this.service.getInvestigations({
            page: this.currentPage(),
            pageSize: this.pageSize()
        }).subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.investigations.set(response.data.itemList);
                    this.totalCount.set(response.data.totalItems);
                }
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error loading I/X templates', err);
                this.notification.error('Error', 'Failed to load templates');
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

    editTemplate(investigation: InvestigationViewModel) {
        this.currentView = 'editor';
        this.editingInvestigation = investigation;
        this.investigationForm = {
            name: investigation.name,
            description: investigation.description || '',
            isActive: investigation.isActive
        };
    }

    toggleStatus(investigation: InvestigationViewModel): void {
        this.service.changeInvestigationActiveStatus(investigation.encryptedId).subscribe({
            next: (success) => {
                if (success) {
                    this.notification.success('Success', 'Status updated successfully');
                    this.loadInvestigations();
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

    deleteTemplate(id: number) {
        // Not implemented on backend yet as delete, using deactivate usually.
    }

    saveTemplate() {
        if (!this.investigationForm.name) {
            this.notification.warning('Wait', 'Please fill in the name');
            return;
        }

        const dto: InvestigationDto = {
            encryptedId: this.editingInvestigation?.encryptedId || null,
            name: this.investigationForm.name,
            description: this.investigationForm.description,
            isActive: this.investigationForm.isActive
        };

        if (this.editingInvestigation) {
            this.service.updateInvestigation(dto).subscribe({
                next: (success) => {
                    if (success) {
                        this.notification.success('Success', 'Updated successfully');
                        this.showList();
                        this.loadInvestigations();
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
            this.service.createInvestigation(dto).subscribe({
                next: (success) => {
                    if (success) {
                        this.notification.success('Success', 'Created successfully');
                        this.showList();
                        this.loadInvestigations();
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
        this.editingInvestigation = null;
        this.investigationForm = {
            name: '',
            description: '',
            isActive: true
        };
    }

    onPageChange(page: number): void {
        this.currentPage.set(page);
        this.loadInvestigations();
    }
}
