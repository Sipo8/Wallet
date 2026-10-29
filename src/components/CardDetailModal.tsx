/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WalletItem, Language } from '../types/wallet';
import { TRANSLATIONS } from '../i18n/translations';
import { CardView } from './CardView';
import { BarcodeRenderer } from '../utils/barcodeRenderer';
import {
  X,
  Radio,
  Copy,
  Check,
  Trash2,
  Sun,
  ShieldCheck,
  Share2,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

interface CardDetailModalProps {
  card: WalletItem | null;
  lang: Language;
  onClose: () => void;
  onDelete: (id: string) => void;
  onOpenTerminal: (card: WalletItem) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  lang,
  onClose,
  onDelete,
  onOpenTerminal,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isBright, setIsBright] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!card) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.ru;

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: card.title,
        text: `${card.title} - ${card.cardNumberOrCode}`,
      }).catch(() => {});
    } else {
      handleCopy(JSON.stringify(card, null, 2), 'share');
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto ${isBright ? 'bg-white' : 'bg-black/85 backdrop-blur-2xl'}`}>
      <div className="relative w-full max-w-md bg-[#121214] border border-white/10 rounded-[2rem] shadow-[0_24px_70px_rgba(0,0,0,0.85)] p-5 sm:p-6 my-auto overflow-hidden text-slate-100 flex flex-col">
        {/* Apple iOS Grab Handle */}
        <div className="w-9 h-1 bg-white/20 rounded-full mx-auto mb-4" />

        {/* Modal Top Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
              {card.issuer || t[card.type]}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsBright(!isBright)}
              title={t.brightness_boost}
              className={`p-1.5 rounded-full border transition-colors ${
                isBright
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleShare}
              title="Share"
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card Presentation Section */}
        <div className="py-4 flex flex-col items-center">
          <div className="w-full cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            {!isFlipped ? (
              <CardView card={card} lang={lang} isDetailed />
            ) : (
              /* Apple Wallet Pass Back Side */
              <div className="w-full aspect-[1.586/1] rounded-2xl bg-zinc-900 border border-white/10 p-5 shadow-2xl flex flex-col justify-between text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-semibold text-white tracking-tight">Информация о пропуске</span>
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="space-y-1.5 text-slate-300 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ID:</span>
                    <span className="truncate max-w-[180px]">{card.id}</span>
                  </div>
                  {card.accessProtocol && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">NFC:</span>
                      <span>{card.accessProtocol.toUpperCase()}</span>
                    </div>
                  )}
                  {card.accessUid && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">UID:</span>
                      <span className="text-cyan-300">{card.accessUid}</span>
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 text-center border-t border-white/10 pt-2">
                  Apple Wallet Compatible Pass · WaletAll Engine
                </div>
              </div>
            )}
            <p className="text-center text-[10px] text-slate-500 mt-2 tracking-wide font-medium">
              (Нажмите на карту для переворота)
            </p>
          </div>

          {/* Barcode Section if applicable */}
          {card.barcodeType !== 'none' && (
            <div className="w-full mt-3 p-3 bg-white rounded-2xl shadow-xl flex flex-col items-center">
              <div className="flex items-center justify-between w-full text-slate-500 text-[10px] font-semibold mb-1">
                <span>{card.barcodeType.toUpperCase()} PASS</span>
                <span>{t.barcode_guide}</span>
              </div>
              <BarcodeRenderer
                type={card.barcodeType}
                value={card.cardNumberOrCode}
                showText={true}
                className="w-full scale-95"
              />
            </div>
          )}

          {/* Apple Pay / HomeKey "Hold Near Reader" Action CTA */}
          <div className="w-full mt-4">
            <button
              onClick={() => onOpenTerminal(card)}
              className="w-full py-3 px-5 rounded-2xl bg-white hover:bg-slate-100 text-black font-bold text-xs shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4 text-cyan-600 animate-pulse" />
              <span>
                {card.type === 'access_key'
                  ? 'Поднести к замку / домофону'
                  : card.type === 'transit'
                  ? 'Приложить к валидатору'
                  : 'Поднести к терминалу (Apple Pay)'}
              </span>
            </button>
          </div>
        </div>

        {/* Technical RFID Parameters in iOS Table style */}
        <div className="space-y-2 pt-2 border-t border-white/5 text-[11px]">
          {card.accessUid && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div>
                <span className="text-slate-400 block text-[10px]">{t.uid_hex}</span>
                <span className="font-mono font-semibold text-cyan-300 text-xs tracking-wider">
                  {card.accessUid}
                </span>
              </div>
              <button
                onClick={() => handleCopy(card.accessUid!, 'uid')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 transition-colors flex items-center gap-1 text-[10px] font-semibold"
              >
                {copiedKey === 'uid' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'uid' ? t.copied : t.copy}</span>
              </button>
            </div>
          )}

          {card.doorOrRoom && (
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">{t.door_room}</span>
              <span className="font-semibold text-white">{card.doorOrRoom}</span>
            </div>
          )}

          {card.notes && (
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-300">
              <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-0.5">{t.notes}</span>
              <p className="leading-relaxed">{card.notes}</p>
            </div>
          )}
        </div>

        {/* Bottom Footer Actions */}
        <div className="pt-3 mt-3 border-t border-white/5 flex justify-between items-center">
          <button
            onClick={() => {
              if (window.confirm(t.confirm_delete)) {
                onDelete(card.id);
                onClose();
              }
            }}
            className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors p-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>{t.delete_card}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
