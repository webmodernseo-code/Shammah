"use client";

import React, { useState } from "react";
import { Check, Plus, Trash2, Palette, Sparkles } from "lucide-react";
import { ColorVariant, PRESET_FASHION_COLORS } from "@/lib/fashion-colors";
import { toast } from "sonner";

interface ColorPalettePickerProps {
  selectedColors: ColorVariant[];
  onChange: (colors: ColorVariant[]) => void;
  customColors: ColorVariant[];
  onCustomColorsChange: (colors: ColorVariant[]) => void;
}

export default function ColorPalettePicker({
  selectedColors,
  onChange,
  customColors,
  onCustomColorsChange,
}: ColorPalettePickerProps) {
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#2563EB");
  const [showAddCustom, setShowAddCustom] = useState(false);

  const allAvailableColors = [...PRESET_FASHION_COLORS, ...customColors];

  const isSelected = (color: ColorVariant) => {
    return selectedColors.some(
      (c) => c.name.toLowerCase() === color.name.toLowerCase() || c.hex.toLowerCase() === color.hex.toLowerCase()
    );
  };

  const toggleColor = (color: ColorVariant) => {
    if (isSelected(color)) {
      onChange(
        selectedColors.filter(
          (c) => c.name.toLowerCase() !== color.name.toLowerCase() && c.hex.toLowerCase() !== color.hex.toLowerCase()
        )
      );
    } else {
      onChange([...selectedColors, color]);
    }
  };

  const handleAddCustomColor = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newColorName.trim();
    if (!trimmed) {
      toast.error("Veuillez saisir un nom pour votre couleur sur-mesure.");
      return;
    }

    const exists = allAvailableColors.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      toast.error("Une couleur portant ce nom existe déjà dans la palette.");
      return;
    }

    const newColor: ColorVariant = {
      id: `custom-${Date.now()}`,
      name: trimmed,
      hex: newColorHex.toUpperCase(),
      isCustom: true,
    };

    const updatedCustom = [...customColors, newColor];
    onCustomColorsChange(updatedCustom);
    onChange([...selectedColors, newColor]);

    setNewColorName("");
    setShowAddCustom(false);
    toast.success(`Couleur "${trimmed}" (${newColor.hex}) ajoutée et sélectionnée !`);
  };

  const handleDeleteCustomColor = (id: string, name: string) => {
    onCustomColorsChange(customColors.filter((c) => c.id !== id));
    onChange(selectedColors.filter((c) => c.id !== id));
    toast.success(`Couleur personnalisée "${name}" retirée.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Palette className="size-4 text-indigo-600" />
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Palette de Couleurs ({selectedColors.length} sélectionnée{selectedColors.length > 1 ? "s" : ""})
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowAddCustom(!showAddCustom)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
        >
          <Plus className="size-3.5" />
          <span>Ajouter une couleur sur-mesure</span>
        </button>
      </div>

      {/* Custom Color Creator Modal / Expandable Card */}
      {showAddCustom && (
        <div className="p-4 bg-slate-50 border border-indigo-100 rounded-2xl space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-indigo-600" />
              Créer une nouvelle nuance personnalisée
            </span>
            <button
              type="button"
              onClick={() => setShowAddCustom(false)}
              className="text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              Fermer
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-6">
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Nom de la nuance (ex: Bleu Nuit, Vert Sauge Impérial...)
              </label>
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="Ex: Bleu Majorelle"
                className="w-full h-10 px-3 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="sm:col-span-3 flex items-center gap-2">
              <div className="relative size-10 rounded-xl overflow-hidden border border-gray-300 shadow-2xs shrink-0">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="absolute -top-2 -left-2 size-14 cursor-pointer border-0"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Code Hex</label>
                <input
                  type="text"
                  value={newColorHex.toUpperCase()}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-full h-10 px-2.5 text-xs font-mono rounded-xl border border-gray-200 bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-3 flex items-end">
              <button
                type="button"
                onClick={handleAddCustomColor}
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="size-3.5" />
                <span>Ajouter</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Color Swatches Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {allAvailableColors.map((color) => {
          const selected = isSelected(color);
          const isLight =
            color.hex.toLowerCase() === "#ffffff" ||
            color.hex.toLowerCase() === "#f5f5f0" ||
            color.hex.toLowerCase() === "#e5e7eb";

          return (
            <div
              key={color.id || color.name}
              onClick={() => toggleColor(color)}
              className={`relative flex items-center gap-2.5 p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                selected
                  ? "bg-indigo-50/50 border-indigo-500 shadow-2xs ring-1 ring-indigo-500/20"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
              }`}
            >
              {/* Color swatch circle */}
              <div
                className="size-6 rounded-full shrink-0 shadow-2xs flex items-center justify-center relative border"
                style={{
                  backgroundColor: color.hex,
                  borderColor: isLight ? "#D1D5DB" : "transparent",
                }}
              >
                {selected && (
                  <Check
                    className={`size-3.5 stroke-[3] ${
                      isLight ? "text-gray-900" : "text-white"
                    }`}
                  />
                )}
              </div>

              {/* Color name & hex label */}
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-gray-900 block truncate">
                  {color.name}
                </span>
                <span className="text-[10px] text-gray-400 font-mono block">
                  {color.hex}
                </span>
              </div>

              {/* Delete custom color button */}
              {color.isCustom && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCustomColor(color.id, color.name);
                  }}
                  title="Supprimer cette nuance"
                  className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="size-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected colors summary strip */}
      {selectedColors.length > 0 ? (
        <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-600">Nuances retenues pour l'article :</span>
          <div className="flex flex-wrap gap-1.5">
            {selectedColors.map((c) => (
              <span
                key={c.name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-800 shadow-2xs"
              >
                <span
                  className="size-2.5 rounded-full border border-gray-300"
                  style={{ backgroundColor: c.hex }}
                />
                <span>{c.name}</span>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-amber-600 font-medium">
          ⚠️ Aucune couleur sélectionnée. Choisissez au moins une couleur pour générer les déclinaisons.
        </p>
      )}
    </div>
  );
}
