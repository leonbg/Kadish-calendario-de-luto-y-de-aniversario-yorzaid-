import React, { useState } from 'react';
import { DerabananNusaj, DerabananNusajOption } from '../types/kaddish';
import { DERABBANAN_NUSAJ_OPTIONS } from '../data/derabananVariants';
import {
  BookOpen,
  ChevronDown,
  Sparkles,
  X,
  Check,
  Globe,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface DerabananCompactHeaderPillProps {
  selectedNusaj: DerabananNusaj;
  onChangeNusaj: (nusaj: DerabananNusaj) => void;
}

/**
 * Ultra-compact inline pill button placed in the top header.
 * Takes 0 vertical space in the main reading area.
 */
export const DerabananCompactHeaderPill: React.FC<DerabananCompactHeaderPillProps> = ({
  selectedNusaj,
  onChangeNusaj,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const currentOption =
    DERABBANAN_NUSAJ_OPTIONS.find((o) => o.id === selectedNusaj) ||
    DERABBANAN_NUSAJ_OPTIONS[0];

  return (
    <div className="relative inline-block">
      {/* Tiny Header Pill */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors shadow-2xs"
        title="Cambiar versión o minhag de Kadish Derabanán"
      >
        <BookOpen className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        <span>Nusaj Derabanán: <strong>{currentOption.nameEs.split('/')[0].trim()}</strong></span>
        <ChevronDown className="w-3 h-3 text-amber-700 dark:text-amber-300 ml-0.5" />
      </button>

      {/* Floating Dropdown Menu */}
      {isDropdownOpen && (
        <div
          className="absolute left-0 mt-1.5 w-72 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100 text-xs"
          onClick={() => setIsDropdownOpen(false)}
        >
          <div className="px-2.5 py-1.5 border-b border-stone-100 dark:border-stone-800 text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400">
            Variante de Kadish Derabanán:
          </div>

          {DERABBANAN_NUSAJ_OPTIONS.map((opt) => {
            const isSelected = selectedNusaj === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChangeNusaj(opt.id);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-amber-500/15 text-amber-950 dark:text-amber-200 font-bold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span>{opt.nameEs}</span>
                    {opt.isDefault && (
                      <span className="text-[9px] bg-amber-600 text-white font-bold px-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-normal text-stone-500">
                    {opt.subtitleEs}
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
              </button>
            );
          })}

          <div className="pt-1.5 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(false);
                setIsComparisonOpen(true);
              }}
              className="w-full text-center py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-bold hover:bg-amber-500 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Comparar las 4 Variantes</span>
            </button>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {isComparisonOpen && (
        <DerabananComparisonModal
          selectedNusaj={selectedNusaj}
          onSelectNusaj={(n) => {
            onChangeNusaj(n);
            setIsComparisonOpen(false);
          }}
          onClose={() => setIsComparisonOpen(false)}
        />
      )}
    </div>
  );
};

interface DerabananFirstTimeModalProps {
  isOpen: boolean;
  selectedNusaj: DerabananNusaj;
  onConfirm: (nusaj: DerabananNusaj) => void;
  onClose: () => void;
}

/**
 * Onboarding modal shown ONLY THE FIRST TIME the user opens Kadish Derabanan.
 */
export const DerabananFirstTimeModal: React.FC<DerabananFirstTimeModalProps> = ({
  isOpen,
  selectedNusaj,
  onConfirm,
  onClose,
}) => {
  const [tempNusaj, setTempNusaj] = useState<DerabananNusaj>(selectedNusaj);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-stone-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-amber-500/10 dark:bg-amber-950/30 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                Selecciona tu Variante de Kadish Derabanán
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Configura la costumbre litúrgica (Nusaj/Minhag) de tu comunidad.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs text-stone-700 dark:text-stone-300">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed">
            💡 <strong>Nota:</strong> Esta selección aparecerá <strong>solo esta primera vez</strong>. Posteriormente podrás cambiar de versión en cualquier momento desde el selector discreto en la barra superior o desde la configuración.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {DERABBANAN_NUSAJ_OPTIONS.map((opt) => {
              const isSelected = tempNusaj === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setTempNusaj(opt.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all space-y-1.5 flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-600 bg-amber-500/10 dark:bg-amber-950/30 ring-1 ring-amber-500'
                      : 'border-stone-200 dark:border-stone-800 hover:border-amber-400 bg-stone-50/50 dark:bg-stone-800/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 border-b border-stone-200 dark:border-stone-800 pb-1.5">
                      <div className="font-bold text-stone-900 dark:text-stone-100 text-xs flex items-center gap-1">
                        <span>{opt.nameEs}</span>
                        {opt.isDefault && (
                          <span className="text-[9px] bg-amber-600 text-white font-bold px-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                    </div>

                    <div className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold mt-1">
                      {opt.subtitleEs}
                    </div>

                    <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">
                      {opt.descriptionEs}
                    </p>
                  </div>

                  <div className="text-[10px] text-right font-bold text-amber-700 dark:text-amber-400 pt-1">
                    {isSelected ? '✓ Seleccionado' : 'Hacer clic para elegir'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-stone-950/60 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            Predeterminado: Sefaradí Standard
          </span>

          <button
            type="button"
            onClick={() => {
              onConfirm(tempNusaj);
            }}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Selección</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface DerabananComparisonModalProps {
  selectedNusaj: DerabananNusaj;
  onSelectNusaj: (nusaj: DerabananNusaj) => void;
  onClose: () => void;
}

export const DerabananComparisonModal: React.FC<DerabananComparisonModalProps> = ({
  selectedNusaj,
  onSelectNusaj,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-stone-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-amber-500/10 dark:bg-amber-950/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                Cuadro Comparativo de Variantes de Kadish Derabanán
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Sefaradí Estándar (Default), Sefaradí Occidental / Marroquí, Ashkenaz y Nusach Ari Z'l / Chabad
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-stone-700 dark:text-stone-300 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DERABBANAN_NUSAJ_OPTIONS.map((option) => {
              const isSelected = selectedNusaj === option.id;

              return (
                <div
                  key={option.id}
                  onClick={() => onSelectNusaj(option.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2.5 flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-600 bg-amber-500/10 dark:bg-amber-950/30 ring-1 ring-amber-500'
                      : 'border-stone-200 dark:border-stone-800 hover:border-amber-400 bg-stone-50/50 dark:bg-stone-800/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
                      <div>
                        <div className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
                          <span>{option.nameEs}</span>
                          {option.isDefault && (
                            <span className="px-1.5 py-0.2 text-[9px] bg-amber-600 text-white font-bold rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
                          {option.subtitleEs}
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="p-1 rounded-full bg-amber-600 text-white font-bold shrink-0">
                          <Check className="w-4 h-4" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-lg border border-stone-300 dark:border-stone-700 text-[11px] font-bold hover:bg-amber-500 hover:text-white"
                        >
                          Seleccionar
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                      {option.descriptionEs}
                    </p>

                    <div className="mt-3 pt-2 border-t border-dashed border-stone-200 dark:border-stone-800 space-y-1">
                      <span className="font-bold text-[10px] text-amber-900 dark:text-amber-300 uppercase block">
                        Diferencias clave respecto al Estándar:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-800 dark:text-stone-200 font-medium">
                        {option.differencesSummary.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 text-right">
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 underline">
                      {isSelected ? '✓ Nusaj Activo en el Sidur' : 'Haz clic para activar en el Sidur'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/50 flex items-center justify-between">
          <div className="text-[11px] text-stone-500">
            💡 Nota halájica: La congregación responde según el Minhag del lugar o según la costumbre de sus antepasados.
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-2xs"
          >
            Cerrar Comparador
          </button>
        </div>
      </div>
    </div>
  );
};
