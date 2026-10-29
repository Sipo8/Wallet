/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CardType = 'loyalty' | 'transit' | 'payment' | 'access_key' | 'ticket';

export type AccessProtocol =
  | 'mifare_classic'      // 13.56 MHz, 1K/4K, ISO 14443-A (Most common modern intercoms, Vizit, Sputnik)
  | 'mifare_desfire'      // 13.56 MHz, High security AES (Modern corporate offices, high-tech transit)
  | 'mifare_ultralight'   // 13.56 MHz, NTAG213/215/216 NDEF tags
  | 'em_marine_125khz'    // 125 kHz LF (Traditional CIS intercoms Vizit, Cyfral, Metakom)
  | 'hid_prox_125khz'     // 125 kHz LF (US/Europe corporate Wiegand-26 access cards)
  | 'ibutton_dallas'      // 1-Wire DS1990A contact "tabletka" key
  | 'felica'              // 13.56 MHz JIS X 6319-4 (Japan Suica, Pasmo, Hong Kong Octopus)
  | 'calypso'             // 13.56 MHz ISO 14443-B (France Navigo, Portugal Navegante, Israel Rav-Kav)
  | 'apple_homekey_aliro' // NFC ECP Smart Lock standard
  | 'ble_smartlock';      // Bluetooth Low Energy / Smart Lock

export type BarcodeType = 'code128' | 'ean13' | 'qr' | 'aztec' | 'pdf417' | 'datamatrix' | 'none';

export type PaymentScheme = 'visa' | 'mastercard' | 'mir' | 'unionpay' | 'amex' | 'kaspi_qr' | 'generic';

export interface WalletItem {
  id: string;
  type: CardType;
  title: string;
  subtitle?: string;
  issuer?: string;
  cardNumberOrCode: string;
  barcodeType: BarcodeType;
  cardColor: string; // Gradient or solid CSS class
  textColor?: 'light' | 'dark';
  balance?: number;
  currency?: string;
  expiryDate?: string;
  cardHolder?: string;
  // Access key / intercom specific fields
  accessProtocol?: AccessProtocol;
  accessUid?: string;       // Hex UID e.g. "A4:3B:5C:1D" or "00:1A:E2:4F"
  accessUidDec?: string;    // Decimal representation
  facilityCode?: string;    // E.g. for HID Prox Wiegand 26
  intercomBrand?: string;   // "Vizit", "Cyfral", "Sputnik", "BAS-IP", "Dormakaba", "Assa Abloy"
  doorOrRoom?: string;      // "Подъезд 2, кв 45", "Office 402", "Room 312"
  isFobDesign?: boolean;    // If true, render as circular/teardrop RFID key fob instead of standard card
  // Payment card specific
  paymentScheme?: PaymentScheme;
  lastFour?: string;
  isNfcEnabled?: boolean;
  notes?: string;
  favorite?: boolean;
  createdAt: number;
}

export type Language = 'ru' | 'kk' | 'en' | 'es' | 'it' | 'pt';
