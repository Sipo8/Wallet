/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Language } from '../types/wallet';
import { TRANSLATIONS } from '../i18n/translations';
import {
  Wallet,
  Plus,
  Radio,
  Scan,
  BookOpen,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  onOpenAddModal: () => void;
  onOpenNfcScanner: () => void;
  onOpenBarcodeScanner: () => void;
  onOpenTerminal: () => void;
  onOpenTechGuide: () => void;
}

const LANGUAGES: Array<{ code: Language; label: string; flag: string }> = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'kk', label: 'Қазақша', flag: '🇰🇿' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
];

export const Header: React.FC<HeaderProps> = ({
  lang,
  onSetLang,
  onOpenAddModal,
  onOpenNfcScanner,
  onOpenBarcodeScanner,
  onOpenTerminal,
  onOpenTechGuide,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ru;
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-black/75 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-6">
      {/* Zone 1: Single text wordmark */}
      <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(6,182,212,0.3)]">
          <Wallet className="w-4 h-4" />
        </div>
        <span className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
          WaletAll <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-cyan-400 font-semibold border border-white/10">NFC</span>
        </span>
      </div>

      {/* Zone 2: 4 concise single-line nav links with iOS subtle hover */}
      <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-300">
        <button
          onClick={onOpenNfcScanner}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-slate-400 hover:text-white"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.scan_nfc}</span>
        </button>
        <button
          onClick={onOpenBarcodeScanner}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-slate-400 hover:text-white"
        >
          <Scan className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.scan_barcode}</span>
        </button>
        <button
          onClick={onOpenTerminal}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-slate-400 hover:text-white"
        >
          <Radio className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.terminal_test}</span>
        </button>
        <button
          onClick={onOpenTechGuide}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-slate-400 hover:text-white"
        >
          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
          <span>{t.tech_guide}</span>
        </button>
      </nav>

      {/* Zone 3: Language picker & Apple style Add button */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="h-8 px-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <span>{currentLang.flag}</span>
            <span className="hidden sm:inline font-medium text-[11px]">{currentLang.label}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl py-1 z-50 overflow-hidden">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    onSetLang(l.code);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-xs flex items-center gap-2 transition-colors text-left ${
                    lang === l.code
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpenAddModal}
          className="h-8 px-3.5 rounded-full bg-white hover:bg-slate-200 text-black font-semibold text-xs shadow-[0_2px_12px_rgba(255,255,255,0.2)] active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{t.add_card}</span>
        </button>
      </div>
    </header>
  );
};
