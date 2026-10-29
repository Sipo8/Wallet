/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WalletItem, Language } from '../types/wallet';
import { TRANSLATIONS } from '../i18n/translations';
import { audioService } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  X,
  Radio,
  DoorClosed,
  DoorOpen,
  Receipt,
  Bus,
  CheckCircle2,
  KeyRound,
  RotateCw,
  Check,
  CreditCard,
} from 'lucide-react';

interface TerminalSimulatorModalProps {
  cards: WalletItem[];
  initialCard?: WalletItem | null;
  lang: Language;
  onClose: () => void;
  onUpdateCardBalance?: (id: string, newBalance: number) => void;
}

type TerminalMode = 'intercom' | 'turnstile' | 'pos';

export const TerminalSimulatorModal: React.FC<TerminalSimulatorModalProps> = ({
  cards,
  initialCard,
  lang,
  onClose,
  onUpdateCardBalance,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ru;

  const [mode, setMode] = useState<TerminalMode>(
    initialCard?.type === 'access_key'
      ? 'intercom'
      : initialCard?.type === 'transit'
      ? 'turnstile'
      : 'pos'
  );

  const [selectedCardId, setSelectedCardId] = useState<string>(
    initialCard?.id || cards[0]?.id || ''
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalStatus, setTerminalStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [lastDeduction, setLastDeduction] = useState<{ amount: number; remaining: number } | null>(null);

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  useEffect(() => {
    setTerminalStatus('idle');
    setStatusMessage('');
    setLastDeduction(null);
  }, [mode, selectedCardId]);

  const handleTap = () => {
    if (!selectedCard || isProcessing) return;

    setIsProcessing(true);
    setTerminalStatus('idle');
    setStatusMessage(t.term_reading);

    setTimeout(() => {
      setIsProcessing(false);

      if (mode === 'intercom') {
        if (
          selectedCard.type === 'access_key' ||
          selectedCard.accessUid ||
          selectedCard.isFobDesign
        ) {
          audioService.playIntercomOpen();
          setTerminalStatus('success');
          setStatusMessage(`${t.term_granted}`);
          confetti({ particleCount: 30, spread: 55, origin: { y: 0.65 } });
        } else {
          audioService.playError();
          setTerminalStatus('error');
          setStatusMessage(t.term_denied);
        }
      } else if (mode === 'turnstile') {
        if (selectedCard.type === 'transit' || selectedCard.balance !== undefined) {
          audioService.playTurnstileBeep();
          const fare = selectedCard.currency === '₸' ? 120 : selectedCard.currency === '₽' ? 57 : selectedCard.currency === '¥' ? 210 : 2.5;
          const currentBal = selectedCard.balance ?? 1000;
          const newBal = Math.max(0, currentBal - fare);
          
          if (onUpdateCardBalance) {
            onUpdateCardBalance(selectedCard.id, newBal);
          }
          setLastDeduction({ amount: fare, remaining: newBal });
          setTerminalStatus('success');
          setStatusMessage(`${t.term_fare_deducted}: -${fare} ${selectedCard.currency || ''}`);
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.65 } });
        } else {
          audioService.playError();
          setTerminalStatus('error');
          setStatusMessage(t.term_denied);
        }
      } else {
        if (
          selectedCard.type === 'payment' ||
          selectedCard.isNfcEnabled ||
          selectedCard.cardNumberOrCode
        ) {
          audioService.playPosBeep();
          setTerminalStatus('success');
          setStatusMessage(`${t.term_paid}`);
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.65 } });
        } else {
          audioService.playError();
          setTerminalStatus('error');
          setStatusMessage(t.term_denied);
        }
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#121214] border border-white/10 rounded-[2rem] shadow-[0_24px_70px_rgba(0,0,0,0.85)] p-5 sm:p-6 my-auto overflow-hidden text-slate-100 flex flex-col">
        {/* iOS Grab Handle */}
        <div className="w-9 h-1 bg-white/20 rounded-full mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Apple Pay & NFC Reader</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Apple Style Segmented Mode Selector */}
        <div className="grid grid-cols-3 gap-1 mt-3 p-1 bg-black rounded-full border border-white/10 text-xs">
          <button
            onClick={() => setMode('intercom')}
            className={`py-1.5 px-2 rounded-full font-semibold transition-all flex items-center justify-center gap-1 text-[11px] ${
              mode === 'intercom'
                ? 'bg-white text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3 h-3" />
            <span>Домофон</span>
          </button>
          <button
            onClick={() => setMode('turnstile')}
            className={`py-1.5 px-2 rounded-full font-semibold transition-all flex items-center justify-center gap-1 text-[11px] ${
              mode === 'turnstile'
                ? 'bg-white text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bus className="w-3 h-3" />
            <span>Турникет</span>
          </button>
          <button
            onClick={() => setMode('pos')}
            className={`py-1.5 px-2 rounded-full font-semibold transition-all flex items-center justify-center gap-1 text-[11px] ${
              mode === 'pos'
                ? 'bg-white text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3 h-3" />
            <span>Терминал</span>
          </button>
        </div>

        {/* Apple Pay "Hold Near Reader" Interaction Stage */}
        <div className="mt-4 p-5 rounded-2xl bg-black border border-white/5 flex flex-col items-center relative overflow-hidden">
          {/* Selected Card Preview Pill */}
          {selectedCard && (
            <div className="w-full max-w-[260px] p-2.5 rounded-xl bg-gradient-to-r from-zinc-800 to-zinc-900 border border-white/10 shadow-lg mb-4 flex items-center justify-between text-xs">
              <div className="truncate mr-2">
                <span className="text-[10px] text-white/50 uppercase tracking-wider block font-medium">
                  {selectedCard.issuer || 'Pass'}
                </span>
                <span className="font-bold text-white truncate block">
                  {selectedCard.title}
                </span>
              </div>
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
            </div>
          )}

          {/* Iconic Concentric Apple Contactless Wave Target */}
          <div
            onClick={handleTap}
            className={`relative w-32 h-32 rounded-full cursor-pointer flex flex-col items-center justify-center transition-all duration-300 ${
              isProcessing
                ? 'scale-95'
                : terminalStatus === 'success'
                ? 'scale-105'
                : 'hover:scale-102 active:scale-95'
            }`}
          >
            {/* Concentric rings */}
            <div className={`absolute inset-0 rounded-full border border-dashed transition-colors ${
              terminalStatus === 'success' ? 'border-emerald-500 animate-ping' : 'border-cyan-500/30 animate-pulse'
            }`} />
            <div className={`absolute inset-3 rounded-full border transition-colors ${
              terminalStatus === 'success' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 bg-zinc-900'
            }`} />

            {/* Center Icon */}
            <div className="relative z-10 flex flex-col items-center">
              {terminalStatus === 'success' ? (
                <Check className="w-10 h-10 text-emerald-400 stroke-[3]" />
              ) : mode === 'intercom' ? (
                <KeyRound className="w-8 h-8 text-white" />
              ) : mode === 'turnstile' ? (
                <Bus className="w-8 h-8 text-white" />
              ) : (
                <CreditCard className="w-8 h-8 text-white" />
              )}
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                {isProcessing ? 'ЧТЕНИЕ...' : terminalStatus === 'success' ? 'ГОТОВО' : 'ПРИЛОЖИТЬ'}
              </span>
            </div>
          </div>

          {/* Status Message Text */}
          <div className="mt-3 text-center min-h-[2rem]">
            {isProcessing ? (
              <p className="text-xs text-amber-400 font-mono animate-pulse">{t.term_reading}</p>
            ) : terminalStatus === 'success' ? (
              <p className="text-xs text-emerald-400 font-bold">{statusMessage}</p>
            ) : terminalStatus === 'error' ? (
              <p className="text-xs text-rose-400 font-semibold">{statusMessage}</p>
            ) : (
              <p className="text-xs text-slate-400 font-medium">
                {mode === 'intercom'
                  ? 'Поднесите к считывателю замка'
                  : mode === 'turnstile'
                  ? 'Приложите к турникету'
                  : 'Поднесите к терминалу оплаты'}
              </p>
            )}

            {lastDeduction && (
              <p className="text-[11px] text-emerald-300 font-mono mt-0.5">
                Остаток: {lastDeduction.remaining} {selectedCard?.currency || ''}
              </p>
            )}
          </div>
        </div>

        {/* Card Switcher Row in Compact Format */}
        <div className="mt-3">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
            {t.term_choose_card}
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {cards.map((card) => {
              const isSelected = card.id === selectedCard?.id;
              return (
                <button
                  key={card.id}
                  onClick={() => setSelectedCardId(card.id)}
                  className={`py-1.5 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-sm'
                      : 'bg-zinc-900 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  <span className="truncate max-w-[120px]">{card.title}</span>
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
          <button
            onClick={() => {
              setTerminalStatus('idle');
              setStatusMessage('');
              setLastDeduction(null);
            }}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            <RotateCw className="w-3 h-3" />
            <span>Сброс</span>
          </button>

          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
