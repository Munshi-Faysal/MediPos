import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../core/services/notification.service';
import { TreatmentService } from '../../../../core/services/treatment.service';
import { DrugService, DrugViewModel } from '../../../../core/services/drug.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TreatmentTemplateViewModel, TreatmentDrugViewModel, TreatmentTemplateDto } from '../../../../core/models';

@Component({
    selector: 'app-treatment-template',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './treatment-template.component.html',
    styles: [`
    .autocomplete-dropdown {
      @apply absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1;
    }
    .autocomplete-item {
      @apply px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm;
    }
  `]
})
export class TreatmentTemplateComponent implements OnInit {
    private notification = inject(NotificationService);
    private treatmentService = inject(TreatmentService);
    private drugService = inject(DrugService);
    private authService = inject(AuthService);

    currentView: 'list' | 'editor' = 'list';
    templateName = '';
    editingTemplateId: string | null = null;

    // Inputs
    searchQuery = '';
    selectedDrug: DrugViewModel | null = null;
    dose = '';
    duration = '';
    durationType: string = 'Days';
    instructionBefore = false;
    instructionAfter = false;

    // Lists
    addedDrugs: TreatmentDrugViewModel[] = [];
    templates: TreatmentTemplateViewModel[] = [];
    allDrugs: DrugViewModel[] = [];
    filteredDrugs: DrugViewModel[] = [];
    showDrugResult = false;
    isLoading = false;

    // Presets
    dosePresets: string[] = ['1+0+1', '1+1+1', '0+0+1', '1+0+0', '0+1+0', '0+0+0'];
    showDoseDropdown = false;

    durationPresets: string[] = ['1', '3', '5', '7', '10', '14', '15', '21', '30'];
    showDurationDropdown = false;

    ngOnInit() {
        this.loadTemplates();
        this.loadActiveDrugs();
    }

    loadTemplates() {
        const doctorId = this.authService.user()?.doctorId;
        if (!doctorId) return;

        this.isLoading = true;
        this.treatmentService.getTemplatesByDoctor(doctorId.toString()).subscribe({
            next: (res) => {
                this.templates = res.data || [];
                this.isLoading = false;
            },
            error: () => {
                this.notification.error('Error', 'Failed to load templates');
                this.isLoading = false;
            }
        });
    }

    loadActiveDrugs() {
        this.drugService.getDrugs({ pageSize: 1000 }).subscribe({
            next: (res) => {
                this.allDrugs = res.data || [];
            }
        });
    }

    // List View Actions
    showList() {
        this.currentView = 'list';
        this.resetEditor();
        this.loadTemplates();
    }

    createNew() {
        this.currentView = 'editor';
        this.resetEditor();
    }

    editTemplate(template: TreatmentTemplateViewModel) {
        if (!template.encryptedId) return;

        this.isLoading = true;
        this.treatmentService.getTemplateById(template.encryptedId).subscribe({
            next: (res) => {
                if (res.data) {
                    this.currentView = 'editor';
                    this.editingTemplateId = res.data.encryptedId || null;
                    this.templateName = res.data.name;
                    this.addedDrugs = res.data.treatmentDrugs || [];
                }
                this.isLoading = false;
            },
            error: () => {
                this.notification.error('Error', 'Failed to load template details');
                this.isLoading = false;
            }
        });
    }

    deleteTemplate(id: string | undefined) {
        if (!id) return;
        if (confirm('Are you sure you want to delete this template?')) {
            this.treatmentService.deleteTemplate(id).subscribe({
                next: () => {
                    this.notification.success('Deleted', 'Template deleted successfully');
                    this.loadTemplates();
                },
                error: () => this.notification.error('Error', 'Failed to delete template')
            });
        }
    }

    // Drug Search
    searchDrug() {
        if (!this.searchQuery) {
            this.filteredDrugs = [];
            this.showDrugResult = false;
            return;
        }
        const term = this.searchQuery.toLowerCase();
        this.filteredDrugs = this.allDrugs.filter(d =>
            d.name.toLowerCase().includes(term) ||
            (d.genericName && d.genericName.toLowerCase().includes(term))
        );
        this.showDrugResult = true;
    }

    selectDrug(drug: DrugViewModel) {
        this.selectedDrug = drug;
        this.searchQuery = `${drug.name} ${drug.drugStrengthName || ''}`;
        this.showDrugResult = false;
    }

    // Dose Handling
    selectDose(d: string) {
        this.dose = d;
        this.showDoseDropdown = false;
    }

    // Add to List
    addDrug() {
        if (!this.selectedDrug) return;

        let instrText = '';
        let instr = '';

        if (this.instructionBefore) {
            instr = 'Before Food';
            instrText = 'খাবার আগে';
        } else if (this.instructionAfter) {
            instr = 'After Food';
            instrText = 'খাবার পর';
        }

        const entry: TreatmentDrugViewModel = {
            drugDetailEncryptedId: this.selectedDrug.encryptedId,
            brandName: this.selectedDrug.name,
            genericName: this.selectedDrug.genericName,
            strength: this.selectedDrug.drugStrengthName,
            type: this.selectedDrug.drugTypeName || 'Tab',
            company: this.selectedDrug.drugCompanyName,
            dose: this.dose,
            duration: this.duration,
            durationType: this.durationType,
            instruction: instr,
            instructionText: instrText
        };

        this.addedDrugs.push(entry);
        this.resetInputs();
    }

    removeDrug(index: number) {
        this.addedDrugs.splice(index, 1);
    }

    resetInputs() {
        this.searchQuery = '';
        this.selectedDrug = null;
        this.dose = '';
        this.duration = '';
        this.instructionBefore = false;
        this.instructionAfter = false;
    }

    resetEditor() {
        this.templateName = '';
        this.addedDrugs = [];
        this.editingTemplateId = null;
        this.resetInputs();
    }

    saveTemplate() {
        if (!this.templateName) {
            this.notification.warning('Missing Name', 'Please enter a template name');
            return;
        }
        if (this.addedDrugs.length === 0) {
            this.notification.warning('Empty Template', 'Please add at least one drug');
            return;
        }

        const doctorId = this.authService.user()?.doctorId;
        if (!doctorId) {
            this.notification.error('Error', 'Doctor information not found');
            return;
        }

        const dto: TreatmentTemplateDto = {
            encryptedId: this.editingTemplateId || undefined,
            name: this.templateName,
            doctorId: doctorId,
            treatmentDrugs: this.addedDrugs.map(d => ({
                drugDetailEncryptedId: d.drugDetailEncryptedId,
                dose: d.dose,
                duration: d.duration,
                durationType: d.durationType,
                instruction: d.instruction,
                instructionText: d.instructionText
            }))
        };

        this.isLoading = true;
        const request = this.editingTemplateId
            ? this.treatmentService.updateTemplate(dto)
            : this.treatmentService.createTemplate(dto);

        request.subscribe({
            next: () => {
                this.notification.success('Success', `Template ${this.editingTemplateId ? 'updated' : 'saved'} successfully`);
                this.showList();
                this.isLoading = false;
            },
            error: () => {
                this.notification.error('Error', 'Failed to save template');
                this.isLoading = false;
            }
        });
    }

    closeDropdowns() {
        this.showDrugResult = false;
        this.showDoseDropdown = false;
        this.showDurationDropdown = false;
    }
}
