/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WalletItem, Language } from '../types/wallet';
import { TRANSLATIONS } from '../i18n/translations';
import { Wifi, KeyRound, CreditCard, Bus, Tag, Ticket, Star, Radio } from 'lucide-react';
import { BarcodeRenderer } from '../utils/barcodeRenderer';

interface CardViewProps {
  card: WalletItem;
  lang: Language;
  onClick?: () => void;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  isDetailed?: boolean;
  isStacked?: boolean;
  stackIndex?: number;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  lang,
  onClick,
  onToggleFavorite,
  isDetailed = false,
  isStacked = false,
  stackIndex = 0,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ru;

  const getTypeIcon = () => {
    switch (card.type) {
      case 'access_key':
        return <KeyRound className="w-3.5 h-3.5" />;
      case 'payment':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'transit':
        return <Bus className="w-3.5 h-3.5" />;
      case 'ticket':
        return <Ticket className="w-3.5 h-3.5" />;
      case 'loyalty':
      default:
        return <Tag className="w-3.5 h-3.5" />;
    }
  };

  // Apple HomeKey Style for Intercom / Door keys
  const isHomeKey = card.type === 'access_key';

  return (
    <div
      onClick={onClick}
      style={
        isStacked && !isDetailed
          ? {
              transform: `translateY(${stackIndex * 60}px)`,
              zIndex: 10 + stackIndex,
            }
          : undefined
      }
      className={`group relative cursor-pointer select-none transition-all duration-300 ${
        isStacked && !isDetailed
          ? 'absolute left-0 right-0 max-w-md mx-auto hover:-translate-y-4 hover:z-40 active:scale-[0.98]'
          : 'hover:-translate-y-1.5 active:scale-[0.98]'
      } ${isDetailed ? 'w-full' : ''}`}
    >
      <div
        className={`relative w-full aspect-[1.586/1] rounded-2xl sm:rounded-[1.35rem] bg-gradient-to-br ${
          isHomeKey && !card.cardColor.includes('rose') && !card.cardColor.includes('amber')
            ? 'from-zinc-800 via-neutral-900 to-black'
            : card.cardColor
        } p-4 sm:p-5 shadow-[0_12px_32px_rgba(0,0,0,0.55)] border border-white/15 overflow-hidden flex flex-col justify-between`}
      >
        {/* Apple Gloss & Specular Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/12 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* HomeKey Apple Concentric Ring Background if Intercom */}
        {isHomeKey && (
          <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full border border-white/10 flex items-center justify-center pointer-events-none opacity-40">
            <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border border-cyan-400/20" />
            </div>
          </div>
        )}

        {/* Top Header: Issuer, Title & NFC Waves */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white/90 border border-white/10">
              {getTypeIcon()}
            </span>
            <div className="leading-tight">
              <span className="text-[10px] font-medium tracking-wider uppercase text-white/60 block">
                {card.issuer || t[card.type]}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight drop-shadow-sm truncate max-w-[190px] sm:max-w-[220px]">
                {card.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* NFC Contactless Wave */}
            {(card.isNfcEnabled || card.accessProtocol || card.type === 'transit' || isHomeKey) && (
              <span className="p-1 rounded-full bg-black/20 text-white/80 backdrop-blur-sm">
                <Wifi className="w-4 h-4 rotate-90" />
              </span>
            )}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className="p-1 rounded-full text-white/50 hover:text-amber-300 transition-colors"
              >
                <Star className={`w-3.5 h-3.5 ${card.favorite ? 'fill-amber-300 text-amber-300' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Center Field: HomeKey Door or Balance or EMV Chip */}
        <div className="my-auto z-10 flex items-center justify-between py-1">
          {isHomeKey ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black/40 border border-white/15 flex items-center justify-center text-amber-400 shadow-inner">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-white/50 uppercase tracking-widest block font-medium">
                  {card.intercomBrand || 'SMART ACCESS'}
                </span>
                <span className="text-sm font-semibold text-white tracking-tight">
                  {card.doorOrRoom || 'Входная дверь'}
                </span>
              </div>
            </div>
          ) : card.type === 'payment' ? (
            <div className="flex items-center gap-3">
              {/* Apple style metallic EMV smart chip */}
              <div className="w-9 h-7 rounded bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/60 shadow-sm relative overflow-hidden flex items-center justify-center">
                <div className="w-full h-[0.5px] bg-amber-900/30 absolute" />
                <div className="h-full w-[0.5px] bg-amber-900/30 absolute" />
                <div className="w-4 h-3.5 rounded-sm border border-amber-900/25" />
              </div>
            </div>
          ) : card.barcodeType !== 'none' && !isDetailed ? (
            <div className="opacity-95 max-w-[130px] pointer-events-none">
              <BarcodeRenderer
                type={card.barcodeType}
                value={card.cardNumberOrCode}
                showText={false}
                className="p-1 rounded-lg bg-white/95 scale-80 origin-left"
              />
            </div>
          ) : (
            <div />
          )}

          {/* Balance display if present */}
          {card.balance !== undefined && (
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider text-white/60 block font-medium">
                {t.balance}
              </span>
              <span className="text-base sm:text-lg font-bold font-mono tracking-tight text-white drop-shadow">
                {card.balance.toLocaleString()} {card.currency || ''}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Details Row */}
        <div className="flex items-end justify-between z-10 text-white/90 pt-1">
          <div>
            <p className="text-xs sm:text-[13px] font-mono tracking-wider text-white/85">
              {isHomeKey && card.accessUid ? `UID: ${card.accessUid}` : card.cardNumberOrCode}
            </p>
            {card.cardHolder && (
              <p className="text-[10px] font-medium tracking-wider uppercase text-white/60 mt-0.5">
                {card.cardHolder}
              </p>
            )}
          </div>

          <div className="text-right">
            {card.expiryDate && (
              <span className="text-[10px] font-mono text-white/60 block">
                {card.expiryDate}
              </span>
            )}
            {card.paymentScheme && (
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/80 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                {card.paymentScheme}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
