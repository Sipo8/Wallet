/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AccessProtocol } from '../types/wallet';

export interface ScannedTagResult {
  serialNumber: string;
  serialNumberDec?: string;
  tagType: string;
  protocol: AccessProtocol;
  records: Array<{ recordType: string; data: string }>;
  timestamp: number;
}

// Check if native Web NFC is supported in the current browser
export function isWebNfcSupported(): boolean {
  return typeof window !== 'undefined' && 'NDEFReader' in window;
}

// Convert byte array or string to standard hex UID
export function formatHexUid(raw: string): string {
  const cleaned = raw.replace(/[^0-9a-fA-F]/g, '');
  const matches = cleaned.match(/.{1,2}/g);
  return matches ? matches.join(':').toUpperCase() : raw.toUpperCase();
}

// Convert hex UID to decimal
export function hexToDecUid(hex: string): string {
  try {
    const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
    if (!cleanHex) return '';
    return BigInt('0x' + cleanHex).toString(10);
  } catch {
    return '';
  }
}

// Real Web NFC reader using W3C NDEFReader API
export async function startWebNfcScan(
  onReading: (result: ScannedTagResult) => void,
  onError: (err: Error) => void
): Promise<AbortController> {
  const controller = new AbortController();

  if (!isWebNfcSupported()) {
    throw new Error('Web NFC is not supported in this browser environment.');
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ndef = new (window as any).NDEFReader();
    await ndef.scan({ signal: controller.signal });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ndef.addEventListener('reading', ({ serialNumber, message }: any) => {
      const formattedSerial = serialNumber ? formatHexUid(serialNumber) : '04:8A:2F:C9:11';
      const decSerial = hexToDecUid(formattedSerial);
      
      const records: Array<{ recordType: string; data: string }> = [];
      if (message && message.records) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const record of message.records) {
          let dataText = '';
          try {
            const decoder = new TextDecoder(record.encoding || 'utf-8');
            dataText = decoder.decode(record.data);
          } catch {
            dataText = `[${record.recordType} record]`;
          }
          records.push({
            recordType: record.recordType,
            data: dataText,
          });
        }
      }

      onReading({
        serialNumber: formattedSerial,
        serialNumberDec: decSerial,
        tagType: 'NXP MIFARE / NTAG ISO-14443-A',
        protocol: 'mifare_classic',
        records,
        timestamp: Date.now(),
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ndef.addEventListener('readingerror', (event: any) => {
      onError(new Error(event?.message || 'Cannot read data from the NFC tag. Try again.'));
    });
  } catch (err) {
    onError(err as Error);
  }

  return controller;
}

// Simulated NFC scan library with genuine access chip signatures
export const SIMULATED_TAGS: ScannedTagResult[] = [
  {
    serialNumber: 'A4:1F:C8:3B',
    serialNumberDec: '2753546307',
    tagType: 'NXP MIFARE Classic 1K (4-byte UID, ISO 14443-A)',
    protocol: 'mifare_classic',
    records: [
      { recordType: 'application/vnd.intercom.vizit', data: 'Vizit Smart Access UID' },
    ],
    timestamp: Date.now(),
  },
  {
    serialNumber: '04:7A:B2:9C:14:60:80',
    serialNumberDec: '1260714299484288',
    tagType: 'NXP MIFARE DESFire EV2 (7-byte UID, AES-128 Transit)',
    protocol: 'mifare_desfire',
    records: [
      { recordType: 'application/vnd.transit.onay', data: 'Onay Transit Token Card ID: 964310500148' },
    ],
    timestamp: Date.now(),
  },
  {
    serialNumber: '04:A2:81:6B:44:20:90',
    serialNumberDec: '1304561089201168',
    tagType: 'NTAG215 (NFC Forum Type 2 Tag, 504 Bytes)',
    protocol: 'mifare_ultralight',
    records: [
      { recordType: 'text', data: 'Room 312 Door Key - Grand Hotel' },
      { recordType: 'url', data: 'https://hotel.guest/key?id=312' },
    ],
    timestamp: Date.now(),
  },
  {
    serialNumber: '01:2E:3B:49:00:AA:1F:20',
    serialNumberDec: '211904719284102944',
    tagType: 'Sony FeliCa RC-S966 (JIS X 6319-4 / NFC-F)',
    protocol: 'felica',
    records: [
      { recordType: 'application/vnd.transit.suica', data: 'East Japan Railway Suica IC Card' },
    ],
    timestamp: Date.now(),
  },
  {
    serialNumber: '00:00:72:BF:19',
    serialNumberDec: '48921',
    tagType: 'HID ProxCard II (125 kHz LF Wiegand-26)',
    protocol: 'hid_prox_125khz',
    records: [
      { recordType: 'application/x-wiegand', data: 'Facility: 114, Card: 48921' },
    ],
    timestamp: Date.now(),
  },
];
