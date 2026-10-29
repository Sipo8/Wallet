/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { WalletItem, Language, BarcodeType } from '../types/wallet';
import { TRANSLATIONS } from '../i18n/translations';
import {
  createBarcodeDetector,
  SIMULATED_BARCODES,
  ScannedBarcodeResult,
} from '../services/barcodeDetectorService';
import { audioService } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  X,
  Camera,
  CheckCircle2,
  Scan,
  Plus,
} from 'lucide-react';

interface BarcodeCameraModalProps {
  lang: Language;
  onClose: () => void;
  onSaveCard: (card: Omit<WalletItem, 'id' | 'createdAt'>) => void;
}

export const BarcodeCameraModal: React.FC<BarcodeCameraModalProps> = ({
  lang,
  onClose,
  onSaveCard,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ru;
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<ScannedBarcodeResult | null>(null);

  const [cardTitle, setCardTitle] = useState('Скидочная карта');
  const [cardIssuer, setCardIssuer] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animId: number | null = null;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError('Camera API not accessible.');
          return;
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setHasCamera(true);
          setCameraError(null);

          const detector = createBarcodeDetector();
          if (detector) {
            const checkFrame = async () => {
              if (videoRef.current && videoRef.current.readyState >= 2) {
                try {
                  const codes = await detector.detect(videoRef.current);
                  if (codes && codes.length > 0) {
                    const first = codes[0];
                    handleDetectedCode(first.rawValue, first.format || 'code128');
                    return;
                  }
                } catch {
                  // ignore
                }
              }
              animId = requestAnimationFrame(checkFrame);
            };
            animId = requestAnimationFrame(checkFrame);
          }
        }
      } catch (err) {
        setCameraError((err as Error).message);
      }
    };

    startCamera();

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleDetectedCode = (rawValue: string, formatRaw: string) => {
    let fmt: BarcodeType = 'code128';
    if (formatRaw.includes('qr')) fmt = 'qr';
    else if (formatRaw.includes('ean') || formatRaw.includes('upc')) fmt = 'ean13';
    else if (formatRaw.includes('aztec')) fmt = 'aztec';
    else if (formatRaw.includes('pdf')) fmt = 'pdf417';

    audioService.playPosBeep();
    setScannedResult({ rawValue, format: fmt, timestamp: Date.now() });
    setCardTitle(fmt === 'qr' ? 'QR-код / Оплата' : 'Бонусная карта');
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
  };

  const handleSimulateScan = (index = 0) => {
    const sample = SIMULATED_BARCODES[index % SIMULATED_BARCODES.length];
    audioService.playPosBeep();
    setScannedResult(sample);
    setCardTitle(
      sample.format === 'qr'
        ? 'Kaspi QR'
        : sample.format === 'ean13'
        ? 'Magnum Club'
        : sample.format === 'aztec'
        ? 'Eurostar Aztec'
        : 'Sephora Pass'
    );
    setCardIssuer(sample.format === 'qr' ? 'Kaspi' : 'Магазин');
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
  };

  const handleSave = () => {
    if (!scannedResult) return;

    onSaveCard({
      type: scannedResult.format === 'pdf417' || scannedResult.format === 'aztec' ? 'ticket' : 'loyalty',
      title: cardTitle || 'Дисконтная карта',
      subtitle: cardIssuer || 'Карта лояльности',
      issuer: cardIssuer || 'Apple Pass',
      cardNumberOrCode: scannedResult.rawValue,
      barcodeType: scannedResult.format,
      cardColor: 'from-blue-600 via-indigo-700 to-slate-900',
      textColor: 'light',
      notes: `Сканировано камерой (${scannedResult.format})`,
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
            <Scan className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              {t.camera_scan_title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {!scannedResult ? (
          <div className="py-4 flex flex-col items-center">
            {/* Viewfinder Target */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-white/10 shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Reticle */}
              <div className="absolute inset-6 border border-white/30 rounded-xl pointer-events-none flex flex-col justify-between">
                <div className="w-full h-0.5 bg-rose-500 shadow-md shadow-rose-500/80 animate-pulse" />
                <div className="text-[9px] text-white/70 font-mono tracking-widest text-center pb-1 uppercase">
                  Сканирование
                </div>
              </div>

              {!hasCamera && (
                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 text-center">
                  <Camera className="w-8 h-8 text-slate-600 mb-1" />
                  <p className="text-[11px] text-slate-400">
                    Камера не активна или ожидает разрешения
                  </p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-2 text-center">
              {t.camera_instruction}
            </p>

            {/* Quick Test Barcodes */}
            <div className="mt-4 w-full">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1.5 text-center">
                Быстрая симуляция:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleSimulateScan(0)}
                  className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 truncate"
                >
                  Kaspi QR
                </button>
                <button
                  onClick={() => handleSimulateScan(1)}
                  className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 truncate"
                >
                  Magnum
                </button>
                <button
                  onClick={() => handleSimulateScan(2)}
                  className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 truncate"
                >
                  Eurostar
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Scanned Result & Save Form */
          <div className="py-4 space-y-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-emerald-300">{t.camera_detected}</h4>
                <p className="text-[10px] text-slate-300 uppercase font-mono">
                  Формат: {scannedResult.format}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black border border-white/10 text-xs">
              <span className="text-slate-400 block text-[10px] mb-0.5">Считанный код:</span>
              <span className="font-mono font-bold text-cyan-300 break-all">
                {scannedResult.rawValue}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  {t.card_title_input}
                </label>
                <input
                  type="text"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  {t.card_issuer_input}
                </label>
                <input
                  type="text"
                  value={cardIssuer}
                  onChange={(e) => setCardIssuer(e.target.value)}
                  placeholder="Magnum, Sephora, Kaspi"
                  className="w-full h-8 px-2.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

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
