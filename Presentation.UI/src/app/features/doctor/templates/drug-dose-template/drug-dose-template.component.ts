import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../core/services/notification.service';
import { DrugDoseTemplateService, DrugDoseTemplateViewModel, DrugDoseTemplateDto } from '../../../../core/services/drug-dose-template.service';
import { confirmAppAction } from '../../../../core/utils/app-alert';

@Component({
  selector: 'app-drug-dose-template',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './drug-dose-template.component.html',
  styleUrl: './drug-dose-template.component.scss'
})
export class DrugDoseTemplateComponent implements OnInit {
  private service = inject(DrugDoseTemplateService);
  private notification = inject(NotificationService);

  currentView: 'list' | 'editor' = 'list';

  // Data State
  templates = signal<DrugDoseTemplateViewModel[]>([]);
  totalCount = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = signal<number>(1000);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  deletingId = signal<string | null>(null);
  searchTerm = signal<string>('');

  readonly commonDosePresets = [
    { name: '1+0+0', description: 'Once daily in the morning' },
    { name: '0+1+0', description: 'Once daily at noon' },
    { name: '0+0+1', description: 'Once daily at night' },
    { name: '1+0+1', description: 'Morning and night' },
    { name: '1+1+1', description: 'Three times daily' },
    { name: '1/2+0+1/2', description: 'Half tablet morning and night' }
  ];

  filteredTemplates = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) return this.templates();

    return this.templates().filter(template =>
      template.name.toLowerCase().includes(query) ||
      (template.description || '').toLowerCase().includes(query)
    );
  });

  activeCount = computed(() => this.templates().filter(template => template.isActive).length);
  inactiveCount = computed(() => this.templates().filter(template => !template.isActive).length);

  // Editor State
  editingTemplate: DrugDoseTemplateViewModel | null = null;
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
    this.service.getDrugDoseTemplates({
      page: this.currentPage(),
      pageSize: this.pageSize()
    }).subscribe({
      next: (response) => {
        if (response?.isSuccess && response.data) {
          const items = response.data.itemList || [];
          this.templates.set(items);
          this.totalCount.set(response.data.totalItems ?? (response.data as any).totalRecords ?? items.length);
        } else {
          this.templates.set([]);
          this.totalCount.set(0);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading Dose templates', err);
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

  createFromPreset(preset: { name: string; description: string }): void {
    this.resetForm();
    this.templateForm.name = preset.name;
    this.templateForm.description = preset.description;
    this.currentView = 'editor';
  }

  updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  editTemplate(template: DrugDoseTemplateViewModel) {
    this.currentView = 'editor';
    this.editingTemplate = template;
    this.templateForm = {
      name: template.name,
      description: template.description || '',
      isActive: template.isActive
    };
  }

  toggleStatus(template: DrugDoseTemplateViewModel): void {
    this.service.changeDrugDoseTemplateActiveStatus(template.encryptedId).subscribe({
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

  async deleteTemplate(template: DrugDoseTemplateViewModel): Promise<void> {
    const confirmed = await confirmAppAction({
      title: 'Delete dose?',
      text: `“${template.name}” will be permanently deleted.`,
      confirmButtonText: 'Yes, delete'
    });

    if (!confirmed || this.deletingId()) return;

    this.deletingId.set(template.encryptedId);
    this.service.deleteDrugDoseTemplate(template.encryptedId).subscribe({
      next: (success) => {
        this.deletingId.set(null);
        if (!success) {
          this.notification.error('Delete failed', 'You can only delete your own dose templates');
          return;
        }

        this.templates.update(items => items.filter(item => item.encryptedId !== template.encryptedId));
        this.totalCount.update(count => Math.max(0, count - 1));
        this.notification.success('Dose deleted', `${template.name} was deleted successfully`);
      },
      error: (err) => {
        this.deletingId.set(null);
        console.error('Error deleting dose template', err);
        this.notification.error('Delete failed', 'An error occurred while deleting the dose');
      }
    });
  }

  saveTemplate() {
    const name = this.templateForm.name.trim();
    if (!name) {
      this.notification.warning('Dose required', 'Please enter a dose, for example 1+0+1');
      return;
    }

    const duplicate = this.templates().some(template =>
      template.encryptedId !== this.editingTemplate?.encryptedId &&
      template.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      this.notification.warning('Already exists', 'A dose template with this name already exists');
      return;
    }

    const dto: DrugDoseTemplateDto = {
      encryptedId: this.editingTemplate?.encryptedId || null,
      name,
      description: this.templateForm.description.trim(),
      isActive: this.templateForm.isActive
    };

    this.isSaving.set(true);

    if (this.editingTemplate) {
      this.service.updateDrugDoseTemplate(dto).subscribe({
        next: (success) => {
          if (success) {
            this.notification.success('Dose updated', `${name} is ready to use in prescriptions`);
            this.showList();
            this.loadTemplates();
          } else {
            this.notification.error('Error', 'Failed to update');
          }
          this.isSaving.set(false);
        },
        error: (err) => {
          console.error('Error updating', err);
          this.notification.error('Error', 'An error occurred');
          this.isSaving.set(false);
        }
      });
    } else {
      this.service.createDrugDoseTemplate(dto).subscribe({
        next: (success) => {
          if (success) {
            this.notification.success('Dose added', `${name} is now available in prescriptions`);
            this.showList();
            this.loadTemplates();
          } else {
            this.notification.error('Error', 'Failed to create');
          }
          this.isSaving.set(false);
        },
        error: (err) => {
          console.error('Error creating', err);
          this.notification.error('Error', 'An error occurred');
          this.isSaving.set(false);
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
