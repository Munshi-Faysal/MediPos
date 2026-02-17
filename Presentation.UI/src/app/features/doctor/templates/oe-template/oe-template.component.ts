import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../core/services/notification.service';
import { OnExaminationService, OnExaminationViewModel, OnExaminationDto } from '../../../../core/services/on-examination.service';

@Component({
    selector: 'app-oe-template',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './oe-template.component.html',
    styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class OeTemplateComponent implements OnInit {
    private service = inject(OnExaminationService);
    private notification = inject(NotificationService);

    currentView: 'list' | 'editor' = 'list';

    // Data State
    examinations = signal<OnExaminationViewModel[]>([]);
    totalCount = signal<number>(0);
    currentPage = signal<number>(1);
    pageSize = signal<number>(10);
    isLoading = signal<boolean>(false);

    // Editor State
    editingExamination: OnExaminationViewModel | null = null;
    examinationForm = {
        name: '',
        description: '',
        isActive: true
    };

    ngOnInit(): void {
        this.loadExaminations();
    }

    loadExaminations(): void {
        this.isLoading.set(true);
        this.service.getOnExaminations({
            page: this.currentPage(),
            pageSize: this.pageSize()
        }).subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.examinations.set(response.data.itemList);
                    this.totalCount.set(response.data.totalItems);
                }
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error loading O/E templates', err);
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

    editTemplate(examination: OnExaminationViewModel) {
        this.currentView = 'editor';
        this.editingExamination = examination;
        this.examinationForm = {
            name: examination.name,
            description: examination.description || '',
            isActive: examination.isActive
        };
    }

    toggleStatus(examination: OnExaminationViewModel): void {
        this.service.changeOnExaminationActiveStatus(examination.encryptedId).subscribe({
            next: (success) => {
                if (success) {
                    this.notification.success('Success', 'Status updated successfully');
                    this.loadExaminations();
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
        if (!this.examinationForm.name) {
            this.notification.warning('Wait', 'Please fill in the name');
            return;
        }

        const dto: OnExaminationDto = {
            encryptedId: this.editingExamination?.encryptedId || null,
            name: this.examinationForm.name,
            description: this.examinationForm.description,
            isActive: this.examinationForm.isActive
        };

        if (this.editingExamination) {
            this.service.updateOnExamination(dto).subscribe({
                next: (success) => {
                    if (success) {
                        this.notification.success('Success', 'Updated successfully');
                        this.showList();
                        this.loadExaminations();
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
            this.service.createOnExamination(dto).subscribe({
                next: (success) => {
                    if (success) {
                        this.notification.success('Success', 'Created successfully');
                        this.showList();
                        this.loadExaminations();
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
        this.editingExamination = null;
        this.examinationForm = {
            name: '',
            description: '',
            isActive: true
        };
    }

    onPageChange(page: number): void {
        this.currentPage.set(page);
        this.loadExaminations();
    }
}
