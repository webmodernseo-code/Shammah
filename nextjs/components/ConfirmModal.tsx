"use client";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        className="w-full max-w-sm rounded-[16px] bg-card-bg p-6 shadow-[0_4px_24px_rgba(17,24,39,0.06)]"
      >
        <h3 className="text-lg font-bold text-text-heading">{title}</h3>
        <p className="mt-2 text-sm text-text-body">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            data-action="cancel"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-text-heading hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            data-action="confirm"
            onClick={onConfirm}
            className={
              "rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors " +
              (danger
                ? "bg-status-red hover:bg-red-600"
                : "bg-accent-primary hover:bg-accent-primary-hover")
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
