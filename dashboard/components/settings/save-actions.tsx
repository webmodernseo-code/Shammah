"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SaveActions({ className }: { className?: string }) {
  return (
    <div className={`flex justify-end gap-4 ${className || ""}`}>
      <Button variant="outline">Annuler</Button>
      <Button onClick={() => toast.success("Modifications enregistrées avec succès.")}>
        Enregistrer les modifications
      </Button>
    </div>
  );
}
