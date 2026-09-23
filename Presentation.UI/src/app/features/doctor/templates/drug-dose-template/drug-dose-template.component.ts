import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../core/services/notification.service';
import { DrugDoseTemplateService, DrugDoseTemplateViewModel, DrugDoseTemplateDto } from '../../../../core/services/drug-dose-template.service';

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
    morning: '',
    noon: '',
    night: '',
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
    const [morning, noon, night] = this.splitDose(preset.name);
    this.templateForm.morning = morning;
    this.templateForm.noon = noon;
    this.templateForm.night = night;
    this.templateForm.description = preset.description;
    this.currentView = 'editor';
  }

  updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  editTemplate(template: DrugDoseTemplateViewModel) {
    this.currentView = 'editor';
    this.editingTemplate = template;
    const [morning, noon, night] = this.splitDose(template.name);
    this.templateForm = {
      morning,
      noon,
      night,
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

  saveTemplate() {
    const name = this.dosePreview();
    if (!this.templateForm.morning.trim() && !this.templateForm.noon.trim() && !this.templateForm.night.trim()) {
      this.notification.warning('Dose required', 'Please enter at least one morning, noon or night dose');
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
      morning: '',
      noon: '',
      night: '',
      description: '',
      isActive: true
    };
  }

  dosePreview(): string {
    return [
      this.templateForm.morning.trim() || '0',
      this.templateForm.noon.trim() || '0',
      this.templateForm.night.trim() || '0'
    ].join('+');
  }

  private splitDose(dose: string): [string, string, string] {
    const parts = (dose || '').split('+').map(part => part.trim());
    return [parts[0] || '0', parts[1] || '0', parts.slice(2).join('+') || '0'];
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadTemplates();
  }
}
