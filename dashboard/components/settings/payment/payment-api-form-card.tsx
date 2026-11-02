"use client";

import { useState } from "react";
import Switch from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

interface PaymentApiFormCardProps {
  title: string;
  description: string;
  isActive: boolean;
  logo: string;
  onToggle: (val: boolean) => void;
}

export default function PaymentApiFormCard({
  title,
  description,
  isActive,
  logo,
  onToggle,
}: PaymentApiFormCardProps) {
  const [showSecret, setShowSecret] = useState(false);

  return (
    <div className="border border-slate-200/80 rounded-2xl p-4 sm:p-5 bg-white flex flex-col gap-4 sm:gap-6 shadow-2xs">
      <div className="flex justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-3.5 sm:items-center">
          <div className="size-11 rounded-xl overflow-hidden shrink-0 bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5">
            <Image
              src={logo}
              alt={title}
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-0.5">
              {title}
            </h4>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <Switch checked={isActive} onChange={() => onToggle(!isActive)} />
      </div>

      <div className="space-y-3.5">
        <FloatingInput label="Clé Publique (Publishable Key)" className="h-10 text-xs" />
        <div className="relative">
          <FloatingInput
            label="Clé Secrète (Secret Key)"
            type={showSecret ? "text" : "password"}
            className="h-10 pr-10 text-xs"
          />
          <button
            type="button"
            onClick={() => setShowSecret(!showSecret)}
            tabIndex={-1}
            aria-label={showSecret ? "Masquer" : "Afficher"}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <FloatingInput label="Secret de Webhook" className="h-10 text-xs" />
      </div>

      <div>
        <Button variant="outline" className="text-xs font-semibold rounded-xl">Tester la connexion</Button>
      </div>
    </div>
  );
}
