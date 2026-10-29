/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WalletItem, Language } from '../types/wallet';
import { TRANSLATIONS } from '../i18n/translations';
import {
  isWebNfcSupported,
  startWebNfcScan,
  ScannedTagResult,
  SIMULATED_TAGS,
} from '../services/nfcService';
import { audioService } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  X,
  Radio,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  KeyRound,
  Shield,
} from 'lucide-react';

interface NFCScannerModalProps {
  lang: Language;
  onClose: () => void;
  onSaveCard: (card: Omit<WalletItem, 'id' | 'createdAt'>) => void;
}

export const NFCScannerModal: React.FC<NFCScannerModalProps> = ({
  lang,
  onClose,
  onSaveCard,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ru;
  const webNfcSupported = isWebNfcSupported();

  const [isScanning, setIsScanning] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<ScannedTagResult | null>(null);

  const [customTitle, setCustomTitle] = useState('');
  const [customDoor, setCustomDoor] = useState('');

  useEffect(() => {
    let abortController: AbortController | null = null;

    if (webNfcSupported) {
      startWebNfcScan(
        (result) => {
          audioService.playNfcRead();
          setScannedResult(result);
          setCustomTitle(`Чип ${result.tagType.split(' ')[0]}`);
          setIsScanning(false);
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
        },
        (err) => {
          setErrorMsg(err.message);
        }
      ).then((ctrl) => {
        abortController = ctrl;
      });
    }

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [webNfcSupported]);

  const handleSimulateScan = (index = 0) => {
    const sample = SIMULATED_TAGS[index % SIMULATED_TAGS.length];
    audioService.playNfcRead();
    setScannedResult(sample);
    setCustomTitle(
      sample.protocol === 'mifare_classic'
        ? 'Домофонный чип Vizit'
        : sample.protocol === 'mifare_desfire'
        ? 'Транспортная карта'
        : sample.protocol === 'hid_prox_125khz'
        ? 'Офисный пропуск HID'
        : 'Электронный NFC ключ'
    );
    setCustomDoor('Входная дверь');
    setIsScanning(false);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
  };

  const handleSave = () => {
    if (!scannedResult) return;

    onSaveCard({
      type: 'access_key',
      title: customTitle || 'NFC Смарт-ключ',
      subtitle: customDoor || scannedResult.tagType,
      issuer: 'Apple NFC Key',
      cardNumberOrCode: scannedResult.serialNumber,
      barcodeType: 'none',
      cardColor: 'from-zinc-800 via-neutral-900 to-black',
      textColor: 'light',
      accessProtocol: scannedResult.protocol,
      accessUid: scannedResult.serialNumber,
      accessUidDec: scannedResult.serialNumberDec,
      doorOrRoom: customDoor,
      isFobDesign: true,
      notes: `Считано через NFC: ${scannedResult.tagType}`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#121214] border border-white/10 rounded-[2rem] shadow-[0_24px_70px_rgba(0,0,0,0.85)] p-5 sm:p-6 my-auto overflow-hidden text-slate-100 flex flex-col">
        {/* iOS Grab Handle */}
        <div className="w-9 h-1 bg-white/20 rounded-full mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              {t.nfc_scan_title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scan Status Area */}
        {!scannedResult ? (
          <div className="py-6 flex flex-col items-center text-center">
            {/* Apple Radar Wave Ring */}
            <div className="relative flex items-center justify-center w-32 h-32 my-3">
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping" />
              <div className="absolute inset-3 rounded-full border border-cyan-400/30 animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Radio className="w-8 h-8 text-white" />
              </div>
            </div>

            <p className="text-xs font-bold text-white mt-2">
              {t.nfc_waiting}
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs mt-1 leading-relaxed">
              {t.nfc_scan_instruction}
            </p>

            {/* Quick Simulate Buttons */}
            <div className="mt-5 w-full space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block text-center">
                Имитация касания чипа:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleSimulateScan(0)}
                  className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[11px] font-semibold transition-all flex items-center justify-center gap-1 truncate"
                >
                  <KeyRound className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">Визит (Mifare 1K)</span>
                </button>
                <button
                  onClick={() => handleSimulateScan(1)}
                  className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[11px] font-semibold transition-all flex items-center justify-center gap-1 truncate"
                >
                  <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">Оңай / DESFire</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Scanned Result Details & Save Form */
          <div className="py-4 space-y-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-emerald-300">{t.nfc_success}</h4>
                <p className="text-[11px] text-slate-300 truncate max-w-[240px]">{scannedResult.tagType}</p>
              </div>
            </div>

            {/* UID Info Card */}
            <div className="p-3 rounded-2xl bg-black border border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">{t.uid_hex}:</span>
              <span className="font-mono font-bold text-cyan-300 text-sm tracking-wider">
                {scannedResult.serialNumber}
              </span>
            </div>

            {/* Customization Inputs */}
            <div className="space-y-2 pt-1">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  {t.card_title_input}
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Домофон, Офис, Ворота"
                  className="w-full h-8 px-2.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  {t.door_room}
                </label>
                <input
                  type="text"
                  value={customDoor}
                  onChange={(e) => setCustomDoor(e.target.value)}
                  placeholder="Подъезд 2, кв 45"
                  className="w-full h-8 px-2.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
              <button
                onClick={() => setScannedResult(null)}
                className="py-1.5 px-3 rounded-lg text-slate-400 hover:text-white text-xs transition-colors"
              >
                Заново
              </button>
              <button
                onClick={handleSave}
                className="py-1.5 px-5 rounded-full bg-white hover:bg-slate-200 text-black font-bold text-xs shadow-md transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t.save_scanned_card}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
