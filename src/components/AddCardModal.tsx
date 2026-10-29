/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  WalletItem,
  CardType,
  AccessProtocol,
  BarcodeType,
  Language,
} from '../types/wallet';
import { TRANSLATIONS } from '../i18n/translations';
import { CARD_PRESETS } from '../data/presets';
import {
  X,
  Radio,
  Scan,
  Sparkles,
  KeyRound,
  CreditCard,
  Bus,
  Tag,
  Ticket,
  Plus,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddCardModalProps {
  lang: Language;
  onClose: () => void;
  onAddCard: (card: Omit<WalletItem, 'id' | 'createdAt'>) => void;
  onOpenNfcScanner: () => void;
  onOpenBarcodeScanner: () => void;
}

const COLOR_PRESETS = [
  { name: 'Titanium Dark', value: 'from-zinc-800 via-neutral-900 to-black' },
  { name: 'Kaspi Red', value: 'from-red-600 via-rose-700 to-red-900' },
  { name: 'Onay Gold', value: 'from-amber-400 via-amber-500 to-amber-700' },
  { name: 'Emerald Forest', value: 'from-emerald-700 via-teal-800 to-black' },
  { name: 'Sapphire Blue', value: 'from-blue-600 via-indigo-700 to-slate-900' },
  { name: 'Troika Cyan', value: 'from-sky-500 via-teal-600 to-cyan-900' },
  { name: 'Violet Cyber', value: 'from-violet-700 via-purple-900 to-black' },
  { name: 'Rose Gold', value: 'from-rose-500 via-pink-600 to-slate-900' },
];

export const AddCardModal: React.FC<AddCardModalProps> = ({
  lang,
  onClose,
  onAddCard,
  onOpenNfcScanner,
  onOpenBarcodeScanner,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ru;
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [presetCategory, setPresetCategory] = useState<'all' | 'kz' | 'intercom' | 'transit' | 'loyalty' | 'bank'>('all');

  // Custom Form state
  const [type, setType] = useState<CardType>('access_key');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [cardNumberOrCode, setCardNumberOrCode] = useState('');
  const [barcodeType, setBarcodeType] = useState<BarcodeType>('none');
  const [accessProtocol, setAccessProtocol] = useState<AccessProtocol>('mifare_classic');
  const [accessUid, setAccessUid] = useState('');
  const [doorOrRoom, setDoorOrRoom] = useState('');
  const [isFobDesign, setIsFobDesign] = useState(true);
  const [cardColor, setCardColor] = useState(COLOR_PRESETS[0].value);
  const [notes, setNotes] = useState('');

  const handleUsePreset = (preset: typeof CARD_PRESETS[0]) => {
    onAddCard(preset);
    confetti({ particleCount: 30, spread: 55, origin: { y: 0.6 } });
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onAddCard({
      type,
      title,
      subtitle,
      issuer: issuer || 'Wallet',
      cardNumberOrCode: cardNumberOrCode || accessUid || '0000 0000',
      barcodeType,
      cardColor,
      textColor: 'light',
      accessProtocol: type === 'access_key' || type === 'transit' ? accessProtocol : undefined,
      accessUid: accessUid || (type === 'access_key' ? cardNumberOrCode : undefined),
      doorOrRoom,
      isFobDesign: type === 'access_key' && isFobDesign,
      notes,
    });

    confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
    onClose();
  };

  const filteredPresets = CARD_PRESETS.filter((p) => {
    if (presetCategory === 'all') return true;
    if (presetCategory === 'kz') {
      return (
        p.title.includes('Kaspi') ||
        p.title.includes('ОҢАЙ') ||
        p.title.includes('Magnum') ||
        p.title.includes('Nomad')
      );
    }
    if (presetCategory === 'intercom') return p.type === 'access_key';
    if (presetCategory === 'transit') return p.type === 'transit';
    if (presetCategory === 'loyalty') return p.type === 'loyalty';
    if (presetCategory === 'bank') return p.type === 'payment';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#121214] border border-white/10 rounded-[2rem] shadow-[0_24px_70px_rgba(0,0,0,0.85)] p-5 sm:p-6 my-auto overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* iOS Grab Handle */}
        <div className="w-9 h-1 bg-white/20 rounded-full mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {t.modal_add_title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Scan Action Pills */}
        <div className="mt-3 grid grid-cols-2 gap-2 shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenNfcScanner();
            }}
            className="py-2 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.scan_nfc}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenBarcodeScanner();
            }}
            className="py-2 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Scan className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.scan_barcode}</span>
          </button>
        </div>

        {/* Tabs: Presets vs Custom */}
        <div className="mt-3 flex items-center p-0.5 bg-black rounded-full border border-white/10 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1 px-3 rounded-full font-semibold transition-all flex items-center justify-center gap-1 text-[11px] ${
              activeTab === 'presets'
                ? 'bg-white text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{t.tab_presets}</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1 px-3 rounded-full font-semibold transition-all flex items-center justify-center gap-1 text-[11px] ${
              activeTab === 'custom'
                ? 'bg-white text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>{t.tab_custom}</span>
          </button>
        </div>

        {/* Body Container */}
        <div className="mt-3 overflow-y-auto pr-1 flex-1">
          {activeTab === 'presets' ? (
            <div className="space-y-2.5">
              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                <button
                  onClick={() => setPresetCategory('all')}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                    presetCategory === 'all'
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setPresetCategory('kz')}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                    presetCategory === 'kz'
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇰🇿 Казахстан
                </button>
                <button
                  onClick={() => setPresetCategory('intercom')}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                    presetCategory === 'intercom'
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Домофоны
                </button>
                <button
                  onClick={() => setPresetCategory('transit')}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                    presetCategory === 'transit'
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Транспорт
                </button>
                <button
                  onClick={() => setPresetCategory('loyalty')}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                    presetCategory === 'loyalty'
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Скидки
                </button>
                <button
                  onClick={() => setPresetCategory('bank')}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                    presetCategory === 'bank'
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Банковские
                </button>
              </div>

              {/* Compact Presets List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredPresets.map((preset, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-zinc-900/80 border border-white/5 flex flex-col justify-between hover:border-white/20 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-cyan-400">
                          {preset.type === 'access_key'
                            ? 'Домофон'
                            : preset.type === 'transit'
                            ? 'Транспорт'
                            : preset.type === 'payment'
                            ? 'Банк'
                            : 'Скидка'}
                        </span>
                        {preset.barcodeType !== 'none' && (
                          <span className="text-[9px] font-mono text-slate-500">
                            {preset.barcodeType.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white tracking-tight truncate">
                        {preset.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {preset.subtitle || preset.issuer}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-[100px]">
                        {preset.accessUid || preset.cardNumberOrCode}
                      </span>
                      <button
                        onClick={() => handleUsePreset(preset)}
                        className="py-1 px-2.5 rounded-full bg-white text-black text-[10px] font-bold transition-transform active:scale-95 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                        <span>Добавить</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Custom Form */
            <form onSubmit={handleCustomSubmit} className="space-y-3 text-xs">
              {/* Type Picker */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1 text-[11px]">
                  {t.card_type_select}
                </label>
                <div className="grid grid-cols-5 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setType('access_key');
                      setIsFobDesign(true);
                      setBarcodeType('none');
                    }}
                    className={`py-1.5 px-1 rounded-xl border text-center transition-all ${
                      type === 'access_key'
                        ? 'bg-white text-black font-semibold border-white'
                        : 'bg-zinc-900 border-white/5 text-slate-400'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5 mx-auto mb-0.5" />
                    <span className="text-[10px]">Ключ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('transit');
                      setIsFobDesign(false);
                      setBarcodeType('qr');
                    }}
                    className={`py-1.5 px-1 rounded-xl border text-center transition-all ${
                      type === 'transit'
                        ? 'bg-white text-black font-semibold border-white'
                        : 'bg-zinc-900 border-white/5 text-slate-400'
                    }`}
                  >
                    <Bus className="w-3.5 h-3.5 mx-auto mb-0.5" />
                    <span className="text-[10px]">Көлік</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('loyalty');
                      setIsFobDesign(false);
                      setBarcodeType('ean13');
                    }}
                    className={`py-1.5 px-1 rounded-xl border text-center transition-all ${
                      type === 'loyalty'
                        ? 'bg-white text-black font-semibold border-white'
                        : 'bg-zinc-900 border-white/5 text-slate-400'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5 mx-auto mb-0.5" />
                    <span className="text-[10px]">Скидка</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('payment');
                      setIsFobDesign(false);
                      setBarcodeType('none');
                    }}
                    className={`py-1.5 px-1 rounded-xl border text-center transition-all ${
                      type === 'payment'
                        ? 'bg-white text-black font-semibold border-white'
                        : 'bg-zinc-900 border-white/5 text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 mx-auto mb-0.5" />
                    <span className="text-[10px]">Банк</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('ticket');
                      setIsFobDesign(false);
                      setBarcodeType('pdf417');
                    }}
                    className={`py-1.5 px-1 rounded-xl border text-center transition-all ${
                      type === 'ticket'
                        ? 'bg-white text-black font-semibold border-white'
                        : 'bg-zinc-900 border-white/5 text-slate-400'
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5 mx-auto mb-0.5" />
                    <span className="text-[10px]">Билет</span>
                  </button>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1 text-[10px] uppercase font-bold tracking-wider">
                    Название *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Домофон, Onay, Magnum"
                    className="w-full h-8 px-2.5 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-white/30 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[10px] uppercase font-bold tracking-wider">
                    Адрес / Заметка
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Подъезд 2, кв 45"
                    className="w-full h-8 px-2.5 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-white/30 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1 text-[10px] uppercase font-bold tracking-wider">
                    Номер / UID *
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNumberOrCode}
                    onChange={(e) => setCardNumberOrCode(e.target.value)}
                    placeholder="A4:1F:C8:3B"
                    className="w-full h-8 px-2.5 rounded-lg bg-zinc-900 border border-white/10 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-white/30 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[10px] uppercase font-bold tracking-wider">
                    Формат кода
                  </label>
                  <select
                    value={barcodeType}
                    onChange={(e) => setBarcodeType(e.target.value as BarcodeType)}
                    className="w-full h-8 px-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-white/30 text-xs"
                  >
                    <option value="none">NFC / RFID (Без кода)</option>
                    <option value="qr">QR Code (Kaspi, Pix)</option>
                    <option value="ean13">EAN-13 (Magnum)</option>
                    <option value="code128">Code 128 (Скидочные)</option>
                    <option value="aztec">Aztec (Ж/д билеты)</option>
                    <option value="pdf417">PDF417 (Авиабилеты)</option>
                  </select>
                </div>
              </div>

              {/* Protocol for RFID */}
              {(type === 'access_key' || type === 'transit') && (
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-cyan-400">Протокол чипа:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={isFobDesign}
                        onChange={(e) => setIsFobDesign(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-white bg-black border-white/20"
                      />
                      <span>Формат HomeKey</span>
                    </label>
                  </div>
                  <select
                    value={accessProtocol}
                    onChange={(e) => setAccessProtocol(e.target.value as AccessProtocol)}
                    className="w-full h-8 px-2 rounded-lg bg-black border border-white/10 text-white focus:outline-none focus:border-white/30 text-xs"
                  >
                    <option value="mifare_classic">Mifare Classic 1K/4K (13.56 MHz Домофон)</option>
                    <option value="mifare_desfire">Mifare DESFire (13.56 MHz Onay/Транспорт)</option>
                    <option value="em_marine_125khz">EM-Marine (125 kHz Брелок Визит)</option>
                    <option value="hid_prox_125khz">HID Prox Wiegand-26 (125 kHz Офис)</option>
                    <option value="ibutton_dallas">Dallas 1-Wire iButton (Таблетка)</option>
                    <option value="apple_homekey_aliro">Apple HomeKey / Aliro (Смарт-замок)</option>
                  </select>
                </div>
              )}

              {/* Color Presets */}
              <div>
                <label className="text-slate-400 block mb-1 text-[10px] uppercase font-bold tracking-wider">
                  Цвет карты
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {COLOR_PRESETS.map((cp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCardColor(cp.value)}
                      className={`w-6 h-6 rounded-full bg-gradient-to-br ${cp.value} border transition-transform shrink-0 flex items-center justify-center ${
                        cardColor === cp.value ? 'scale-110 border-white' : 'border-transparent'
                      }`}
                      title={cp.name}
                    >
                      {cardColor === cp.value && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-1.5 px-3 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-5 rounded-full bg-white hover:bg-slate-200 text-black font-bold shadow-md transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{t.save}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
