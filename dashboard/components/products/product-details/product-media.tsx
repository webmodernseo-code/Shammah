import React from "react";
import Image from "next/image";
import { Image as ImageIcon, Sparkles, ZoomIn } from "lucide-react";

interface ProductMediaProps {
  images?: Array<{ url: string; label: string }>;
}

const DEFAULT_MEDIA = [
  { url: "/images/products/fashion-1.jpg", label: "Vue Face Mannequin" },
  { url: "/images/products/fashion-2.jpg", label: "Détail Tissage & Revers" },
  { url: "/images/products/fashion-3.jpg", label: "Vue Profil & Coupe" },
  { url: "/images/products/fashion-4.jpg", label: "Finition Doublure & Boutons" },
];

export default function ProductMedia({ images = DEFAULT_MEDIA }: ProductMediaProps) {
  return (
    <div className="border rounded-2xl border-gray-200 bg-white shadow-xs overflow-hidden">
      <div className="py-4 px-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2">
          <ImageIcon className="size-4 text-emerald-700" />
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Galerie Visuels & Photographies Studio
          </h2>
        </div>
        <span className="text-xs text-gray-500 font-medium">
          {images.length} visuels haute définition
        </span>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {images.map((item, index) => (
            <div
              key={index}
              className="group relative aspect-3/4 rounded-xl overflow-hidden border border-gray-200/90 bg-slate-50 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <Image
                src={item.url}
                alt={item.label}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <span className="self-end p-1.5 rounded-full bg-white/80 backdrop-blur-xs text-gray-800 shadow-xs">
                  <ZoomIn className="size-3.5" />
                </span>
                <span className="text-[11px] font-semibold text-white tracking-wide leading-tight">
                  {item.label}
                </span>
              </div>
              {index === 0 && (
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
