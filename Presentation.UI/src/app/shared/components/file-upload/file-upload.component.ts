import { Component, Input, Output, EventEmitter, signal } from '@angular/core';


@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [],
  template: `
    <div class="file-upload-container">
      <input
        type="file"
        [accept]="acceptedTypes"
        (change)="onFileSelect($event)"
        class="hidden"
        #fileInput
        />
    
        <div
          class="file-upload-area"
          [class.drag-over]="isDragOver()"
          [class.has-file]="selectedFile()"
          (click)="fileInput.click()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          >
          <div class="file-upload-content">
            @if (!selectedFile()) {
              <div class="file-upload-empty">
                <svg class="h-12 w-12 text-on-surface-variant mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                </svg>
                <h3 class="text-lg font-semibold text-on-surface mb-2">{{ title }}</h3>
                <p class="text-on-surface-variant mb-4">{{ description }}</p>
                <button type="button" class="btn-outline">
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                  </svg>
                  Choose File
                </button>
                <p class="text-xs text-on-surface-variant mt-2">
                  or drag and drop your file here
                </p>
              </div>
            }
    
            @if (selectedFile()) {
              <div class="file-upload-selected">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg class="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-on-surface">{{ selectedFile()?.name }}</p>
                    <p class="text-xs text-on-surface-variant">{{ formatFileSize(selectedFile()?.size) }}</p>
                  </div>
                  <button
                    type="button"
                    (click)="removeFile($event)"
                    class="btn-ghost p-1"
                    title="Remove file"
                    >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
    
        <!-- File Preview -->
        @if (showPreview && selectedFile() && isPreviewable(selectedFile()!)) {
          <div class="mt-4">
            <h4 class="text-sm font-medium text-on-surface mb-2">Preview:</h4>
            <div class="bg-surface-variant rounded-lg p-4 max-h-48 overflow-auto">
              <pre class="text-xs text-on-surface-variant whitespace-pre-wrap">{{ filePreview() }}</pre>
            </div>
          </div>
        }
    
        <!-- Error Message -->
        @if (errorMessage()) {
          <div class="mt-2 text-sm text-error-600">
            {{ errorMessage() }}
          </div>
        }
    
        <!-- Help Text -->
        @if (helpText) {
          <div class="mt-2 text-sm text-on-surface-variant">
            {{ helpText }}
          </div>
        }
      </div>
    `,
  styles: [`
    .file-upload-container {
      @apply w-full;
    }
    
    .file-upload-area {
      @apply border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer transition-colors;
      @apply hover:border-primary-500 hover:bg-primary-50;
    }
    
    .file-upload-area.drag-over {
      @apply border-primary-500 bg-primary-50;
    }
    
    .file-upload-area.has-file {
      @apply border-primary-500 bg-primary-50;
    }
    
    .file-upload-content {
      @apply pointer-events-none;
    }
    
    .file-upload-empty {
      @apply flex flex-col items-center;
    }
    
    .file-upload-selected {
      @apply flex items-center justify-center;
    }
  `]
})
export class FileUploadComponent {
  @Input() title = 'Upload File';
  @Input() description = 'Select a file to upload';
  @Input() acceptedTypes = '*/*';
  @Input() maxSize: number = 10 * 1024 * 1024; // 10MB
  @Input() showPreview = true;
  @Input() helpText = '';
  
  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileRemoved = new EventEmitter<void>();

  public selectedFile = signal<File | null>(null);
  public isDragOver = signal(false);
  public errorMessage = signal<string | null>(null);
  public filePreview = signal<string>('');

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.errorMessage.set(null);
    
    // Validate file size
    if (file.size > this.maxSize) {
      this.errorMessage.set(`File size must be less than ${this.formatFileSize(this.maxSize)}`);
      return;
    }
    
    // Validate file type
    if (this.acceptedTypes !== '*/*' && !this.isValidFileType(file)) {
      this.errorMessage.set(`File type not supported. Accepted types: ${this.acceptedTypes}`);
      return;
    }
    
    this.selectedFile.set(file);
    this.fileSelected.emit(file);
    
    // Load preview for text files
    if (this.showPreview && this.isPreviewable(file)) {
      this.loadFilePreview(file);
    }
  }

  private isValidFileType(file: File): boolean {
    const acceptedTypes = this.acceptedTypes.split(',').map(type => type.trim());
    return acceptedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType + '/');
      }
      return file.type === type;
    });
  }

  public isPreviewable(file: File): boolean {
    const previewableTypes = [
      'text/plain',
      'text/csv',
      'application/json',
      'text/xml',
      'application/xml'
    ];
    return previewableTypes.includes(file.type) || file.name.endsWith('.txt') || file.name.endsWith('.csv');
  }

  private loadFilePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      this.filePreview.set(content.substring(0, 1000)); // Limit preview to 1000 characters
    };
    reader.readAsText(file);
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile.set(null);
    this.filePreview.set('');
    this.errorMessage.set(null);
    this.fileRemoved.emit();
  }

  formatFileSize(bytes: number | undefined): string {
    if (!bytes) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
