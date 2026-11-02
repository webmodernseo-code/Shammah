"use client";

import GeneralSettingsForm from "@/components/settings/general-settings-form";
import PasswordUpdate from "@/components/settings/general/password-update";
import Notifications from "@/components/settings/general/notifications";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function GeneralSettingsClientPage() {
  const handleSave = () => {
    toast.success("Les paramètres généraux de la boutique ont été enregistrés avec succès.");
  };

  return (
    <div className="space-y-6">
      <GeneralSettingsForm />
      <Notifications />
      <PasswordUpdate />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" className="px-5 py-2 rounded-full text-xs font-bold">
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full text-xs font-bold shadow-xs cursor-pointer"
        >
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
}
