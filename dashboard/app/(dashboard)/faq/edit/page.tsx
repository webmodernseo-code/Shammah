import EditFaqForm from "@/components/faqs/edit-faq-form";
import { Suspense } from "react";

export default function EditFaqPage() {
  return <Suspense fallback={<div className="rounded-2xl bg-white p-8 text-sm text-gray-500">Chargement…</div>}><EditFaqForm /></Suspense>;
}
