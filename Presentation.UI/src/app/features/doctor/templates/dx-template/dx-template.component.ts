import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../core/services/notification.service';
import { DiseaseService, DiseaseViewModel, DiseaseDto } from '../../../../core/services/disease.service';

@Component({
    selector: 'app-dx-template',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './dx-template.component.html',
    styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class DxTemplateComponent implements OnInit {
    private service = inject(DiseaseService);
    private notification = inject(NotificationService);

    currentView: 'list' | 'editor' = 'list';

    // Data State
    diseases = signal<DiseaseViewModel[]>([]);
    totalCount = signal<number>(0);
    currentPage = signal<number>(1);
    pageSize = signal<number>(10);
    isLoading = signal<boolean>(false);

    // Editor State
    editingDisease: DiseaseViewModel | null = null;
    diseaseForm = {
        name: '',
        description: '',
        isActive: true
    };

    ngOnInit(): void {
        this.loadDiseases();
    }

    loadDiseases(): void {
        this.isLoading.set(true);
        this.service.getDiseases({
            page: this.currentPage(),
            pageSize: this.pageSize()
        }).subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.diseases.set(response.data.itemList);
                    this.totalCount.set(response.data.totalItems);
                }
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error loading D/X templates', err);
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

    editTemplate(disease: DiseaseViewModel) {
        this.currentView = 'editor';
        this.editingDisease = disease;
        this.diseaseForm = {
            name: disease.name,
            description: disease.description || '',
            isActive: disease.isActive
        };
    }

    toggleStatus(disease: DiseaseViewModel): void {
        this.service.changeDiseaseActiveStatus(disease.encryptedId).subscribe({
            next: (success) => {
                if (success) {
                    this.notification.success('Success', 'Status updated successfully');
                    this.loadDiseases();
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
        if (!this.diseaseForm.name) {
            this.notification.warning('Wait', 'Please fill in the name');
            return;
        }

        const dto: DiseaseDto = {
            encryptedId: this.editingDisease?.encryptedId || null,
            name: this.diseaseForm.name,
            description: this.diseaseForm.description,
            isActive: this.diseaseForm.isActive
        };

        if (this.editingDisease) {
            this.service.updateDisease(dto).subscribe({
                next: (success) => {
                    if (success) {
                        this.notification.success('Success', 'Updated successfully');
                        this.showList();
                        this.loadDiseases();
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
            this.service.createDisease(dto).subscribe({
                next: (success) => {
                    if (success) {
                        this.notification.success('Success', 'Created successfully');
                        this.showList();
                        this.loadDiseases();
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
        this.editingDisease = null;
        this.diseaseForm = {
            name: '',
            description: '',
            isActive: true
        };
    }

    onPageChange(page: number): void {
        this.currentPage.set(page);
        this.loadDiseases();
    }
}
