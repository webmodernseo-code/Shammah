"use client";

import { useState } from "react";
import type { VariantFormState } from "./ProductDrawer";

function suggestedSizesForCategory(categorySlug: string | undefined): string[] {
  if (categorySlug === "gadget") return ["Taille Unique"];
  if (categorySlug === "enfant") return ["2 ans", "4 ans", "6 ans", "8 ans"];
  return ["S", "M", "L", "XL"];
}

export function VariantEditor({
  variants,
  onChange,
  categorySlug,
}: {
  variants: VariantFormState[];
  onChange: (variants: VariantFormState[]) => void;
  categorySlug: string | undefined;
}) {
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  function addColor() {
    if (!newColorName.trim()) return;
    const sizes = suggestedSizesForCategory(categorySlug);
    const stock: Record<string, number> = {};
    sizes.forEach((s) => (stock[s] = 0));
    onChange([...variants, { colorName: newColorName.trim(), colorHex: newColorHex, images: [""], stock }]);
    setNewColorName("");
  }

  function removeVariant(index: number) {
    onChange(variants.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, patch: Partial<VariantFormState>) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function updateImage(index: number, imageIndex: number, url: string) {
    const variant = variants[index];
    const images = variant.images.map((img, i) => (i === imageIndex ? url : img));
    updateVariant(index, { images });
  }

  function addImageField(index: number) {
    updateVariant(index, { images: [...variants[index].images, ""] });
  }

  function updateStock(index: number, size: string, quantity: number) {
    updateVariant(index, { stock: { ...variants[index].stock, [size]: quantity } });
  }

  return (
    <section id="variant-editor" className="mt-6">
      <h4 className="text-sm font-semibold text-text-heading">Tailles &amp; Variantes de couleur</h4>

      <div className="mt-3 space-y-4">
        {variants.map((variant, index) => (
          <div key={index} data-variant-block className="rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: variant.colorHex }} />
                <span className="text-sm font-medium text-text-heading">{variant.colorName}</span>
              </div>
              <button type="button" onClick={() => removeVariant(index)} className="text-xs text-status-red">
                Retirer
              </button>
            </div>

            <div className="mt-2 space-y-1">
              {variant.images.map((img, imageIndex) => (
                <input
                  key={imageIndex}
                  data-image-url-input
                  type="text"
                  placeholder="URL de l'image"
                  value={img}
                  onChange={(e) => updateImage(index, imageIndex, e.target.value)}
                  className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                />
              ))}
              <button type="button" onClick={() => addImageField(index)} className="text-xs text-accent-primary">
                + image
              </button>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              {Object.entries(variant.stock).map(([size, quantity]) => (
                <div key={size} data-size-row className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-text-body">{size}</span>
                  <input
                    type="number"
                    min={0}
                    value={quantity}
                    onChange={(e) => updateStock(index, size, Math.max(0, Math.trunc(Number(e.target.value)) || 0))}
                    className="w-16 rounded border border-gray-200 px-2 py-1"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          id="new-color-name"
          type="text"
          placeholder="Nom de la couleur (Ex: Noir Onyx)"
          value={newColorName}
          onChange={(e) => setNewColorName(e.target.value)}
          className="flex-1 rounded border border-gray-200 px-2 py-1.5 text-sm"
        />
        <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} className="h-9 w-9" />
        <button id="add-color-btn" type="button" onClick={addColor} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-text-heading hover:bg-gray-50">
          + Couleur
        </button>
      </div>
    </section>
  );
}
