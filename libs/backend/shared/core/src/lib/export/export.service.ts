import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
 
const Papa = require('papaparse');

/**
 * Export Format
 */
export type ExportFormat = 'csv' | 'json' | 'excel' | 'xlsx';

/**
 * Export Options
 */
export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  sheetName?: string; // For Excel
  headers?: string[]; // Custom headers
  includeHeaders?: boolean; // Include headers in CSV/Excel
}

/**
 * Export Service
 * Handles data export to CSV, JSON, Excel formats
 */
@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  /**
   * Export data to specified format
   */
  async export<T extends Record<string, any>>(data: T[], options: ExportOptions): Promise<Buffer> {
    this.logger.log(`Exporting ${data.length} items to ${options.format}`);

    switch (options.format) {
      case 'csv':
        return this.exportToCSV(data, options);
      case 'json':
        return this.exportToJSON(data);
      case 'excel':
      case 'xlsx':
        return this.exportToExcel(data, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export to CSV
   */
  private async exportToCSV<T extends Record<string, any>>(
    data: T[],
    options: ExportOptions
  ): Promise<Buffer> {
    if (data.length === 0) {
      return Buffer.from('');
    }

    // Get headers
    const firstItem = data[0];
    if (!firstItem) {
      return Buffer.from('');
    }
    const headers = options.headers || Object.keys(firstItem);

    // Convert to CSV
    const csv = (Papa as { unparse: (data: unknown[], options?: { columns?: string[]; header?: boolean }) => string }).unparse(data, {
      columns: headers,
      header: options.includeHeaders !== false,
    });

    return Buffer.from(csv, 'utf-8');
  }

  /**
   * Export to JSON
   */
  private async exportToJSON<T extends Record<string, any>>(data: T[]): Promise<Buffer> {
    const json = JSON.stringify(data, null, 2);
    return Buffer.from(json, 'utf-8');
  }

  /**
   * Export to Excel
   */
  private async exportToExcel<T extends Record<string, any>>(
    data: T[],
    options: ExportOptions
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(options.sheetName || 'Sheet1');

    if (data.length === 0) {
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    }

    // Get headers
    const firstItem = data[0];
    if (!firstItem) {
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    }
    const headers = options.headers || Object.keys(firstItem);

    // Add headers
    if (options.includeHeaders !== false) {
      worksheet.addRow(headers);

      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    }

    // Add data rows
    for (const row of data) {
      const values = headers.map((header) => row[header] ?? '');
      worksheet.addRow(values);
    }

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (column.header) {
        column.width = Math.max(column.header.toString().length + 2, 15);
      }
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Get MIME type for format
   */
  getMimeType(format: ExportFormat): string {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      case 'excel':
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Get file extension for format
   */
  getFileExtension(format: ExportFormat): string {
    switch (format) {
      case 'csv':
        return '.csv';
      case 'json':
        return '.json';
      case 'excel':
      case 'xlsx':
        return '.xlsx';
      default:
        return '';
    }
  }
}
