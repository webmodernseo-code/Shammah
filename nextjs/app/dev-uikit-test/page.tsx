"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function DevUikitTestPage() {
  const { show } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmResult, setConfirmResult] = useState<string>("(none)");

  return (
    <main className="p-8 flex flex-col gap-4">
      <button
        id="trigger-toast"
        onClick={() => show("Ceci est un test", "success")}
        className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white"
      >
        Trigger Toast
      </button>
      <button
        id="trigger-confirm"
        onClick={() => setConfirmOpen(true)}
        className="rounded-lg bg-status-blue px-4 py-2 text-sm font-medium text-white"
      >
        Trigger Confirm
      </button>
      <p id="confirm-result" className="text-sm text-text-body">
        {confirmResult}
      </p>
      <ConfirmModal
        open={confirmOpen}
        title="Test"
        message="Confirmer ce test ?"
        onConfirm={() => {
          setConfirmResult("true");
          setConfirmOpen(false);
        }}
        onCancel={() => {
          setConfirmResult("false");
          setConfirmOpen(false);
        }}
      />
    </main>
  );
}
