/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Language } from '../types/wallet';
import { TRANSLATIONS } from '../i18n/translations';
import { TECH_ENCYCLOPEDIA } from '../data/techEncyclopedia';
import {
  X,
  BookOpen,
  Search,
  Radio,
  KeyRound,
  Bus,
  Scan,
  Smartphone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TechGuideModalProps {
  lang: Language;
  onClose: () => void;
}

export const TechGuideModal: React.FC<TechGuideModalProps> = ({ lang, onClose }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ru;
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(TECH_ENCYCLOPEDIA[0]?.id || null);

  const filteredItems = TECH_ENCYCLOPEDIA.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.frequencyOrType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.regions.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.examples.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#121214] border border-white/10 rounded-[2rem] shadow-[0_24px_70px_rgba(0,0,0,0.85)] p-5 sm:p-6 my-auto overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* iOS Grab Handle */}
        <div className="w-9 h-1 bg-white/20 rounded-full mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              {t.tech_guide_title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="mt-3 space-y-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по технологии (FeliCa, 125 кГц, Aztec, Dallas)..."
              className="w-full h-8 pl-8 pr-3 rounded-full bg-zinc-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                activeCategory === 'all'
                  ? 'bg-white text-black font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setActiveCategory('intercom_access')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                activeCategory === 'intercom_access'
                  ? 'bg-white text-black font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Домофоны
            </button>
            <button
              onClick={() => setActiveCategory('transit_payments')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                activeCategory === 'transit_payments'
                  ? 'bg-white text-black font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Транспорт & FeliCa
            </button>
            <button
              onClick={() => setActiveCategory('barcodes')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                activeCategory === 'barcodes'
                  ? 'bg-white text-black font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Aztec & PDF417
            </button>
            <button
              onClick={() => setActiveCategory('smart_locks')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                activeCategory === 'smart_locks'
                  ? 'bg-white text-black font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Apple HomeKey
            </button>
          </div>
        </div>

        {/* Apple Accordion List */}
        <div className="mt-3 overflow-y-auto space-y-2 pr-1 flex-1">
          {filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-2xl bg-zinc-900/70 border border-white/5 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full p-3 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-cyan-400">
                      {item.category === 'intercom_access' ? (
                        <KeyRound className="w-3.5 h-3.5" />
                      ) : item.category === 'transit_payments' ? (
                        <Bus className="w-3.5 h-3.5" />
                      ) : item.category === 'barcodes' ? (
                        <Scan className="w-3.5 h-3.5" />
                      ) : (
                        <Radio className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white tracking-tight">
                        {item.name}
                      </h3>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.frequencyOrType} · {item.regions.join(', ')}
                      </div>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-3 pt-0 border-t border-white/5 space-y-2.5 text-xs">
                    <p className="text-slate-300 leading-relaxed text-[11px] pt-2">
                      {item.description[lang] || item.description.ru}
                    </p>

                    <div className="p-2.5 rounded-xl bg-black border border-white/5 text-[11px]">
                      <span className="text-amber-400 font-bold block mb-0.5 flex items-center gap-1 text-[10px]">
                        <Smartphone className="w-3 h-3" />
                        <span>{t.phone_capability}:</span>
                      </span>
                      <p className="text-slate-400 leading-relaxed">
                        {item.phoneSupport[lang] || item.phoneSupport.ru}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black border border-white/5 text-[11px]">
                      <span className="text-cyan-400 font-bold block mb-0.5 text-[10px]">
                        {t.how_it_operates}:
                      </span>
                      <p className="text-slate-400 leading-relaxed">
                        {item.howItWorks[lang] || item.howItWorks.ru}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-white/5 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
