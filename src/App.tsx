/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { WalletItem, CardType, Language } from './types/wallet';
import { TRANSLATIONS } from './i18n/translations';
import { CARD_PRESETS } from './data/presets';
import { Header } from './components/Header';
import { CardView } from './components/CardView';
import { CardDetailModal } from './components/CardDetailModal';
import { TerminalSimulatorModal } from './components/TerminalSimulatorModal';
import { NFCScannerModal } from './components/NFCScannerModal';
import { BarcodeCameraModal } from './components/BarcodeCameraModal';
import { AddCardModal } from './components/AddCardModal';
import { TechGuideModal } from './components/TechGuideModal';
import {
  Radio,
  Scan,
  BookOpen,
  Search,
  Star,
  Download,
  Upload,
  Plus,
  KeyRound,
  Bus,
  Tag,
  CreditCard,
  Ticket,
  Sparkles,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'omniwallet_cards_v1';
const LANG_STORAGE_KEY = 'omniwallet_lang_v1';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANG_STORAGE_KEY) as Language;
      if (saved && ['ru', 'kk', 'en', 'es', 'it', 'pt'].includes(saved)) {
        return saved;
      }
    }
    return 'ru';
  });

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.ru;

  // Wallet Cards state with initial seed presets
  const [cards, setCards] = useState<WalletItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return CARD_PRESETS.slice(0, 6).map((preset, index) => ({
      ...preset,
      id: `seed-${index + 1}-${Date.now()}`,
      createdAt: Date.now() - index * 60000,
    }));
  });

  // Display Mode: 'stacked' (Apple Wallet Deck) or 'grid' (Compact Grid)
  const [viewMode, setViewMode] = useState<'stacked' | 'grid'>('stacked');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  // Modals state
  const [selectedCard, setSelectedCard] = useState<WalletItem | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isNfcScannerOpen, setIsNfcScannerOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isTechGuideOpen, setIsTechGuideOpen] = useState(false);

  // Filter & Search state
  const [filterType, setFilterType] = useState<CardType | 'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesFilter =
        filterType === 'all'
          ? true
          : filterType === 'favorites'
          ? card.favorite
          : card.type === filterType;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        card.title.toLowerCase().includes(q) ||
        (card.subtitle && card.subtitle.toLowerCase().includes(q)) ||
        (card.doorOrRoom && card.doorOrRoom.toLowerCase().includes(q)) ||
        (card.issuer && card.issuer.toLowerCase().includes(q)) ||
        card.cardNumberOrCode.toLowerCase().includes(q) ||
        (card.accessUid && card.accessUid.toLowerCase().includes(q));

      return matchesFilter && matchesSearch;
    });
  }, [cards, filterType, searchQuery]);

  // Card Operations
  const handleAddCard = (newCardData: Omit<WalletItem, 'id' | 'createdAt'>) => {
    const newCard: WalletItem = {
      ...newCardData,
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
    };
    setCards((prev) => [newCard, ...prev]);
  };

  const handleDeleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    if (selectedCard?.id === id) {
      setSelectedCard(null);
    }
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c))
    );
  };

  const handleUpdateBalance = (id: string, newBalance: number) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, balance: newBalance } : c))
    );
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cards, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `WaletAll_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setCards(imported);
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        }
      } catch {
        alert('Ошибка файла резервной копии');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col antialiased selection:bg-white selection:text-black pb-20 lg:pb-8">
      {/* Sleek Apple-style Header */}
      <Header
        lang={lang}
        onSetLang={handleSetLang}
        onOpenAddModal={() => setIsAddCardOpen(true)}
        onOpenNfcScanner={() => setIsNfcScannerOpen(true)}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        onOpenTerminal={() => setIsTerminalOpen(true)}
        onOpenTechGuide={() => setIsTechGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Compact Apple Wallet Controls Strip */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search_placeholder}
              className="w-full h-8 pl-8 pr-3 rounded-full bg-zinc-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* View Mode Switcher & Quick Utilities */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {/* Apple Segmented View Toggle: Stack vs Grid */}
            <div className="flex items-center p-0.5 rounded-full bg-zinc-900 border border-white/10 text-xs">
              <button
                onClick={() => setViewMode('stacked')}
                title="Стопка как в iPhone Wallet"
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'stacked'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Стопка</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Сетка карт"
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Сетка</span>
              </button>
            </div>

            {/* Backup actions */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportBackup}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title={t.import_backup}
              className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExportBackup}
              title={t.export_backup}
              className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* Apple Style Minimalist Segmented Category Filters */}
        <section className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-medium scrollbar-none">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0 ${
              filterType === 'all'
                ? 'bg-white text-black font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.all_cards} ({cards.length})
          </button>

          <button
            onClick={() => setFilterType('access_key')}
            className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              filterType === 'access_key'
                ? 'bg-white text-black font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <KeyRound className="w-3 h-3" />
            <span>{t.access_key}</span>
          </button>

          <button
            onClick={() => setFilterType('transit')}
            className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              filterType === 'transit'
                ? 'bg-white text-black font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bus className="w-3 h-3" />
            <span>{t.transit}</span>
          </button>

          <button
            onClick={() => setFilterType('payment')}
            className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              filterType === 'payment'
                ? 'bg-white text-black font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-3 h-3" />
            <span>{t.payment}</span>
          </button>

          <button
            onClick={() => setFilterType('loyalty')}
            className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              filterType === 'loyalty'
                ? 'bg-white text-black font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>{t.loyalty}</span>
          </button>

          <button
            onClick={() => setFilterType('favorites')}
            className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              filterType === 'favorites'
                ? 'bg-white text-black font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Star className="w-3 h-3" />
            <span>{t.favorites}</span>
          </button>
        </section>

        {/* Cards Presentation Container */}
        <section className="pt-2">
          {filteredCards.length > 0 ? (
            viewMode === 'stacked' ? (
              /* Apple Wallet Cascading Deck */
              <div
                className="relative w-full max-w-md mx-auto"
                style={{
                  minHeight: `${Math.max(380, 240 + (filteredCards.length - 1) * 62)}px`,
                }}
              >
                {filteredCards.map((card, index) => (
                  <CardView
                    key={card.id}
                    card={card}
                    lang={lang}
                    isStacked={true}
                    stackIndex={index}
                    onClick={() => setSelectedCard(card)}
                    onToggleFavorite={(e) => handleToggleFavorite(card.id, e)}
                  />
                ))}
              </div>
            ) : (
              /* Compact Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {filteredCards.map((card) => (
                  <CardView
                    key={card.id}
                    card={card}
                    lang={lang}
                    isStacked={false}
                    onClick={() => setSelectedCard(card)}
                    onToggleFavorite={(e) => handleToggleFavorite(card.id, e)}
                  />
                ))}
              </div>
            )
          ) : (
            /* Empty State */
            <div className="py-14 px-4 rounded-3xl bg-zinc-950 border border-white/5 text-center flex flex-col items-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-slate-500 mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">
                {t.empty_deck_title}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                {t.empty_deck_sub}
              </p>
              <button
                onClick={() => setIsAddCardOpen(true)}
                className="py-2 px-4 rounded-full bg-white hover:bg-slate-200 text-black font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.add_first_card}</span>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/85 backdrop-blur-2xl border-t border-white/10 grid grid-cols-5 items-center h-14 px-2">
        <button
          onClick={() => setFilterType('all')}
          className={`flex flex-col items-center justify-center min-h-[44px] ${
            filterType === 'all' ? 'text-white' : 'text-slate-500'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium">{t.all_cards}</span>
        </button>

        <button
          onClick={() => setIsNfcScannerOpen(true)}
          className="flex flex-col items-center justify-center min-h-[44px] text-slate-500 hover:text-white"
        >
          <Radio className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium">NFC</span>
        </button>

        {/* Center Primary Add Button */}
        <button
          onClick={() => setIsAddCardOpen(true)}
          className="flex items-center justify-center min-h-[44px] -mt-3"
        >
          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-90 transition-transform">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
        </button>

        <button
          onClick={() => setIsTerminalOpen(true)}
          className="flex flex-col items-center justify-center min-h-[44px] text-slate-500 hover:text-white"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium">Тест</span>
        </button>

        <button
          onClick={() => setIsTechGuideOpen(true)}
          className="flex flex-col items-center justify-center min-h-[44px] text-slate-500 hover:text-white"
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium">Гид</span>
        </button>
      </nav>

      {/* Modals */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          lang={lang}
          onClose={() => setSelectedCard(null)}
          onDelete={handleDeleteCard}
          onOpenTerminal={(card) => {
            setSelectedCard(null);
            setIsTerminalOpen(true);
          }}
        />
      )}

      {isTerminalOpen && (
        <TerminalSimulatorModal
          cards={cards}
          initialCard={selectedCard}
          lang={lang}
          onClose={() => setIsTerminalOpen(false)}
          onUpdateCardBalance={handleUpdateBalance}
        />
      )}

      {isNfcScannerOpen && (
        <NFCScannerModal
          lang={lang}
          onClose={() => setIsNfcScannerOpen(false)}
          onSaveCard={handleAddCard}
        />
      )}

      {isBarcodeScannerOpen && (
        <BarcodeCameraModal
          lang={lang}
          onClose={() => setIsBarcodeScannerOpen(false)}
          onSaveCard={handleAddCard}
        />
      )}

      {isAddCardOpen && (
        <AddCardModal
          lang={lang}
          onClose={() => setIsAddCardOpen(false)}
          onAddCard={handleAddCard}
          onOpenNfcScanner={() => setIsNfcScannerOpen(true)}
          onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        />
      )}

      {isTechGuideOpen && (
        <TechGuideModal
          lang={lang}
          onClose={() => setIsTechGuideOpen(false)}
        />
      )}
    </div>
  );
}
