/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BarcodeType } from '../types/wallet';

export interface ScannedBarcodeResult {
  rawValue: string;
  format: BarcodeType;
  timestamp: number;
}

export function isBarcodeDetectorSupported(): boolean {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window;
}

// Map web BarcodeDetector formats to our BarcodeType
function mapDetectorFormat(format: string): BarcodeType {
  switch (format) {
    case 'qr_code':
      return 'qr';
    case 'ean_13':
    case 'ean_8':
    case 'upc_a':
    case 'upc_e':
      return 'ean13';
    case 'code_128':
    case 'code_39':
      return 'code128';
    case 'aztec':
      return 'aztec';
    case 'pdf417':
      return 'pdf417';
    case 'data_matrix':
      return 'datamatrix';
    default:
      return 'code128';
  }
}

// Create native BarcodeDetector if available
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createBarcodeDetector(): any {
  if (!isBarcodeDetectorSupported()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new (window as any).BarcodeDetector({
      formats: ['qr_code', 'ean_13', 'code_128', 'aztec', 'pdf417', 'data_matrix'],
    });
  } catch {
    return null;
  }
}

// Preset samples for fast testing when camera is unavailable or denied
export const SIMULATED_BARCODES: ScannedBarcodeResult[] = [
  {
    rawValue: 'https://qr.kaspi.kz/pay?id=018492019482',
    format: 'qr',
    timestamp: Date.now(),
  },
  {
    rawValue: '2700018492031',
    format: 'ean13',
    timestamp: Date.now(),
  },
  {
    rawValue: '9384729184719',
    format: 'code128',
    timestamp: Date.now(),
  },
  {
    rawValue: 'EUR-9014-984218-P9',
    format: 'aztec',
    timestamp: Date.now(),
  },
  {
    rawValue: 'M1BAURZHAN/MR EKC953 29OCT ALAIST Y 14A',
    format: 'pdf417',
    timestamp: Date.now(),
  },
];
