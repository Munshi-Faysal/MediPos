import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { TableColumn } from '../models';

export type TableData = Record<string, any>;

export type ExportFormat = 'pdf' | 'excel';
export type ExportScope = 'selected' | 'page' | 'all';

export interface ExportOptions {
  scope: ExportScope;
  format: ExportFormat;
  filename?: string;
  title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  /**
   * Export table data based on the provided options
   */
  exportData(
    columns: TableColumn[],
    allData: TableData[],
    selectedData: TableData[] = [],
    currentPageData: TableData[] = [],
    options: ExportOptions
  ): void {
    let dataToExport: TableData[] = [];

    // Determine which data to export based on scope
    switch (options.scope) {
      case 'selected':
        dataToExport = selectedData;
        break;
      case 'page':
        dataToExport = currentPageData;
        break;
      case 'all':
        dataToExport = allData;
        break;
    }

    if (dataToExport.length === 0) {
      throw new Error('No data available for export');
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = options.filename ? `${options.filename}_${timestamp}` : `export_${timestamp}`;

    // Export based on format
    switch (options.format) {
      case 'pdf':
        this.exportToPDF(columns, dataToExport, filename, options.title);
        break;
      case 'excel':
        this.exportToExcel(columns, dataToExport, filename);
        break;
    }
  }

  /**
   * Export data to PDF format
   */
  private exportToPDF(
    columns: TableColumn[],
    data: TableData[],
    filename: string,
    title?: string
  ): void {
    const doc = new jsPDF();

    // Add title if provided
    if (title) {
      doc.setFontSize(16);
      doc.text(title, 14, 20);
    }

    // Prepare table headers
    const headers = columns
      .filter(col => col.key !== 'actions' && col.key !== 'sl') // Exclude actions and sl columns
      .map(col => col.title);

    // Prepare table data
    const tableData = data.map((row, index) => {
      return columns
        .filter(col => col.key !== 'actions' && col.key !== 'sl')
        .map(col => this.formatCellValue(row[col.key], col));
    });

    // Add table to PDF
    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: title ? 30 : 20,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185], // Primary blue color
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Light gray for alternate rows
      },
      margin: { top: 20 },
    });

    // Add footer with export info
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Exported on ${new Date().toLocaleString()}`,
        14,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );
    }

    // Save the PDF
    doc.save(`${filename}.pdf`);
  }

  /**
   * Export data to Excel format
   */
  private exportToExcel(
    columns: TableColumn[],
    data: TableData[],
    filename: string
  ): void {
    // Prepare headers
    const headers = columns
      .filter(col => col.key !== 'actions' && col.key !== 'sl') // Exclude actions and sl columns
      .map(col => col.title);

    // Prepare data rows
    const rows = data.map((row, index) => {
      const rowData: any[] = [];
      columns
        .filter(col => col.key !== 'actions' && col.key !== 'sl')
        .forEach(col => {
          rowData.push(this.formatCellValue(row[col.key], col));
        });
      return rowData;
    });

    // Create worksheet data
    const wsData = [headers, ...rows];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = headers.map(header => ({ wch: Math.max(header.length, 15) }));
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Save the Excel file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  /**
   * Format cell value for export
   */
  private formatCellValue(value: any, column: TableColumn): string {
    if (value === null || value === undefined) {
      return '';
    }

    // Handle different data types
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (value instanceof Date) {
      return value.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    if (typeof value === 'object') {
      // Handle arrays
      if (Array.isArray(value)) {
        if (value.length === 0) return 'N/A';
        // If array contains objects, try to extract names or stringify
        if (value[0] && typeof value[0] === 'object') {
          const firstKey = Object.keys(value[0])[0];
          if (firstKey && (firstKey.includes('name') || firstKey.includes('user') || firstKey.includes('title'))) {
            return value.map((item: any) => item[firstKey] || JSON.stringify(item)).join(', ');
          }
          return value.map((item: any) => JSON.stringify(item)).join(', ');
        }
        return value.join(', ');
      }
      // Handle objects
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Get export scope display name
   */
  getScopeDisplayName(scope: ExportScope): string {
    switch (scope) {
      case 'selected':
        return 'Selected Records';
      case 'page':
        return 'Page Records';
      case 'all':
        return 'All Records';
      default:
        return scope;
    }
  }

  /**
   * Get export format display name
   */
  getFormatDisplayName(format: ExportFormat): string {
    switch (format) {
      case 'pdf':
        return 'PDF';
      case 'excel':
        return 'Excel';
      default:
        return (format as string).toUpperCase();
    }
  }
}
