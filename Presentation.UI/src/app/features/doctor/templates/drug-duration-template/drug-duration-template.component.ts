import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../core/services/notification.service';
import { DrugDurationTemplateService, DrugDurationTemplateViewModel, DrugDurationTemplateDto } from '../../../../core/services/drug-duration-template.service';

@Component({
  selector: 'app-drug-duration-template',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './drug-duration-template.component.html',
  styleUrl: './drug-duration-template.component.scss'
})
export class DrugDurationTemplateComponent implements OnInit {
  private service = inject(DrugDurationTemplateService);
  private notification = inject(NotificationService);

  currentView: 'list' | 'editor' = 'list';

  // Data State
  templates = signal<DrugDurationTemplateViewModel[]>([]);
  totalCount = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  isLoading = signal<boolean>(false);

  // Editor State
  editingTemplate: DrugDurationTemplateViewModel | null = null;
  templateForm = {
    name: '',
    description: '',
    isActive: true
  };

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.isLoading.set(true);
    this.service.getDrugDurationTemplates({
      page: this.currentPage(),
      pageSize: this.pageSize()
    }).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.templates.set(response.data.itemList);
          this.totalCount.set(response.data.totalItems);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading Duration templates', err);
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

  editTemplate(template: DrugDurationTemplateViewModel) {
    this.currentView = 'editor';
    this.editingTemplate = template;
    this.templateForm = {
      name: template.name,
      description: template.description || '',
      isActive: template.isActive
    };
  }

  toggleStatus(template: DrugDurationTemplateViewModel): void {
    this.service.changeDrugDurationTemplateActiveStatus(template.encryptedId).subscribe({
      next: (success) => {
        if (success) {
          this.notification.success('Success', 'Status updated successfully');
          this.loadTemplates();
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
    if (!this.templateForm.name) {
      this.notification.warning('Wait', 'Please fill in the name');
      return;
    }

    const dto: DrugDurationTemplateDto = {
      encryptedId: this.editingTemplate?.encryptedId || null,
      name: this.templateForm.name,
      description: this.templateForm.description,
      isActive: this.templateForm.isActive
    };

    if (this.editingTemplate) {
      this.service.updateDrugDurationTemplate(dto).subscribe({
        next: (success) => {
          if (success) {
            this.notification.success('Success', 'Updated successfully');
            this.showList();
            this.loadTemplates();
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
      this.service.createDrugDurationTemplate(dto).subscribe({
        next: (success) => {
          if (success) {
            this.notification.success('Success', 'Created successfully');
            this.showList();
            this.loadTemplates();
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
    this.editingTemplate = null;
    this.templateForm = {
      name: '',
      description: '',
      isActive: true
    };
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadTemplates();
  }
}
